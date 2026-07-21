import { createWorker } from 'tesseract.js'

let workerPromise = null
let cameraStream = null

async function getWorker() {
  if (!workerPromise) {
    workerPromise = (async () => {
      const worker = await createWorker('spa', 1, {
        logger: () => {},
      })
      await worker.setParameters({
        tessedit_pageseg_mode: '6',
        preserve_interword_spaces: '1',
      })
      return worker
    })()
  }
  return workerPromise
}

export async function startCamera(videoEl) {
  stopCamera()
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      facingMode: { ideal: 'environment' },
      width: { ideal: 1920 },
      height: { ideal: 1080 },
    },
  })
  cameraStream = stream
  videoEl.srcObject = stream
  await videoEl.play()
  return stream
}

export function stopCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach((t) => t.stop())
    cameraStream = null
  }
}

export function captureFrame(videoEl, opts = {}) {
  const maxW = opts.maxWidth || 1280
  const vw = videoEl.videoWidth || 0
  const vh = videoEl.videoHeight || 0
  if (!vw || !vh) return null

  // Crop center band (ticket strip) for better OCR
  const cropW = Math.floor(vw * 0.82)
  const cropH = Math.floor(vh * 0.72)
  const sx = Math.floor((vw - cropW) / 2)
  const sy = Math.floor((vh - cropH) / 2)

  const scale = Math.min(1, maxW / cropW)
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.floor(cropW * scale))
  canvas.height = Math.max(1, Math.floor(cropH * scale))
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(videoEl, sx, sy, cropW, cropH, 0, 0, canvas.width, canvas.height)

  // Boost contrast for thermal paper
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const d = img.data
  for (let i = 0; i < d.length; i += 4) {
    const g = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]
    const v = g < 140 ? Math.max(0, g * 0.75) : Math.min(255, g * 1.2)
    d[i] = d[i + 1] = d[i + 2] = v
  }
  ctx.putImageData(img, 0, 0)
  return canvas
}

export async function recognizeCanvas(canvas) {
  const worker = await getWorker()
  const {
    data: { text },
  } = await worker.recognize(canvas)
  return text || ''
}

export async function preloadScanner() {
  await getWorker()
}

export async function terminateScanner() {
  stopCamera()
  if (workerPromise) {
    try {
      const worker = await workerPromise
      await worker.terminate()
    } catch {
      /* ignore */
    }
    workerPromise = null
  }
}

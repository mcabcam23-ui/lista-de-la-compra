import { createWorker } from 'tesseract.js'

let workerPromise = null
let cameraStream = null
let detectTimer = null
let lastQuad = null // { tl, tr, br, bl } in 0..1 video coords

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
  stopTicketTracking()
  if (cameraStream) {
    cameraStream.getTracks().forEach((t) => t.stop())
    cameraStream = null
  }
  lastQuad = null
}

/**
 * Tracks the ticket shape live and updates the overlay polygon.
 * frameEl: HTMLElement with clip-path / SVG polygon to reshape.
 */
export function startTicketTracking(videoEl, frameEl) {
  stopTicketTracking()
  const tick = () => {
    if (!videoEl?.srcObject || !videoEl.videoWidth) return
    const quad = detectTicketQuad(videoEl)
    if (quad) {
      lastQuad = smoothQuad(lastQuad, quad, 0.35)
      applyFrameShape(frameEl, lastQuad)
      frameEl?.classList.add('locked')
    } else {
      // Softly ease back toward default tall receipt guide
      const fallback = defaultQuad()
      lastQuad = lastQuad ? smoothQuad(lastQuad, fallback, 0.12) : fallback
      applyFrameShape(frameEl, lastQuad)
      frameEl?.classList.remove('locked')
    }
  }
  tick()
  detectTimer = setInterval(tick, 180)
}

export function stopTicketTracking() {
  if (detectTimer) {
    clearInterval(detectTimer)
    detectTimer = null
  }
}

function defaultQuad() {
  // Tall receipt-shaped default guide (center)
  return {
    tl: { x: 0.18, y: 0.1 },
    tr: { x: 0.82, y: 0.1 },
    br: { x: 0.82, y: 0.9 },
    bl: { x: 0.18, y: 0.9 },
  }
}

function smoothQuad(prev, next, alpha) {
  if (!prev) return next
  const mix = (a, b) => ({
    x: a.x + (b.x - a.x) * alpha,
    y: a.y + (b.y - a.y) * alpha,
  })
  return {
    tl: mix(prev.tl, next.tl),
    tr: mix(prev.tr, next.tr),
    br: mix(prev.br, next.br),
    bl: mix(prev.bl, next.bl),
  }
}

function applyFrameShape(frameEl, quad) {
  if (!frameEl || !quad) return
  const border = frameEl.querySelector('.scanner-frame-border')
  if (!border) return
  border.setAttribute(
    'points',
    [
      `${(quad.tl.x * 100).toFixed(2)},${(quad.tl.y * 100).toFixed(2)}`,
      `${(quad.tr.x * 100).toFixed(2)},${(quad.tr.y * 100).toFixed(2)}`,
      `${(quad.br.x * 100).toFixed(2)},${(quad.br.y * 100).toFixed(2)}`,
      `${(quad.bl.x * 100).toFixed(2)},${(quad.bl.y * 100).toFixed(2)}`,
    ].join(' '),
  )
}

/**
 * Detect a bright paper-like quadrilateral in the video frame.
 * Returns normalized corners or null.
 */
export function detectTicketQuad(videoEl) {
  const vw = videoEl.videoWidth
  const vh = videoEl.videoHeight
  if (!vw || !vh) return null

  const tw = 200
  const th = Math.max(120, Math.round((vh / vw) * tw))
  const canvas = document.createElement('canvas')
  canvas.width = tw
  canvas.height = th
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(videoEl, 0, 0, tw, th)
  const { data } = ctx.getImageData(0, 0, tw, th)

  // Grayscale + estimate background
  const gray = new Float32Array(tw * th)
  let sum = 0
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    const g = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
    gray[p] = g
    sum += g
  }
  const mean = sum / gray.length
  const threshold = Math.min(210, Math.max(130, mean + 28))

  // Mask bright pixels (paper)
  const mask = new Uint8Array(tw * th)
  let count = 0
  for (let p = 0; p < gray.length; p++) {
    if (gray[p] >= threshold) {
      mask[p] = 1
      count++
    }
  }

  // Need a reasonable paper region
  const fill = count / gray.length
  if (fill < 0.06 || fill > 0.72) return null

  // Light morphology: keep pixels with neighbors
  const cleaned = new Uint8Array(tw * th)
  for (let y = 1; y < th - 1; y++) {
    for (let x = 1; x < tw - 1; x++) {
      const i = y * tw + x
      if (!mask[i]) continue
      let n = 0
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          n += mask[(y + dy) * tw + (x + dx)]
        }
      }
      if (n >= 4) cleaned[i] = 1
    }
  }

  // Extreme points → corners
  let minSum = Infinity
  let maxSum = -Infinity
  let minDiff = Infinity
  let maxDiff = -Infinity
  let tl = null
  let br = null
  let tr = null
  let bl = null
  let found = 0

  for (let y = 0; y < th; y++) {
    for (let x = 0; x < tw; x++) {
      if (!cleaned[y * tw + x]) continue
      found++
      const s = x + y
      const d = x - y
      if (s < minSum) {
        minSum = s
        tl = { x, y }
      }
      if (s > maxSum) {
        maxSum = s
        br = { x, y }
      }
      if (d > maxDiff) {
        maxDiff = d
        tr = { x, y }
      }
      if (d < minDiff) {
        minDiff = d
        bl = { x, y }
      }
    }
  }

  if (found < 80 || !tl || !tr || !br || !bl) return null

  // Normalize + pad slightly inward
  const norm = (pt) => ({
    x: clamp((pt.x + 0.5) / tw, 0.02, 0.98),
    y: clamp((pt.y + 0.5) / th, 0.02, 0.98),
  })

  const quad = {
    tl: norm(tl),
    tr: norm(tr),
    br: norm(br),
    bl: norm(bl),
  }

  // Sanity: receipt-ish aspect (taller than wide in image space often, but can be landscape)
  const width =
    (dist(quad.tl, quad.tr) + dist(quad.bl, quad.br)) / 2
  const height =
    (dist(quad.tl, quad.bl) + dist(quad.tr, quad.br)) / 2
  if (width < 0.18 || height < 0.22) return null
  if (width > 0.98 || height > 0.98) return null

  // Order corners consistently
  return orderQuad(quad)
}

function orderQuad(q) {
  const pts = [q.tl, q.tr, q.br, q.bl]
  pts.sort((a, b) => a.y - b.y || a.x - b.x)
  const top = pts.slice(0, 2).sort((a, b) => a.x - b.x)
  const bottom = pts.slice(2).sort((a, b) => a.x - b.x)
  return { tl: top[0], tr: top[1], bl: bottom[0], br: bottom[1] }
}

function dist(a, b) {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.hypot(dx, dy)
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n))
}

/**
 * Capture and perspective-correct the detected ticket for OCR.
 */
export function captureFrame(videoEl, opts = {}) {
  const vw = videoEl.videoWidth || 0
  const vh = videoEl.videoHeight || 0
  if (!vw || !vh) return null

  const quad = lastQuad || detectTicketQuad(videoEl) || defaultQuad()

  // Output size: tall receipt (kept modest for mobile perf)
  const outW = Math.min(opts.maxWidth || 900, 900)
  const aspect =
    ((dist(quad.tl, quad.bl) + dist(quad.tr, quad.br)) /
      Math.max(0.001, dist(quad.tl, quad.tr) + dist(quad.bl, quad.br))) ||
    1.6
  const outH = Math.max(Math.round(outW * Math.min(2.2, Math.max(1.25, aspect))), 640)

  const src = [
    { x: quad.tl.x * vw, y: quad.tl.y * vh },
    { x: quad.tr.x * vw, y: quad.tr.y * vh },
    { x: quad.br.x * vw, y: quad.br.y * vh },
    { x: quad.bl.x * vw, y: quad.bl.y * vh },
  ]

  // Downscale source for faster warp
  const scale = Math.min(1, 1280 / Math.max(vw, vh))
  const sw = Math.max(1, Math.round(vw * scale))
  const sh = Math.max(1, Math.round(vh * scale))
  const full = document.createElement('canvas')
  full.width = sw
  full.height = sh
  const fctx = full.getContext('2d', { willReadFrequently: true })
  fctx.drawImage(videoEl, 0, 0, sw, sh)
  const srcData = fctx.getImageData(0, 0, sw, sh)
  const scaledSrc = src.map((p) => ({ x: p.x * scale, y: p.y * scale }))

  const out = document.createElement('canvas')
  out.width = outW
  out.height = outH
  const octx = out.getContext('2d')
  const outImg = octx.createImageData(outW, outH)

  const dst = [
    { x: 0, y: 0 },
    { x: outW - 1, y: 0 },
    { x: outW - 1, y: outH - 1 },
    { x: 0, y: outH - 1 },
  ]
  const m = getPerspectiveTransform(dst, scaledSrc)

  for (let y = 0; y < outH; y++) {
    for (let x = 0; x < outW; x++) {
      const p = applyPerspective(m, x, y)
      const sx = p.x
      const sy = p.y
      const dstI = (y * outW + x) * 4
      if (sx < 0 || sy < 0 || sx >= sw - 1 || sy >= sh - 1) {
        outImg.data[dstI] = outImg.data[dstI + 1] = outImg.data[dstI + 2] = 255
        outImg.data[dstI + 3] = 255
        continue
      }
      const x0 = Math.floor(sx)
      const y0 = Math.floor(sy)
      const x1 = x0 + 1
      const y1 = y0 + 1
      const fx = sx - x0
      const fy = sy - y0
      const i00 = (y0 * sw + x0) * 4
      const i10 = (y0 * sw + x1) * 4
      const i01 = (y1 * sw + x0) * 4
      const i11 = (y1 * sw + x1) * 4
      for (let c = 0; c < 3; c++) {
        const v =
          srcData.data[i00 + c] * (1 - fx) * (1 - fy) +
          srcData.data[i10 + c] * fx * (1 - fy) +
          srcData.data[i01 + c] * (1 - fx) * fy +
          srcData.data[i11 + c] * fx * fy
        outImg.data[dstI + c] = v
      }
      outImg.data[dstI + 3] = 255
    }
  }
  octx.putImageData(outImg, 0, 0)

  // Contrast boost for thermal paper
  const img = octx.getImageData(0, 0, outW, outH)
  const d = img.data
  for (let i = 0; i < d.length; i += 4) {
    const g = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]
    const v = g < 145 ? Math.max(0, g * 0.72) : Math.min(255, g * 1.22)
    d[i] = d[i + 1] = d[i + 2] = v
  }
  octx.putImageData(img, 0, 0)
  return out
}

/** Homography from 4 dest points → 4 source points */
function getPerspectiveTransform(src, dst) {
  // Solve for mapping src(x,y) -> dst(u,v)
  const A = []
  const b = []
  for (let i = 0; i < 4; i++) {
    const { x, y } = src[i]
    const u = dst[i].x
    const v = dst[i].y
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y])
    b.push(u)
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y])
    b.push(v)
  }
  const h = solve8(A, b)
  return h
}

function applyPerspective(h, x, y) {
  const w = h[6] * x + h[7] * y + 1
  return {
    x: (h[0] * x + h[1] * y + h[2]) / w,
    y: (h[3] * x + h[4] * y + h[5]) / w,
  }
}

function solve8(A, b) {
  // Gaussian elimination 8x8
  const n = 8
  const M = A.map((row, i) => [...row, b[i]])
  for (let col = 0; col < n; col++) {
    let pivot = col
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(M[r][col]) > Math.abs(M[pivot][col])) pivot = r
    }
    ;[M[col], M[pivot]] = [M[pivot], M[col]]
    const div = M[col][col] || 1e-12
    for (let c = col; c <= n; c++) M[col][c] /= div
    for (let r = 0; r < n; r++) {
      if (r === col) continue
      const f = M[r][col]
      for (let c = col; c <= n; c++) M[r][c] -= f * M[col][c]
    }
  }
  return M.map((row) => row[n])
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

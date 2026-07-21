import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, 'data')
const DATA_FILE = path.join(DATA_DIR, 'lists.json')
const PORT = process.env.PORT || 4173

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '{}')

function readAll() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
  } catch {
    return {}
  }
}

function writeAll(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
}

const app = express()
app.use(cors())
app.use(express.json({ limit: '1mb' }))

app.get('/api/lists/:id', (req, res) => {
  const all = readAll()
  const list = all[req.params.id]
  if (!list) return res.json({ items: [], history: [], members: [], updatedAt: 0 })
  res.json(list)
})

app.put('/api/lists/:id', (req, res) => {
  const all = readAll()
  const incoming = req.body || {}
  const current = all[req.params.id]
  if (current && (incoming.updatedAt || 0) < (current.updatedAt || 0)) {
    return res.json(current)
  }
  const next = {
    items: Array.isArray(incoming.items) ? incoming.items : [],
    history: Array.isArray(incoming.history)
      ? incoming.history
      : Array.isArray(current?.history)
        ? current.history
        : [],
    members: Array.isArray(incoming.members) ? incoming.members : [],
    updatedAt: incoming.updatedAt || Date.now(),
  }
  all[req.params.id] = next
  writeAll(all)
  res.json(next)
})

const dist = path.join(__dirname, 'dist')
if (fs.existsSync(dist)) {
  app.use(express.static(dist))
  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next()
    if (req.path.startsWith('/api')) return next()
    res.sendFile(path.join(dist, 'index.html'))
  })
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Lista de la compra lista en http://localhost:${PORT}`)
  console.log('En el móvil (misma WiFi), usa la IP de este PC + el puerto.')
})

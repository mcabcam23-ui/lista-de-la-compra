import { PRODUCTS } from './products.js'
import { STORES } from './stores.js'

const SKIP =
  /^(total|subtotal|sub total|iva|base|tarjeta|efectivo|cambio|gracias|ticket|factura|nif|cif|dto|dto\.|descuento|importe|pagado|vuelto|operacion|op\.|caja|tienda|tel|www\.|http|mercado|cliente|vendedor|fecha|hora|n[ºo°]|articulos?|uds?\.?)$/i

export function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function parseReceiptText(rawText) {
  const lines = String(rawText || '')
    .split(/\r?\n/)
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter(Boolean)

  const store = detectStore(lines)
  const items = []
  let total = null

  for (const line of lines) {
    const totalMatch = line.match(/^(?:total|importe|a pagar)\s*:?\s*(\d+[.,]\d{2})\s*[€eE]?$/i)
    if (totalMatch) {
      total = parseMoney(totalMatch[1])
      continue
    }

    const item = parseItemLine(line)
    if (!item) continue
    if (SKIP.test(normalizeText(item.name).split(' ')[0] || '')) continue
    if (item.name.length < 3) continue
    items.push(item)
  }

  const deduped = dedupeItems(items)
  return {
    store,
    total: total ?? sumPrices(deduped),
    items: deduped,
    rawText: lines.join('\n'),
  }
}

function parseItemLine(line) {
  // "LECHE ENTERA 1,25" · "1,25 LECHE" · "LECHE x2 2,50"
  let m = line.match(/^(.+?)\s+(\d+[.,]\d{2})\s*[€eE]?$/)
  if (m) {
    return {
      name: cleanName(m[1]),
      price: parseMoney(m[2]),
      qty: extractQty(m[1]) || 1,
    }
  }
  m = line.match(/^(\d+[.,]\d{2})\s*[€eE]?\s+(.+)$/)
  if (m) {
    return {
      name: cleanName(m[2]),
      price: parseMoney(m[1]),
      qty: extractQty(m[2]) || 1,
    }
  }
  m = line.match(/^(.+?)\s+x\s*(\d+)\s+(\d+[.,]\d{2})\s*[€eE]?$/i)
  if (m) {
    return {
      name: cleanName(m[1]),
      qty: Number(m[2]) || 1,
      price: parseMoney(m[3]),
    }
  }
  return null
}

function cleanName(name) {
  return String(name || '')
    .replace(/\s*x\s*\d+\s*$/i, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^[\d*\-_.]+/, '')
    .trim()
}

function extractQty(name) {
  const m = String(name).match(/\bx\s*(\d+)\b/i)
  return m ? Number(m[1]) : 0
}

function parseMoney(value) {
  const n = Number(String(value).replace(',', '.'))
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0
}

function sumPrices(items) {
  return Math.round(items.reduce((n, i) => n + (i.price || 0), 0) * 100) / 100
}

function dedupeItems(items) {
  const map = new Map()
  for (const item of items) {
    const key = normalizeText(item.name)
    if (!key) continue
    if (map.has(key)) {
      const prev = map.get(key)
      prev.qty += item.qty || 1
      prev.price = item.price
    } else {
      map.set(key, { ...item, qty: item.qty || 1 })
    }
  }
  return [...map.values()]
}

function detectStore(lines) {
  const blob = normalizeText(lines.slice(0, 8).join(' '))
  for (const store of STORES) {
    if (store.id === 'todos') continue
    const name = normalizeText(store.name)
    if (blob.includes(name) || blob.includes(normalizeText(store.short))) return store.id
  }
  if (blob.includes('mercadona')) return 'mercadona'
  if (blob.includes('lidl')) return 'lidl'
  if (blob.includes('alcampo')) return 'alcampo'
  if (blob.includes('carrefour')) return 'carrefour'
  if (blob.includes('alimerka')) return 'alimerka'
  return 'todos'
}

export function matchCatalogProduct(name) {
  const needle = normalizeText(name)
  if (!needle) return null
  let best = null
  let bestScore = 0
  for (const product of PRODUCTS) {
    const target = normalizeText(product.name)
    if (!target) continue
    let score = 0
    if (target === needle) score = 1
    else if (target.includes(needle) || needle.includes(target)) score = 0.86
    else {
      const a = new Set(needle.split(' '))
      const b = new Set(target.split(' '))
      let inter = 0
      for (const w of a) if (b.has(w)) inter += 1
      score = inter / Math.max(a.size, b.size)
    }
    if (score > bestScore) {
      bestScore = score
      best = product
    }
  }
  return bestScore >= 0.55 ? best : null
}

export function priceKey(productId, name) {
  if (productId) return `id:${productId}`
  return `name:${normalizeText(name)}`
}

export function getPriceEntry(prices, productId, name) {
  if (!prices || typeof prices !== 'object') return null
  if (productId && prices[`id:${productId}`]) return prices[`id:${productId}`]
  const key = priceKey(null, name)
  return prices[key] || null
}

export function formatEuro(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return ''
  return `${n.toFixed(2).replace('.', ',')} €`
}

export function applyTicketPrices(prices, ticket) {
  const next = { ...(prices || {}) }
  const at = ticket.boughtAt || Date.now()
  for (const line of ticket.items || []) {
    const product = line.productId ? PRODUCTS.find((p) => p.id === line.productId) : matchCatalogProduct(line.name)
    const unit = line.qty > 1 ? Math.round((line.price / line.qty) * 100) / 100 : line.price
    if (!unit || unit <= 0) continue
    const keys = []
    if (product?.id) keys.push(`id:${product.id}`)
    keys.push(priceKey(null, product?.name || line.name))
    for (const key of keys) {
      const prev = next[key]
      if (prev && (prev.updatedAt || 0) > at) continue
      next[key] = {
        name: product?.name || line.name,
        productId: product?.id || null,
        price: unit,
        store: ticket.store || 'todos',
        updatedAt: at,
        ticketId: ticket.id,
      }
    }
  }
  return next
}

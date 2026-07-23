import { PRODUCTS, allProducts, upsertExtraProduct } from './products.js'
import { STORES } from './stores.js'

const SKIP =
  /^(total|subtotal|sub total|iva|base|tarjeta|efectivo|cambio|gracias|ticket|factura|nif|cif|dto|dto\.|descuento|importe|pagado|vuelto|operacion|op\.|caja|tienda|tel|www\.|http|mercado|cliente|vendedor|fecha|hora|n[ºo°]|articulos?|uds?\.?|eur|euro|euros|cantidad|precio|pvp|ref)$/i

const PRICE_RE = /(\d+[.,]\d{2})\s*[€eE]?/

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
  const rawLines = String(rawText || '')
    .split(/\r?\n/)
    .map((l) => l.replace(/[·•]/g, '.').replace(/\.{2,}/g, ' ').replace(/\s+/g, ' ').trim())
    .filter(Boolean)

  const lines = coalesceBrokenLines(rawLines)
  const store = detectStore(lines)
  const items = []
  let total = null

  for (const line of lines) {
    const totalMatch = line.match(
      /^(?:total|importe|a pagar|total a pagar)\s*:?\s*(\d+[.,]\d{2})\s*[€eE]?$/i,
    )
    if (totalMatch) {
      total = parseMoney(totalMatch[1])
      continue
    }

    const item = parseItemLine(line)
    if (!item) continue
    const first = normalizeText(item.name).split(' ')[0] || ''
    if (SKIP.test(first)) continue
    if (normalizeText(item.name).length < 3) continue
    if (!item.price || item.price <= 0 || item.price > 500) continue
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

/** Une “NOMBRE” + “1,25” en líneas separadas (muy habitual en OCR) */
function coalesceBrokenLines(lines) {
  const out = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const next = lines[i + 1]
    if (next && !PRICE_RE.test(line) && isPriceOnly(next) && looksLikeProductName(line)) {
      out.push(`${line} ${next}`)
      i += 1
      continue
    }
    // Nombre + "0,450 kg x 2,99" / "0,450 kg x 2,99 1,35"
    if (
      next &&
      looksLikeProductName(line) &&
      !PRICE_RE.test(line) &&
      /^\d+[.,]\d+\s*kg\b/i.test(next)
    ) {
      out.push(`${line} ${next}`)
      i += 1
      continue
    }
    if (
      next &&
      looksLikeProductName(line) &&
      !PRICE_RE.test(line) &&
      /^\d+\s+[A-Za-zÁÉÍÓÚÑáéíóúñ]/.test(next) === false &&
      PRICE_RE.test(next) &&
      next.length < 28
    ) {
      const pricePart = next.match(PRICE_RE)
      if (pricePart && !looksLikeProductName(next.replace(PRICE_RE, '').trim())) {
        out.push(`${line} ${pricePart[1]}`)
        i += 1
        continue
      }
    }
    out.push(line)
  }
  return out
}

function isPriceOnly(line) {
  return /^\d+[.,]\d{2}\s*[€eE]?$/.test(String(line).trim())
}

function looksLikeProductName(line) {
  const t = String(line || '').trim()
  if (t.length < 3 || t.length > 60) return false
  if (isPriceOnly(t)) return false
  if (/^(total|iva|nif|cif|fecha|hora)/i.test(t)) return false
  return /[A-Za-zÁÉÍÓÚÑáéíóúñ]{2,}/.test(t)
}

function parseItemLine(line) {
  const cleaned = String(line || '')
    .replace(/\s*[€eE]\s*$/, '')
    .replace(/\s+/g, ' ')
    .trim()

  // Al peso: "PLATANOS 0,450 kg x 2,49" · "PLATANOS 0,450kg x 2,49 €/kg 1,12"
  let m = cleaned.match(
    /^(.+?)\s+(\d+[.,]\d+)\s*kg\s*[x×*]\s*(\d+[.,]\d{2})(?:\s*(?:€|e|eur)?\/?\s*kg)?(?:\s+(\d+[.,]\d{2}))?$/i,
  )
  if (m && !isPriceOnly(m[1])) {
    const weightKg = parseMoney(m[2])
    const pricePerKg = parseMoney(m[3])
    const lineTotal = m[4]
      ? parseMoney(m[4])
      : Math.round(weightKg * pricePerKg * 100) / 100
    return {
      name: cleanName(m[1]),
      price: lineTotal,
      qty: 1,
      unit: 'kg',
      unitPrice: pricePerKg,
      weightKg,
    }
  }

  // Solo precio/kg: " entrecot 12,99 €/kg" · " entrecot 12,99/kg"
  m = cleaned.match(/^(.+?)\s+(\d+[.,]\d{2})\s*(?:€|e|eur)?\s*\/\s*kg$/i)
  if (m && !isPriceOnly(m[1])) {
    return {
      name: cleanName(m[1]),
      price: parseMoney(m[2]),
      qty: 1,
      unit: 'kg',
      unitPrice: parseMoney(m[2]),
    }
  }

  // "LECHE ENTERA 1,25" · "LECHE ..... 1,25"
  m = cleaned.match(/^(.+?)\s+(\d+[.,]\d{2})$/)
  if (m && !isPriceOnly(m[1])) {
    return {
      name: cleanName(m[1]),
      price: parseMoney(m[2]),
      qty: extractQty(m[1]) || 1,
      unit: 'ud',
    }
  }

  // "1,25 LECHE ENTERA"
  m = cleaned.match(/^(\d+[.,]\d{2})\s+(.+)$/)
  if (m) {
    return {
      name: cleanName(m[2]),
      price: parseMoney(m[1]),
      qty: extractQty(m[2]) || 1,
      unit: 'ud',
    }
  }

  // "LECHE x2 2,50" · "LECHE x 2 2,50"
  m = cleaned.match(/^(.+?)\s+x\s*(\d+)\s+(\d+[.,]\d{2})$/i)
  if (m) {
    return {
      name: cleanName(m[1]),
      qty: Number(m[2]) || 1,
      price: parseMoney(m[3]),
      unit: 'ud',
    }
  }

  // "2 LECHE ENTERA 2,50"
  m = cleaned.match(/^(\d+)\s+(.+?)\s+(\d+[.,]\d{2})$/)
  if (m) {
    return {
      name: cleanName(m[2]),
      qty: Number(m[1]) || 1,
      price: parseMoney(m[3]),
      unit: 'ud',
    }
  }

  return null
}

function cleanName(name) {
  return String(name || '')
    .replace(/\s*x\s*\d+\s*$/i, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^[\d*\-_.#]+/, '')
    .replace(/\s+\d+[.,]\d{2}\s*$/, '')
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
      prev.price = Math.round((prev.price + (item.price || 0)) * 100) / 100
      if (item.unit === 'kg') {
        prev.unit = 'kg'
        if (item.unitPrice) prev.unitPrice = item.unitPrice
      }
    } else {
      map.set(key, {
        ...item,
        qty: item.qty || 1,
        unit: item.unit === 'kg' ? 'kg' : 'ud',
      })
    }
  }
  return [...map.values()]
}

function detectStore(lines) {
  const head = normalizeText(lines.slice(0, 14).join(' '))
  const all = normalizeText(lines.join(' '))
  const blob = `${head} ${all}`

  // Orden: claves más específicas primero (evitar falsos positivos)
  const aliases = [
    { id: 'mercadona', keys: ['mercadona', 'hacendado'] },
    { id: 'lidl', keys: ['lidl'] },
    { id: 'alimerka', keys: ['alimerka'] },
    { id: 'alcampo', keys: ['alcampo', 'auchan'] },
    { id: 'carrefour', keys: ['carrefour'] },
    { id: 'masymas', keys: ['masymas', 'mas y mas', 'masy mas', 'supermasymas', 'hijos de luis rodriguez'] },
    { id: 'familia', keys: ['autoservicios familia', 'supermercados familia', 'super familia'] },
  ]

  let best = { id: 'todos', score: 0 }
  for (const entry of aliases) {
    for (const key of entry.keys) {
      if (!blob.includes(key)) continue
      const inHead = head.includes(key) ? 4 : 1
      const specificity = key.length / 12
      const score = inHead + specificity
      if (score > best.score) best = { id: entry.id, score }
    }
  }
  if (best.score > 0) return best.id

  // Fallback por nombre de tienda (excepto "familia" suelto: demasiado genérico)
  for (const store of STORES) {
    if (store.id === 'todos' || store.id === 'familia') continue
    const name = normalizeText(store.name)
    if (head.includes(name) || blob.includes(name)) return store.id
  }
  if (/\bfamilia\b/.test(head) && !blob.includes('masymas')) return 'familia'
  return 'todos'
}

export function matchCatalogProduct(name, pool) {
  const needle = normalizeText(name)
  if (!needle) return null
  const products = Array.isArray(pool) ? pool : allProducts()

  // Nombres muy cortos: solo coincidencia exacta
  if (needle.length < 3) {
    return products.find((p) => normalizeText(p.name) === needle) || null
  }

  let best = null
  let bestScore = 0
  for (const product of products) {
    const target = normalizeText(product.name)
    if (!target) continue
    let score = 0
    if (target === needle) score = 1
    else if (needle.length >= 4 && target.length >= 4) {
      if (target.includes(needle) || needle.includes(target)) {
        const shorter = Math.min(needle.length, target.length)
        const longer = Math.max(needle.length, target.length)
        score = 0.68 + 0.22 * (shorter / longer)
      }
    }
    if (score < 0.9) {
      const a = new Set(needle.split(' ').filter((w) => w.length > 2))
      const b = new Set(target.split(' ').filter((w) => w.length > 2))
      if (a.size && b.size) {
        let inter = 0
        for (const w of a) if (b.has(w)) inter += 1
        const jaccard = inter / Math.max(a.size, b.size)
        if (jaccard > score) score = jaccard * 0.95
      }
    }
    if (score > bestScore) {
      bestScore = score
      best = product
    }
  }
  return bestScore >= 0.72 ? best : null
}

export function priceKey(productId, name) {
  if (productId) return `id:${productId}`
  return `name:${normalizeText(name)}`
}

/** Precio del producto en un supermercado concreto */
export function getPriceEntry(prices, productId, name, storeId) {
  if (!prices || typeof prices !== 'object') return null
  const store = storeId && storeId !== 'todos' ? storeId : null
  if (!store) return null

  const bucket = prices[store]
  if (bucket && typeof bucket === 'object') {
    if (productId && bucket[`id:${productId}`]) return bucket[`id:${productId}`]
    return bucket[priceKey(null, name)] || null
  }

  // Compat: precios antiguos planos
  if (productId && prices[`id:${productId}`]?.store === store) return prices[`id:${productId}`]
  const flat = prices[priceKey(null, name)]
  if (flat?.store === store) return flat
  return null
}

export function formatEuro(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return ''
  return `${n.toFixed(2).replace('.', ',')}€`
}

/** Precio para mostrar: 1,25€ o 3,99€/kg */
export function formatPriceLabel(entryOrPrice, unit = 'ud') {
  if (entryOrPrice && typeof entryOrPrice === 'object') {
    const label = formatEuro(entryOrPrice.price)
    if (!label) return ''
    return entryOrPrice.unit === 'kg' ? `${label}/kg` : label
  }
  const label = formatEuro(entryOrPrice)
  if (!label) return ''
  return unit === 'kg' ? `${label}/kg` : label
}

/** Productos con precio real de tickets, agrupados por supermercado */
export function listPricedProductsByStore(prices) {
  const groups = []
  for (const store of STORES) {
    if (store.id === 'todos') continue
    const bucket = prices?.[store.id]
    if (!bucket || typeof bucket !== 'object') continue

    const seen = new Set()
    const entries = []
    for (const [key, entry] of Object.entries(bucket)) {
      if (!entry || typeof entry !== 'object') continue
      if (!entry.name && !entry.productId) continue
      if (key.startsWith('name:') && entry.productId && bucket[`id:${entry.productId}`]) continue
      const dedupe = entry.productId ? `id:${entry.productId}` : key
      if (seen.has(dedupe)) continue
      seen.add(dedupe)
      entries.push({
        name: entry.name,
        productId: entry.productId || null,
        price: entry.price,
        unit: entry.unit === 'kg' ? 'kg' : 'ud',
        store: store.id,
        updatedAt: entry.updatedAt || 0,
      })
    }
    entries.sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'es'))
    if (entries.length) groups.push({ store, entries })
  }
  return groups
}

/** Asegura que las líneas del ticket existan en catálogo (crea extras si faltan) */
export function resolveTicketCatalog(extraProducts, ticketItems) {
  let extras = Array.isArray(extraProducts) ? [...extraProducts] : []
  const items = []

  for (const line of ticketItems || []) {
    const name = String(line.name || '').trim()
    if (!name) continue

    const pool = [...PRODUCTS, ...extras]
    let product = line.productId ? pool.find((p) => p.id === line.productId) : null
    if (!product) product = matchCatalogProduct(name, pool)

    let isNew = false
    if (!product) {
      const created = upsertExtraProduct(extras, name)
      extras = created.list
      product = created.product
      isNew = true
    } else if (product.custom) {
      const created = upsertExtraProduct(extras, product.name)
      extras = created.list
      product = created.product || product
    }

    const qty = Math.max(1, Number(line.qty) || 1)
    const unit = line.unit === 'kg' ? 'kg' : 'ud'
    let unitPrice = Number(line.unitPrice)
    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
      unitPrice = qty > 1 ? Math.round((line.price / qty) * 100) / 100 : line.price
    }

    items.push({
      name: product?.name || name,
      productId: product?.id || null,
      qty,
      price: line.price,
      unit,
      unitPrice,
      weightKg: line.weightKg || null,
      isNew,
      emoji: product?.emoji || '🛒',
      icon: product?.icon || null,
    })
  }

  return { extras, items }
}

export function applyTicketPrices(prices, ticket) {
  const next = { ...(prices || {}) }
  const storeId = ticket.store && ticket.store !== 'todos' ? ticket.store : null
  if (!storeId) return next

  const bucket = { ...(next[storeId] || {}) }
  const at = ticket.boughtAt || Date.now()

  for (const line of ticket.items || []) {
    const product = line.productId
      ? allProducts().find((p) => p.id === line.productId)
      : matchCatalogProduct(line.name)
    const unit = line.unit === 'kg' ? 'kg' : 'ud'
    let unitPrice = Number(line.unitPrice)
    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
      unitPrice =
        line.qty > 1 ? Math.round((line.price / line.qty) * 100) / 100 : line.price
    }
    if (!unitPrice || unitPrice <= 0) continue

    const keys = []
    if (product?.id) keys.push(`id:${product.id}`)
    keys.push(priceKey(null, product?.name || line.name))

    for (const key of keys) {
      const prev = bucket[key]
      if (prev && (prev.updatedAt || 0) > at) continue
      bucket[key] = {
        name: product?.name || line.name,
        productId: product?.id || null,
        price: unitPrice,
        unit,
        store: storeId,
        updatedAt: at,
        ticketId: ticket.id,
      }
    }
  }

  next[storeId] = bucket
  return next
}

import { PRODUCTS, allProducts, upsertExtraProduct } from './products.js'
import { STORES } from './stores.js'

/** Palabras que NUNCA son nombre de producto */
const SKIP_NAME =
  /^(total|subtotal|sub|iva|base|tarjeta|efectivo|cambio|gracias|ticket|factura|nif|cif|dto|descuento|importe|pagado|vuelto|operacion|op|caja|tienda|tel|www|http|cliente|vendedor|fecha|hora|articulos?|uds?|ud|eur|euro|euros|cantidad|precio|pvp|ref|pedido|numero|num|nro|recibo|tpv|autorizacion|caducidad|iban|bizum|contacto|direccion|localidad|provincia|cp)$/i

/** Línea completa de metadatos / pie / cabecera (no producto) */
const META_LINE =
  /\b(fecha|hora|nif|cif|dni|ticket\s*n|n[ºo°]?\s*ticket|factura|caja\b|operacion|autoriz|tarjeta|efectivo|cambio\b|vuelto|bizum|iban|tpv|caducidad|base\s*imponible|cuota\s*iva|%\s*iva|tel[eé]fono|www\.|http|le\s+atendio|vendedor|cajero|bienvenido|gracias\s+por|conserve|cif\s*:|nif\s*:)\b/i

/** Total del ticket */
const TOTAL_LABEL =
  /^(?:\*+\s*)?(?:total(?:\s+a\s+pagar)?|importe(?:\s+total)?|a\s+pagar|total\s+euros?|total\s+eur)\b/i

const ARTICLES_COUNT =
  /(?:^|\b)(\d{1,3})\s*(?:art[ií]culos?|productos?|uds\.?|unidades?)(?:\b|$)/i

export function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Parsea OCR de ticket español.
 * Solo acepta importes con formato de euro (2 decimales); ignora fechas,
 * horas, nº de pedido, códigos, etc.
 */
export function parseReceiptText(rawText) {
  const rawLines = String(rawText || '')
    .split(/\r?\n/)
    .map((l) =>
      l
        .replace(/[·•]/g, '.')
        .replace(/\.{2,}/g, ' ')
        .replace(/\s+/g, ' ')
        .trim(),
    )
    .filter(Boolean)

  const lines = coalesceBrokenLines(rawLines)
  const store = detectStore(lines)
  const articleCount = detectArticleCount(lines)
  const totalInfo = detectTotal(lines)

  const items = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (isMetaOrNoiseLine(line)) continue
    if (TOTAL_LABEL.test(line)) continue

    const item = parseItemLine(line)
    if (!item) continue
    if (!isValidProductItem(item)) continue
    items.push({ ...item, _lineIndex: i })
  }

  let refined = refineAgainstTotal(dedupeItems(items), totalInfo?.amount ?? null, articleCount)

  // Si el total del ticket existe y la suma no cuadra, preferir el total declarado
  const sum = sumPrices(refined)
  let total = totalInfo?.amount ?? null
  if (total == null) {
    total = sum
  } else if (refined.length && Math.abs(sum - total) > 0.05 && Math.abs(sum - total) / Math.max(total, 1) > 0.15) {
    // Intento extra: quitar outliers caros que parecen códigos mal leídos
    refined = dropOutliersToMatchTotal(refined, total)
  }

  return {
    store,
    total: total ?? sumPrices(refined),
    items: refined.map(({ _lineIndex, _confidence, ...rest }) => rest),
    articleCount,
    rawText: lines.join('\n'),
  }
}

function isMetaOrNoiseLine(line) {
  const t = String(line || '').trim()
  if (!t) return true
  if (META_LINE.test(t)) return true
  if (/^\d{1,2}[/.-]\d{1,2}([/.-]\d{2,4})?$/.test(t)) return true // solo fecha
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(t)) return true // solo hora
  if (/^[A-Z0-9./-]{8,}$/i.test(t) && !/[a-záéíóúñ]{3,}/i.test(t)) return true // código
  if (/^(nif|cif|dni)\s*:?\s*\w+/i.test(t)) return true
  return false
}

function detectArticleCount(lines) {
  for (const line of lines) {
    const m = line.match(ARTICLES_COUNT)
    if (m) {
      const n = Number(m[1])
      if (n >= 1 && n <= 80) return n
    }
  }
  return null
}

function detectTotal(lines) {
  // Buscar desde el final: el TOTAL suele ir abajo
  let best = null
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i]
    if (!TOTAL_LABEL.test(line) && !/total/i.test(line)) continue
    // Evitar "total articulos" sin importe
    if (/art[ií]culos?/i.test(line) && !findEuroAmounts(line).length) continue

    const amounts = findEuroAmounts(line, { allowHigh: true })
    if (!amounts.length) {
      // TOTAL en esta línea, importe en la siguiente
      const next = lines[i + 1]
      if (next) {
        const nextAmounts = findEuroAmounts(next, { allowHigh: true })
        if (nextAmounts.length === 1 && isPriceOnlyLine(next)) {
          const amount = nextAmounts[0].value
          if (amount >= 0.2 && amount <= 2000) {
            const score = 10 + i / 100
            if (!best || score > best.score) best = { amount, score }
          }
        }
      }
      continue
    }
    // El total es el importe más a la derecha de la línea TOTAL
    const amount = amounts[amounts.length - 1].value
    if (amount < 0.2 || amount > 2000) continue
    let score = 5 + (TOTAL_LABEL.test(line) ? 5 : 0) + i / 100
    if (/a\s+pagar|importe/i.test(line)) score += 2
    if (!best || score > best.score) best = { amount, score }
  }
  return best
}

/**
 * Encuentra importes en formato euro: 1,25 / 12.50 / 1,25€
 * Rechaza fechas, horas y números sin exactamente 2 decimales.
 */
function findEuroAmounts(line, { allowHigh = false } = {}) {
  const text = String(line || '')
  const results = []

  const pushUnique = (value, index, raw, hasEuro) => {
    if (!isPlausibleMoney(value, allowHigh)) return
    if (results.some((r) => r.index === index)) return
    results.push({ value, index, raw, hasEuro })
  }

  // Con símbolo € (máxima confianza)
  const withEuro = /(\d{1,4}[.,]\d{2})\s*€/gi
  let m
  while ((m = withEuro.exec(text))) {
    if (m.index > 0 && /\d/.test(text[m.index - 1])) continue
    pushUnique(parseMoney(m[1]), m.index, m[1], true)
  }

  // Sin € pero exactamente 2 decimales
  const bare = /(\d{1,4}[.,]\d{2})/g
  while ((m = bare.exec(text))) {
    const start = m.index
    const end = start + m[1].length
    if (start > 0 && /\d/.test(text[start - 1])) continue
    if (end < text.length && /\d/.test(text[end])) continue
    if (results.some((r) => r.index === start)) continue

    // Hora 14:30
    if (start > 0 && text[start - 1] === ':') continue
    if (/^\d{1,2}:\d{2}/.test(text.slice(start))) continue

    // Fragmento de fecha con separadores / - .
    const before = text[start - 1] || ''
    const after = text[end] || ''
    if (/[/.-]/.test(before) || /[/.-]/.test(after)) continue
    const window = text.slice(Math.max(0, start - 3), Math.min(text.length, end + 6))
    if (/\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}/.test(window)) continue

    if (!/€/.test(text) && looksLikeDayMonth(m[1]) && /\bfecha\b/i.test(text)) continue

    const around = text.slice(Math.max(0, start - 1), Math.min(text.length, end + 1))
    pushUnique(parseMoney(m[1]), start, m[1], /€/i.test(around))
  }

  results.sort((a, b) => a.index - b.index)
  return results
}

function looksLikeDayMonth(token) {
  const parts = String(token).split(/[.,]/)
  if (parts.length !== 2) return false
  const a = Number(parts[0])
  const b = Number(parts[1])
  return a >= 1 && a <= 31 && b >= 1 && b <= 12
}

function isPlausibleMoney(value, allowHigh = false) {
  if (!Number.isFinite(value) || value <= 0) return false
  // Centavos mínimos
  if (value < 0.01) return false
  if (allowHigh) return value <= 2000
  // Precio de línea de producto de súper (no electrodomésticos)
  return value <= 150
}

function isPriceOnlyLine(line) {
  const t = String(line || '')
    .trim()
    .replace(/[€eE]\s*$/, '')
    .trim()
  return /^\d{1,4}[.,]\d{2}$/.test(t)
}

/** Une nombre + precio en líneas separadas solo si el precio es euro real */
function coalesceBrokenLines(lines) {
  const out = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const next = lines[i + 1]
    if (
      next &&
      looksLikeProductName(line) &&
      !findEuroAmounts(line).length &&
      isPriceOnlyLine(next) &&
      findEuroAmounts(next).length === 1
    ) {
      out.push(`${line} ${next.trim()}`)
      i += 1
      continue
    }
    if (
      next &&
      looksLikeProductName(line) &&
      !findEuroAmounts(line).length &&
      /^\d+[.,]\d+\s*kg\b/i.test(next)
    ) {
      out.push(`${line} ${next}`)
      i += 1
      continue
    }
    out.push(line)
  }
  return out
}

function looksLikeProductName(line) {
  const t = String(line || '').trim()
  if (t.length < 3 || t.length > 70) return false
  if (isPriceOnlyLine(t)) return false
  if (isMetaOrNoiseLine(t)) return false
  if (TOTAL_LABEL.test(t)) return false
  return /[A-Za-zÁÉÍÓÚÑáéíóúñ]{2,}/.test(t)
}

function parseItemLine(line) {
  const cleaned = String(line || '')
    .replace(/\s+/g, ' ')
    .trim()
  if (!cleaned || isMetaOrNoiseLine(cleaned)) return null

  // Al peso: "PLATANOS 0,450 kg x 2,49" · opcional total a la derecha
  let m = cleaned.match(
    /^(.+?)\s+(\d+[.,]\d+)\s*kg\s*[x×*]\s*(\d+[.,]\d{2})(?:\s*(?:€|e|eur)?\/?\s*kg)?(?:\s+(\d+[.,]\d{2})\s*€?)?$/i,
  )
  if (m && looksLikeProductName(m[1])) {
    const weightKg = parseMoney(m[2])
    const pricePerKg = parseMoney(m[3])
    if (!isPlausibleMoney(pricePerKg) || weightKg <= 0 || weightKg > 50) return null
    const lineTotal = m[4]
      ? parseMoney(m[4])
      : Math.round(weightKg * pricePerKg * 100) / 100
    if (!isPlausibleMoney(lineTotal)) return null
    return {
      name: cleanName(m[1]),
      price: lineTotal,
      qty: 1,
      unit: 'kg',
      unitPrice: pricePerKg,
      weightKg,
      _confidence: m[4] ? 0.95 : 0.85,
    }
  }

  // Precio/kg sin peso: "ENTRECOT 12,99 €/kg"
  m = cleaned.match(/^(.+?)\s+(\d+[.,]\d{2})\s*(?:€|e|eur)?\s*\/\s*kg$/i)
  if (m && looksLikeProductName(m[1])) {
    const pricePerKg = parseMoney(m[2])
    if (!isPlausibleMoney(pricePerKg)) return null
    return {
      name: cleanName(m[1]),
      price: pricePerKg,
      qty: 1,
      unit: 'kg',
      unitPrice: pricePerKg,
      _confidence: 0.7,
    }
  }

  // "LECHE x2 2,50" / "LECHE x 2 2,50€" → qty y TOTAL de línea
  m = cleaned.match(/^(.+?)\s+x\s*(\d{1,2})\s+(\d+[.,]\d{2})\s*€?$/i)
  if (m && looksLikeProductName(m[1])) {
    const qty = Number(m[2]) || 1
    const lineTotal = parseMoney(m[3])
    if (qty < 1 || qty > 30 || !isPlausibleMoney(lineTotal)) return null
    return {
      name: cleanName(m[1]),
      qty,
      price: lineTotal,
      unit: 'ud',
      unitPrice: Math.round((lineTotal / qty) * 100) / 100,
      _confidence: 0.92,
    }
  }

  // "2 LECHE ENTERA 2,50" → qty al inicio, precio al final
  m = cleaned.match(/^(\d{1,2})\s+(.+?)\s+(\d+[.,]\d{2})\s*€?$/)
  if (m && looksLikeProductName(m[2])) {
    const qty = Number(m[1]) || 1
    const lineTotal = parseMoney(m[3])
    if (qty < 1 || qty > 30 || !isPlausibleMoney(lineTotal)) return null
    // Evitar interpretar código de barras corto + basura
    if (!/[A-Za-zÁÉÍÓÚÑáéíóúñ]{2,}/.test(m[2])) return null
    return {
      name: cleanName(m[2]),
      qty,
      price: lineTotal,
      unit: 'ud',
      unitPrice: Math.round((lineTotal / qty) * 100) / 100,
      _confidence: 0.88,
    }
  }

  // Caso general: nombre + precio(s). El precio del producto es el de la DERECHA.
  const amounts = findEuroAmounts(cleaned, { allowHigh: false })
  if (!amounts.length) return null

  const priceAmount = amounts[amounts.length - 1]
  // Nombre = texto a la izquierda del precio final
  let namePart = cleaned.slice(0, priceAmount.index).trim()
  namePart = namePart
    .replace(/\s*[€eE]\s*$/, '')
    .replace(/\s+\d+[.,]\d{2}\s*$/, '') // quitar otros importes intermedios del nombre
    .trim()

  // Si el precio estaba a la izquierda ("1,25 LECHE"), name a la derecha
  if (!looksLikeProductName(namePart) && priceAmount.index < 4) {
    namePart = cleaned.slice(priceAmount.index + priceAmount.raw.length).trim()
    namePart = namePart.replace(/^[€eE]\s*/, '').trim()
  }

  if (!looksLikeProductName(namePart)) return null
  const name = cleanName(namePart)
  if (!isValidProductName(name)) return null
  if (!isPlausibleMoney(priceAmount.value)) return null

  const qty = extractQty(namePart) || 1
  let confidence = priceAmount.hasEuro ? 0.95 : 0.8
  // Varios importes: el de la derecha suele ser el total de línea
  if (amounts.length > 1) confidence += 0.05

  return {
    name,
    price: priceAmount.value,
    qty,
    unit: 'ud',
    unitPrice: qty > 1 ? Math.round((priceAmount.value / qty) * 100) / 100 : priceAmount.value,
    _confidence: Math.min(0.99, confidence),
  }
}

function isValidProductName(name) {
  const n = normalizeText(name)
  if (!n || n.length < 3) return false
  const first = n.split(' ')[0] || ''
  if (SKIP_NAME.test(first)) return false
  if (SKIP_NAME.test(n)) return false
  // Rechazar nombres que son solo números / códigos
  if (!/[a-z]{2,}/.test(n)) return false
  // Rechazar si parece fecha escrita
  if (/^\d{1,2}\s+\d{1,2}\s+\d{2,4}$/.test(n)) return false
  return true
}

function isValidProductItem(item) {
  if (!item || !isValidProductName(item.name)) return false
  if (!isPlausibleMoney(item.price)) return false
  return true
}

function cleanName(name) {
  return String(name || '')
    .replace(/\s*x\s*\d+\s*$/i, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^[\d*\-_.#]+/, '')
    .replace(/\s+\d+[.,]\d{2}\s*€?\s*$/, '')
    .replace(/\s+[€eE]\s*$/, '')
    .trim()
}

function extractQty(name) {
  const m = String(name).match(/\bx\s*(\d{1,2})\b/i)
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
      prev._confidence = Math.max(prev._confidence || 0, item._confidence || 0)
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

/**
 * Si el ticket dice N artículos, recortar/ajustar.
 * Si hay total, eliminar líneas dudosas que rompen la suma.
 */
function refineAgainstTotal(items, total, articleCount) {
  let list = [...items]

  if (articleCount && list.length > articleCount) {
    // Quedarse con las de mayor confianza / precio más plausible
    list.sort((a, b) => (b._confidence || 0) - (a._confidence || 0))
    list = list.slice(0, articleCount)
  }

  if (total != null && list.length) {
    const sum = sumPrices(list)
    if (Math.abs(sum - total) <= 0.06) return list
    // Quitar la línea cuya eliminación acerca más al total
    list = dropOutliersToMatchTotal(list, total)
  }

  // Restaurar orden de aparición
  list.sort((a, b) => (a._lineIndex || 0) - (b._lineIndex || 0))
  return list
}

function dropOutliersToMatchTotal(items, total) {
  let list = [...items]
  for (let guard = 0; guard < 8 && list.length > 1; guard++) {
    const sum = sumPrices(list)
    if (Math.abs(sum - total) <= 0.06) break
    // Si la suma es mayor, quitar el ítem que más sobra (y menos confianza)
    if (sum > total) {
      let worstIdx = -1
      let worstScore = -Infinity
      for (let i = 0; i < list.length; i++) {
        const without = sum - list[i].price
        const improvement = Math.abs(sum - total) - Math.abs(without - total)
        const score = improvement - (list[i]._confidence || 0.5)
        if (score > worstScore) {
          worstScore = score
          worstIdx = i
        }
      }
      if (worstIdx >= 0 && worstScore > 0) {
        list.splice(worstIdx, 1)
        continue
      }
    }
    break
  }
  return list
}

function detectStore(lines) {
  const head = normalizeText(lines.slice(0, 14).join(' '))
  const all = normalizeText(lines.join(' '))
  const blob = `${head} ${all}`

  const aliases = [
    { id: 'mercadona', keys: ['mercadona', 'hacendado'] },
    { id: 'lidl', keys: ['lidl'] },
    { id: 'alimerka', keys: ['alimerka'] },
    { id: 'alcampo', keys: ['alcampo', 'auchan'] },
    { id: 'carrefour', keys: ['carrefour'] },
    {
      id: 'masymas',
      keys: ['masymas', 'mas y mas', 'masy mas', 'supermasymas', 'hijos de luis rodriguez'],
    },
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

export function getPriceEntry(prices, productId, name, storeId) {
  if (!prices || typeof prices !== 'object') return null
  const store = storeId && storeId !== 'todos' ? storeId : null
  if (!store) return null

  const bucket = prices[store]
  if (bucket && typeof bucket === 'object') {
    if (productId && bucket[`id:${productId}`]) return bucket[`id:${productId}`]
    return bucket[priceKey(null, name)] || null
  }

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
        category: entry.category || null,
      })
    }
    entries.sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'es'))
    if (entries.length) groups.push({ store, entries })
  }
  return groups
}

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

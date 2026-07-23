import './style.css'
import {
  CATEGORIES,
  searchProducts,
  getProductById,
  getProductsByCategory,
  getProductsBySub,
  getCategory,
  groupProducts,
  setExtraProducts,
  upsertExtraProduct,
  allProducts,
  guessCategory,
} from './products.js'
import { renderIcon, renderCategoryIcon } from './icons.js'
import { STORES, getStore, storeOrder, storeLabel, renderStoreLogo } from './stores.js'
import {
  getListIdFromUrl,
  loadLocal,
  saveLocal,
  getSyncUrl,
  setSyncUrl,
  pullRemote,
  pushRemote,
  saveMember,
  saveMembers,
  applySyncFromUrl,
  buildNfcLink,
  DEFAULT_CLOUD_SYNC,
} from './storage.js'
import {
  parseReceiptText,
  matchCatalogProduct,
  getPriceEntry,
  formatEuro,
  formatPriceLabel,
  listPricedProductsByStore,
  applyTicketPrices,
  resolveTicketCatalog,
} from './receipt.js'
import {
  startCamera,
  stopCamera,
  captureFrame,
  recognizeCanvas,
  terminateScanner,
  preloadScanner,
  startTicketTracking,
} from './scanner.js'

const listId = getListIdFromUrl()
let state = loadLocal(listId)
// Normalizar tienda en ítems antiguos
state.items = state.items.map((item) => ({
  ...item,
  store: item.store && STORES.some((s) => s.id === item.store) ? item.store : 'todos',
}))
if (!Array.isArray(state.history)) state.history = []
if (!Array.isArray(state.tickets)) state.tickets = []
if (!Array.isArray(state.extraProducts)) state.extraProducts = []
if (!state.prices || typeof state.prices !== 'object') state.prices = {}
setExtraProducts(state.extraProducts)
let view = 'lista'
let category = null // null = pasillos (rejilla)
let subcategory = 'all'
let historyDay = null // null = lista de días · YYYY-MM-DD = detalle
let ticketDetail = null // null | ticket id
let query = ''
let activeStore = localStorage.getItem('compra:store') || 'todos'
if (!STORES.some((s) => s.id === activeStore)) activeStore = 'todos'
let qtyDraft = 2
let storeFilter = 'all' // all | store id
let toastTimer = null
let syncTimer = null
let pushing = false
let syncOk = false
let deferredInstallPrompt = null
let scanLoop = null
let scanBusy = false
let pendingTicketDraft = null

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  deferredInstallPrompt = e
})

window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null
  showToast('App instalada en el móvil')
})

const app = document.querySelector('#app')

init()

async function init() {
  applySyncFromUrl()
  render()
  await syncPull()
  startSyncLoop()
  // Al escanear la NFC el móvil abre/reabre la app → refrescar lista
  window.addEventListener('pageshow', () => {
    if (getSyncUrl()) syncPull()
  })
  window.addEventListener('focus', () => {
    if (getSyncUrl()) syncPull()
  })
  if (!state.member) {
    openSheet('member')
  }
}

function render() {
  const count = state.items.reduce((n, i) => n + i.qty, 0)
  app.innerHTML = `
    <header class="app-header">
      <div class="brand-row">
        <div class="brand">
          <div class="brand-mark" aria-hidden="true">🛒</div>
          <div class="brand-text">
            <h1>Lista de la compra</h1>
            <div class="brand-meta">
              <span class="sync-dot ${syncOk ? 'on' : ''}" title="${syncOk ? 'Sincronizado' : 'Solo este móvil'}"></span>
              <span class="brand-meta-text">${escapeHtml(listId)} · ${escapeHtml(state.member || 'sin nombre')}</span>
            </div>
          </div>
        </div>
        <button class="icon-btn" type="button" data-action="open-settings" aria-label="Ajustes">⚙️</button>
      </div>
      <div class="search-wrap">
        <span class="search-icon">🔎</span>
        <input id="search" type="search" placeholder="${
          view === 'lista'
            ? 'Buscar en la lista…'
            : view === 'historial'
              ? historyDay
                ? 'Buscar en este día…'
                : 'Buscar día o producto…'
              : view === 'tickets'
                ? 'Buscar en tickets…'
                : 'Buscar productos…'
        }" value="${escapeAttr(query)}" autocomplete="off" />
        ${query ? `<button class="clear-search" type="button" data-action="clear-search" aria-label="Limpiar">✕</button>` : ''}
      </div>
    </header>

    <main>
      <section class="view ${view === 'lista' ? 'active' : ''}" data-view-panel="lista">
        ${renderLista()}
      </section>
      <section class="view ${view === 'catalogo' ? 'active' : ''}" data-view-panel="catalogo">
        ${renderCatalogo()}
      </section>
      <section class="view ${view === 'tickets' ? 'active' : ''}" data-view-panel="tickets">
        ${renderTickets()}
      </section>
      <section class="view ${view === 'historial' ? 'active' : ''}" data-view-panel="historial">
        ${renderHistorial()}
      </section>
    </main>

    <nav class="bottom-nav bottom-nav-4">
      <button class="nav-btn ${view === 'lista' ? 'active' : ''}" type="button" data-action="set-view" data-view="lista">
        <span class="icon">📝</span>
        Lista ${count ? `(${count})` : ''}
      </button>
      <button class="nav-btn ${view === 'catalogo' ? 'active' : ''}" type="button" data-action="set-view" data-view="catalogo">
        <span class="icon">🏪</span>
        Añadir
      </button>
      <button class="nav-btn ${view === 'tickets' ? 'active' : ''}" type="button" data-action="set-view" data-view="tickets">
        <span class="icon">🧾</span>
        Tickets
      </button>
      <button class="nav-btn ${view === 'historial' ? 'active' : ''}" type="button" data-action="set-view" data-view="historial">
        <span class="icon">📅</span>
        Historial
      </button>
    </nav>

    <div class="overlay" id="overlay"></div>
    <div class="toast" id="toast"></div>
  `

  bindEvents()
}

function renderLista() {
  const filtered = filterListItems(state.items, query).filter((item) =>
    itemMatchesStoreFilter(item, storeFilter),
  )
  const groups = groupItemsByStore(filtered)

  if (!state.items.length) {
    return `
      <div class="empty-state">
        <div class="emoji">🧊</div>
        <h2>La nevera está al día</h2>
        <p>Añade lo que falta con el producto rápido o el catálogo.</p>
      </div>
      <button class="quick-add-btn" type="button" data-action="add-custom">
        <span aria-hidden="true">＋</span>
        Añadir producto rápido
      </button>
      <button class="secondary-btn catalog-btn" type="button" data-action="set-view" data-view="catalogo">Ver catálogo</button>
    `
  }

  return `
    ${renderStorePicker('filter')}
    <div class="list-meta">
      <h2>Para comprar</h2>
      <span class="badge">${filtered.reduce((n, i) => n + i.qty, 0)} uds</span>
    </div>
    <button class="quick-add-btn" type="button" data-action="add-custom">
      <span aria-hidden="true">＋</span>
      Añadir producto rápido
    </button>
    <div class="shopping-list">
      ${
        groups.length
          ? groups
              .map(
                (g) => `
        <section class="store-group" style="--store:${g.store.brand}">
          <div class="store-group-head">
            ${renderStoreLogo(g.store, 'sm')}
            <h3>${escapeHtml(g.store.name)}</h3>
            <em>${g.items.reduce((n, i) => n + i.qty, 0)}</em>
          </div>
          ${g.items.map(renderListItem).join('')}
        </section>`,
              )
              .join('')
          : `<p class="section-label">Nada en este supermercado</p>`
      }
    </div>
    ${
      state.items.length
        ? `<div class="custom-row">
            <button class="danger-btn" type="button" data-action="clear-bought" style="width:100%">Vaciar lista</button>
          </div>`
        : ''
    }
  `
}

function renderStorePicker(mode) {
  if (mode === 'filter') return renderStoreLogoPicker('filter')
  return renderStoreLogoPicker('add')
}

function itemMatchesStoreFilter(item, filter) {
  // TODOS: visible en cualquier supermercado
  if (filter === 'all') return true
  return item.store === filter || item.store === 'todos'
}

/** Desplegable solo logos (PC y móvil) — usa <details> nativo para que siempre abra */
function renderStoreLogoPicker(mode) {
  const isFilter = mode === 'filter'
  const selectedId = isFilter ? (storeFilter === 'all' ? 'todos' : storeFilter) : activeStore
  const selected = getStore(selectedId)
  const label = isFilter ? 'Ver' : 'Nuevos productos en'
  const pickerId = isFilter ? 'filter' : 'add'

  return `
    <div class="store-bar ${isFilter ? '' : 'store-bar-add'}">
      <div class="store-bar-label">${label}</div>
      <details class="store-logo-picker" data-picker="${pickerId}">
        <summary
          class="store-logo-trigger"
          style="--store:${selected.brand}"
          aria-label="${escapeAttr(isFilter ? `Ver: ${storeLabel(selected, 'filter')}` : `Añadir en ${selected.name}`)}"
        >
          ${renderStoreLogo(selected, 'lg')}
          <span class="store-logo-caret" aria-hidden="true"></span>
        </summary>
        <div class="store-logo-menu" role="listbox">
          ${STORES.map((s) => {
            const value = isFilter ? (s.id === 'todos' ? 'all' : s.id) : s.id
            const active = isFilter
              ? (s.id === 'todos' ? storeFilter === 'all' : storeFilter === s.id)
              : activeStore === s.id
            const action = isFilter ? 'set-store-filter' : 'set-active-store'
            return `
              <button
                type="button"
                class="store-logo-option ${active ? 'active' : ''}"
                role="option"
                aria-selected="${active ? 'true' : 'false'}"
                aria-label="${escapeAttr(storeLabel(s, isFilter ? 'filter' : 'add'))}"
                data-action="${action}"
                data-store="${escapeAttr(value)}"
                style="--store:${s.brand}"
              >
                ${renderStoreLogo(s, 'xl')}
              </button>`
          }).join('')}
        </div>
      </details>
    </div>
  `
}

function groupItemsByStore(items) {
  const map = new Map()
  for (const id of storeOrder()) map.set(id, [])
  for (const item of items) {
    const key = getStore(item.store).id
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(item)
  }
  return [...map.entries()]
    .filter(([, list]) => list.length)
    .map(([id, list]) => ({ store: getStore(id), items: list }))
}

function renderListItem(item) {
  const product = item.productId ? getProductById(item.productId) : null
  const visual = product
    ? { emoji: product.emoji, icon: product.icon, name: product.name }
    : { emoji: item.emoji || '🛒', icon: item.icon || null, name: item.name }
  const name = product?.name || item.name
  const store = getStore(item.store)
  const who = item.addedBy ? `Añadido por ${item.addedBy}` : 'En la lista'
  const when = item.addedAt ? ` · ${formatTime(item.addedAt)}` : ''
  const price = getPriceEntry(state.prices, item.productId, name, item.store)
  const priceLabel = price ? formatPriceLabel(price) : ''

  return `
    <article class="list-item" data-id="${escapeAttr(item.id)}" style="--store:${store.brand}">
      <div class="item-main">
        <div class="item-emoji">${renderIcon(visual, 'sm')}</div>
        <div class="item-body">
          <div class="item-info">
            <strong>${escapeHtml(name)}</strong>
            <span class="item-meta">${escapeHtml(who + when)}</span>
            <span class="item-price ${price ? '' : 'is-empty'}">${
              priceLabel || '0,00€'
            }</span>
          </div>
          <div class="item-side">
            <button class="store-badge" type="button" data-action="cycle-store" data-id="${escapeAttr(item.id)}" title="Cambiar supermercado" style="--store:${store.brand}">
              ${renderStoreLogo(store, 'xs')}
              <span>${escapeHtml(store.short)}</span>
            </button>
            <div class="qty">
              <button type="button" data-action="qty" data-id="${escapeAttr(item.id)}" data-delta="-1" aria-label="Menos">−</button>
              <b>${item.qty}</b>
              <button type="button" data-action="qty" data-id="${escapeAttr(item.id)}" data-delta="1" aria-label="Más">＋</button>
            </div>
          </div>
        </div>
      </div>
      <div class="buy-slide" data-buy-id="${escapeAttr(item.id)}">
        <div class="buy-slide-fill"></div>
        <span class="buy-slide-label">Desliza para comprar</span>
        <span class="buy-slide-done">✓ Comprado</span>
        <button class="buy-slide-knob" type="button" aria-label="Deslizar a la derecha para marcar comprado">›</button>
      </div>
    </article>
  `
}

function renderCatalogo() {
  const searching = Boolean(query.trim())

  if (searching) {
    return renderSearchResults()
  }

  if (category === '__reales__') {
    return renderRealesBrowse()
  }

  if (!category) {
    return renderAisles()
  }

  return renderCategoryBrowse()
}

function renderAisles() {
  const realesCount = listPricedProductsByStore(state.prices).reduce(
    (n, g) => n + g.entries.length,
    0,
  )

  return `
    ${renderStorePicker('add')}
    <div class="browse-head">
      <h2>Pasillos</h2>
      <p>Añadiendo en <strong>${escapeHtml(getStore(activeStore).name)}</strong></p>
    </div>
    <button class="aisle-card reales-card" type="button" data-action="set-category" data-category="__reales__">
      <span class="aisle-icon">🧾</span>
      <span class="aisle-name">Productos reales</span>
      <span class="aisle-count">${realesCount}</span>
    </button>
    <p class="reales-hint">Precios sacados de tickets, por supermercado${realesCount ? '' : ' · escanea un ticket para empezar'}</p>
    <div class="aisle-grid">
      ${CATEGORIES.map((c) => {
        const count = getProductsByCategory(c.id).length
        return `
          <button class="aisle-card" type="button" data-action="set-category" data-category="${c.id}">
            <span class="aisle-icon">${renderCategoryIcon(c.id, 'lg')}</span>
            <span class="aisle-name">${escapeHtml(c.name)}</span>
            <span class="aisle-count">${count}</span>
          </button>`
      }).join('')}
    </div>
    <div class="custom-row">
      <div class="quick-add">
        <input id="custom-name-cat" type="text" placeholder="¿No está? Escríbelo aquí" maxlength="60" />
        <button class="primary-btn" type="button" data-action="add-custom-cat">Añadir</button>
      </div>
    </div>
  `
}

function renderRealesBrowse() {
  const groups = listPricedProductsByStore(state.prices)
  const total = groups.reduce((n, g) => n + g.entries.length, 0)

  return `
    <div class="browse-bar">
      <button class="back-btn" type="button" data-action="set-category" data-category="" aria-label="Volver">←</button>
      <div class="browse-bar-title">
        <span class="browse-bar-icon">🧾</span>
        <div>
          <strong>Productos reales</strong>
          <span>${total} con precio de ticket</span>
        </div>
      </div>
    </div>
    ${
      groups.length
        ? groups
            .map((group) => {
              const sections = groupRealEntriesBySection(group.entries)
              return `
              <section class="reales-store-group" style="--store:${group.store.brand}">
                <div class="reales-store-head">
                  ${renderStoreLogo(group.store, 'sm')}
                  <strong>${escapeHtml(group.store.name)}</strong>
                  <em>${group.entries.length}</em>
                </div>
                ${sections
                  .map(
                    (section) => `
                  <div class="reales-section">
                    <div class="reales-section-head">
                      <span class="reales-section-icon">${renderCategoryIcon(section.category.id, 'sm')}</span>
                      <strong>${escapeHtml(section.category.name)}</strong>
                      <em>${section.entries.length}</em>
                    </div>
                    <div class="product-grid">
                      ${section.entries
                        .map((entry) => renderRealProductCard(entry, group.store.id))
                        .join('')}
                    </div>
                  </div>`,
                  )
                  .join('')}
              </section>`
            })
            .join('')
        : `<div class="empty-state">
            <div class="emoji">🧾</div>
            <h2>Aún no hay productos reales</h2>
            <p>Escanea un ticket en la pestaña Tickets. Los productos y precios quedarán aquí, separados por supermercado y sección.</p>
          </div>`
    }
  `
}

/** Agrupa productos reales por pasillo/categoría (orden del catálogo) */
function groupRealEntriesBySection(entries) {
  const map = new Map()
  for (const entry of entries || []) {
    const product = entry.productId ? getProductById(entry.productId) : null
    const catId = product?.category || guessCategory(entry.name || '').category || 'despensa'
    if (!map.has(catId)) map.set(catId, [])
    map.get(catId).push(entry)
  }

  const sections = []
  for (const cat of CATEGORIES) {
    const list = map.get(cat.id)
    if (!list?.length) continue
    list.sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'es'))
    sections.push({ category: cat, entries: list })
    map.delete(cat.id)
  }
  for (const [id, list] of map) {
    if (!list?.length) continue
    list.sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'es'))
    sections.push({
      category: getCategory(id) || { id, name: 'Otros' },
      entries: list,
    })
  }
  return sections
}

function renderRealProductCard(entry, storeId) {
  const product = entry.productId ? getProductById(entry.productId) : null
  const visual = product || {
    name: entry.name,
    emoji: '🛒',
    icon: null,
  }
  const productId = product?.id || entry.productId
  const existing = productId
    ? state.items.find((i) => i.productId === productId && i.store === storeId)
    : state.items.find(
        (i) => !i.productId && i.name === entry.name && i.store === storeId,
      )
  const priceLabel = formatPriceLabel(entry)

  if (!productId) {
    // Producto solo por nombre (sin id): añadir como custom en ese súper
    return `
      <button
        class="product-card reales-product ${existing ? 'in-list' : ''}"
        type="button"
        data-action="add-real-named"
        data-name="${escapeAttr(entry.name)}"
        data-store="${escapeAttr(storeId)}"
        data-longpress="add-qty"
        title="Toque: +1 · Mantener: elegir cantidad"
      >
        <span class="product-icon">
          ${renderIcon(visual, 'sm')}
          <span class="price-under">${escapeHtml(priceLabel)}</span>
        </span>
        <span class="name">${escapeHtml(entry.name)}</span>
        ${existing ? `<span class="qty-tag">×${existing.qty}</span>` : ''}
      </button>`
  }

  return `
    <button
      class="product-card reales-product ${existing ? 'in-list' : ''}"
      type="button"
      data-action="toggle-product"
      data-product="${escapeAttr(productId)}"
      data-store="${escapeAttr(storeId)}"
      data-longpress="add-qty"
      title="Toque: +1 · Mantener: elegir cantidad"
    >
      <span class="product-icon">
        ${renderIcon(visual, 'sm')}
        <span class="price-under">${escapeHtml(priceLabel)}</span>
      </span>
      <span class="name">${escapeHtml(product?.name || entry.name)}</span>
      ${existing ? `<span class="qty-tag">×${existing.qty}</span>` : ''}
    </button>`
}

function renderCategoryBrowse() {
  const cat = getCategory(category)
  const products = getVisibleProducts()
  const subs = [{ id: 'all', name: 'Todo' }, ...(cat?.subs || [])]

  return `
    ${renderStorePicker('add')}
    <div class="browse-bar">
      <button class="back-btn" type="button" data-action="set-category" data-category="" aria-label="Volver">←</button>
      <div class="browse-bar-title">
        <span class="browse-bar-icon">${renderCategoryIcon(category, 'sm')}</span>
        <div>
          <strong>${escapeHtml(cat?.name || '')}</strong>
          <span>${products.length} · ${escapeHtml(getStore(activeStore).name)}</span>
        </div>
      </div>
    </div>
    <div class="sub-scroll">
      ${subs
        .map((s) => {
          const count =
            s.id === 'all'
              ? getProductsByCategory(category).length
              : getProductsBySub(category, s.id).length
          if (s.id !== 'all' && count === 0) return ''
          return `
          <button class="sub-chip ${subcategory === s.id ? 'active' : ''}" type="button" data-action="set-sub" data-sub="${s.id}">
            ${escapeHtml(s.name)}
            <em>${count}</em>
          </button>`
        })
        .join('')}
    </div>
    <div class="product-grid">
      ${products.map(renderProductCard).join('') || '<p class="section-label">No hay productos en esta sección</p>'}
    </div>
    <div class="custom-row">
      <div class="quick-add">
        <input id="custom-name-cat" type="text" placeholder="¿No está? Escríbelo aquí" maxlength="60" />
        <button class="primary-btn" type="button" data-action="add-custom-cat">Añadir</button>
      </div>
    </div>
  `
}

function renderSearchResults() {
  let list = searchProducts(query)
  if (category) list = list.filter((p) => p.category === category)
  const groups = groupProducts(list)

  return `
    ${renderStorePicker('add')}
    <div class="browse-bar">
      ${
        category
          ? `<button class="back-btn" type="button" data-action="set-category" data-category="" aria-label="Volver">←</button>`
          : `<button class="back-btn" type="button" data-action="clear-search" aria-label="Limpiar">✕</button>`
      }
      <div class="browse-bar-title">
        <div>
          <strong>Resultados</strong>
          <span>${list.length} para “${escapeHtml(query.trim())}”</span>
        </div>
      </div>
    </div>
    ${
      groups.length
        ? groups
            .map(
              (g) => `
        <section class="result-group">
          <div class="result-group-head">
            <span class="result-group-icon">${renderCategoryIcon(g.categoryId, 'sm')}</span>
            <div>
              <strong>${escapeHtml(g.categoryName)}</strong>
              ${g.subName ? `<span>${escapeHtml(g.subName)}</span>` : ''}
            </div>
            <button class="link-btn" type="button" data-action="jump-sub" data-category="${g.categoryId}" data-sub="${g.subId}">Ver</button>
          </div>
          <div class="product-grid">
            ${g.products.map(renderProductCard).join('')}
          </div>
        </section>`,
            )
            .join('')
        : `<div class="empty-state"><div class="emoji">🔎</div><h2>Sin resultados</h2><p>Prueba con otro nombre o añádelo abajo.</p></div>`
    }
    <div class="custom-row">
      <div class="quick-add">
        <input id="custom-name-cat" type="text" placeholder="Añadir “${escapeAttr(query.trim())}”" maxlength="60" value="${escapeAttr(query.trim())}" />
        <button class="primary-btn" type="button" data-action="add-custom-cat">Añadir</button>
      </div>
    </div>
  `
}

function renderProductCard(product) {
  const existing = state.items.find(
    (i) => i.productId === product.id && i.store === activeStore,
  )
  const price = getPriceEntry(state.prices, product.id, product.name, activeStore)
  return `
    <button class="product-card ${existing ? 'in-list' : ''}" type="button" data-action="toggle-product" data-product="${escapeAttr(product.id)}" data-longpress="add-qty" title="Toque: +1 · Mantener: elegir cantidad">
      <span class="product-icon">
        ${renderIcon(product, 'sm')}
        ${price ? `<span class="price-under">${escapeHtml(formatPriceLabel(price))}</span>` : ''}
      </span>
      <span class="name">${escapeHtml(product.name)}</span>
      ${existing ? `<span class="qty-tag">×${existing.qty}</span>` : ''}
    </button>
  `
}

function getVisibleProducts() {
  if (query.trim()) {
    let list = searchProducts(query)
    if (category) list = list.filter((p) => p.category === category)
    return list
  }
  if (!category) return []
  const list = getProductsByCategory(category)
  if (subcategory === 'all') return list
  return list.filter((p) => p.sub === subcategory)
}

function filterListItems(items, q) {
  const needle = q.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  if (!needle) return items
  return items.filter((item) => {
    const product = item.productId ? getProductById(item.productId) : null
    const name = (product?.name || item.name || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
    return name.includes(needle)
  })
}

let eventsBound = false

function bindEvents() {
  if (!eventsBound) {
    eventsBound = true
    app.addEventListener('click', (e) => {
      if (e.target?.id === 'overlay') {
        closeSheet()
        return
      }
      const btn = e.target.closest('[data-action]')
      if (!btn || !app.contains(btn)) return
      onAction({ currentTarget: btn })
    })
    app.addEventListener('input', (e) => {
      if (e.target?.id !== 'search') return
      query = e.target.value
      softRerender()
    })
    app.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' || e.target?.id !== 'custom-name-cat') return
      e.preventDefault()
      addCustomProduct(e.target.value)
      e.target.value = ''
    })
  }
  bindLongPress()
  bindBuySliders()
  bindStoreSelects()
}

function closeStorePickers(except = null) {
  app.querySelectorAll('details.store-logo-picker[open]').forEach((p) => {
    if (except && p === except) return
    p.open = false
  })
}

function bindStoreSelects() {
  if (!app.dataset.storePickerBound) {
    app.dataset.storePickerBound = '1'
    // Solo un details abierto a la vez
    app.addEventListener('toggle', (e) => {
      const el = e.target
      if (!(el instanceof HTMLDetailsElement)) return
      if (!el.classList.contains('store-logo-picker') || !el.open) return
      closeStorePickers(el)
    }, true)
    // Cerrar al tocar fuera (después del click nativo del <details>)
    document.addEventListener('click', (e) => {
      if (e.target.closest?.('details.store-logo-picker')) return
      closeStorePickers()
    })
  }
}

function softRerender() {
  const lista = app.querySelector('[data-view-panel="lista"]')
  const catalogo = app.querySelector('[data-view-panel="catalogo"]')
  const tickets = app.querySelector('[data-view-panel="tickets"]')
  const historial = app.querySelector('[data-view-panel="historial"]')
  if (view === 'lista' && lista) lista.innerHTML = renderLista()
  if (view === 'catalogo' && catalogo) catalogo.innerHTML = renderCatalogo()
  if (view === 'tickets' && tickets) tickets.innerHTML = renderTickets()
  if (view === 'historial' && historial) historial.innerHTML = renderHistorial()

  const search = app.querySelector('#search')
  if (search) {
    search.placeholder =
      view === 'lista'
        ? 'Buscar en la lista…'
        : view === 'historial'
          ? historyDay
            ? 'Buscar en este día…'
            : 'Buscar día o producto…'
          : view === 'tickets'
            ? 'Buscar en tickets…'
            : 'Buscar productos…'
    if (search.value !== query) search.value = query
  }

  bindLongPress()
  bindBuySliders()
  bindStoreSelects()
  updateNavCount()
}

const LONG_PRESS_MS = 550
let suppressProductClickUntil = 0
let syncDirtyUntil = 0
let buyGestureActive = false

function bindLongPress() {
  app.querySelectorAll('[data-longpress]').forEach((el) => {
    if (el.dataset.lpBound) return
    el.dataset.lpBound = '1'

    let timer = null
    let longPressed = false
    let startX = 0
    let startY = 0

    const clearTimer = () => {
      if (timer) clearTimeout(timer)
      timer = null
      el.classList.remove('holding')
    }

    el.addEventListener(
      'pointerdown',
      (e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return
        longPressed = false
        startX = e.clientX
        startY = e.clientY
        el.classList.add('holding')
        clearTimer()
        timer = setTimeout(() => {
          longPressed = true
          suppressProductClickUntil = Date.now() + 800
          clearTimer()
          el.classList.add('long-pressed')
          if (el.dataset.product) openQtySheet(el.dataset.product, el.dataset.store)
          else if (el.dataset.name) {
            const created = upsertExtraProduct(state.extraProducts, el.dataset.name)
            state.extraProducts = created.list
            setExtraProducts(state.extraProducts)
            if (created.product) openQtySheet(created.product.id, el.dataset.store)
          }
          vibrate([12, 30, 12])
        }, LONG_PRESS_MS)
      },
      { passive: true },
    )

    el.addEventListener(
      'pointermove',
      (e) => {
        if (!timer) return
        if (Math.abs(e.clientX - startX) > 12 || Math.abs(e.clientY - startY) > 12) {
          clearTimer()
        }
      },
      { passive: true },
    )

    el.addEventListener('pointerup', clearTimer, { passive: true })
    el.addEventListener('pointercancel', clearTimer, { passive: true })
    el.addEventListener('pointerleave', clearTimer, { passive: true })

    // Igual que +/− de la lista: el click burbujea y suma +1
    el.addEventListener(
      'click',
      (e) => {
        if (longPressed || Date.now() < suppressProductClickUntil) {
          e.preventDefault()
          e.stopImmediatePropagation()
          longPressed = false
        }
      },
      true,
    )
  })
}

function updateNavCount() {
  const count = state.items.reduce((n, i) => n + i.qty, 0)
  const btn = app.querySelector('[data-view="lista"]')
  if (btn) btn.innerHTML = `<span class="icon">📝</span>Lista ${count ? `(${count})` : ''}`
}

function onAction(e) {
  const btn = e.currentTarget
  const action = btn.dataset.action

  switch (action) {
    case 'set-view':
      view = btn.dataset.view
      query = ''
      historyDay = null
      ticketDetail = null
      render()
      break
    case 'open-ticket':
      ticketDetail = btn.dataset.ticket || null
      query = ''
      softRerender()
      break
    case 'close-ticket':
      ticketDetail = null
      query = ''
      softRerender()
      break
    case 'scan-ticket':
      openTicketScanner()
      break
    case 'delete-ticket':
      if (confirm('¿Borrar este ticket?')) {
        state.tickets = (state.tickets || []).filter((t) => t.id !== btn.dataset.ticket)
        if (ticketDetail === btn.dataset.ticket) ticketDetail = null
        persist()
        showToast('Ticket borrado')
        softRerender()
      }
      break
    case 'open-history-day':
      historyDay = btn.dataset.day || null
      query = ''
      softRerender()
      break
    case 'close-history-day':
      historyDay = null
      query = ''
      softRerender()
      break
    case 'set-category': {
      const next = btn.dataset.category
      category = next || null
      subcategory = 'all'
      softRerender()
      break
    }
    case 'set-sub':
      subcategory = btn.dataset.sub
      softRerender()
      break
    case 'jump-sub':
      category = btn.dataset.category
      subcategory = btn.dataset.sub || 'all'
      query = ''
      softRerender()
      break
    case 'clear-search':
      query = ''
      render()
      break
    case 'toggle-product':
      // El +1 lo hace el toque en pointerup; el click solo si no hubo pointer (accesibilidad)
      if (Date.now() < suppressProductClickUntil) break
      addProductQty(btn.dataset.product, 1, btn.dataset.store)
      break
    case 'add-real-named': {
      if (Date.now() < suppressProductClickUntil) break
      addNamedRealProduct(btn.dataset.name, btn.dataset.store, 1)
      break
    }
    case 'set-store-filter': {
      storeFilter = btn.dataset.store
      softRerender()
      break
    }
    case 'set-active-store': {
      activeStore = btn.dataset.store
      localStorage.setItem('compra:store', activeStore)
      showToast(`Nuevos en ${getStore(activeStore).name}`)
      softRerender()
      break
    }
    case 'cycle-store':
      cycleItemStore(btn.dataset.id)
      break
    case 'qty':
      changeQty(btn.dataset.id, Number(btn.dataset.delta))
      break
    case 'add-custom':
      openQuickAddSheet()
      break
    case 'add-custom-cat': {
      const input = app.querySelector('#custom-name-cat')
      addCustomProduct(input?.value || '')
      if (input) input.value = ''
      break
    }
    case 'clear-bought':
      if (confirm('¿Seguro que quieres vaciar toda la lista?')) {
        state.items = []
        persist()
        showToast('Lista vaciada')
        softRerender()
      }
      break
    case 'clear-history':
      if (confirm('¿Vaciar todo el historial de compras?')) {
        state.history = []
        historyDay = null
        persist()
        showToast('Historial vaciado')
        softRerender()
      }
      break
    case 'delete-history-entry': {
      const id = btn.dataset.id
      if (!id) break
      const name = (state.history || []).find((e) => historyEntryKey(e) === id)?.name
      state.history = (state.history || []).filter((e) => historyEntryKey(e) !== id)
      if (historyDay && !groupHistoryByDay(state.history).some((d) => d.key === historyDay)) {
        historyDay = null
      }
      persist()
      showToast(name ? `Eliminado: ${name}` : 'Producto eliminado del historial')
      softRerender()
      break
    }
    case 'open-settings':
      openSheet('settings')
      break
    case 'open-help':
      openSheet('help')
      break
    case 'close-sheet':
      closeSheet()
      break
    default:
      break
  }
}

function toggleProduct(productId) {
  addProductQty(productId, 1)
}

function resolveAddStore(storeOverride) {
  if (storeOverride && storeOverride !== 'todos' && STORES.some((s) => s.id === storeOverride)) {
    return storeOverride
  }
  return activeStore
}

function addProductQty(productId, qty, storeOverride) {
  const amount = Math.max(1, Math.min(99, Number(qty) || 1))
  const product = getProductById(productId)
  if (!product) return
  const storeId = resolveAddStore(storeOverride)
  const existing = state.items.find(
    (i) => i.productId === productId && i.store === storeId,
  )
  if (existing) {
    existing.qty += amount
  } else {
    state.items.unshift({
      id: crypto.randomUUID(),
      productId,
      name: product.name,
      emoji: product.emoji,
      icon: product.icon || null,
      qty: amount,
      store: storeId,
      addedBy: state.member || '',
      addedAt: Date.now(),
    })
  }
  persist()
  showToast(`＋${amount} ${product.name} · ${getStore(storeId).name}`)
  vibrate()
  softRerender()
}

function addNamedRealProduct(name, storeOverride, qty = 1) {
  const clean = String(name || '').trim()
  if (!clean) return
  const storeId = resolveAddStore(storeOverride)
  const amount = Math.max(1, Math.min(99, Number(qty) || 1))
  const created = upsertExtraProduct(state.extraProducts, clean)
  state.extraProducts = created.list
  setExtraProducts(state.extraProducts)
  const product = created.product
  if (!product) return
  addProductQty(product.id, amount, storeId)
}

/** Fija la cantidad exacta (no suma). 0 = quitar de este súper. */
function setProductQty(productId, qty, storeOverride) {
  const product = getProductById(productId)
  if (!product) return
  const storeId = resolveAddStore(storeOverride)
  const amount = Math.max(0, Math.min(99, Number(qty) || 0))
  const existing = state.items.find(
    (i) => i.productId === productId && i.store === storeId,
  )

  if (amount <= 0) {
    if (!existing) return
    if (state.items.length === 1 && !confirmLastProduct(product.name)) return
    state.items = state.items.filter((i) => i.id !== existing.id)
    persist()
    showToast(`✕ ${product.name}`)
    vibrate()
    softRerender()
    return
  }

  if (existing) {
    existing.qty = amount
  } else {
    state.items.unshift({
      id: crypto.randomUUID(),
      productId,
      name: product.name,
      emoji: product.emoji,
      icon: product.icon || null,
      qty: amount,
      store: storeId,
      addedBy: state.member || '',
      addedAt: Date.now(),
    })
  }
  persist()
  showToast(`${amount}× ${product.name} · ${getStore(storeId).name}`)
  vibrate()
  softRerender()
}

function openQtySheet(productId, storeOverride) {
  const product = getProductById(productId)
  if (!product) return
  const storeId = resolveAddStore(storeOverride)
  const existing = state.items.find(
    (i) => i.productId === productId && i.store === storeId,
  )
  const editing = Boolean(existing)
  const totalOfProduct = state.items
    .filter((i) => i.productId === productId)
    .reduce((n, i) => n + i.qty, 0)
  qtyDraft = editing ? existing.qty : 2
  const overlay = app.querySelector('#overlay')
  if (!overlay) return
  const minQty = editing ? 0 : 1

  overlay.innerHTML = `
    <div class="sheet qty-sheet">
      <div class="qty-sheet-product">
        <span class="qty-sheet-icon">${renderIcon(product, 'md')}</span>
        <div>
          <h2>${escapeHtml(product.name)}</h2>
          <p>${
            editing
              ? `Cambiar cantidad en <strong>${escapeHtml(getStore(storeId).name)}</strong> · ahora ${existing.qty}`
              : `Añadir en <strong>${escapeHtml(getStore(storeId).name)}</strong>`
          }</p>
        </div>
      </div>
      <div class="qty-presets">
        ${[1, 2, 3, 4, 5, 6, 8, 10, 12]
          .map(
            (n) => `
          <button type="button" class="qty-preset ${qtyDraft === n ? 'active' : ''}" data-qty="${n}">${n}</button>`,
          )
          .join('')}
      </div>
      <div class="qty-stepper">
        <button type="button" class="qty-step" data-delta="-1" aria-label="Menos">−</button>
        <b id="qty-draft">${qtyDraft}</b>
        <button type="button" class="qty-step" data-delta="1" aria-label="Más">＋</button>
      </div>
      <div class="sheet-actions">
        <button class="secondary-btn" type="button" data-action="close-sheet">Cancelar</button>
        <button class="primary-btn" type="button" id="confirm-qty">${
          editing ? (qtyDraft === 0 ? 'Quitar' : `Dejar en ${qtyDraft}`) : `Añadir ${qtyDraft}`
        }</button>
      </div>
      ${
        editing
          ? `<button class="danger-btn qty-delete-btn" type="button" id="delete-product">Quitar de la lista${
              totalOfProduct > existing.qty ? ` (todas: ${totalOfProduct})` : ''
            }</button>`
          : ''
      }
    </div>
  `
  overlay.classList.add('open')

  const draftEl = overlay.querySelector('#qty-draft')
  const confirmBtn = overlay.querySelector('#confirm-qty')
  const syncDraft = () => {
    draftEl.textContent = String(qtyDraft)
    if (editing) {
      confirmBtn.textContent = qtyDraft === 0 ? 'Quitar' : `Dejar en ${qtyDraft}`
    } else {
      confirmBtn.textContent = `Añadir ${qtyDraft}`
    }
    overlay.querySelectorAll('.qty-preset').forEach((b) => {
      b.classList.toggle('active', Number(b.dataset.qty) === qtyDraft)
    })
  }

  overlay.querySelectorAll('.qty-preset').forEach((b) => {
    b.addEventListener('click', () => {
      qtyDraft = Number(b.dataset.qty)
      syncDraft()
    })
  })
  overlay.querySelectorAll('.qty-step').forEach((b) => {
    b.addEventListener('click', () => {
      qtyDraft = Math.max(minQty, Math.min(99, qtyDraft + Number(b.dataset.delta)))
      syncDraft()
    })
  })
  confirmBtn.addEventListener('click', () => {
    closeSheet()
    setProductQty(productId, qtyDraft, storeId)
  })
  const deleteBtn = overlay.querySelector('#delete-product')
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      const total = state.items
        .filter((i) => i.productId === productId)
        .reduce((n, i) => n + i.qty, 0)
      if (!confirm(`¿Borrar las ${total} ${product.name} de la lista?`)) return
      closeSheet()
      removeAllOfProduct(productId)
    })
  }
}

function removeAllOfProduct(productId) {
  const product = getProductById(productId)
  const matches = state.items.filter((i) => i.productId === productId)
  if (!matches.length) return
  state.items = state.items.filter((i) => i.productId !== productId)
  persist()
  showToast(`✕ ${product?.name || 'Eliminado'}`)
  softRerender()
}

function cycleItemStore(itemId) {
  const item = state.items.find((i) => i.id === itemId)
  if (!item) return
  const ids = storeOrder()
  const idx = ids.indexOf(item.store)
  item.store = ids[(idx + 1) % ids.length]
  // Fusionar si ya existe el mismo producto en esa tienda
  const twin = state.items.find(
    (i) => i.id !== item.id && i.productId && i.productId === item.productId && i.store === item.store,
  )
  if (twin) {
    twin.qty += item.qty
    state.items = state.items.filter((i) => i.id !== item.id)
  }
  persist()
  showToast(getStore(item.store).name)
  softRerender()
}

function confirmLastProduct(name) {
  const label = name ? `“${name}”` : 'este producto'
  return confirm(`Es el último de la lista. ¿Quitar ${label} y dejarla vacía?`)
}

function openQuickAddSheet(initialName = '') {
  const overlay = app.querySelector('#overlay')
  if (!overlay) return
  const selected = getStore(activeStore)
  const prefill = String(initialName || '').trim()

  overlay.innerHTML = `
    <div class="sheet quick-add-sheet">
      <button class="sheet-close" type="button" data-action="close-sheet" aria-label="Cerrar">✕</button>
      <h2>Producto rápido</h2>
      <p>Elige supermercado y confirma para añadirlo a la lista.</p>
      <label for="quick-add-name">Producto</label>
      <input id="quick-add-name" type="text" maxlength="60" placeholder="Ej. cilantro" value="${escapeAttr(prefill)}" autocomplete="off" />
      <label for="quick-add-store">Nuevos productos en</label>
      <div class="store-select-wrap ${selected.light ? 'light' : ''}" style="--store:${selected.brand}">
        ${renderStoreLogo(selected, 'sm')}
        <select id="quick-add-store" class="store-select">
          ${STORES.map((s) => {
            const selectedAttr = activeStore === s.id
            return `<option value="${escapeAttr(s.id)}" ${selectedAttr ? 'selected' : ''}>${escapeHtml(storeLabel(s, 'add'))}</option>`
          }).join('')}
        </select>
      </div>
      <div class="sheet-actions">
        <button class="secondary-btn" type="button" data-action="close-sheet">Cancelar</button>
        <button class="primary-btn" type="button" id="confirm-quick-add">Añadir</button>
      </div>
    </div>
  `
  overlay.classList.add('open')

  const nameInput = overlay.querySelector('#quick-add-name')
  const storeSelect = overlay.querySelector('#quick-add-store')
  const wrap = overlay.querySelector('.store-select-wrap')

  const syncStoreLook = () => {
    const store = getStore(storeSelect.value)
    wrap.style.setProperty('--store', store.brand)
    wrap.classList.toggle('light', !!store.light)
    const logo = wrap.querySelector('.store-logo')
    if (logo) logo.outerHTML = renderStoreLogo(store, 'sm')
  }
  storeSelect.addEventListener('change', syncStoreLook)

  const confirm = () => {
    const name = nameInput.value.trim()
    if (!name) {
      nameInput.focus()
      showToast('Escribe un producto')
      return
    }
    activeStore = storeSelect.value
    localStorage.setItem('compra:store', activeStore)
    closeSheet()
    addCustomProduct(name)
  }

  overlay.querySelector('#confirm-quick-add').addEventListener('click', confirm)
  nameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      confirm()
    }
  })

  requestAnimationFrame(() => {
    nameInput.focus()
    nameInput.setSelectionRange(nameInput.value.length, nameInput.value.length)
  })
}

function addCustomProduct(name) {
  const trimmed = name.trim()
  if (!trimmed) return

  const exact = allProducts().find(
    (p) => p.name.toLowerCase() === trimmed.toLowerCase(),
  )
  if (exact) {
    toggleProduct(exact.id)
    return
  }

  const { list, product } = upsertExtraProduct(state.extraProducts, trimmed)
  if (!product) return
  state.extraProducts = list
  setExtraProducts(state.extraProducts)
  toggleProduct(product.id)
  if (view !== 'lista') {
    view = 'lista'
    query = ''
    render()
  }
}

function changeQty(id, delta) {
  const item = state.items.find((i) => i.id === id)
  if (!item) return
  if (delta < 0 && item.qty + delta <= 0) {
    const name = getProductById(item.productId)?.name || item.name
    if (state.items.length === 1 && !confirmLastProduct(name)) return
    state.items = state.items.filter((i) => i.id !== id)
    persist()
    showToast('Eliminado')
    softRerender()
    return
  }
  item.qty += delta
  persist()
  softRerender()
}

function bindBuySliders() {
  app.querySelectorAll('.buy-slide').forEach((slide) => {
    if (slide.dataset.bound) return
    slide.dataset.bound = '1'

    const knob = slide.querySelector('.buy-slide-knob')
    const fill = slide.querySelector('.buy-slide-fill')
    if (!knob || !fill) return

    let dragging = false
    let startX = 0
    let maxX = 0
    let currentX = 0
    let completed = false
    let pointerId = null
    const END = 0.92

    const knubSize = () => knob.offsetWidth || 42
    const measure = () => Math.max(0, slide.clientWidth - knubSize() - 6)

    const apply = (x, animate = false) => {
      currentX = Math.max(0, Math.min(maxX, x))
      const pct = maxX ? currentX / maxX : 0
      slide.style.setProperty('--slide-x', `${currentX}px`)
      fill.style.width = `${currentX + knubSize()}px`
      slide.classList.toggle('active', pct > 0.08)
      knob.style.transition = animate ? 'transform .18s ease' : 'none'
      fill.style.transition = animate ? 'width .18s ease' : 'none'
    }

    const reset = () => {
      apply(0, true)
      slide.classList.remove('active', 'complete')
    }

    const finish = () => {
      if (completed) return
      completed = true
      buyGestureActive = false
      apply(maxX, true)
      slide.classList.add('complete')
      vibrate([10, 40, 10])
      buyItem(slide.dataset.buyId)
    }

    const onDown = (e) => {
      if (completed) return
      if (e.pointerType === 'mouse' && e.button !== 0) return
      dragging = true
      buyGestureActive = true
      pointerId = e.pointerId
      maxX = measure()
      startX = e.clientX - currentX
      try {
        slide.setPointerCapture(e.pointerId)
      } catch {
        try {
          knob.setPointerCapture(e.pointerId)
        } catch {
          /* ignore */
        }
      }
      e.preventDefault()
    }

    const onMove = (e) => {
      if (!dragging || completed) return
      if (pointerId != null && e.pointerId !== pointerId) return
      apply(e.clientX - startX)
      if (maxX > 0 && currentX >= maxX * END) finish()
    }

    const onUp = (e) => {
      if (!dragging) return
      if (pointerId != null && e.pointerId != null && e.pointerId !== pointerId) return
      dragging = false
      pointerId = null
      buyGestureActive = false
      if (completed) return
      if (maxX > 0 && currentX >= maxX * END) finish()
      else reset()
    }

    // Escuchar en el carril entero (más fiable en móvil que solo el knob)
    slide.addEventListener('pointerdown', onDown, { passive: false })
    slide.addEventListener('pointermove', onMove, { passive: false })
    slide.addEventListener('pointerup', onUp)
    slide.addEventListener('pointercancel', onUp)
    knob.addEventListener('click', (e) => e.preventDefault())
  })
}

function buyItem(id) {
  const item = state.items.find((i) => i.id === id)
  if (!item) return
  const product = item.productId ? getProductById(item.productId) : null
  const name = product?.name || item.name
  const entry = {
    id: crypto.randomUUID(),
    productId: item.productId || null,
    name,
    emoji: product?.emoji || item.emoji || '🛒',
    icon: product?.icon || item.icon || null,
    qty: item.qty,
    store: item.store || 'todos',
    boughtBy: state.member || '',
    boughtAt: Date.now(),
  }

  // Guardar YA (antes el delay de animación hacía que la sync del PC lo pisara)
  state.history = [entry, ...(state.history || [])].slice(0, 2000)
  state.items = state.items.filter((i) => i.id !== id)
  persist()

  const row = app.querySelector(`.list-item[data-id="${CSS.escape(id)}"]`)
  if (row) row.classList.add('buying')
  showToast(`✓ Comprado: ${name}`)
  setTimeout(() => softRerender(), 220)
}

function renderHistorial() {
  if (!(state.history || []).length) {
    return `
      <div class="empty-state">
        <div class="emoji">📅</div>
        <h2>Sin compras aún</h2>
        <p>Cuando deslices para confirmar una compra, quedará registrada aquí por días.</p>
      </div>
    `
  }

  if (historyDay) return renderHistorialDay(historyDay)
  return renderHistorialDays()
}

function renderHistorialDays() {
  const q = normalizeSearch(query)
  let days = groupHistoryByDay(state.history || [])

  if (q) {
    days = days.filter((day) => {
      const label = normalizeSearch(day.label)
      const dateKey = normalizeSearch(day.key)
      if (label.includes(q) || dateKey.includes(q)) return true
      return day.entries.some((e) => {
        const name = normalizeSearch(e.name || '')
        const store = normalizeSearch(getStore(e.store).name)
        return name.includes(q) || store.includes(q)
      })
    })
  }

  if (!days.length) {
    return `
      <div class="browse-head">
        <h2>Historial de compras</h2>
        <p>No hay resultados para “${escapeHtml(query.trim())}”</p>
      </div>
    `
  }

  return `
    <div class="browse-head">
      <h2>Historial de compras</h2>
      <p>Elige un día para ver la compra completa</p>
    </div>
    <div class="history-day-list">
      ${days
        .map((day) => {
          const count = day.entries.reduce((n, e) => n + (e.qty || 1), 0)
          return `
          <button class="history-day-card" type="button" data-action="open-history-day" data-day="${escapeAttr(day.key)}">
            <div class="history-day-card-main">
              <strong>${escapeHtml(day.label)}</strong>
              <span>${count} producto${count === 1 ? '' : 's'}</span>
            </div>
            <span class="history-day-card-count">${count}</span>
            <span class="history-day-card-chevron" aria-hidden="true">›</span>
          </button>`
        })
        .join('')}
    </div>
    <div class="custom-row">
      <button class="danger-btn" type="button" data-action="clear-history" style="width:100%">Vaciar historial</button>
    </div>
    <p class="section-label" style="text-align:center;margin-top:8px">
      <button class="link-btn" type="button" data-action="open-help" style="width:auto">Configurar NFC</button>
    </p>
  `
}

function renderHistorialDay(key) {
  const q = normalizeSearch(query)
  const day = groupHistoryByDay(state.history || []).find((d) => d.key === key)

  if (!day) {
    historyDay = null
    return renderHistorialDays()
  }

  let entries = day.entries
  if (q) {
    entries = entries.filter((e) => {
      const name = normalizeSearch(e.name || '')
      const store = normalizeSearch(getStore(e.store).name)
      return name.includes(q) || store.includes(q)
    })
  }

  const total = day.entries.reduce((n, e) => n + (e.qty || 1), 0)

  return `
    <div class="browse-bar">
      <button class="back-btn" type="button" data-action="close-history-day" aria-label="Volver">←</button>
      <div class="browse-bar-title">
        <span class="browse-bar-icon">📅</span>
        <div>
          <strong>${escapeHtml(day.label)}</strong>
          <span>${total} producto${total === 1 ? '' : 's'} comprados</span>
        </div>
      </div>
    </div>
    ${
      entries.length
        ? `<div class="history-entries">
            ${entries.map(renderHistoryEntry).join('')}
          </div>`
        : `<div class="browse-head">
            <p>No hay resultados para “${escapeHtml(query.trim())}”</p>
          </div>`
    }
  `
}

function normalizeSearch(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function renderTickets() {
  if (ticketDetail) return renderTicketDetail(ticketDetail)

  const q = normalizeSearch(query)
  let tickets = [...(state.tickets || [])].sort((a, b) => (b.boughtAt || 0) - (a.boughtAt || 0))
  if (q) {
    tickets = tickets.filter((t) => {
      const store = normalizeSearch(getStore(t.store).name)
      const total = String(t.total || '')
      const items = (t.items || []).some((i) => normalizeSearch(i.name).includes(q))
      return store.includes(q) || total.includes(q) || items
    })
  }

  return `
    <div class="browse-head">
      <h2>Tickets</h2>
      <p>Escanea el ticket con la cámara. Se guardan productos y precios.</p>
    </div>
    <button class="quick-add-btn" type="button" data-action="scan-ticket">
      <span aria-hidden="true">📷</span>
      Escanear ticket
    </button>
    ${
      !(state.tickets || []).length
        ? `<div class="empty-state">
            <div class="emoji">🧾</div>
            <h2>Sin tickets aún</h2>
            <p>Enfoca el ticket en la cámara; el escaneo lee líneas y precios automáticamente.</p>
          </div>`
        : tickets.length
          ? `<div class="history-day-list">
              ${tickets
                .map((t) => {
                  const store = getStore(t.store)
                  const count = (t.items || []).length
                  return `
                  <button class="history-day-card" type="button" data-action="open-ticket" data-ticket="${escapeAttr(t.id)}">
                    ${renderStoreLogo(store, 'md')}
                    <div class="history-day-card-main">
                      <strong>${escapeHtml(store.name)}</strong>
                      <span>${escapeHtml(formatDayLabel(dayKey(t.boughtAt)))} · ${count} producto${count === 1 ? '' : 's'}</span>
                    </div>
                    <span class="history-day-card-count ticket-total">${escapeHtml(formatEuro(t.total || 0))}</span>
                    <span class="history-day-card-chevron" aria-hidden="true">›</span>
                  </button>`
                })
                .join('')}
            </div>`
          : `<div class="browse-head"><p>No hay resultados para “${escapeHtml(query.trim())}”</p></div>`
    }
  `
}

function renderTicketDetail(id) {
  const ticket = (state.tickets || []).find((t) => t.id === id)
  if (!ticket) {
    ticketDetail = null
    return renderTickets()
  }
  const store = getStore(ticket.store)
  return `
    <div class="browse-bar">
      <button class="back-btn" type="button" data-action="close-ticket" aria-label="Volver">←</button>
      <div class="browse-bar-title">
        ${renderStoreLogo(store, 'md')}
        <div>
          <strong>${escapeHtml(store.name)}</strong>
          <span>${escapeHtml(formatDayLabel(dayKey(ticket.boughtAt)))} · ${escapeHtml(formatEuro(ticket.total || 0))}</span>
        </div>
      </div>
    </div>
    <div class="receipt-paper receipt-paper--saved">
      <div class="receipt-head">
        <strong>${escapeHtml(store.name)}</strong>
        <span>${escapeHtml(formatDayLabel(dayKey(ticket.boughtAt)))}</span>
      </div>
      <div class="receipt-sep">····························</div>
      <div class="receipt-body">
        ${(ticket.items || [])
          .map((line) => {
            const product = line.productId ? getProductById(line.productId) : matchCatalogProduct(line.name)
            const visual = product
              ? { emoji: product.emoji, icon: product.icon, name: product.name }
              : { emoji: line.emoji || '🛒', icon: null, name: line.name }
            return `
          <div class="receipt-row receipt-row--static">
            <span class="receipt-ico">${renderIcon(visual, 'sm')}</span>
            <span class="receipt-name-text">${escapeHtml(line.name)}${
              line.qty > 1 ? ` ×${line.qty}` : ''
            }</span>
            <span class="receipt-lead" aria-hidden="true"></span>
            <span class="receipt-price-text">${escapeHtml(formatEuro(line.price))}</span>
          </div>`
          })
          .join('')}
      </div>
      <div class="receipt-sep">····························</div>
      <div class="receipt-foot">
        <span>TOTAL</span>
        <strong>${escapeHtml(formatEuro(ticket.total || 0))}</strong>
      </div>
    </div>
    <div class="custom-row">
      <button class="danger-btn" type="button" data-action="delete-ticket" data-ticket="${escapeAttr(ticket.id)}" style="width:100%">Borrar ticket</button>
    </div>
  `
}

async function openTicketScanner() {
  if (!navigator.mediaDevices?.getUserMedia) {
    showToast('Este dispositivo no permite cámara')
    return
  }
  const overlay = app.querySelector('#overlay')
  if (!overlay) return

  overlay.innerHTML = `
    <div class="sheet scanner-sheet">
      <button class="sheet-close" type="button" id="close-scanner" aria-label="Cerrar">✕</button>
      <h2>Escanear ticket</h2>
      <p>Enfoca el ticket dentro del marco. El escaneo lee el texto en vivo (no es una foto de galería).</p>
      <div class="scanner-stage">
        <video id="scan-video" playsinline muted autoplay></video>
        <div class="scanner-dim" aria-hidden="true"></div>
        <svg class="scanner-frame" id="scan-frame" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <polygon class="scanner-frame-border" points="18,10 82,10 82,90 18,90"></polygon>
        </svg>
        <div class="scanner-status" id="scan-status">Abriendo cámara…</div>
      </div>
      <div class="sheet-actions">
        <button class="secondary-btn" type="button" id="close-scanner-2">Cancelar</button>
        <button class="primary-btn" type="button" id="scan-now">Escanear ahora</button>
      </div>
    </div>
  `
  overlay.classList.add('open')

  const video = overlay.querySelector('#scan-video')
  const status = overlay.querySelector('#scan-status')
  const close = () => {
    clearInterval(scanLoop)
    scanLoop = null
    scanBusy = false
    stopCamera()
    closeSheet()
  }
  overlay.querySelector('#close-scanner').addEventListener('click', close)
  overlay.querySelector('#close-scanner-2').addEventListener('click', close)

  try {
    status.textContent = 'Preparando escáner OCR…'
    await preloadScanner()
  } catch {
    status.textContent = 'No se pudo cargar el OCR. Revisa la conexión.'
    return
  }

  try {
    await startCamera(video)
    const frame = overlay.querySelector('#scan-frame')
    startTicketTracking(video, frame)
    status.textContent = 'Enfoca el ticket… el marco se adapta solo'
    const run = () => runTicketScan(video, status)
    overlay.querySelector('#scan-now').addEventListener('click', run)
    clearInterval(scanLoop)
    scanLoop = setInterval(run, 2400)
    setTimeout(run, 900)
  } catch {
    status.textContent = 'No se pudo abrir la cámara. Revisa permisos.'
    showToast('Permiso de cámara denegado')
  }
}

async function runTicketScan(video, statusEl) {
  if (scanBusy || !video?.srcObject) return
  if (!video.videoWidth) return
  scanBusy = true
  try {
    if (statusEl) statusEl.textContent = 'Escaneando ticket…'
    const canvas = captureFrame(video)
    if (!canvas) {
      scanBusy = false
      return
    }
    const text = await recognizeCanvas(canvas)
    const parsed = parseReceiptText(text)
    if ((parsed.items || []).length >= 2) {
      clearInterval(scanLoop)
      scanLoop = null
      stopCamera()
      pendingTicketDraft = enrichTicketDraft(parsed)
      openTicketReview(pendingTicketDraft)
      return
    }
    if (statusEl) {
      statusEl.textContent =
        (parsed.items || []).length === 1
          ? 'Casi… ajusta el ticket dentro del marco adaptado'
          : 'Sigue el marco verde: se adapta a la forma del ticket'
    }
  } catch {
    if (statusEl) statusEl.textContent = 'Error al escanear. Reintenta.'
  } finally {
    scanBusy = false
  }
}

function enrichTicketDraft(parsed) {
  const resolved = resolveTicketCatalog(state.extraProducts, parsed.items || [])
  return {
    id: crypto.randomUUID(),
    store: parsed.store || 'todos',
    total: parsed.total,
    items: resolved.items,
    extrasPreview: resolved.extras,
    rawText: parsed.rawText || '',
    boughtAt: Date.now(),
    scannedBy: state.member || '',
  }
}

function openTicketReview(draft) {
  const overlay = app.querySelector('#overlay')
  if (!overlay || !draft) return
  const store = getStore(draft.store)

  overlay.innerHTML = `
    <div class="sheet ticket-review-sheet">
      <button class="sheet-close" type="button" data-action="close-sheet" aria-label="Cerrar">✕</button>
      <h2>Revisar ticket</h2>
      <p>Comprueba líneas y precios. Al guardar se actualizan precios y se añaden productos nuevos al catálogo.</p>
      <label for="ticket-store">Supermercado</label>
      <div class="store-select-wrap" style="--store:${store.brand}">
        ${renderStoreLogo(store, 'sm')}
        <select id="ticket-store" class="store-select">
          ${STORES.map(
            (s) =>
              `<option value="${escapeAttr(s.id)}" ${draft.store === s.id ? 'selected' : ''}>${escapeHtml(storeLabel(s, 'add'))}</option>`,
          ).join('')}
        </select>
      </div>
      <div class="receipt-paper" id="ticket-receipt">
        <div class="receipt-head">
          <strong id="receipt-store-name">${escapeHtml(store.name)}</strong>
          <span>borrador</span>
        </div>
        <div class="receipt-sep">····························</div>
        <div class="receipt-body" id="ticket-lines">
          ${draft.items
            .map((line, idx) => {
              const visual = {
                emoji: line.emoji || '🛒',
                icon: line.icon || null,
                name: line.name,
              }
              return `
            <div class="receipt-row ticket-line${line.isNew ? ' receipt-row--new' : ''}" data-idx="${idx}" data-qty="${escapeAttr(String(line.qty || 1))}" data-unit="${escapeAttr(line.unit || 'ud')}" data-unit-price="${escapeAttr(String(line.unitPrice ?? ''))}">
              <span class="receipt-ico">${renderIcon(visual, 'sm')}</span>
              <input class="ticket-name receipt-name" type="text" value="${escapeAttr(line.name)}" maxlength="80" aria-label="Producto" />
              ${line.isNew ? '<span class="receipt-new">nuevo</span>' : ''}
              ${line.unit === 'kg' ? '<span class="receipt-unit">€/kg</span>' : ''}
              <span class="receipt-lead" aria-hidden="true"></span>
              <input class="ticket-price receipt-price" type="text" inputmode="decimal" value="${escapeAttr(String(line.price).replace('.', ','))}" aria-label="Precio línea" />
            </div>`
            })
            .join('')}
        </div>
        <div class="receipt-sep">····························</div>
        <div class="receipt-foot">
          <span>TOTAL</span>
          <strong id="ticket-total">${escapeHtml(formatEuro(draft.total || 0))}</strong>
        </div>
      </div>
      <div class="sheet-actions">
        <button class="secondary-btn" type="button" id="rescan-ticket">Volver a escanear</button>
        <button class="primary-btn" type="button" id="save-ticket">Guardar ticket</button>
      </div>
    </div>
  `
  overlay.classList.add('open')

  const storeSelect = overlay.querySelector('#ticket-store')
  const wrap = overlay.querySelector('.store-select-wrap')
  storeSelect.addEventListener('change', () => {
    const s = getStore(storeSelect.value)
    wrap.style.setProperty('--store', s.brand)
    const logo = wrap.querySelector('.store-logo')
    if (logo) logo.outerHTML = renderStoreLogo(s, 'sm')
    const nameEl = overlay.querySelector('#receipt-store-name')
    if (nameEl) nameEl.textContent = s.name
  })

  const syncTotal = () => {
    const prices = [...overlay.querySelectorAll('.ticket-price')].map((el) =>
      Number(String(el.value).replace(',', '.')),
    )
    const total = Math.round(prices.filter((n) => Number.isFinite(n)).reduce((a, b) => a + b, 0) * 100) / 100
    overlay.querySelector('#ticket-total').textContent = formatEuro(total)
    return total
  }
  overlay.querySelectorAll('.ticket-price').forEach((el) => el.addEventListener('input', syncTotal))

  overlay.querySelector('#rescan-ticket').addEventListener('click', () => {
    closeSheet()
    openTicketScanner()
  })
  overlay.querySelector('#save-ticket').addEventListener('click', () => {
    const storeId = storeSelect.value || 'todos'
    if (!storeId || storeId === 'todos') {
      showToast('Elige el supermercado del ticket')
      return
    }

    const rawItems = [...overlay.querySelectorAll('.ticket-line')]
      .map((row) => {
        const name = row.querySelector('.ticket-name').value.trim()
        const price = Number(String(row.querySelector('.ticket-price').value).replace(',', '.'))
        const qty = Math.max(1, Number(row.dataset.qty) || 1)
        const unit = row.dataset.unit === 'kg' ? 'kg' : 'ud'
        let unitPrice = Number(String(row.dataset.unitPrice || '').replace(',', '.'))
        if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
          unitPrice = unit === 'kg' ? null : qty > 1 ? price / qty : price
        }
        return {
          name,
          qty,
          price: Number.isFinite(price) ? Math.round(price * 100) / 100 : 0,
          unit,
          unitPrice:
            unitPrice != null && Number.isFinite(unitPrice)
              ? Math.round(unitPrice * 100) / 100
              : null,
        }
      })
      .filter((i) => i.name && i.price > 0)

    if (!rawItems.length) {
      showToast('No hay líneas válidas')
      return
    }

    const resolved = resolveTicketCatalog(state.extraProducts, rawItems)
    const newCount = resolved.items.filter((i) => i.isNew).length
    state.extraProducts = resolved.extras
    setExtraProducts(state.extraProducts)

    const ticket = {
      id: draft.id || crypto.randomUUID(),
      store: storeId,
      total: syncTotal(),
      items: resolved.items.map(({ name, productId, qty, price, emoji, unit, unitPrice }) => ({
        name,
        productId,
        qty,
        price,
        emoji,
        unit,
        unitPrice,
      })),
      boughtAt: Date.now(),
      scannedBy: state.member || '',
    }
    state.tickets = [ticket, ...(state.tickets || [])].slice(0, 200)
    state.prices = applyTicketPrices(state.prices, ticket)
    persist()
    closeSheet()
    view = 'tickets'
    ticketDetail = ticket.id
    query = ''
    render()
    const bits = [`precios ${getStore(ticket.store).name}`]
    if (newCount) bits.push(`${newCount} producto${newCount === 1 ? '' : 's'} nuevo${newCount === 1 ? '' : 's'}`)
    showToast(`Ticket guardado · ${bits.join(' · ')}`)
  })
}

function historyEntryKey(entry) {
  return entry?.id || `legacy:${entry?.boughtAt || 0}:${entry?.name || ''}`
}

function renderHistoryEntry(entry) {
  const store = getStore(entry.store)
  const visual = {
    emoji: entry.emoji || '🛒',
    icon: entry.icon || null,
    name: entry.name,
  }
  const who = entry.boughtBy ? `por ${entry.boughtBy}` : 'comprado'
  const time = formatTimeOnly(entry.boughtAt)
  const key = historyEntryKey(entry)

  return `
    <article class="history-item" style="--store:${store.brand}">
      <div class="item-emoji">${renderIcon(visual, 'sm')}</div>
      <div class="item-info">
        <strong>${escapeHtml(entry.name)} <em class="history-qty">×${entry.qty || 1}</em></strong>
        <span class="history-store-line">${renderStoreLogo(store, 'xs')} ${escapeHtml(store.name)} · ${escapeHtml(who)} · ${escapeHtml(time)}</span>
      </div>
      <button
        class="history-delete-btn"
        type="button"
        data-action="delete-history-entry"
        data-id="${escapeAttr(key)}"
        aria-label="Borrar ${escapeAttr(entry.name)} del historial"
        title="Borrar"
      >✕</button>
    </article>
  `
}

function groupHistoryByDay(entries) {
  const map = new Map()
  for (const entry of entries) {
    const key = dayKey(entry.boughtAt)
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(entry)
  }
  return [...map.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([key, list]) => ({
      key,
      label: formatDayLabel(key),
      entries: list.sort((a, b) => (b.boughtAt || 0) - (a.boughtAt || 0)),
    }))
}

function dayKey(ts) {
  const d = new Date(ts || Date.now())
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatDayLabel(key) {
  const [y, m, d] = key.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const today = dayKey(Date.now())
  const yesterday = dayKey(Date.now() - 86400000)
  if (key === today) return 'Hoy'
  if (key === yesterday) return 'Ayer'
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatTimeOnly(ts) {
  return new Date(ts).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function persist() {
  state.updatedAt = Date.now()
  syncDirtyUntil = Date.now() + 3000
  saveLocal(listId, state)
  saveMembers(state.members)
  queuePush()
}

let pushQueued = null
function queuePush() {
  if (!getSyncUrl()) return
  clearTimeout(pushQueued)
  // Empujar enseguida para que el móvil no pierda el producto
  pushQueued = setTimeout(() => syncPush(), 80)
}

async function syncPull() {
  // No pisar gestos del móvil ni cambios recién guardados
  if (buyGestureActive || pushing || Date.now() < syncDirtyUntil) return

  const remote = await pullRemote(listId)
  if (!remote) {
    setSyncStatus(false)
    return
  }
  setSyncStatus(true)
  if ((remote.updatedAt || 0) > (state.updatedAt || 0)) {
    state.items = remote.items
    state.history = Array.isArray(remote.history) ? remote.history : state.history || []
    state.tickets = Array.isArray(remote.tickets) ? remote.tickets : state.tickets || []
    state.prices =
      remote.prices && typeof remote.prices === 'object' ? remote.prices : state.prices || {}
    state.extraProducts = Array.isArray(remote.extraProducts)
      ? remote.extraProducts
      : state.extraProducts || []
    setExtraProducts(state.extraProducts)
    if (remote.members?.length) state.members = remote.members
    state.updatedAt = remote.updatedAt
    saveLocal(listId, state)
    softRerender()
  }
}

async function syncPush() {
  if (pushing || !getSyncUrl()) return
  pushing = true
  const result = await pushRemote(listId, state)
  if (result === 'ok') {
    syncDirtyUntil = 0
  }
  if (result === 'conflict') {
    syncDirtyUntil = 0
    await syncPull()
  }
  setSyncStatus(result === 'ok' || result === 'conflict')
  pushing = false
}

function setSyncStatus(ok) {
  syncOk = ok
  const dot = app.querySelector('.sync-dot')
  if (dot) {
    dot.classList.toggle('on', ok)
    dot.title = ok ? 'Sincronizado' : 'Solo este móvil'
  }
}

function startSyncLoop() {
  clearInterval(syncTimer)
  syncTimer = setInterval(() => {
    if (getSyncUrl() && !document.hidden) syncPull()
  }, 4000)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) syncPull()
  })
}

function openSheet(type) {
  const overlay = app.querySelector('#overlay')
  if (!overlay) return

  if (type === 'member') {
    overlay.innerHTML = `
      <div class="sheet">
        <h2>¿Quién eres?</h2>
        <p>Así la familia ve quién ha apuntado cada cosa en la nevera.</p>
        <div class="member-chips" id="member-chips">
          ${state.members
            .map(
              (m) =>
                `<button class="member-chip ${state.member === m ? 'active' : ''}" type="button" data-pick="${escapeAttr(m)}">${escapeHtml(m)}</button>`,
            )
            .join('')}
        </div>
        <label for="member-input">Tu nombre</label>
        <input id="member-input" type="text" maxlength="24" placeholder="Ej. María" value="${escapeAttr(state.member)}" />
        <div class="sheet-actions">
          <button class="primary-btn" type="button" id="save-member">Empezar</button>
        </div>
      </div>
    `
    overlay.classList.add('open')
    overlay.querySelectorAll('[data-pick]').forEach((chip) => {
      chip.addEventListener('click', () => {
        overlay.querySelector('#member-input').value = chip.dataset.pick
      })
    })
    overlay.querySelector('#save-member').addEventListener('click', () => {
      const name = overlay.querySelector('#member-input').value.trim()
      if (!name) return
      state.member = name
      if (!state.members.includes(name)) state.members.push(name)
      saveMember(name)
      persist()
      closeSheet()
      render()
      showToast(`Hola, ${name}`)
    })
    return
  }

  if (type === 'settings') {
    const url = getSyncUrl()
    const installed = isAppInstalled()
    const canInstall = !!deferredInstallPrompt
    const ios = isIosSafari()
    overlay.innerHTML = `
      <div class="sheet">
        <h2>Ajustes</h2>
        <p>Lista compartida: <strong>${escapeHtml(listId)}</strong></p>
        <label>Tu nombre</label>
        <input id="set-member" type="text" maxlength="24" value="${escapeAttr(state.member)}" />
        <label>Código de lista (URL NFC)</label>
        <input id="set-list" type="text" maxlength="40" value="${escapeAttr(listId)}" />
        <label>URL de sincronización</label>
        <input id="set-sync" type="url" placeholder="${escapeAttr(DEFAULT_CLOUD_SYNC)}" value="${escapeAttr(url)}" />
        <p style="font-size:0.82rem;margin-top:8px">Ya está configurada la nube (Firebase). Funciona en casa y fuera, con WiFi o datos.</p>

        <div class="install-box">
          <strong>Instalar en el móvil</strong>
          <p>La app instalada usa la misma lista y sincronización que en el navegador.</p>
          ${
            installed
              ? `<p class="install-status">✓ Ya está instalada en este dispositivo</p>`
              : canInstall
                ? `<button class="primary-btn" type="button" id="install-app" style="width:100%">Instalar app</button>`
                : ios
                  ? `<ol class="install-steps">
                      <li>Pulsa el botón <strong>Compartir</strong> (□↑) en Safari.</li>
                      <li>Elige <strong>Añadir a pantalla de inicio</strong>.</li>
                      <li>Confirma con <strong>Añadir</strong>.</li>
                    </ol>`
                  : `<p class="install-status">Abre esta página en Chrome o Edge del móvil para instalarla. Si no aparece el botón, el navegador aún no ofrece la instalación.</p>`
          }
        </div>

        <div class="sheet-actions">
          <button class="secondary-btn" type="button" data-action="close-sheet">Cerrar</button>
          <button class="primary-btn" type="button" id="save-settings">Guardar</button>
        </div>
        <div class="sheet-actions">
          <button class="secondary-btn" type="button" id="copy-link">Copiar enlace NFC</button>
          <button class="secondary-btn" type="button" id="change-member">Cambiar persona</button>
        </div>
      </div>
    `
    overlay.classList.add('open')
    overlay.querySelector('#change-member').addEventListener('click', () => openSheet('member'))
    overlay.querySelector('#copy-link').addEventListener('click', copyNfcLink)
    const installBtn = overlay.querySelector('#install-app')
    if (installBtn) {
      installBtn.addEventListener('click', () => installApp())
    }
    overlay.querySelector('#save-settings').addEventListener('click', () => {
      const name = overlay.querySelector('#set-member').value.trim()
      const newList = slugify(overlay.querySelector('#set-list').value.trim() || 'familia')
      const sync = overlay.querySelector('#set-sync').value.trim()
      if (name) {
        state.member = name
        if (!state.members.includes(name)) state.members.push(name)
        saveMember(name)
      }
      setSyncUrl(sync)
      persist()
      if (newList !== listId) {
        const u = new URL(window.location.href)
        u.searchParams.set('lista', newList)
        window.location.href = u.toString()
        return
      }
      closeSheet()
      render()
      showToast(getSyncUrl() ? 'Sincronización activada' : 'Ajustes guardados · sync desactivada')
      startSyncLoop()
      if (getSyncUrl()) syncPull()
    })
    return
  }

  if (type === 'help') {
    const link = nfcLink()
    const syncOn = Boolean(getSyncUrl())
    overlay.innerHTML = `
      <div class="sheet">
        <h2>Pegatina NFC</h2>
        <p>La pegatina guarda un enlace a la app en internet. Al escanear, abre la lista y <strong>actualiza en la nube</strong> (casa o fuera).</p>
        <ol class="help-steps">
          <li>Copia el enlace de abajo.</li>
          <li>En <strong>NFC Tools</strong> → Escribir → URL/URI → pega el enlace → acerca la pegatina.</li>
          <li>Pégala en la nevera. Listo.</li>
        </ol>
        ${
          syncOn
            ? `<p class="install-status">✓ Sync en la nube activa</p>`
            : `<p class="install-status">⚠ Sin sync — revisa Ajustes</p>`
        }
        <div class="code-box" id="nfc-link">${escapeHtml(link)}</div>
        <div class="sheet-actions">
          <button class="secondary-btn" type="button" data-action="close-sheet">Cerrar</button>
          <button class="primary-btn" type="button" id="copy-nfc">Copiar enlace NFC</button>
        </div>
      </div>
    `
    overlay.classList.add('open')
    overlay.querySelector('#copy-nfc').addEventListener('click', copyNfcLink)
  }
}

function closeSheet() {
  const overlay = app.querySelector('#overlay')
  if (!overlay) return
  clearInterval(scanLoop)
  scanLoop = null
  scanBusy = false
  stopCamera()
  overlay.classList.remove('open')
  overlay.innerHTML = ''
}

function nfcLink() {
  return buildNfcLink(listId)
}

async function copyNfcLink() {
  try {
    await navigator.clipboard.writeText(nfcLink())
    showToast('Enlace copiado')
  } catch {
    showToast('Copia el enlace manualmente')
  }
}

function showToast(message) {
  const el = app.querySelector('#toast')
  if (!el) return
  el.textContent = message
  el.classList.add('show')
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => el.classList.remove('show'), 1800)
}

function isAppInstalled() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.navigator.standalone === true
  )
}

function isIosSafari() {
  const ua = window.navigator.userAgent || ''
  const iOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const webkit = /WebKit/.test(ua)
  const chromeLike = /CriOS|FxiOS|EdgiOS|OPiOS/.test(ua)
  return iOS && webkit && !chromeLike
}

async function installApp() {
  if (!deferredInstallPrompt) {
    showToast('Instalación no disponible ahora')
    return
  }
  deferredInstallPrompt.prompt()
  const result = await deferredInstallPrompt.userChoice
  deferredInstallPrompt = null
  if (result.outcome === 'accepted') {
    showToast('Instalando…')
    closeSheet()
  } else {
    showToast('Instalación cancelada')
  }
}

function vibrate(pattern = 12) {
  try {
    navigator.vibrate?.(pattern)
  } catch {
    /* ignore */
  }
}

function formatTime(ts) {
  const d = new Date(ts)
  return d.toLocaleString('es-ES', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40) || 'familia'
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function escapeAttr(str) {
  return escapeHtml(str).replaceAll("'", '&#39;')
}

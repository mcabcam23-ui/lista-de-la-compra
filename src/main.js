import './style.css'
import {
  CATEGORIES,
  PRODUCTS,
  searchProducts,
  getProductById,
  getProductsByCategory,
  getCategory,
  groupProducts,
} from './products.js'
import { renderIcon, renderCategoryIcon } from './icons.js'
import { STORES, getStore, storeOrder, storeLabel } from './stores.js'
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
} from './storage.js'

const listId = getListIdFromUrl()
let state = loadLocal(listId)
// Normalizar tienda en ítems antiguos
state.items = state.items.map((item) => ({
  ...item,
  store: item.store && STORES.some((s) => s.id === item.store) ? item.store : 'todos',
}))
if (!Array.isArray(state.history)) state.history = []
let view = 'lista'
let category = null // null = pasillos (rejilla)
let subcategory = 'all'
let historyDay = null // null = lista de días · YYYY-MM-DD = detalle
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
  render()
  await syncPull()
  startSyncLoop()
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
      <section class="view ${view === 'historial' ? 'active' : ''}" data-view-panel="historial">
        ${renderHistorial()}
      </section>
    </main>

    <nav class="bottom-nav">
      <button class="nav-btn ${view === 'lista' ? 'active' : ''}" type="button" data-action="set-view" data-view="lista">
        <span class="icon">📝</span>
        Lista ${count ? `(${count})` : ''}
      </button>
      <button class="nav-btn ${view === 'catalogo' ? 'active' : ''}" type="button" data-action="set-view" data-view="catalogo">
        <span class="icon">🏪</span>
        Añadir
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
            <span class="store-dot"></span>
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
  // filter = chips arriba · add = desplegable abajo (dónde van los nuevos)
  if (mode === 'filter') return renderStoreFilterChips()
  return renderStoreAddSelect()
}

function itemMatchesStoreFilter(item, filter) {
  // TODOS: visible en cualquier supermercado
  if (filter === 'all') return true
  return item.store === filter || item.store === 'todos'
}

function renderStoreFilterChips() {
  return `
    <div class="store-bar">
      <div class="store-bar-label">Ver</div>
      <div class="store-scroll">
        ${STORES.map((s) => {
          const isTodos = s.id === 'todos'
          const active = isTodos ? storeFilter === 'all' : storeFilter === s.id
          const count = isTodos
            ? state.items.reduce((n, i) => n + i.qty, 0)
            : state.items
                .filter((i) => itemMatchesStoreFilter(i, s.id))
                .reduce((n, i) => n + i.qty, 0)
          return `
          <button class="store-chip ${active ? 'active' : ''} ${s.light ? 'light' : ''}" type="button"
            data-action="set-store-filter"
            data-store="${isTodos ? 'all' : s.id}"
            style="--store:${s.brand}">
            ${escapeHtml(storeLabel(s, 'filter'))}
            ${count ? `<em>${count}</em>` : ''}
          </button>`
        }).join('')}
      </div>
    </div>
  `
}

function renderStoreAddSelect() {
  const selected = getStore(activeStore)
  return `
    <div class="store-bar store-bar-add">
      <label class="store-bar-label" for="store-add-select">Nuevos productos en</label>
      <div class="store-select-wrap ${selected.light ? 'light' : ''}" style="--store:${selected.brand}">
        <span class="store-select-dot" aria-hidden="true"></span>
        <select id="store-add-select" class="store-select" data-store-mode="add">
          ${STORES.map((s) => {
            const selectedAttr = activeStore === s.id
            return `<option value="${escapeAttr(s.id)}" ${selectedAttr ? 'selected' : ''}>${escapeHtml(storeLabel(s, 'add'))}</option>`
          }).join('')}
        </select>
      </div>
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

  return `
    <article class="list-item" data-id="${escapeAttr(item.id)}" style="--store:${store.brand}">
      <div class="item-main">
        <div class="item-emoji">${renderIcon(visual, 'sm')}</div>
        <div class="item-info">
          <strong>${escapeHtml(name)}</strong>
          <span>${escapeHtml(who + when)}</span>
        </div>
        <div class="item-side">
          <button class="store-badge" type="button" data-action="cycle-store" data-id="${escapeAttr(item.id)}" title="Cambiar supermercado" style="--store:${store.brand}">
            ${escapeHtml(store.short)}
          </button>
          <div class="qty">
            <button type="button" data-action="qty" data-id="${escapeAttr(item.id)}" data-delta="-1" aria-label="Menos">−</button>
            <b>${item.qty}</b>
            <button type="button" data-action="qty" data-id="${escapeAttr(item.id)}" data-delta="1" aria-label="Más">＋</button>
          </div>
        </div>
      </div>
      <div class="buy-slide" data-buy-id="${escapeAttr(item.id)}">
        <div class="buy-slide-fill"></div>
        <span class="buy-slide-label">Desliza para confirmar compra</span>
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

  if (!category) {
    return renderAisles()
  }

  return renderCategoryBrowse()
}

function renderAisles() {
  return `
    ${renderStorePicker('add')}
    <div class="browse-head">
      <h2>Pasillos</h2>
      <p>Añadiendo en <strong>${escapeHtml(getStore(activeStore).name)}</strong></p>
    </div>
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
              : PRODUCTS.filter((p) => p.category === category && p.sub === s.id).length
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
  return `
    <button class="product-card ${existing ? 'in-list' : ''}" type="button" data-action="toggle-product" data-product="${escapeAttr(product.id)}" data-longpress="add-qty" title="Toca: +1 · Mantén: elegir cantidad">
      <span class="product-icon">${renderIcon(product, 'md')}</span>
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

function bindStoreSelects() {
  app.querySelectorAll('select[data-store-mode="add"]').forEach((select) => {
    if (select.dataset.bound) return
    select.dataset.bound = '1'
    select.addEventListener('change', () => {
      activeStore = select.value
      localStorage.setItem('compra:store', activeStore)
      showToast(`Nuevos en ${getStore(activeStore).name}`)
      softRerender()
    })
  })
}

function softRerender() {
  const lista = app.querySelector('[data-view-panel="lista"]')
  const catalogo = app.querySelector('[data-view-panel="catalogo"]')
  const historial = app.querySelector('[data-view-panel="historial"]')
  if (view === 'lista' && lista) lista.innerHTML = renderLista()
  if (view === 'catalogo' && catalogo) catalogo.innerHTML = renderCatalogo()
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
          : 'Buscar productos…'
    if (search.value !== query) search.value = query
  }

  bindLongPress()
  bindBuySliders()
  bindStoreSelects()
  updateNavCount()
}

const LONG_PRESS_MS = 480
let suppressProductClickUntil = 0

function bindLongPress() {
  app.querySelectorAll('[data-longpress]').forEach((el) => {
    if (el.dataset.lpBound) return
    el.dataset.lpBound = '1'

    let timer = null
    let fired = false

    const clear = () => {
      if (timer) clearTimeout(timer)
      timer = null
      el.classList.remove('holding')
    }

    const start = (e) => {
      if (e.button != null && e.button !== 0) return
      fired = false
      el.classList.add('holding')
      timer = setTimeout(() => {
        fired = true
        suppressProductClickUntil = Date.now() + 500
        el.classList.remove('holding')
        el.classList.add('long-pressed')
        const action = el.dataset.longpress
        if (action === 'add-qty') {
          openQtySheet(el.dataset.product)
        }
        vibrate([12, 30, 12])
      }, LONG_PRESS_MS)
    }

    el.addEventListener('pointerdown', start)
    el.addEventListener('pointerup', clear)
    el.addEventListener('pointerleave', clear)
    el.addEventListener('pointercancel', clear)
    el.addEventListener(
      'click',
      (e) => {
        if (fired || Date.now() < suppressProductClickUntil) {
          e.preventDefault()
          e.stopImmediatePropagation()
          fired = false
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
      render()
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
      if (Date.now() < suppressProductClickUntil) break
      toggleProduct(btn.dataset.product)
      break
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

function addProductQty(productId, qty) {
  const amount = Math.max(1, Math.min(99, Number(qty) || 1))
  const product = getProductById(productId)
  if (!product) return
  const existing = state.items.find(
    (i) => i.productId === productId && i.store === activeStore,
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
      store: activeStore,
      addedBy: state.member || '',
      addedAt: Date.now(),
    })
  }
  persist()
  showToast(`＋${amount} ${product.name} · ${getStore(activeStore).name}`)
  vibrate()
  softRerender()
}

function openQtySheet(productId) {
  const product = getProductById(productId)
  if (!product) return
  const existing = state.items.find(
    (i) => i.productId === productId && i.store === activeStore,
  )
  const totalOfProduct = state.items
    .filter((i) => i.productId === productId)
    .reduce((n, i) => n + i.qty, 0)
  qtyDraft = 2
  const overlay = app.querySelector('#overlay')
  if (!overlay) return

  overlay.innerHTML = `
    <div class="sheet qty-sheet">
      <div class="qty-sheet-product">
        <span class="qty-sheet-icon">${renderIcon(product, 'md')}</span>
        <div>
          <h2>${escapeHtml(product.name)}</h2>
          <p>Añadir en <strong>${escapeHtml(getStore(activeStore).name)}</strong>${existing ? ` · ya hay ${existing.qty}` : ''}</p>
        </div>
      </div>
      <div class="qty-presets">
        ${[2, 3, 4, 5, 6, 8, 10, 12].map((n) => `
          <button type="button" class="qty-preset ${qtyDraft === n ? 'active' : ''}" data-qty="${n}">${n}</button>
        `).join('')}
      </div>
      <div class="qty-stepper">
        <button type="button" class="qty-step" data-delta="-1" aria-label="Menos">−</button>
        <b id="qty-draft">${qtyDraft}</b>
        <button type="button" class="qty-step" data-delta="1" aria-label="Más">＋</button>
      </div>
      <div class="sheet-actions">
        <button class="secondary-btn" type="button" data-action="close-sheet">Cancelar</button>
        <button class="primary-btn" type="button" id="confirm-qty">Añadir ${qtyDraft}</button>
      </div>
      ${
        totalOfProduct
          ? `<button class="danger-btn qty-delete-btn" type="button" id="delete-product">Borrar todas (${totalOfProduct})</button>`
          : ''
      }
    </div>
  `
  overlay.classList.add('open')

  const draftEl = overlay.querySelector('#qty-draft')
  const confirmBtn = overlay.querySelector('#confirm-qty')
  const syncDraft = () => {
    draftEl.textContent = String(qtyDraft)
    confirmBtn.textContent = `Añadir ${qtyDraft}`
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
      qtyDraft = Math.max(1, Math.min(99, qtyDraft + Number(b.dataset.delta)))
      syncDraft()
    })
  })
  confirmBtn.addEventListener('click', () => {
    closeSheet()
    addProductQty(productId, qtyDraft)
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
        <span class="store-select-dot" aria-hidden="true"></span>
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

  const match = PRODUCTS.find(
    (p) => p.name.toLowerCase() === trimmed.toLowerCase(),
  )
  if (match) {
    toggleProduct(match.id)
    return
  }

  const existing = state.items.find(
    (i) => !i.productId && i.name.toLowerCase() === trimmed.toLowerCase() && i.store === activeStore,
  )
  if (existing) {
    existing.qty += 1
  } else {
    state.items.unshift({
      id: crypto.randomUUID(),
      productId: null,
      name: trimmed,
      emoji: '🛒',
      qty: 1,
      store: activeStore,
      addedBy: state.member || '',
      addedAt: Date.now(),
    })
  }
  persist()
  showToast(`＋ ${trimmed} · ${getStore(activeStore).name}`)
  vibrate()
  if (view !== 'lista') {
    view = 'lista'
    query = ''
    render()
  } else {
    softRerender()
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
    const END = 0.97 // solo al llegar casi al borde derecho

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
      apply(maxX, true)
      slide.classList.add('complete')
      vibrate([10, 40, 10])
      buyItem(slide.dataset.buyId)
    }

    const onDown = (e) => {
      if (completed) return
      dragging = true
      maxX = measure()
      startX = e.clientX - currentX
      try {
        knob.setPointerCapture(e.pointerId)
      } catch {
        /* ignore */
      }
      e.preventDefault()
    }

    const onMove = (e) => {
      if (!dragging || completed) return
      apply(e.clientX - startX)
      // Solo completa al llegar al final real, no a mitad de camino
      if (maxX > 0 && currentX >= maxX * END) finish()
    }

    const onUp = () => {
      if (!dragging) return
      dragging = false
      if (completed) return
      if (maxX > 0 && currentX >= maxX * END) finish()
      else reset()
    }

    knob.addEventListener('pointerdown', onDown)
    knob.addEventListener('pointermove', onMove)
    knob.addEventListener('pointerup', onUp)
    knob.addEventListener('pointercancel', onUp)
    knob.addEventListener('click', (e) => e.preventDefault())
  })
}

function buyItem(id) {
  const row = app.querySelector(`.list-item[data-id="${CSS.escape(id)}"]`)
  if (row) row.classList.add('buying')
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
  setTimeout(() => {
    state.history = [entry, ...(state.history || [])].slice(0, 2000)
    state.items = state.items.filter((i) => i.id !== id)
    persist()
    showToast(`✓ Comprado: ${name}`)
    softRerender()
  }, 280)
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

function renderHistoryEntry(entry) {
  const store = getStore(entry.store)
  const visual = {
    emoji: entry.emoji || '🛒',
    icon: entry.icon || null,
    name: entry.name,
  }
  const who = entry.boughtBy ? `por ${entry.boughtBy}` : 'comprado'
  const time = formatTimeOnly(entry.boughtAt)

  return `
    <article class="history-item" style="--store:${store.brand}">
      <div class="item-emoji">${renderIcon(visual, 'sm')}</div>
      <div class="item-info">
        <strong>${escapeHtml(entry.name)} <em class="history-qty">×${entry.qty || 1}</em></strong>
        <span>${escapeHtml(store.name)} · ${escapeHtml(who)} · ${escapeHtml(time)}</span>
      </div>
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
  saveLocal(listId, state)
  saveMembers(state.members)
  queuePush()
}

let pushQueued = null
function queuePush() {
  if (!getSyncUrl()) return
  clearTimeout(pushQueued)
  pushQueued = setTimeout(() => syncPush(), 400)
}

async function syncPull() {
  const remote = await pullRemote(listId)
  if (!remote) {
    setSyncStatus(false)
    return
  }
  setSyncStatus(true)
  if ((remote.updatedAt || 0) > (state.updatedAt || 0)) {
    state.items = remote.items
    state.history = Array.isArray(remote.history) ? remote.history : state.history || []
    if (remote.members?.length) state.members = remote.members
    state.updatedAt = remote.updatedAt
    saveLocal(listId, state)
    softRerender()
  }
}

async function syncPush() {
  if (pushing || !getSyncUrl()) return
  pushing = true
  const ok = await pushRemote(listId, state)
  setSyncStatus(ok)
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
        <input id="set-sync" type="url" placeholder="${escapeAttr(window.location.origin + '/api')}" value="${escapeAttr(url)}" />
        <p style="font-size:0.82rem;margin-top:8px">Con <code>npm run start</code> usa la API del mismo servidor. También puedes pegar una URL de Firebase Realtime Database.</p>

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
      showToast(sync ? 'Sincronización activada' : 'Ajustes guardados')
      startSyncLoop()
      syncPull()
    })
    return
  }

  if (type === 'help') {
    const link = nfcLink()
    overlay.innerHTML = `
      <div class="sheet">
        <h2>Pegatina NFC en la nevera</h2>
        <p>Cada miembro de la familia acerca el móvil a la pegatina y se abre esta lista al instante.</p>
        <ol class="help-steps">
          <li>En el PC: <code>npm run start</code> (sirve la app + sincronización familiar).</li>
          <li>Abre en el móvil la IP de ese PC, p. ej. <code>http://192.168.1.20:4173/?lista=familia</code>.</li>
          <li>Copia el enlace de abajo y grábalo en la pegatina con NFC Tools.</li>
          <li>Pega la pegatina en la nevera. Cada scan abre la misma lista.</li>
        </ol>
        <div class="code-box" id="nfc-link">${escapeHtml(link)}</div>
        <div class="sheet-actions">
          <button class="secondary-btn" type="button" data-action="close-sheet">Cerrar</button>
          <button class="primary-btn" type="button" id="copy-nfc">Copiar enlace</button>
        </div>
        <p style="margin-top:14px;font-size:0.85rem">Flujo típico: alguien ve que falta leche → toca NFC → añade Leche → al comprar, <strong>desliza el círculo</strong> a la derecha y desaparece.</p>
      </div>
    `
    overlay.classList.add('open')
    overlay.querySelector('#copy-nfc').addEventListener('click', copyNfcLink)
  }
}

function closeSheet() {
  const overlay = app.querySelector('#overlay')
  if (!overlay) return
  overlay.classList.remove('open')
  overlay.innerHTML = ''
}

function nfcLink() {
  const u = new URL(window.location.href)
  u.searchParams.set('lista', listId)
  u.hash = ''
  return u.toString()
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

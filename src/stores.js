/** Supermercados donde se puede comprar */

export const STORES = [
  { id: 'todos', name: 'TODOS', short: 'TODOS', brand: '#37474f' },
  { id: 'mercadona', name: 'Mercadona', short: 'MERC', brand: '#1f8a4c' },
  { id: 'lidl', name: 'LIDL', short: 'LIDL', brand: '#0050aa' },
  { id: 'alimerka', name: 'Alimerka', short: 'ALI', brand: '#f5c400', light: true },
  { id: 'alcampo', name: 'Alcampo', short: 'ALC', brand: '#e30613' },
  { id: 'carrefour', name: 'Carrefour', short: 'CARR', brand: '#004e9f' },
  { id: 'familia', name: 'Familia', short: 'FAM', brand: '#c62828' },
]

export function getStore(id) {
  return STORES.find((s) => s.id === id) || STORES[0]
}

export function storeOrder() {
  return STORES.map((s) => s.id)
}

/** Etiqueta según pantalla: en lista = Ver todos, al añadir = TODOS */
export function storeLabel(store, mode) {
  if (store.id === 'todos' && mode === 'filter') return 'Ver todos'
  return store.name
}

/** Logo oficial PNG de cada supermercado (carpeta public/stores) */
export function renderStoreLogo(storeOrId, size = 'md') {
  const store = typeof storeOrId === 'string' ? getStore(storeOrId) : storeOrId || STORES[0]
  const src = `./stores/${store.id}.png`
  return `<span class="store-logo size-${size}" style="--store:${store.brand}" aria-hidden="true"><img src="${src}" alt="" width="40" height="40" loading="lazy" decoding="async" /></span>`
}

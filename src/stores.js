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

/** Logo SVG estilizado de cada supermercado */
export function renderStoreLogo(storeOrId, size = 'md') {
  const store = typeof storeOrId === 'string' ? getStore(storeOrId) : storeOrId || STORES[0]
  const fn = LOGO_SVG[store.id] || LOGO_SVG.todos
  return `<span class="store-logo size-${size}" style="--store:${store.brand}" aria-hidden="true">${fn()}</span>`
}

const LOGO_SVG = {
  todos: () => `
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="10" fill="#455a64"/>
      <circle cx="13" cy="15" r="4" fill="#1f8a4c"/>
      <circle cx="27" cy="15" r="4" fill="#0050aa"/>
      <circle cx="13" cy="27" r="4" fill="#e30613"/>
      <circle cx="27" cy="27" r="4" fill="#f5c400"/>
    </svg>`,

  mercadona: () => `
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="10" fill="#1f8a4c"/>
      <path d="M8 28 V12 h5.2 l4.4 10.2 L22 12 H27.2 V28 h-4.2 V18.2 L18.6 28 h-3.4 L10.8 18.2 V28 H8Z" fill="#fff"/>
      <rect x="6" y="30" width="28" height="3" rx="1.5" fill="#fff" opacity=".35"/>
    </svg>`,

  lidl: () => `
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="19" fill="#0050aa"/>
      <circle cx="20" cy="20" r="14.5" fill="#ffcc00"/>
      <circle cx="20" cy="20" r="11.5" fill="#0050aa"/>
      <text x="20" y="24.2" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="9.5" font-weight="900" fill="#fff" letter-spacing="-0.4">Lidl</text>
    </svg>`,

  alimerka: () => `
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="10" fill="#f5c400"/>
      <path d="M20 7 L33 28 H7 Z" fill="#c62828"/>
      <path d="M20 12.5 L28.2 26 H11.8 Z" fill="#fff"/>
      <circle cx="20" cy="22" r="3.2" fill="#1565c0"/>
      <text x="20" y="36" text-anchor="middle" font-family="Arial, sans-serif" font-size="6.5" font-weight="800" fill="#333">ALI</text>
    </svg>`,

  alcampo: () => `
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="10" fill="#e30613"/>
      <path d="M20 6 L22.4 15.2 H32 L24.2 20.8 L26.6 30 L20 24.4 L13.4 30 L15.8 20.8 L8 15.2 H17.6 Z" fill="#fff"/>
    </svg>`,

  carrefour: () => `
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="10" fill="#fff" stroke="#e8eef5" stroke-width="1"/>
      <path d="M20 4 L36 20 L20 36 L18 34 L32 20 L18 6 Z" fill="#e30613"/>
      <path d="M20 4 L4 20 L20 36 L22 34 L8 20 L22 6 Z" fill="#004e9f"/>
      <circle cx="20" cy="20" r="5.5" fill="#fff"/>
    </svg>`,

  familia: () => `
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="10" fill="#c62828"/>
      <path d="M12 28c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="#fff" stroke-width="2.4" stroke-linecap="round" fill="none"/>
      <circle cx="15.5" cy="15" r="3.2" fill="#fff"/>
      <circle cx="24.5" cy="15" r="3.2" fill="#fff"/>
      <circle cx="20" cy="12.5" r="3.6" fill="#fff"/>
      <text x="20" y="36" text-anchor="middle" font-family="Arial, sans-serif" font-size="6" font-weight="800" fill="#fff" opacity=".9">FAM</text>
    </svg>`,
}

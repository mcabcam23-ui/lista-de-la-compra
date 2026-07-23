const LOCAL_PREFIX = 'compra:'

/** Sync en la nube (fuera de casa y en casa) */
export const DEFAULT_CLOUD_SYNC =
  'https://lista-compra-familia-9cff4-default-rtdb.europe-west1.firebasedatabase.app'

/** App pública para la pegatina NFC (funciona con datos móviles) */
export const PUBLIC_APP_URL = 'https://mcabcam23-ui.github.io/lista-de-la-compra/'

function localKey(listId) {
  return `${LOCAL_PREFIX}${listId}`
}

export function getListIdFromUrl() {
  const params = new URLSearchParams(window.location.search)
  let id = params.get('lista') || params.get('list') || localStorage.getItem('compra:lastList')
  if (!id) {
    id = 'familia'
    const url = new URL(window.location.href)
    url.searchParams.set('lista', id)
    window.history.replaceState({}, '', url)
  }
  localStorage.setItem('compra:lastList', id)
  return id
}

/** Si el enlace NFC trae ?sync=..., se guarda y ese móvil queda sincronizado */
export function applySyncFromUrl() {
  const params = new URLSearchParams(window.location.search)
  const fromQuery = params.get('sync')
  if (fromQuery != null && String(fromQuery).trim() !== '') {
    setSyncUrl(String(fromQuery).trim().replace(/\/$/, ''))
    const url = new URL(window.location.href)
    url.searchParams.delete('sync')
    window.history.replaceState({}, '', url)
  } else {
    ensureCloudSync()
  }
  return getSyncUrl()
}

/** Activa Firebase si aún no hay sync o solo había la API local de casa */
export function ensureCloudSync() {
  const raw = localStorage.getItem('compra:syncUrl')
  if (raw === null || String(raw).trim() === '') {
    setSyncUrl(DEFAULT_CLOUD_SYNC)
    return DEFAULT_CLOUD_SYNC
  }
  const current = String(raw).trim().replace(/\/$/, '')
  try {
    const host = new URL(current).hostname
    if (isLocalHost(host) || /\/api$/i.test(current)) {
      setSyncUrl(DEFAULT_CLOUD_SYNC)
      return DEFAULT_CLOUD_SYNC
    }
  } catch {
    setSyncUrl(DEFAULT_CLOUD_SYNC)
    return DEFAULT_CLOUD_SYNC
  }
  return current
}

export function loadLocal(listId) {
  try {
    const raw = localStorage.getItem(localKey(listId))
    if (!raw) return defaultState()
    const data = JSON.parse(raw)
    return {
      ...defaultState(),
      ...data,
      items: Array.isArray(data.items) ? data.items : [],
      history: Array.isArray(data.history) ? data.history : [],
      tickets: Array.isArray(data.tickets) ? data.tickets : [],
      prices: data.prices && typeof data.prices === 'object' ? data.prices : {},
      extraProducts: Array.isArray(data.extraProducts) ? data.extraProducts : [],
      sectionOverrides:
        data.sectionOverrides && typeof data.sectionOverrides === 'object'
          ? data.sectionOverrides
          : {},
    }
  } catch {
    return defaultState()
  }
}

export function saveLocal(listId, state) {
  localStorage.setItem(
    localKey(listId),
    JSON.stringify({
      items: state.items,
      history: state.history || [],
      tickets: state.tickets || [],
      prices: state.prices || {},
      extraProducts: state.extraProducts || [],
      sectionOverrides: state.sectionOverrides || {},
      member: state.member,
      members: state.members,
      updatedAt: state.updatedAt || Date.now(),
    }),
  )
}

export function defaultState() {
  return {
    items: [],
    history: [],
    tickets: [],
    prices: {},
    extraProducts: [],
    sectionOverrides: {},
    member: localStorage.getItem('compra:member') || '',
    members: JSON.parse(localStorage.getItem('compra:members') || '[]'),
    updatedAt: 0,
  }
}

function isLocalHost(host) {
  return (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '[::1]' ||
    /^\d{1,3}(\.\d{1,3}){3}$/.test(host)
  )
}

export function getSyncUrl() {
  const raw = localStorage.getItem('compra:syncUrl')
  if (raw !== null) {
    const v = String(raw).trim().replace(/\/$/, '')
    if (v) return v
  }
  return DEFAULT_CLOUD_SYNC
}

export function setSyncUrl(url) {
  localStorage.setItem('compra:syncUrl', String(url || '').trim().replace(/\/$/, ''))
}

export function hasSyncConfigured() {
  return Boolean(getSyncUrl())
}

/** Enlace para grabar en la pegatina NFC (GitHub Pages + Firebase = funciona fuera de casa) */
export function buildNfcLink(listId) {
  const u = new URL(PUBLIC_APP_URL)
  u.searchParams.set('lista', listId || 'familia')
  const sync = getSyncUrl() || DEFAULT_CLOUD_SYNC
  if (sync && !/\/api$/i.test(sync)) {
    u.searchParams.set('sync', sync)
  }
  return u.toString()
}

function isFirebaseBase(base) {
  return (
    base.includes('firebaseio.com') ||
    base.includes('firebasedatabase.app') ||
    base.endsWith('.json')
  )
}

function remoteListUrl(listId) {
  const base = getSyncUrl().replace(/\/$/, '').replace(/\.json$/, '')
  if (isFirebaseBase(base)) {
    return `${base}/lists/${encodeURIComponent(listId)}.json`
  }
  return `${base}/lists/${encodeURIComponent(listId)}`
}

export async function pullRemote(listId) {
  try {
    if (!getSyncUrl()) return null
    const res = await fetch(remoteListUrl(listId), { cache: 'no-store' })
    if (!res.ok) return null
    const data = await res.json()
    // Firebase devuelve null si la ruta aún no existe
    if (data == null) {
      return {
        items: [],
        history: [],
        tickets: [],
        prices: {},
        extraProducts: [],
        members: [],
        sectionOverrides: {},
        updatedAt: 0,
      }
    }
    if (typeof data !== 'object') return null
    return {
      items: Array.isArray(data.items) ? data.items : [],
      history: Array.isArray(data.history) ? data.history : [],
      tickets: Array.isArray(data.tickets) ? data.tickets : [],
      prices: data.prices && typeof data.prices === 'object' ? data.prices : {},
      extraProducts: Array.isArray(data.extraProducts) ? data.extraProducts : [],
      members: Array.isArray(data.members) ? data.members : [],
      sectionOverrides:
        data.sectionOverrides && typeof data.sectionOverrides === 'object'
          ? data.sectionOverrides
          : {},
      updatedAt: data.updatedAt || 0,
    }
  } catch {
    return null
  }
}

export async function pushRemote(listId, state) {
  try {
    const base = getSyncUrl()
    if (!base) return 'off'

    const payload = {
      items: state.items,
      history: state.history || [],
      tickets: state.tickets || [],
      prices: state.prices || {},
      extraProducts: state.extraProducts || [],
      sectionOverrides: state.sectionOverrides || {},
      members: state.members,
      updatedAt: state.updatedAt || Date.now(),
    }
    const res = await fetch(remoteListUrl(listId), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.status === 409) return 'conflict'
    return res.ok ? 'ok' : 'fail'
  } catch {
    return 'fail'
  }
}

export function saveMember(name) {
  localStorage.setItem('compra:member', name)
}

export function saveMembers(members) {
  localStorage.setItem('compra:members', JSON.stringify(members))
}

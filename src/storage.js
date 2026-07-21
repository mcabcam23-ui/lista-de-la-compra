const LOCAL_PREFIX = 'compra:'

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
    member: localStorage.getItem('compra:member') || '',
    members: JSON.parse(localStorage.getItem('compra:members') || '[]'),
    updatedAt: 0,
  }
}

export function getSyncUrl() {
  const saved = localStorage.getItem('compra:syncUrl')
  if (saved) return saved.trim().replace(/\/$/, '')
  return `${window.location.origin}/api`
}

export function setSyncUrl(url) {
  if (url) localStorage.setItem('compra:syncUrl', url.trim().replace(/\/$/, ''))
  else localStorage.removeItem('compra:syncUrl')
}

function remoteListUrl(listId) {
  const base = getSyncUrl()
  if (base.includes('firebaseio.com') || base.endsWith('.json')) {
    const root = base.replace(/\/$/, '').replace(/\.json$/, '')
    return `${root}/lists/${encodeURIComponent(listId)}.json`
  }
  return `${base}/lists/${encodeURIComponent(listId)}`
}

export async function pullRemote(listId) {
  try {
    const res = await fetch(remoteListUrl(listId), { cache: 'no-store' })
    if (!res.ok) return null
    const data = await res.json()
    if (!data || typeof data !== 'object') return null
    return {
      items: Array.isArray(data.items) ? data.items : [],
      history: Array.isArray(data.history) ? data.history : [],
      tickets: Array.isArray(data.tickets) ? data.tickets : [],
      prices: data.prices && typeof data.prices === 'object' ? data.prices : {},
      members: Array.isArray(data.members) ? data.members : [],
      updatedAt: data.updatedAt || 0,
    }
  } catch {
    return null
  }
}

export async function pushRemote(listId, state) {
  try {
    const payload = {
      items: state.items,
      history: state.history || [],
      tickets: state.tickets || [],
      prices: state.prices || {},
      members: state.members,
      updatedAt: Date.now(),
    }
    const res = await fetch(remoteListUrl(listId), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    return res.ok
  } catch {
    return false
  }
}

export function saveMember(name) {
  localStorage.setItem('compra:member', name)
}

export function saveMembers(members) {
  localStorage.setItem('compra:members', JSON.stringify(members))
}

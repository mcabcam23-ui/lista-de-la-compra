/** Iconos SVG de envase — estilo súper español */
import { renderProduce } from './produce.js'

export function renderIcon(product, size = 'md') {
  const icon = product?.icon
  if (!icon) {
    return renderProduce(product, size)
  }

  const svg = {
    carton: svgCarton,
    bottle: svgBottle,
    tub: svgTub,
    pot: svgPot,
    tray: svgTray,
    can: svgCan,
    jar: svgJar,
    bag: svgBag,
    box: svgBox,
    bar: svgBar,
    eggbox: svgEggbox,
  }[icon.type]

  if (!svg) return renderProduce(product, size)
  return `<span class="pack-svg size-${size}" aria-hidden="true">${svg(icon)}</span>`
}

export function renderCategoryIcon(catId, size = 'md') {
  const fn = CATEGORY_SVGS[catId]
  if (!fn) return `<span class="cat-fallback">✨</span>`
  return `<span class="cat-svg size-${size}" aria-hidden="true">${fn()}</span>`
}

/* ——— SVG packs ——— */

function svgCarton(i) {
  const c = i.color || '#c62828'
  const top = i.top || shade(c, 22)
  const stripe = i.stripe || '#ffffff'
  const label = i.label || ''
  const uid = uid_()
  return `
  <svg viewBox="0 0 64 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g${uid}" x1="8" y1="10" x2="56" y2="74" gradientUnits="userSpaceOnUse">
        <stop stop-color="${shade(c, 18)}"/><stop offset="1" stop-color="${shade(c, -12)}"/>
      </linearGradient>
      <linearGradient id="s${uid}" x1="0" y1="0" x2="0" y2="1">
        <stop stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
      </linearGradient>
      <filter id="f${uid}" x="-20%" y="-10%" width="140%" height="130%">
        <feDropShadow dx="0" dy="2" stdDeviation="1.6" flood-opacity=".22"/>
      </filter>
    </defs>
    <g filter="url(#f${uid})">
      <path d="M18 16 L22 6 H42 L46 16 Z" fill="${top}"/>
      <path d="M18 16 H46 V18.5 H18 Z" fill="${shade(c, -20)}"/>
      <rect x="14" y="18" width="36" height="54" rx="4" fill="url(#g${uid})"/>
      <rect x="14" y="18" width="36" height="54" rx="4" fill="url(#s${uid})"/>
      <rect x="14" y="34" width="36" height="12" fill="${stripe}" opacity=".95"/>
      <rect x="14" y="34" width="36" height="1.2" fill="${shade(c, -30)}" opacity=".25"/>
      <rect x="14" y="45" width="36" height="1.2" fill="${shade(c, -30)}" opacity=".18"/>
      ${label ? `<rect x="20" y="50" width="24" height="12" rx="3" fill="#fff" opacity=".94"/>
      <text x="32" y="59" text-anchor="middle" font-family="DM Sans, system-ui, sans-serif" font-size="7.5" font-weight="800" fill="${c}">${esc(label)}</text>` : ''}
      <path d="M16 20 h6 a2 2 0 0 1 2 2 v8 a2 2 0 0 1 -2 2 h-3 z" fill="#fff" opacity=".12"/>
    </g>
  </svg>`
}

function svgBottle(i) {
  const c = i.color || '#1565c0'
  const cap = i.cap || shade(c, -30)
  const liquid = i.liquid || '#e3f2fd'
  const label = i.label || ''
  const uid = uid_()
  return `
  <svg viewBox="0 0 64 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="b${uid}" x1="20" y1="20" x2="48" y2="74">
        <stop stop-color="${shade(liquid, 10)}"/><stop offset="1" stop-color="${shade(liquid, -8)}"/>
      </linearGradient>
      <filter id="f${uid}" x="-20%" y="-10%" width="140%" height="130%">
        <feDropShadow dx="0" dy="2" stdDeviation="1.5" flood-opacity=".2"/>
      </filter>
    </defs>
    <g filter="url(#f${uid})">
      <rect x="26" y="6" width="12" height="8" rx="2" fill="${cap}"/>
      <rect x="28" y="13" width="8" height="10" fill="${shade(liquid, 5)}" stroke="${c}" stroke-width="1.2"/>
      <path d="M22 24 C22 20 26 18 32 18 C38 18 42 20 42 24 L44 34 C46 38 46 42 46 48 L44 70 C44 73 40 76 32 76 C24 76 20 73 20 70 L18 48 C18 42 18 38 20 34 Z" fill="url(#b${uid})" stroke="${c}" stroke-width="1.8"/>
      <path d="M24 28 C24 26 28 24 32 24 C36 24 40 26 40 28" stroke="#fff" stroke-opacity=".35" stroke-width="2"/>
      ${label ? `<rect x="23" y="44" width="18" height="11" rx="3" fill="#fff" opacity=".9"/>
      <text x="32" y="52" text-anchor="middle" font-family="DM Sans, system-ui, sans-serif" font-size="7" font-weight="800" fill="${c}">${esc(label)}</text>` : ''}
    </g>
  </svg>`
}

function svgTub(i) {
  const c = i.color || '#f9a825'
  const lid = i.lid || shade(c, 15)
  const label = i.label || ''
  const uid = uid_()
  return `
  <svg viewBox="0 0 64 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="t${uid}" x1="12" y1="28" x2="52" y2="70">
        <stop stop-color="${shade(c, 12)}"/><stop offset="1" stop-color="${shade(c, -10)}"/>
      </linearGradient>
      <filter id="f${uid}" x="-20%" y="-10%" width="140%" height="130%">
        <feDropShadow dx="0" dy="2" stdDeviation="1.5" flood-opacity=".2"/>
      </filter>
    </defs>
    <g filter="url(#f${uid})">
      <ellipse cx="32" cy="24" rx="24" ry="8" fill="${lid}"/>
      <ellipse cx="32" cy="22" rx="22" ry="6.5" fill="${shade(lid, 20)}" opacity=".9"/>
      <path d="M10 26 L14 66 C15 70 22 74 32 74 C42 74 49 70 50 66 L54 26" fill="url(#t${uid})"/>
      <path d="M14 34 H50" stroke="#fff" stroke-opacity=".25" stroke-width="2"/>
      ${label ? `<rect x="20" y="44" width="24" height="12" rx="3" fill="#fff" opacity=".92"/>
      <text x="32" y="53" text-anchor="middle" font-family="DM Sans, system-ui, sans-serif" font-size="7.5" font-weight="800" fill="${shade(c, -35)}">${esc(label)}</text>` : ''}
    </g>
  </svg>`
}

function svgPot(i) {
  const foil = i.foil || '#b0bec5'
  const fill = i.fill || '#fffde7'
  const label = i.label || ''
  const uid = uid_()
  return `
  <svg viewBox="0 0 64 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="p${uid}" x1="16" y1="22" x2="48" y2="70">
        <stop stop-color="${shade(fill, 8)}"/><stop offset="1" stop-color="${shade(fill, -6)}"/>
      </linearGradient>
      <filter id="f${uid}" x="-20%" y="-10%" width="140%" height="130%">
        <feDropShadow dx="0" dy="2" stdDeviation="1.4" flood-opacity=".2"/>
      </filter>
    </defs>
    <g filter="url(#f${uid})">
      <ellipse cx="32" cy="20" rx="20" ry="7" fill="${foil}"/>
      <ellipse cx="32" cy="18.5" rx="18" ry="5" fill="${shade(foil, 25)}" opacity=".85"/>
      <path d="M14 22 L16 64 C17 70 23 74 32 74 C41 74 47 70 48 64 L50 22" fill="url(#p${uid})" stroke="rgba(0,0,0,.08)" stroke-width="1"/>
      <path d="M18 30 C22 28 42 28 46 30" stroke="#fff" stroke-opacity=".4" stroke-width="2"/>
      ${label ? `<rect x="21" y="42" width="22" height="12" rx="3" fill="#fff" opacity=".93"/>
      <text x="32" y="51" text-anchor="middle" font-family="DM Sans, system-ui, sans-serif" font-size="7" font-weight="800" fill="#455a64">${esc(label)}</text>` : ''}
    </g>
  </svg>`
}

function svgTray(i) {
  const pad = i.color || '#fff3e0'
  const meat = i.meat || '#c62828'
  const label = i.label || ''
  const uid = uid_()
  return `
  <svg viewBox="0 0 64 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="f${uid}" x="-20%" y="-10%" width="140%" height="130%">
        <feDropShadow dx="0" dy="2" stdDeviation="1.5" flood-opacity=".2"/>
      </filter>
      <radialGradient id="m${uid}" cx="35%" cy="35%" r="65%">
        <stop stop-color="${shade(meat, 18)}"/><stop offset="1" stop-color="${shade(meat, -10)}"/>
      </radialGradient>
    </defs>
    <g filter="url(#f${uid})">
      <rect x="8" y="18" width="48" height="46" rx="8" fill="${pad}" stroke="rgba(0,0,0,.08)"/>
      <rect x="12" y="22" width="40" height="8" rx="2" fill="#fff" opacity=".55"/>
      <ellipse cx="32" cy="46" rx="16" ry="11" fill="url(#m${uid})"/>
      <ellipse cx="28" cy="42" rx="5" ry="3" fill="#fff" opacity=".2"/>
      ${label ? `<rect x="22" y="56" width="20" height="9" rx="2.5" fill="rgba(0,0,0,.45)"/>
      <text x="32" y="63" text-anchor="middle" font-family="DM Sans, system-ui, sans-serif" font-size="6.5" font-weight="800" fill="#fff">${esc(label)}</text>` : ''}
    </g>
  </svg>`
}

function svgCan(i) {
  const c = i.color || '#546e7a'
  const top = i.top || '#cfd8dc'
  const label = i.label || ''
  const uid = uid_()
  return `
  <svg viewBox="0 0 64 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="c${uid}" x1="14" y1="16" x2="50" y2="70">
        <stop stop-color="${shade(c, 16)}"/><stop offset=".45" stop-color="${c}"/><stop offset="1" stop-color="${shade(c, -14)}"/>
      </linearGradient>
      <filter id="f${uid}" x="-20%" y="-10%" width="140%" height="130%">
        <feDropShadow dx="0" dy="2" stdDeviation="1.5" flood-opacity=".22"/>
      </filter>
    </defs>
    <g filter="url(#f${uid})">
      <ellipse cx="32" cy="14" rx="16" ry="6" fill="${top}"/>
      <ellipse cx="32" cy="12.5" rx="14" ry="4.5" fill="${shade(top, 20)}" opacity=".8"/>
      <path d="M16 14 V62 C16 68 22 72 32 72 C42 72 48 68 48 62 V14" fill="url(#c${uid})"/>
      <path d="M18 22 H46" stroke="#fff" stroke-opacity=".2" stroke-width="3"/>
      ${label ? `<rect x="20" y="38" width="24" height="12" rx="3" fill="#fff" opacity=".92"/>
      <text x="32" y="47" text-anchor="middle" font-family="DM Sans, system-ui, sans-serif" font-size="7" font-weight="800" fill="${shade(c, -25)}">${esc(label)}</text>` : ''}
      <ellipse cx="32" cy="62" rx="16" ry="6" fill="${shade(c, -20)}" opacity=".35"/>
    </g>
  </svg>`
}

function svgJar(i) {
  const c = i.color || '#6d4c41'
  const lid = i.lid || '#b0bec5'
  const label = i.label || ''
  const uid = uid_()
  return `
  <svg viewBox="0 0 64 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="j${uid}" x1="18" y1="22" x2="46" y2="72">
        <stop stop-color="${shade(c, 14)}"/><stop offset="1" stop-color="${shade(c, -12)}"/>
      </linearGradient>
      <filter id="f${uid}" x="-20%" y="-10%" width="140%" height="130%">
        <feDropShadow dx="0" dy="2" stdDeviation="1.5" flood-opacity=".2"/>
      </filter>
    </defs>
    <g filter="url(#f${uid})">
      <rect x="20" y="8" width="24" height="10" rx="3" fill="${lid}"/>
      <rect x="22" y="10" width="20" height="3" fill="#fff" opacity=".35"/>
      <path d="M18 20 H46 L48 28 C50 34 50 42 48 52 L46 68 C45 72 40 74 32 74 C24 74 19 72 18 68 L16 52 C14 42 14 34 16 28 Z" fill="url(#j${uid})" stroke="rgba(255,255,255,.15)"/>
      <path d="M22 30 C26 28 38 28 42 30" stroke="#fff" stroke-opacity=".3" stroke-width="2"/>
      ${label ? `<rect x="21" y="42" width="22" height="12" rx="3" fill="#fff" opacity=".92"/>
      <text x="32" y="51" text-anchor="middle" font-family="DM Sans, system-ui, sans-serif" font-size="7" font-weight="800" fill="${shade(c, -30)}">${esc(label)}</text>` : ''}
    </g>
  </svg>`
}

function svgBag(i) {
  const c = i.color || '#8d6e63'
  const label = i.label || ''
  const uid = uid_()
  return `
  <svg viewBox="0 0 64 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="a${uid}" x1="12" y1="12" x2="52" y2="72">
        <stop stop-color="${shade(c, 16)}"/><stop offset="1" stop-color="${shade(c, -12)}"/>
      </linearGradient>
      <filter id="f${uid}" x="-20%" y="-10%" width="140%" height="130%">
        <feDropShadow dx="0" dy="2" stdDeviation="1.5" flood-opacity=".2"/>
      </filter>
    </defs>
    <g filter="url(#f${uid})">
      <path d="M16 14 C16 10 20 8 24 10 L32 16 L40 10 C44 8 48 10 48 14 L52 22 L50 70 C49 74 42 76 32 76 C22 76 15 74 14 70 L12 22 Z" fill="url(#a${uid})"/>
      <path d="M24 12 L32 18 L40 12" stroke="#fff" stroke-opacity=".25" stroke-width="2"/>
      ${label ? `<rect x="20" y="40" width="24" height="12" rx="3" fill="#fff" opacity=".93"/>
      <text x="32" y="49" text-anchor="middle" font-family="DM Sans, system-ui, sans-serif" font-size="7.5" font-weight="800" fill="${shade(c, -30)}">${esc(label)}</text>` : ''}
    </g>
  </svg>`
}

function svgBox(i) {
  const c = i.color || '#ef6c00'
  const label = i.label || ''
  const uid = uid_()
  return `
  <svg viewBox="0 0 64 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="x${uid}" x1="10" y1="14" x2="54" y2="68">
        <stop stop-color="${shade(c, 14)}"/><stop offset="1" stop-color="${shade(c, -12)}"/>
      </linearGradient>
      <filter id="f${uid}" x="-20%" y="-10%" width="140%" height="130%">
        <feDropShadow dx="0" dy="2" stdDeviation="1.5" flood-opacity=".22"/>
      </filter>
    </defs>
    <g filter="url(#f${uid})">
      <rect x="10" y="16" width="44" height="50" rx="6" fill="url(#x${uid})"/>
      <path d="M10 28 H54" stroke="#fff" stroke-opacity=".2" stroke-width="8"/>
      <rect x="10" y="16" width="44" height="10" rx="6" fill="${shade(c, 20)}" opacity=".5"/>
      ${label ? `<rect x="18" y="38" width="28" height="14" rx="3" fill="#fff" opacity=".94"/>
      <text x="32" y="48" text-anchor="middle" font-family="DM Sans, system-ui, sans-serif" font-size="8" font-weight="800" fill="${shade(c, -30)}">${esc(label)}</text>` : ''}
    </g>
  </svg>`
}

function svgBar(i) {
  const c = i.color || '#6d4c41'
  const wrap = i.wrap || '#fff8e1'
  const label = i.label || ''
  const uid = uid_()
  return `
  <svg viewBox="0 0 64 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="r${uid}" x1="8" y1="30" x2="56" y2="50">
        <stop stop-color="${wrap}"/><stop offset=".35" stop-color="${c}"/><stop offset=".65" stop-color="${c}"/><stop offset="1" stop-color="${wrap}"/>
      </linearGradient>
      <filter id="f${uid}" x="-20%" y="-10%" width="140%" height="130%">
        <feDropShadow dx="0" dy="2" stdDeviation="1.5" flood-opacity=".22"/>
      </filter>
    </defs>
    <g filter="url(#f${uid})" transform="rotate(-10 32 40)">
      <rect x="8" y="30" width="48" height="22" rx="5" fill="url(#r${uid})"/>
      <rect x="8" y="30" width="48" height="6" rx="5" fill="#fff" opacity=".2"/>
      ${label ? `<rect x="20" y="35" width="24" height="12" rx="3" fill="#fff" opacity=".93"/>
      <text x="32" y="44" text-anchor="middle" font-family="DM Sans, system-ui, sans-serif" font-size="7.5" font-weight="800" fill="${shade(c, -25)}">${esc(label)}</text>` : ''}
    </g>
  </svg>`
}

function svgEggbox(i) {
  const c = i.color || '#fff8e1'
  const egg = i.egg || '#ffe0b2'
  const label = i.label || ''
  const uid = uid_()
  return `
  <svg viewBox="0 0 64 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="f${uid}" x="-20%" y="-10%" width="140%" height="130%">
        <feDropShadow dx="0" dy="2" stdDeviation="1.4" flood-opacity=".2"/>
      </filter>
      <radialGradient id="e${uid}" cx="35%" cy="30%" r="70%">
        <stop stop-color="#fff"/><stop offset="1" stop-color="${egg}"/>
      </radialGradient>
    </defs>
    <g filter="url(#f${uid})">
      <rect x="10" y="20" width="44" height="42" rx="8" fill="${c}" stroke="rgba(0,0,0,.08)"/>
      <ellipse cx="24" cy="34" rx="8" ry="10" fill="url(#e${uid})"/>
      <ellipse cx="40" cy="34" rx="8" ry="10" fill="url(#e${uid})"/>
      <ellipse cx="24" cy="52" rx="8" ry="10" fill="url(#e${uid})"/>
      <ellipse cx="40" cy="52" rx="8" ry="10" fill="url(#e${uid})"/>
      ${label ? `<rect x="22" y="58" width="20" height="10" rx="3" fill="rgba(0,0,0,.4)"/>
      <text x="32" y="66" text-anchor="middle" font-family="DM Sans, system-ui, sans-serif" font-size="7" font-weight="800" fill="#fff">${esc(label)}</text>` : ''}
    </g>
  </svg>`
}

/* Category aisle icons */
const CATEGORY_SVGS = {
  all: () => `<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="20" fill="#e8f5e9"/><path d="M16 24h16M24 16v16" stroke="#1a7a4c" stroke-width="3" stroke-linecap="round"/></svg>`,
  frutas: () => `<svg viewBox="0 0 48 48"><circle cx="24" cy="26" r="14" fill="#e53935"/><path d="M24 12c0 0 2-6 8-6-2 6-4 8-8 8" fill="#43a047"/><ellipse cx="20" cy="22" rx="3" ry="4" fill="#fff" opacity=".25"/></svg>`,
  verduras: () => `<svg viewBox="0 0 48 48"><ellipse cx="24" cy="30" rx="12" ry="10" fill="#2e7d32"/><circle cx="18" cy="22" r="6" fill="#43a047"/><circle cx="30" cy="20" r="7" fill="#66bb6a"/><circle cx="24" cy="16" r="5" fill="#81c784"/></svg>`,
  lacteos: () => `<svg viewBox="0 0 48 48"><path d="M16 14h16l4 8v18a4 4 0 0 1-4 4H16a4 4 0 0 1-4-4V22z" fill="#c62828"/><rect x="12" y="26" width="24" height="8" fill="#fff"/><text x="24" y="33" text-anchor="middle" font-size="7" font-weight="800" fill="#c62828" font-family="system-ui">LEC</text></svg>`,
  carne: () => `<svg viewBox="0 0 48 48"><rect x="8" y="12" width="32" height="26" rx="6" fill="#ffebee"/><ellipse cx="24" cy="26" rx="11" ry="8" fill="#c62828"/><ellipse cx="20" cy="24" rx="3" ry="2" fill="#fff" opacity=".3"/></svg>`,
  pescado: () => `<svg viewBox="0 0 48 48"><ellipse cx="22" cy="24" rx="14" ry="8" fill="#42a5f5"/><path d="M34 24l10-8v16z" fill="#1e88e5"/><circle cx="16" cy="22" r="1.5" fill="#0d47a1"/></svg>`,
  charcuteria: () => `<svg viewBox="0 0 48 48"><rect x="10" y="18" width="28" height="16" rx="4" fill="#e57373" transform="rotate(-12 24 26)"/><rect x="14" y="20" width="8" height="12" fill="#fff" opacity=".25" transform="rotate(-12 24 26)"/></svg>`,
  panaderia: () => `<svg viewBox="0 0 48 48"><ellipse cx="24" cy="28" rx="16" ry="10" fill="#ffb74d"/><ellipse cx="24" cy="24" rx="16" ry="8" fill="#ffe0b2"/><path d="M12 24c4 4 20 4 24 0" stroke="#ff9800" stroke-width="1.5" fill="none"/></svg>`,
  desayuno: () => `<svg viewBox="0 0 48 48"><ellipse cx="24" cy="30" rx="14" ry="6" fill="#bcaaa4"/><path d="M12 28c0-10 6-16 12-16s12 6 12 16" fill="#efebe9" stroke="#8d6e63"/><circle cx="24" cy="22" r="4" fill="#ff9800"/></svg>`,
  despensa: () => `<svg viewBox="0 0 48 48"><rect x="14" y="10" width="20" height="28" rx="3" fill="#ffe0b2"/><rect x="14" y="18" width="20" height="6" fill="#ffb74d"/><text x="24" y="32" text-anchor="middle" font-size="7" font-weight="800" fill="#e65100" font-family="system-ui">PASTA</text></svg>`,
  conservas: () => `<svg viewBox="0 0 48 48"><ellipse cx="24" cy="12" rx="10" ry="4" fill="#b0bec5"/><path d="M14 12v22c0 4 4 6 10 6s10-2 10-6V12" fill="#0277bd"/><rect x="16" y="22" width="16" height="8" rx="2" fill="#fff" opacity=".9"/></svg>`,
  salsas: () => `<svg viewBox="0 0 48 48"><rect x="20" y="8" width="8" height="6" rx="2" fill="#b71c1c"/><path d="M18 14h12l4 6v18a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4V20z" fill="#c62828"/></svg>`,
  congelados: () => `<svg viewBox="0 0 48 48"><rect x="10" y="12" width="28" height="26" rx="6" fill="#e3f2fd"/><path d="M24 16v18M18 20l12 10M30 20L18 30" stroke="#29b6f6" stroke-width="2.5" stroke-linecap="round"/></svg>`,
  bebidas: () => `<svg viewBox="0 0 48 48"><rect x="18" y="8" width="12" height="6" rx="2" fill="#0277bd"/><path d="M16 16h16l2 24a6 6 0 0 1-6 6h-8a6 6 0 0 1-6-6z" fill="#4fc3f7"/><path d="M18 28h12" stroke="#fff" stroke-opacity=".5" stroke-width="3"/></svg>`,
  snacks: () => `<svg viewBox="0 0 48 48"><path d="M14 12h20l4 8-2 24H12l-2-24z" fill="#fdd835"/><ellipse cx="24" cy="32" rx="6" ry="4" fill="#ffb300"/></svg>`,
  platos: () => `<svg viewBox="0 0 48 48"><rect x="8" y="14" width="32" height="22" rx="6" fill="#fff3e0" stroke="#ffb74d"/><circle cx="20" cy="25" r="5" fill="#ef5350"/><circle cx="30" cy="25" r="4" fill="#66bb6a"/></svg>`,
  bebe: () => `<svg viewBox="0 0 48 48"><path d="M20 10h8v6l6 4v8c0 6-4 12-10 12s-10-6-10-12v-8l6-4z" fill="#fff59d" stroke="#fbc02d"/></svg>`,
  mascotas: () => `<svg viewBox="0 0 48 48"><circle cx="16" cy="18" r="5" fill="#6d4c41"/><circle cx="32" cy="18" r="5" fill="#6d4c41"/><circle cx="12" cy="28" r="4" fill="#6d4c41"/><circle cx="36" cy="28" r="4" fill="#6d4c41"/><ellipse cx="24" cy="32" rx="8" ry="7" fill="#5d4037"/></svg>`,
  limpieza: () => `<svg viewBox="0 0 48 48"><rect x="20" y="8" width="8" height="6" rx="2" fill="#00838f"/><path d="M16 14h16l3 28a5 5 0 0 1-5 5H18a5 5 0 0 1-5-5z" fill="#00bcd4"/></svg>`,
  higiene: () => `<svg viewBox="0 0 48 48"><rect x="18" y="8" width="12" height="8" rx="2" fill="#5c6bc0"/><path d="M16 16h16v22a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6z" fill="#9fa8da"/></svg>`,
  hogar: () => `<svg viewBox="0 0 48 48"><path d="M8 22 L24 10 L40 22 V38 A4 4 0 0 1 36 42 H12 A4 4 0 0 1 8 38 Z" fill="#81c784"/><rect x="20" y="28" width="8" height="14" fill="#fff" opacity=".85"/></svg>`,
}

let _uid = 0
function uid_() {
  _uid = (_uid + 1) % 100000
  return `${Date.now().toString(36)}${_uid}`
}

function shade(hex, percent) {
  const n = String(hex).replace('#', '')
  const full = n.length === 3 ? n.split('').map((c) => c + c).join('') : n
  const num = parseInt(full, 16)
  if (Number.isNaN(num)) return hex
  let r = (num >> 16) + Math.round((percent / 100) * 255)
  let g = ((num >> 8) & 0xff) + Math.round((percent / 100) * 255)
  let b = (num & 0xff) + Math.round((percent / 100) * 255)
  r = Math.max(0, Math.min(255, r))
  g = Math.max(0, Math.min(255, g))
  b = Math.max(0, Math.min(255, b))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

function esc(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

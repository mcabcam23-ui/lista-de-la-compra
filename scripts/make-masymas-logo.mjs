import { Resvg } from '@resvg/resvg-js'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const out = path.join(__dirname, '../public/stores/masymas.png')

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <rect width="256" height="256" rx="36" fill="#1b7a3d"/>
  <text x="128" y="118" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="42" font-weight="900" fill="#ffffff">masymas</text>
  <text x="128" y="168" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="#c8f0d4">+</text>
</svg>`

const png = new Resvg(svg, { fitTo: { mode: 'width', value: 256 } }).render().asPng()
fs.writeFileSync(out, png)
console.log('wrote', out, png.length)

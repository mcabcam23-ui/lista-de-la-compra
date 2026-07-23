import { parseReceiptText } from '../src/receipt.js'

function assert(cond, msg) {
  if (!cond) throw new Error(msg)
}

function almost(a, b, eps = 0.02) {
  return Math.abs(a - b) <= eps
}

// 1) Ticket limpio Mercadona-like
{
  const t = `MERCADONA
FECHA 23/07/2026 14:35
TICKET 00123456
CAJA 03
LECHE ENTERA 1,25
PAN DE MOLDE 1,10
PLATANOS 0,450 kg x 2,49 1,12
5 ARTICULOS
TOTAL 3,47
TARJETA 3,47`
  const p = parseReceiptText(t)
  assert(p.store === 'mercadona', 'store mercadona')
  assert(almost(p.total, 3.47), `total 3.47 got ${p.total}`)
  assert(p.items.length === 3, `3 items got ${p.items.length}: ${p.items.map((i) => i.name)}`)
  assert(
    !p.items.some((i) => /fecha|ticket|caja|23/i.test(i.name)),
    'no meta as product',
  )
  const milk = p.items.find((i) => /leche/i.test(i.name))
  assert(milk && almost(milk.price, 1.25), 'leche 1.25')
  const plat = p.items.find((i) => /platan/i.test(i.name))
  assert(plat && plat.unit === 'kg' && almost(plat.unitPrice, 2.49), 'platanos €/kg')
  assert(plat && almost(plat.price, 1.12), 'platanos line total')
}

// 2) No tomar fecha/hora/pedido como precio
{
  const t = `LIDL
Fecha: 12/03/2026
Hora: 09:15
Pedido 987654
NIF B12345678
YOGUR NATURAL 0,85
AGUA 6x1,5L 2,10
TOTAL A PAGAR 2,95`
  const p = parseReceiptText(t)
  assert(almost(p.total, 2.95), `total 2.95 got ${p.total}`)
  assert(p.items.length === 2, `2 items got ${p.items.length}`)
  assert(!p.items.some((i) => almost(i.price, 12.03) || almost(i.price, 9.15)), 'no date/time as price')
  assert(!p.items.some((i) => /pedido|nif|fecha|hora/i.test(i.name)), 'no meta names')
}

// 3) Masymas + qty
{
  const t = `MASYMAS
2 LECHE SEMIDES 2,40
MANZANAS 1,99
TOTAL 4,39
3 articulos`
  const p = parseReceiptText(t)
  assert(p.store === 'masymas', 'masymas')
  assert(almost(p.total, 4.39), `total got ${p.total}`)
  const leche = p.items.find((i) => /leche/i.test(i.name))
  assert(leche && leche.qty === 2 && almost(leche.price, 2.4), 'qty line total')
}

// 4) Precios partidos en dos líneas
{
  const t = `ALCAMPO
ARROZ BOMBA
1,45
TOMATE FRITO
0,95
TOTAL
2,40`
  const p = parseReceiptText(t)
  assert(p.items.length === 2, `2 items got ${p.items.length}`)
  assert(almost(p.total, 2.4), `total got ${p.total}`)
}

// 5) No inventar productos de códigos
{
  const t = `CARREFOUR
8437000000000
OP. 445566
EFECTIVO
CAMBIO 0,00
TOTAL 0,00`
  const p = parseReceiptText(t)
  assert(p.items.length === 0, `no junk items got ${p.items.map((i) => i.name)}`)
}

console.log('All receipt parser tests passed')

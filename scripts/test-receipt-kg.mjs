import {
  parseReceiptText,
  applyTicketPrices,
  listPricedProductsByStore,
  formatPriceLabel,
} from '../src/receipt.js'

const sample = `MASYMAS ASTURIAS
PLATANOS CANARIOS 0,450 kg x 2,49 1,12
LECHE ENTERA 1,25
TOTAL 2,37`

const parsed = parseReceiptText(sample)
console.log('store', parsed.store)
console.log('items', parsed.items)

const ticket = {
  id: 't1',
  store: parsed.store,
  boughtAt: Date.now(),
  items: parsed.items.map((i) => ({ ...i, productId: null })),
}
const prices = applyTicketPrices({}, ticket)
console.log(
  'groups',
  listPricedProductsByStore(prices).map((g) => ({
    store: g.store.id,
    labels: g.entries.map((e) => `${e.name} ${formatPriceLabel(e)}`),
  })),
)

# Lista de la compra

App familiar de lista de la compra pensada para pegatina NFC en la nevera: alguien toca el tag, abre la URL compartida y apunta lo que falta.

## Características

- Lista compartida por URL (`?lista=familia`)
- Catálogo por pasillos y subcategorías
- Producto rápido con elección de supermercado
- Filtro por súper (Mercadona, LIDL, Alimerka, Alcampo, Carrefour, Familia, TODOS)
- Deslizar para confirmar compra
- Historial de compras por días
- PWA instalable + sincronización familiar (API local o Firebase)

## Uso rápido

```bash
npm install
npm run start
```

Abre en el móvil (misma WiFi) la IP del PC, por ejemplo:

`http://192.168.1.20:4173/?lista=familia`

Graba ese enlace en la pegatina NFC.

## Desarrollo

```bash
npm run dev
```

Vite en `5173` (proxy `/api` → Express en `4173`).

## Scripts

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor API + Vite |
| `npm run build` | Build de producción |
| `npm run start` | Build + servir `dist` + API |
| `npm run server` | Solo API / estáticos |

## Sincronización

Por defecto usa `/api/lists/:id` del mismo servidor (`data/lists.json`).

También puedes pegar en Ajustes una URL de Firebase Realtime Database.

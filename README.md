# Lista de la compra

App familiar de lista de la compra pensada para pegatina NFC en la nevera: alguien toca el tag, abre la URL compartida y apunta lo que falta.

## Abrir la app

**Página web:** https://mcabcam23-ui.github.io/lista-de-la-compra/?lista=familia

Ese es el enlace para el móvil / pegatina NFC (no el de GitHub).

## Características

- Lista compartida por URL (`?lista=familia`)
- Catálogo por pasillos y subcategorías
- Producto rápido con elección de supermercado
- Filtro por súper (Mercadona, LIDL, Alimerka, Alcampo, Carrefour, Familia, TODOS)
- Deslizar para confirmar compra
- Historial de compras por días
- PWA instalable

## Uso en local (sincronización familiar)

```bash
npm install
npm run start
```

Abre en el móvil (misma WiFi) la IP del PC, por ejemplo:

`http://192.168.1.20:4173/?lista=familia`

En GitHub Pages la lista se guarda en cada móvil. Para sincronizar entre móviles en casa, usa `npm run start` en el PC o configura Firebase en Ajustes.

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

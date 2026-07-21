# Lista de la compra

App familiar de lista de la compra para pegatina NFC en la nevera.

## Abrir ya (sin instalar)

https://mcabcam23-ui.github.io/lista-de-la-compra/?lista=familia  

(En Pages cada móvil guarda su lista. Para familia en tiempo real, usa el modo nevera de abajo.)

## Pegatina NFC (lo más fácil)

La pegatina **no guarda la lista** (casi no tiene memoria). Guarda un **enlace**. Al escanear: abre la app y **actualiza sola**.

1. En el PC (misma WiFi):
```bash
npm install
npm run start
```
2. En el móvil abre `http://IP_DEL_PC:4173/?lista=familia`  
   (Windows: `ipconfig` → IPv4, ej. `192.168.1.129`)
3. En la app → Ayuda → **Copiar enlace NFC**
4. Grábalo con **NFC Tools** → Escribir → URL
5. Pega la pegatina en la nevera

Cada scan = lista al día en todos los móviles de casa (el PC debe estar encendido con `npm run start`).

## Características

- Lista compartida (`?lista=familia`)
- Catálogo por pasillos, tickets OCR, precios por súper
- Deslizar para comprar + historial
- PWA instalable

## Scripts

| Comando | Descripción |
| --- | --- |
| `npm run start` | Build + app + sync (puerto 4173) |
| `npm run dev` | Desarrollo (Vite + API) |
| `npm run build` | Solo generar `dist/` |

## Sync en la nube (sin PC)

En Ajustes puedes pegar una URL de Firebase Realtime Database. El enlace NFC incluirá esa sync: al escanear, cada móvil se configura solo.

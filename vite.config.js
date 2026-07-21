import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  server: {
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:4173',
        changeOrigin: true,
      },
    },
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Lista de la compra',
        short_name: 'Compra',
        description: 'Lista de la compra familiar por NFC en la nevera',
        theme_color: '#1a7a4c',
        background_color: '#f3f7f4',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        lang: 'es',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        navigateFallbackDenylist: [/^\/api/],
      },
    }),
  ],
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 2000
  },
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
    proxy: {
      '/api-bnovus-qa': {
        target: 'https://webapibncore.azurewebsites.net',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api-bnovus-qa/, '')
      },
      '/api-bnovus-prod': {
        target: 'https://webapibnovuscoreqa.azurewebsites.net',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api-bnovus-prod/, '')
      }
    }
  }
})
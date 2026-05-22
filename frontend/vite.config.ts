import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/health': { target: 'http://localhost:8000', changeOrigin: true },
      '/startup-progress': { target: 'http://localhost:8000', changeOrigin: true },
      '/dashboard': { target: 'http://localhost:8000', changeOrigin: true },
      '/stations': { target: 'http://localhost:8000', changeOrigin: true },
      '/cities': { target: 'http://localhost:8000', changeOrigin: true },
      '/radar': { target: 'http://localhost:8000', changeOrigin: true },
      '/risk': { target: 'http://localhost:8000', changeOrigin: true },
      '/clusters': { target: 'http://localhost:8000', changeOrigin: true },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
  },
})

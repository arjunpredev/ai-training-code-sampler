import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: [
      'code-sampler-b27b.pre.dev',
      'localhost',
      '127.0.0.1',
      process.env.PREDEV_DEPLOYMENT_URL || 'code-sampler-b27b.pre.dev'
    ]
  },
  build: {
    minify: 'terser',
    sourcemap: false,
    target: 'ES2020'
  }
})

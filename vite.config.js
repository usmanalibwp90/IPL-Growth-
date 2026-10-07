import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

import { cloudflare } from "@cloudflare/vite-plugin";

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    ...(command === 'build' ? [cloudflare()] : [])
  ],
  server: {
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
}))
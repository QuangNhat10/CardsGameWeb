import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  // Use root for local dev, GitHub Pages subpath in production
  base: mode === 'production' ? '/CardsGameWeb/' : '/',
  plugins: [react()],
}))

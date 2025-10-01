import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  // Use root base for Netlify/most hosts to prevent broken asset paths
  // If you deploy to GitHub Pages under a subpath, override BASE at build time
  //   e.g. `vite build --base=/CardsGameWeb/`
  base: '/',
  plugins: [react()],
}))

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  // Use root base for Vercel/most hosts
  base: '/',
  plugins: [react()],
}))

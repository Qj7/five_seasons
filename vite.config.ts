import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Dev: http://localhost:5173/ — production: /five_seasons/
  base: command === 'build' ? '/five_seasons/' : '/',
}))

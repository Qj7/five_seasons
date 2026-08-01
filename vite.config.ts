import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Dev: http://localhost:5173/ — production: /magic_shoes/
  base: command === 'build' ? '/magic_shoes/' : '/',
}))

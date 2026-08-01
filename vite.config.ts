import { copyFileSync, existsSync } from 'node:fs'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/** Keep a Vite entry template so Pages can host a built index.html on main. */
function useIndexTemplate(): Plugin {
  const restore = () => {
    if (existsSync('index.template.html')) {
      copyFileSync('index.template.html', 'index.html')
    }
  }
  return {
    name: 'use-index-template',
    buildStart: restore,
    configureServer: restore,
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [useIndexTemplate(), react()],
  // GitHub Pages project site: https://qj7.github.io/magic_shoes/
  base: '/magic_shoes/',
})

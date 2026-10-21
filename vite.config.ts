import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

const SHARED_FILE = path.resolve(__dirname, 'public/shared-published.json')

/** Dev-only: persist manager publishes so every browser on this machine sees the same catalog. */
function sharedCatalogApi(): Plugin {
  return {
    name: 'shared-catalog-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.split('?')[0] !== '/api/shared-catalog') {
          next()
          return
        }

        if (req.method === 'GET') {
          try {
            const body = fs.existsSync(SHARED_FILE)
              ? fs.readFileSync(SHARED_FILE, 'utf8')
              : '[]'
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(body)
          } catch (err) {
            res.statusCode = 500
            res.end(JSON.stringify({ error: String(err) }))
          }
          return
        }

        if (req.method === 'PUT' || req.method === 'POST') {
          const chunks: Buffer[] = []
          req.on('data', (c) => chunks.push(c))
          req.on('end', () => {
            try {
              const raw = Buffer.concat(chunks).toString('utf8')
              const parsed = JSON.parse(raw) as unknown
              if (!Array.isArray(parsed)) {
                res.statusCode = 400
                res.end(JSON.stringify({ error: 'expected array' }))
                return
              }
              fs.writeFileSync(
                SHARED_FILE,
                `${JSON.stringify(parsed, null, 2)}\n`,
                'utf8',
              )
              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ ok: true, count: parsed.length }))
            } catch (err) {
              res.statusCode = 500
              res.end(JSON.stringify({ error: String(err) }))
            }
          })
          return
        }

        res.statusCode = 405
        res.end('Method Not Allowed')
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react(), sharedCatalogApi()],
  // Dev: http://localhost:5173/ — production: /five_seasons/
  base: command === 'build' ? '/five_seasons/' : '/',
}))

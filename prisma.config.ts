import path from 'node:path'
import { defineConfig } from 'prisma/config'

function databaseUrl() {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL ||
    ''
  )
}

// Prisma 7 reads the connection from this file, not from schema.prisma.
// Empty URL is fine for `prisma generate` / `next build`. Migrate needs a real one.
const direct =
  process.env.DIRECT_URL || process.env.POSTGRES_URL_NON_POOLING || undefined

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  datasource: {
    url: databaseUrl(),
    ...(direct ? { shadowDatabaseUrl: direct } : {}),
  },
  migrations: {
    path: path.join('prisma', 'migrations'),
  },
})

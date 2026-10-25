import { PrismaClient } from '@prisma/client'
import { PrismaNeonHttp } from '@prisma/adapter-neon'

/**
 * Vercel Postgres and the Neon integration expose the URL under different names.
 * Any one of them is enough for the app to talk to the database.
 */
export function databaseUrl(): string | null {
  const url =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL ||
    ''
  return url.trim() ? url : null
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient | null
}

function createClient(): PrismaClient | null {
  const url = databaseUrl()
  if (!url) return null
  // HTTP driver: no WebSocket, which is what Vercel serverless can actually open.
  const adapter = new PrismaNeonHttp(url, {})
  return new PrismaClient({ adapter })
}

/** Lazy so `next build` never opens a connection while collecting pages. */
export function getPrisma(): PrismaClient | null {
  if (globalForPrisma.prisma !== undefined) return globalForPrisma.prisma
  try {
    globalForPrisma.prisma = createClient()
  } catch {
    globalForPrisma.prisma = null
  }
  return globalForPrisma.prisma
}

export function hasDatabase(): boolean {
  return databaseUrl() !== null
}

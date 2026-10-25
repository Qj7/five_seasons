import { cookies } from 'next/headers'
import { randomBytes } from 'node:crypto'
import { getPrisma } from './prisma'

const COOKIE = 'fs_session'
const MAX_AGE = 60 * 60 * 24 * 30 // 30 days

export interface SessionUser {
  id: string
  email: string
  name: string
  role: string
}

export async function createSession(userId: string): Promise<void> {
  const prisma = getPrisma()
  if (!prisma) return
  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + MAX_AGE * 1000)
  await prisma.session.create({ data: { token, userId, expiresAt } })
  const store = await cookies()
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  })
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const prisma = getPrisma()
  if (!prisma) return null
  const store = await cookies()
  const token = store.get(COOKIE)?.value
  if (!token) return null
  try {
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    })
    if (!session || session.expiresAt < new Date()) return null
    const { id, email, name, role } = session.user
    return { id, email, name, role }
  } catch {
    return null
  }
}

export async function destroySession(): Promise<void> {
  const prisma = getPrisma()
  const store = await cookies()
  const token = store.get(COOKIE)?.value
  if (token && prisma) {
    await prisma.session.deleteMany({ where: { token } }).catch(() => {})
  }
  store.delete(COOKIE)
}

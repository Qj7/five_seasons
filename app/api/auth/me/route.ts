import { NextResponse } from 'next/server'
import { hasDatabase } from '@/lib/prisma'
import { getSessionUser } from '@/lib/session'

export async function GET() {
  // Signal to the client whether server auth is available so it can fall back.
  const user = await getSessionUser()
  return NextResponse.json({ user, serverAuth: hasDatabase() })
}

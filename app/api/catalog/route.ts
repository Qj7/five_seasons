import { NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/session'
import { getPublished, replacePublished } from '@/lib/catalog-store'
import type { Product } from '@/src/data/products'

export async function GET() {
  const list = await getPublished()
  return NextResponse.json(list, {
    headers: { 'Cache-Control': 'no-store' },
  })
}

export async function PUT(req: Request) {
  // Enforce manager/admin only when a real DB-backed session exists.
  const prisma = getPrisma()
  if (prisma) {
    const user = await getSessionUser()
    if (!user || (user.role !== 'manager' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 })
    }
  }
  const list = (await req.json().catch(() => null)) as Product[] | null
  if (!Array.isArray(list)) {
    return NextResponse.json({ error: 'expected array' }, { status: 400 })
  }
  await replacePublished(list)
  return NextResponse.json({ ok: true, count: list.length })
}

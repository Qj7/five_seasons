import { NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/session'
import { normalizeFavoriteIds } from '@/lib/cart'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  const prisma = getPrisma()
  const user = prisma ? await getSessionUser() : null
  if (!prisma || !user) {
    return NextResponse.json({ server: false, ids: [] as string[] })
  }
  const rows = await prisma.favorite.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json({ server: true, ids: rows.map((row) => row.productId) })
}

export async function PUT(req: Request) {
  const prisma = getPrisma()
  const user = prisma ? await getSessionUser() : null
  if (!prisma || !user) {
    return NextResponse.json({ server: false }, { status: prisma ? 401 : 503 })
  }
  const body = (await req.json().catch(() => null)) as { ids?: unknown } | null
  const ids = normalizeFavoriteIds(body?.ids)
  await prisma.$transaction([
    prisma.favorite.deleteMany({ where: { userId: user.id } }),
    ...(ids.length
      ? [
          prisma.favorite.createMany({
            data: ids.map((productId) => ({ userId: user.id, productId })),
          }),
        ]
      : []),
  ])
  return NextResponse.json({ server: true, ids })
}

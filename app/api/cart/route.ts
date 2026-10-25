import { NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/session'
import { normalizeCart, type CartLine } from '@/lib/cart'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  const prisma = getPrisma()
  const user = prisma ? await getSessionUser() : null
  if (!prisma || !user) {
    return NextResponse.json({ server: false, items: [] as CartLine[] })
  }
  const rows = await prisma.cartItem.findMany({
    where: { userId: user.id },
    orderBy: { id: 'asc' },
  })
  const items: CartLine[] = rows.map((row) => ({
    productId: row.productId,
    qty: row.qty,
    size: row.size,
    delivery: row.delivery === 'express' ? 'express' : 'standard',
  }))
  return NextResponse.json({ server: true, items })
}

export async function PUT(req: Request) {
  const prisma = getPrisma()
  const user = prisma ? await getSessionUser() : null
  if (!prisma || !user) {
    return NextResponse.json({ server: false }, { status: prisma ? 401 : 503 })
  }
  const body = (await req.json().catch(() => null)) as { items?: unknown } | null
  const items = normalizeCart(body?.items)
  await prisma.$transaction([
    prisma.cartItem.deleteMany({ where: { userId: user.id } }),
    ...(items.length
      ? [
          prisma.cartItem.createMany({
            data: items.map((line) => ({
              userId: user.id,
              productId: line.productId,
              qty: line.qty,
              size: line.size,
              delivery: line.delivery,
            })),
          }),
        ]
      : []),
  ])
  return NextResponse.json({ server: true, items })
}

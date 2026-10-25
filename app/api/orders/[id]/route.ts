import { NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/session'

const STATUSES = ['new', 'processing', 'shipped', 'done', 'cancelled']

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const prisma = getPrisma()
  if (!prisma) {
    return NextResponse.json({ error: 'db_unavailable' }, { status: 503 })
  }
  const user = await getSessionUser()
  if (!user || (user.role !== 'manager' && user.role !== 'admin')) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  const { id } = await params
  const body = (await req.json().catch(() => null)) as { status?: string } | null
  const status = body?.status ?? ''
  if (!STATUSES.includes(status)) {
    return NextResponse.json({ error: 'invalid status' }, { status: 400 })
  }

  const order = await prisma.order.update({ where: { id }, data: { status } })

  // Notify the customer about the status change.
  await prisma.notification
    .create({
      data: {
        userId: order.customerId,
        type: 'order_status',
        title: 'Статус заказа обновлён',
        body: `Заказ ${order.id}: ${status}`,
      },
    })
    .catch(() => {})

  return NextResponse.json({ ok: true, status })
}

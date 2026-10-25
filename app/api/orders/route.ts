import { NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/session'

type IncomingItem = {
  productId: string
  name: string
  price: number
  qty: number
  image: string
  size?: string
  delivery?: string
  publishedBy?: string
}

export async function GET(req: Request) {
  const prisma = getPrisma()
  if (!prisma) {
    // No DB → client uses its localStorage orders.
    return NextResponse.json({ orders: [], serverOrders: false })
  }
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ orders: [], serverOrders: true })

  const scope = new URL(req.url).searchParams.get('scope')
  const where =
    scope === 'manager' && (user.role === 'manager' || user.role === 'admin')
      ? { items: { some: { publishedBy: user.id } } }
      : { customerId: user.id }

  const orders = await prisma.order.findMany({
    where,
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ orders, serverOrders: true })
}

export async function POST(req: Request) {
  const prisma = getPrisma()
  if (!prisma) {
    return NextResponse.json({ error: 'db_unavailable' }, { status: 503 })
  }
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = (await req.json().catch(() => null)) as {
    items?: IncomingItem[]
    discount?: number
    deliveryMethod?: string
    deliveryAddress?: string
  } | null
  const items = body?.items ?? []
  if (!items.length)
    return NextResponse.json({ error: 'empty order' }, { status: 400 })

  const discount = Math.max(0, body?.discount ?? 0)
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)
  const total = Math.max(0, subtotal - discount)

  const order = await prisma.order.create({
    data: {
      customerId: user.id,
      customerName: user.name,
      customerEmail: user.email,
      total,
      discount,
      status: 'new',
      deliveryMethod: body?.deliveryMethod ?? null,
      deliveryAddress: body?.deliveryAddress ?? null,
      items: {
        create: items.map((i) => ({
          productId: i.productId,
          name: i.name,
          price: i.price,
          qty: i.qty,
          image: i.image,
          size: i.size ?? null,
          delivery: i.delivery === 'express' ? 'express' : i.delivery === 'standard' ? 'standard' : null,
          publishedBy: i.publishedBy ?? null,
        })),
      },
    },
    include: { items: true },
  })

  // Order-received notification (skeleton for the notifications feature).
  await prisma.notification
    .create({
      data: {
        userId: user.id,
        type: 'order_status',
        title: 'Заказ оформлен',
        body: `Заказ ${order.id} принят. Мы свяжемся с вами для подтверждения.`,
      },
    })
    .catch(() => {})

  return NextResponse.json({ order })
}

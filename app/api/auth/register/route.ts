import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getPrisma } from '@/lib/prisma'
import { createSession } from '@/lib/session'

export async function POST(req: Request) {
  const prisma = getPrisma()
  if (!prisma) {
    return NextResponse.json({ error: 'db_unavailable' }, { status: 503 })
  }
  const body = (await req.json().catch(() => null)) as {
    name?: string
    email?: string
    password?: string
  } | null
  const name = body?.name?.trim() ?? ''
  const email = body?.email?.trim().toLowerCase() ?? ''
  const password = body?.password ?? ''

  if (!name) return NextResponse.json({ error: 'Укажите имя' }, { status: 400 })
  if (!email.includes('@'))
    return NextResponse.json({ error: 'Некорректный email' }, { status: 400 })
  if (password.length < 6)
    return NextResponse.json(
      { error: 'Пароль должен быть не короче 6 символов' },
      { status: 400 },
    )

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing)
    return NextResponse.json(
      { error: 'Аккаунт с таким email уже есть' },
      { status: 409 },
    )

  const hash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { name, email, password: hash, role: 'customer' },
  })
  await createSession(user.id)
  return NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  })
}

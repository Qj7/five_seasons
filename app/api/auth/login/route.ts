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
    email?: string
    password?: string
  } | null
  const email = body?.email?.trim().toLowerCase() ?? ''
  const password = body?.password ?? ''

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return NextResponse.json(
      { error: 'Неверный email или пароль' },
      { status: 401 },
    )
  }
  await createSession(user.id)
  return NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  })
}

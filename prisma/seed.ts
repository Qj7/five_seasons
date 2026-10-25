import { PrismaClient } from '@prisma/client'
import { PrismaNeonHttp } from '@prisma/adapter-neon'
import bcrypt from 'bcryptjs'
import { baseProducts, type Product } from '../src/data/products'

const url = process.env.DATABASE_URL
if (!url) {
  console.error('DATABASE_URL is required to seed. Set it and run `npm run db:seed`.')
  process.exit(1)
}

const prisma = new PrismaClient({ adapter: new PrismaNeonHttp(url, {}) })

// Seed managers. Change these passwords after the first deploy.
const managers = [
  { email: 'nikita@fiveseasons.vn', name: 'Никита', password: 'NikitaMgr2024' },
  { email: 'anna@fiveseasons.vn', name: 'Анна', password: 'AnnaMgr2024' },
]

function toRow(p: Product) {
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    category: p.category,
    gender: p.gender ?? null,
    color: p.color,
    accent: p.accent,
    colorName: p.colorName,
    modelGroup: p.modelGroup,
    brand: p.brand ?? null,
    image: p.image,
    gallery: p.gallery ?? [],
    tag: p.tag ?? null,
    features: p.features ?? null,
    delivery: p.delivery,
    sizes: p.sizes ?? [],
    expressDays: p.expressDays ?? null,
    expressSurcharge: p.expressSurcharge ?? null,
    standardDays: p.standardDays ?? null,
    returnable: p.returnable ?? true,
    popularRank: p.popularRank ?? null,
    fromPrice: p.fromPrice ?? false,
    soldOut: p.soldOut ?? false,
    publishedBy: null,
    source: 'base',
  }
}

async function main() {
  for (const m of managers) {
    const password = await bcrypt.hash(m.password, 10)
    await prisma.user.upsert({
      where: { email: m.email },
      update: { name: m.name, role: 'manager', password },
      create: { email: m.email, name: m.name, role: 'manager', password },
    })
  }

  for (const p of baseProducts) {
    const row = toRow(p)
    await prisma.product.upsert({ where: { id: p.id }, update: row, create: row })
  }

  console.log(`Seeded ${managers.length} managers and ${baseProducts.length} products.`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => void prisma.$disconnect())

import fs from 'node:fs'
import path from 'node:path'
import { getPrisma } from './prisma'
import type { Product } from '../src/data/products'

const FILE = path.join(process.cwd(), 'public', 'shared-published.json')

type ProductRow = {
  id: string
  name: string
  price: number
  category: string
  gender: string | null
  color: string
  accent: string
  colorName: string
  modelGroup: string
  brand: string | null
  image: string
  gallery: string[]
  tag: string | null
  features: string | null
  delivery: string
  sizes: string[]
  expressDays: string | null
  expressSurcharge: number | null
  standardDays: string | null
  returnable: boolean
  popularRank: number | null
  fromPrice: boolean
  soldOut: boolean
  publishedBy: string | null
}

function rowToProduct(r: ProductRow): Product {
  return {
    id: r.id,
    name: r.name,
    price: r.price,
    category: r.category as Product['category'],
    gender: (r.gender as Product['gender']) ?? undefined,
    color: r.color,
    accent: r.accent,
    colorName: r.colorName,
    modelGroup: r.modelGroup,
    brand: r.brand ?? undefined,
    image: r.image,
    gallery: r.gallery.length ? r.gallery : undefined,
    tag: r.tag ?? undefined,
    features: r.features ?? undefined,
    delivery: r.delivery,
    sizes: r.sizes.length ? r.sizes : undefined,
    expressDays: r.expressDays ?? undefined,
    expressSurcharge: r.expressSurcharge ?? undefined,
    standardDays: r.standardDays ?? undefined,
    returnable: r.returnable,
    popularRank: r.popularRank ?? undefined,
    fromPrice: r.fromPrice || undefined,
    soldOut: r.soldOut || undefined,
    publishedBy: r.publishedBy ?? undefined,
  }
}

function productToRow(p: Product) {
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
    publishedBy: p.publishedBy ?? null,
    source: 'manager',
  }
}

/** Manager-published storefront catalog. */
export async function getPublished(): Promise<Product[]> {
  const prisma = getPrisma()
  if (prisma) {
    try {
      const rows = await prisma.product.findMany({
        where: { source: 'manager' },
        orderBy: { createdAt: 'desc' },
      })
      return (rows as ProductRow[]).map(rowToProduct)
    } catch {
      /* fall through to filesystem */
    }
  }
  try {
    if (fs.existsSync(FILE)) {
      const parsed = JSON.parse(fs.readFileSync(FILE, 'utf8')) as unknown
      return Array.isArray(parsed) ? (parsed as Product[]) : []
    }
  } catch {
    /* ignore */
  }
  return []
}

/** Replace the whole manager-published set (publish/update/remove all go through here). */
export async function replacePublished(list: Product[]): Promise<void> {
  const prisma = getPrisma()
  if (prisma) {
    await prisma.$transaction([
      prisma.product.deleteMany({ where: { source: 'manager' } }),
      prisma.product.createMany({ data: list.map(productToRow) }),
    ])
    return
  }
  try {
    fs.writeFileSync(FILE, `${JSON.stringify(list, null, 2)}\n`, 'utf8')
  } catch {
    /* read-only FS (e.g. serverless) without a DB — nothing to persist */
  }
}

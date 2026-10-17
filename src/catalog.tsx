import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  baseProducts,
  type Category,
  type Gender,
  type Product,
} from './data/products'

const STORAGE_KEY = 'five-seasons:published-products'

export type PublishInput = {
  name: string
  price: number
  category: Category
  gender: Gender
  brand?: string
  colorName?: string
  colorHex?: string
  /** Cover / card image */
  image: string
  /** PDP gallery (cover is usually first). */
  gallery: string[]
  /** EU size labels enabled for this SKU. */
  sizes: string[]
  expressDays: string
  expressSurcharge: number
  standardDays: string
  tag?: string
  returnable?: boolean
}

interface CatalogCtx {
  products: Product[]
  published: Product[]
  publishProduct: (input: PublishInput, managerId: string) => Product
  removePublished: (id: string) => void
}

function loadPublished(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Product[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function savePublished(list: Product[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)
}

const Ctx = createContext<CatalogCtx | null>(null)

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [published, setPublished] = useState<Product[]>(() => loadPublished())

  const products = useMemo(() => {
    const byId = new Map(baseProducts.map((p) => [p.id, p]))
    for (const p of published) byId.set(p.id, p)
    return [...byId.values()]
  }, [published])

  const publishProduct = useCallback((input: PublishInput, managerId: string) => {
    const stem = slugify(input.name) || 'product'
    const stamp = Date.now().toString(36)
    const swatch = input.colorHex?.trim() || '#e8e8e8'
    const gallery = input.gallery.filter(Boolean)
    const image = input.image || gallery[0]
    const standardLabel = input.standardDays.trim() || '25-35'
    const created: Product = {
      id: `mgr-${stem}-${stamp}`,
      name: input.name.trim(),
      price: input.price,
      category: input.category,
      gender: input.gender,
      brand: input.brand?.trim() || undefined,
      color: swatch,
      accent: swatch,
      colorName: input.colorName?.trim() || 'Default',
      modelGroup: `mgr-${stem}`,
      image,
      gallery: gallery.length ? gallery : [image],
      tag: input.tag?.trim() || undefined,
      sizes: input.sizes.length ? input.sizes : undefined,
      expressDays: input.expressDays.trim() || '3-7',
      expressSurcharge: Math.max(0, input.expressSurcharge),
      standardDays: standardLabel,
      delivery: standardLabel.includes('–') || standardLabel.includes('-')
        ? `${standardLabel.replace(/[-−–—]/g, '–')} дней`
        : `${standardLabel} дней`,
      returnable: input.returnable ?? true,
      publishedBy: managerId,
    }
    setPublished((prev) => {
      const next = [created, ...prev]
      savePublished(next)
      return next
    })
    return created
  }, [])

  const removePublished = useCallback((id: string) => {
    setPublished((prev) => {
      const next = prev.filter((p) => p.id !== id)
      savePublished(next)
      return next
    })
  }, [])

  const value = useMemo(
    () => ({ products, published, publishProduct, removePublished }),
    [products, published, publishProduct, removePublished],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useCatalog() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useCatalog outside CatalogProvider')
  return ctx
}

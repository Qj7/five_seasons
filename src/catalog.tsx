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
  /** Reuse when adding another colorway of an existing model. */
  modelGroup?: string
  /** Cover / card image */
  image: string
  /** PDP gallery (separate from cover). */
  gallery: string[]
  /** Size labels enabled for this SKU. */
  sizes: string[]
  expressDays: string
  expressSurcharge: number
  standardDays: string
  features?: string
  tag?: string
  returnable?: boolean
}

interface CatalogCtx {
  products: Product[]
  published: Product[]
  publishProduct: (input: PublishInput, managerId: string) => Product
  updatePublished: (id: string, input: PublishInput) => Product | null
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

function deliveryLabel(standardDays: string) {
  const standardLabel = standardDays.trim() || '25-35'
  return standardLabel.includes('–') || standardLabel.includes('-')
    ? `${standardLabel.replace(/[-−–—]/g, '–')} дней`
    : `${standardLabel} дней`
}

function buildFields(input: PublishInput) {
  const swatch = input.colorHex?.trim() || '#e8e8e8'
  const gallery = input.gallery.filter(Boolean)
  const image = input.image || gallery[0]
  const standardLabel = input.standardDays.trim() || '25-35'
  return {
    name: input.name.trim(),
    price: input.price,
    category: input.category,
    gender: input.gender,
    brand: input.brand?.trim() || undefined,
    color: swatch,
    accent: swatch,
    colorName: input.colorName?.trim() || 'Default',
    image,
    gallery: gallery.length ? gallery : [image],
    tag: input.tag?.trim() || undefined,
    features: input.features?.trim() || undefined,
    sizes: input.sizes.length ? input.sizes : undefined,
    expressDays: input.expressDays.trim() || '3-7',
    expressSurcharge: Math.max(0, input.expressSurcharge),
    standardDays: standardLabel,
    delivery: deliveryLabel(standardLabel),
    returnable: input.returnable ?? true,
  }
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
    const fields = buildFields(input)
    const created: Product = {
      id: `mgr-${stem}-${stamp}`,
      ...fields,
      modelGroup: input.modelGroup?.trim() || `mgr-${stem}`,
      publishedBy: managerId,
    }
    setPublished((prev) => {
      const next = [created, ...prev]
      savePublished(next)
      return next
    })
    return created
  }, [])

  const updatePublished = useCallback((id: string, input: PublishInput) => {
    const current = published.find((p) => p.id === id)
    if (!current) return null
    const fields = buildFields(input)
    const updated: Product = {
      ...current,
      ...fields,
      modelGroup: input.modelGroup?.trim() || current.modelGroup,
    }
    setPublished((prev) => {
      const idx = prev.findIndex((p) => p.id === id)
      if (idx < 0) return prev
      const next = [...prev]
      next[idx] = updated
      savePublished(next)
      return next
    })
    return updated
  }, [published])

  const removePublished = useCallback((id: string) => {
    setPublished((prev) => {
      const next = prev.filter((p) => p.id !== id)
      savePublished(next)
      return next
    })
  }, [])

  const value = useMemo(
    () => ({
      products,
      published,
      publishProduct,
      updatePublished,
      removePublished,
    }),
    [products, published, publishProduct, updatePublished, removePublished],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useCatalog() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useCatalog outside CatalogProvider')
  return ctx
}

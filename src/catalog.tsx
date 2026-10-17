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
  type Product,
} from './data/products'

const STORAGE_KEY = 'five-seasons:published-products'

export type ColorDraft = {
  colorName: string
  images: string[]
}

export type PublishInput = {
  name: string
  price: number
  category: Category
  gender?: Product['gender']
  delivery?: string
  tag?: string
  /** One product card per color; they share a model group on the PDP. */
  colors: ColorDraft[]
}

interface CatalogCtx {
  products: Product[]
  published: Product[]
  publishProduct: (input: PublishInput, managerId: string) => Product[]
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
    const modelGroup = `mgr-${stem}`
    const stamp = Date.now().toString(36)
    const created: Product[] = input.colors.map((color, index) => {
      const colorName = color.colorName.trim()
      const images = color.images.filter(Boolean)
      return {
        id: `mgr-${stem}-${stamp}-${index}`,
        name: input.name.trim(),
        price: input.price,
        category: input.category,
        gender: input.gender ?? 'unisex',
        color: '#e8e8e8',
        accent: '#e8e8e8',
        colorName,
        modelGroup,
        image: images[0],
        gallery: images,
        tag: input.tag?.trim() || undefined,
        delivery: input.delivery?.trim() || '3 дня',
        returnable: true,
        publishedBy: managerId,
      }
    })
    setPublished((prev) => {
      const next = [...created, ...prev]
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

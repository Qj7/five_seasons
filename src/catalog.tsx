import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  baseProducts,
  type Category,
  type Gender,
  type Product,
} from './data/products'
import {
  clearLocalPublished,
  fetchSharedPublished,
  flushLocalStorageToStore,
  loadLocalPublished,
  saveLocalPublished,
  syncSharedPublished,
} from './sharedCatalog'

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
  /** Storefront manager SKUs (shared catalog + unflushed local staging). */
  published: Product[]
  catalogReady: boolean
  /** True while draining localStorage into the shared shop catalog. */
  syncing: boolean
  publishProduct: (input: PublishInput, managerId: string) => Product
  updatePublished: (id: string, input: PublishInput) => Product | null
  removePublished: (id: string) => void
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

function mergeById(store: Product[], pending: Product[]) {
  const byId = new Map(store.map((p) => [p.id, p]))
  for (const p of pending) {
    if (!byId.has(p.id)) byId.set(p.id, p)
  }
  return [...byId.values()]
}

const Ctx = createContext<CatalogCtx | null>(null)

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<Product[]>([])
  const [pending, setPending] = useState<Product[]>(() => loadLocalPublished())
  const [catalogReady, setCatalogReady] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const storeRef = useRef(store)
  storeRef.current = store

  const runFlush = useCallback(async (shared: Product[]) => {
    setSyncing(true)
    try {
      const result = await flushLocalStorageToStore(shared)
      setStore(result.store)
      setPending(result.pending)
      return result
    } finally {
      setSyncing(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const shared = await fetchSharedPublished()
      if (cancelled) return
      await runFlush(shared)
      if (cancelled) return
      setCatalogReady(true)
    })()
    return () => {
      cancelled = true
    }
  }, [runFlush])

  // Other tabs may stage publishes into localStorage — pick up and flush.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== 'five-seasons:published-products') return
      const nextPending = loadLocalPublished()
      setPending(nextPending)
      if (nextPending.length) void runFlush(storeRef.current)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [runFlush])

  const published = useMemo(
    () => mergeById(store, pending),
    [store, pending],
  )

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

    // Stage in manager localStorage, then drain into the shop by SKU.
    const staged = [created, ...loadLocalPublished().filter((p) => p.id !== created.id)]
    saveLocalPublished(staged)
    setPending(staged)
    void runFlush(storeRef.current)

    return created
  }, [runFlush])

  const updatePublished = useCallback((id: string, input: PublishInput) => {
    const current =
      storeRef.current.find((p) => p.id === id) ??
      loadLocalPublished().find((p) => p.id === id)
    if (!current) return null
    const fields = buildFields(input)
    const updated: Product = {
      ...current,
      ...fields,
      modelGroup: input.modelGroup?.trim() || current.modelGroup,
    }

    // Prefer updating the shared store copy; fall back to pending staging.
    const inStore = storeRef.current.some((p) => p.id === id)
    if (inStore) {
      const nextStore = storeRef.current.map((p) => (p.id === id ? updated : p))
      setStore(nextStore)
      void syncSharedPublished(nextStore)
      return updated
    }

    const nextPending = loadLocalPublished().map((p) => (p.id === id ? updated : p))
    saveLocalPublished(nextPending)
    setPending(nextPending)
    void runFlush(storeRef.current)
    return updated
  }, [runFlush])

  const removePublished = useCallback((id: string) => {
    const nextStore = storeRef.current.filter((p) => p.id !== id)
    const nextPending = loadLocalPublished().filter((p) => p.id !== id)
    setStore(nextStore)
    setPending(nextPending)
    if (nextPending.length) saveLocalPublished(nextPending)
    else clearLocalPublished()
    void syncSharedPublished(nextStore)
  }, [])

  const value = useMemo(
    () => ({
      products,
      published,
      catalogReady,
      syncing,
      publishProduct,
      updatePublished,
      removePublished,
    }),
    [
      products,
      published,
      catalogReady,
      syncing,
      publishProduct,
      updatePublished,
      removePublished,
    ],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useCatalog() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useCatalog outside CatalogProvider')
  return ctx
}

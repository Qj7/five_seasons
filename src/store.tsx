import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type { BrandGroup } from './data/brands'

export type Tab = 'home' | 'catalog' | 'favorites' | 'cart' | 'profile'

interface StoreCtx {
  tab: Tab
  setTab: (t: Tab) => void
  favorites: Set<string>
  toggleFavorite: (id: string) => void
  cart: Map<string, number>
  addToCart: (id: string) => void
  removeFromCart: (id: string) => void
  cartCount: number
  catalogFilter: string | null
  setCatalogFilter: (f: string | null) => void
  search: string
  setSearch: (s: string) => void
  selectedProductId: string | null
  openProduct: (id: string) => void
  closeProduct: () => void
  /** Full-screen manager publish flow (not part of profile). */
  managerOpen: boolean
  openManager: () => void
  closeManager: () => void
  /** Brand screens stack: 'all' / 'all:{group}' is the brands index, otherwise a brand slug. */
  brandStack: string[]
  openBrands: (group?: BrandGroup) => void
  openBrand: (slug: string) => void
  closeBrand: () => void
}

const Ctx = createContext<StoreCtx | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [tab, setTab] = useState<Tab>('home')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [cart, setCart] = useState<Map<string, number>>(new Map())
  const [catalogFilter, setCatalogFilter] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [managerOpen, setManagerOpen] = useState(false)
  const [brandStack, setBrandStack] = useState<string[]>([])

  const openBrands = useCallback((group?: BrandGroup) => {
    const screen = group ? `all:${group}` : 'all'
    setSelectedProductId(null)
    setManagerOpen(false)
    setBrandStack((prev) => (prev.at(-1) === screen ? prev : [...prev, screen]))
  }, [])

  const openBrand = useCallback((slug: string) => {
    setSelectedProductId(null)
    setManagerOpen(false)
    setBrandStack((prev) => [...prev, slug])
  }, [])

  const closeBrand = useCallback(() => {
    setBrandStack((prev) => prev.slice(0, -1))
  }, [])

  const openProduct = useCallback((id: string) => {
    setManagerOpen(false)
    setSelectedProductId(id)
  }, [])

  const closeProduct = useCallback(() => {
    setSelectedProductId(null)
  }, [])

  const openManager = useCallback(() => {
    setSelectedProductId(null)
    setBrandStack([])
    setManagerOpen(true)
  }, [])

  const closeManager = useCallback(() => {
    setManagerOpen(false)
  }, [])

  const handleSetTab = useCallback((t: Tab) => {
    setSelectedProductId(null)
    setManagerOpen(false)
    setBrandStack([])
    setTab(t)
  }, [])

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const addToCart = useCallback((id: string) => {
    setCart((prev) => {
      const next = new Map(prev)
      next.set(id, (next.get(id) ?? 0) + 1)
      return next
    })
  }, [])

  const removeFromCart = useCallback((id: string) => {
    setCart((prev) => {
      const next = new Map(prev)
      const qty = next.get(id) ?? 0
      if (qty <= 1) next.delete(id)
      else next.set(id, qty - 1)
      return next
    })
  }, [])

  const cartCount = [...cart.values()].reduce((a, b) => a + b, 0)

  return (
    <Ctx.Provider
      value={{
        tab,
        setTab: handleSetTab,
        favorites,
        toggleFavorite,
        cart,
        addToCart,
        removeFromCart,
        cartCount,
        catalogFilter,
        setCatalogFilter,
        search,
        setSearch,
        selectedProductId,
        openProduct,
        closeProduct,
        managerOpen,
        openManager,
        closeManager,
        brandStack,
        openBrands,
        openBrand,
        closeBrand,
      }}
    >
      {children}
    </Ctx.Provider>
  )
}

export function useStore() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useStore outside provider')
  return ctx
}

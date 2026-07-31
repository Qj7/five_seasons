import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'

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
}

const Ctx = createContext<StoreCtx | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [tab, setTab] = useState<Tab>('home')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [cart, setCart] = useState<Map<string, number>>(new Map())
  const [catalogFilter, setCatalogFilter] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)

  const openProduct = useCallback((id: string) => {
    setSelectedProductId(id)
  }, [])

  const closeProduct = useCallback(() => {
    setSelectedProductId(null)
  }, [])

  const handleSetTab = useCallback((t: Tab) => {
    setSelectedProductId(null)
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

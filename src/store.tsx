import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type { BrandGroup } from './data/brands'

export type Tab = 'home' | 'catalog' | 'favorites' | 'cart' | 'profile'

/** Manager cabinet screens — each manager has their own listings/orders. */
export type ManagerScreen = 'hub' | 'new' | 'orders' | 'listings'

interface StoreCtx {
  tab: Tab
  setTab: (t: Tab) => void
  favorites: Set<string>
  toggleFavorite: (id: string) => void
  cart: Map<string, number>
  addToCart: (id: string) => void
  removeFromCart: (id: string) => void
  clearCart: () => void
  cartCount: number
  catalogFilter: string | null
  setCatalogFilter: (f: string | null) => void
  search: string
  setSearch: (s: string) => void
  selectedProductId: string | null
  openProduct: (id: string) => void
  closeProduct: () => void
  managerOpen: boolean
  managerScreen: ManagerScreen
  /** When set, product form edits this published SKU. */
  managerEditId: string | null
  /** When set, product form adds another colorway of this SKU’s model. */
  managerColorSourceId: string | null
  openManager: (screen?: ManagerScreen) => void
  openManagerNew: () => void
  openManagerEdit: (productId: string) => void
  openManagerAddColor: (sourceProductId: string) => void
  setManagerScreen: (screen: ManagerScreen) => void
  closeManager: () => void
  /** Customer / shared orders list (profile → Мои заказы). */
  ordersOpen: boolean
  openOrders: () => void
  closeOrders: () => void
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
  const [managerScreen, setManagerScreen] = useState<ManagerScreen>('hub')
  const [managerEditId, setManagerEditId] = useState<string | null>(null)
  const [managerColorSourceId, setManagerColorSourceId] = useState<string | null>(
    null,
  )
  const [ordersOpen, setOrdersOpen] = useState(false)
  const [brandStack, setBrandStack] = useState<string[]>([])

  const clearManagerForm = useCallback(() => {
    setManagerEditId(null)
    setManagerColorSourceId(null)
  }, [])

  const openBrands = useCallback((group?: BrandGroup) => {
    const screen = group ? `all:${group}` : 'all'
    setSelectedProductId(null)
    setManagerOpen(false)
    setOrdersOpen(false)
    setBrandStack((prev) => (prev.at(-1) === screen ? prev : [...prev, screen]))
  }, [])

  const openBrand = useCallback((slug: string) => {
    setSelectedProductId(null)
    setManagerOpen(false)
    setOrdersOpen(false)
    setBrandStack((prev) => [...prev, slug])
  }, [])

  const closeBrand = useCallback(() => {
    setBrandStack((prev) => prev.slice(0, -1))
  }, [])

  const openProduct = useCallback((id: string) => {
    setManagerOpen(false)
    setOrdersOpen(false)
    setSelectedProductId(id)
  }, [])

  const closeProduct = useCallback(() => {
    setSelectedProductId(null)
  }, [])

  const openManager = useCallback((screen: ManagerScreen = 'hub') => {
    setSelectedProductId(null)
    setBrandStack([])
    setOrdersOpen(false)
    if (screen !== 'new') {
      setManagerEditId(null)
      setManagerColorSourceId(null)
    }
    setManagerScreen(screen)
    setManagerOpen(true)
  }, [])

  const openManagerNew = useCallback(() => {
    setSelectedProductId(null)
    setBrandStack([])
    setOrdersOpen(false)
    setManagerEditId(null)
    setManagerColorSourceId(null)
    setManagerScreen('new')
    setManagerOpen(true)
  }, [])

  const openManagerEdit = useCallback((productId: string) => {
    setSelectedProductId(null)
    setBrandStack([])
    setOrdersOpen(false)
    setManagerEditId(productId)
    setManagerColorSourceId(null)
    setManagerScreen('new')
    setManagerOpen(true)
  }, [])

  const openManagerAddColor = useCallback((sourceProductId: string) => {
    setSelectedProductId(null)
    setBrandStack([])
    setOrdersOpen(false)
    setManagerEditId(null)
    setManagerColorSourceId(sourceProductId)
    setManagerScreen('new')
    setManagerOpen(true)
  }, [])

  const closeManager = useCallback(() => {
    setManagerOpen(false)
    setManagerScreen('hub')
    clearManagerForm()
  }, [clearManagerForm])

  const handleSetManagerScreen = useCallback(
    (screen: ManagerScreen) => {
      if (screen !== 'new') clearManagerForm()
      setManagerScreen(screen)
    },
    [clearManagerForm],
  )

  const openOrders = useCallback(() => {
    setSelectedProductId(null)
    setBrandStack([])
    setManagerOpen(false)
    setOrdersOpen(true)
  }, [])

  const closeOrders = useCallback(() => {
    setOrdersOpen(false)
  }, [])

  const handleSetTab = useCallback((t: Tab) => {
    setSelectedProductId(null)
    setManagerOpen(false)
    setOrdersOpen(false)
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

  const clearCart = useCallback(() => {
    setCart(new Map())
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
        clearCart,
        cartCount,
        catalogFilter,
        setCatalogFilter,
        search,
        setSearch,
        selectedProductId,
        openProduct,
        closeProduct,
        managerOpen,
        managerScreen,
        managerEditId,
        managerColorSourceId,
        openManager,
        openManagerNew,
        openManagerEdit,
        openManagerAddColor,
        setManagerScreen: handleSetManagerScreen,
        closeManager,
        ordersOpen,
        openOrders,
        closeOrders,
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

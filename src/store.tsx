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
import type { BrandGroup } from './data/brands'
import { computePath, parsePath } from './routing'
import { useAuth } from './auth'
import {
  cartLineKey,
  mergeCart,
  normalizeCart,
  normalizeFavoriteIds,
  type CartLine,
  type DeliveryMethod,
} from '../lib/cart'

const FAVORITES_KEY = 'five-seasons:favorites'
const CART_KEY = 'five-seasons:cart'
const BAG_OWNER_KEY = 'five-seasons:bag-owner'

export type { CartLine, DeliveryMethod }

function loadFavorites(): Set<string> {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY)
    if (!raw) return new Set()
    return new Set(normalizeFavoriteIds(JSON.parse(raw) as unknown))
  } catch {
    return new Set()
  }
}

function loadCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(CART_KEY)
    if (!raw) return []
    return normalizeCart(JSON.parse(raw) as unknown)
  } catch {
    return []
  }
}

function saveBag(cart: CartLine[], favorites: Set<string>, owner: string) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart))
    localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]))
    localStorage.setItem(BAG_OWNER_KEY, owner)
  } catch {
    /* quota / private mode */
  }
}

function clearBag() {
  try {
    localStorage.removeItem(CART_KEY)
    localStorage.removeItem(FAVORITES_KEY)
    localStorage.removeItem(BAG_OWNER_KEY)
  } catch {
    /* ignore */
  }
}

export type Tab = 'home' | 'catalog' | 'favorites' | 'cart' | 'profile'

/** Manager cabinet screens — each manager has their own listings/orders. */
export type ManagerScreen = 'hub' | 'new' | 'orders' | 'listings'

interface StoreCtx {
  tab: Tab
  setTab: (t: Tab) => void
  favorites: Set<string>
  toggleFavorite: (id: string) => void
  cart: CartLine[]
  addToCart: (
    productId: string,
    opts?: { size?: string; delivery?: DeliveryMethod },
  ) => void
  removeFromCart: (
    productId: string,
    opts?: { size?: string; delivery?: DeliveryMethod },
  ) => void
  updateCartLine: (
    line: CartLine,
    patch: Partial<Pick<CartLine, 'size' | 'delivery' | 'qty'>>,
  ) => void
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

export function StoreProvider({
  children,
  initialPath,
}: {
  children: ReactNode
  initialPath?: string
}) {
  const { user, authReady } = useAuth()
  const userId = user?.id ?? null
  const initial = useMemo(() => parsePath(initialPath), [initialPath])
  const [tab, setTab] = useState<Tab>(initial.tab)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [cart, setCart] = useState<CartLine[]>([])
  const [hydrated, setHydrated] = useState(false)
  const [serverBag, setServerBag] = useState(false)
  const [catalogFilter, setCatalogFilter] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    initial.selectedProductId,
  )
  const [managerOpen, setManagerOpen] = useState(initial.managerOpen)
  const [managerScreen, setManagerScreen] = useState<ManagerScreen>(initial.managerScreen)
  const [managerEditId, setManagerEditId] = useState<string | null>(null)
  const [managerColorSourceId, setManagerColorSourceId] = useState<string | null>(
    null,
  )
  const [ordersOpen, setOrdersOpen] = useState(initial.ordersOpen)
  const [brandStack, setBrandStack] = useState<string[]>(initial.brandStack)

  const skipCartPush = useRef(false)
  const skipFavPush = useRef(false)
  const prevUserId = useRef<string | null | undefined>(undefined)

  // Guest bag lives in localStorage. A logged-in account with a database
  // loads the server bag and folds a guest bag in on the first login.
  useEffect(() => {
    if (!authReady) return
    let cancelled = false
    const prev = prevUserId.current
    prevUserId.current = userId

    if (prev && !userId) {
      skipCartPush.current = true
      skipFavPush.current = true
      setServerBag(false)
      setCart([])
      setFavorites(new Set())
      clearBag()
      setHydrated(true)
      return
    }

    ;(async () => {
      const localCart = loadCart()
      const localFav = loadFavorites()
      const owner = localStorage.getItem(BAG_OWNER_KEY)

      if (!userId) {
        if (cancelled) return
        skipCartPush.current = true
        skipFavPush.current = true
        setServerBag(false)
        setCart(localCart)
        setFavorites(localFav)
        saveBag(localCart, localFav, 'guest')
        setHydrated(true)
        return
      }

      let remoteCart: CartLine[] = []
      let remoteFav: string[] = []
      let server = false
      try {
        const [cartRes, favRes] = await Promise.all([
          fetch('/api/cart', { cache: 'no-store' }),
          fetch('/api/favorites', { cache: 'no-store' }),
        ])
        const cartData = (await cartRes.json().catch(() => null)) as {
          server?: boolean
          items?: unknown
        } | null
        const favData = (await favRes.json().catch(() => null)) as {
          server?: boolean
          ids?: unknown
        } | null
        server = Boolean(cartData?.server && favData?.server)
        remoteCart = normalizeCart(cartData?.items)
        remoteFav = normalizeFavoriteIds(favData?.ids)
      } catch {
        server = false
      }
      if (cancelled) return

      let nextCart = localCart
      let nextFav = localFav
      if (server) {
        const guest = owner === 'guest'
        nextCart = guest ? mergeCart(remoteCart, localCart) : remoteCart
        nextFav = guest
          ? new Set([...remoteFav, ...localFav])
          : new Set(remoteFav)
        if (guest) {
          await Promise.all([
            fetch('/api/cart', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ items: nextCart }),
            }),
            fetch('/api/favorites', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids: [...nextFav] }),
            }),
          ]).catch(() => {})
        }
      }
      if (cancelled) return
      skipCartPush.current = true
      skipFavPush.current = true
      setServerBag(server)
      setCart(nextCart)
      setFavorites(nextFav)
      saveBag(nextCart, nextFav, server ? userId : 'guest')
      setHydrated(true)
    })()

    return () => {
      cancelled = true
    }
  }, [authReady, userId])

  useEffect(() => {
    if (!hydrated) return
    saveBag(cart, favorites, serverBag && userId ? userId : 'guest')
    if (skipCartPush.current) {
      skipCartPush.current = false
      return
    }
    if (!serverBag || !userId) return
    const timer = setTimeout(() => {
      void fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart }),
      })
    }, 250)
    return () => clearTimeout(timer)
  }, [cart, hydrated, serverBag, userId])

  useEffect(() => {
    if (!hydrated) return
    saveBag(cart, favorites, serverBag && userId ? userId : 'guest')
    if (skipFavPush.current) {
      skipFavPush.current = false
      return
    }
    if (!serverBag || !userId) return
    const ids = [...favorites]
    const timer = setTimeout(() => {
      void fetch('/api/favorites', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      })
    }, 250)
    return () => clearTimeout(timer)
  }, [favorites, cart, hydrated, serverBag, userId])

  // Mirror primary navigation into the URL so deep links and Back/Forward work.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const path = computePath({
      tab,
      selectedProductId,
      managerOpen,
      managerScreen,
      ordersOpen,
      brandScreen: brandStack.at(-1) ?? null,
    })
    if (path !== window.location.pathname) {
      window.history.pushState(null, '', path)
    }
  }, [tab, selectedProductId, managerOpen, managerScreen, ordersOpen, brandStack])

  useEffect(() => {
    const onPop = () => {
      const r = parsePath(window.location.pathname)
      setTab(r.tab)
      setSelectedProductId(r.selectedProductId)
      setManagerOpen(r.managerOpen)
      setManagerScreen(r.managerScreen)
      setOrdersOpen(r.ordersOpen)
      setBrandStack(r.brandStack)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

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

  const addToCart = useCallback(
    (productId: string, opts?: { size?: string; delivery?: DeliveryMethod }) => {
      const line: CartLine = {
        productId,
        qty: 1,
        size: opts?.size?.trim().slice(0, 32) ?? '',
        delivery: opts?.delivery === 'express' ? 'express' : 'standard',
      }
      setCart((prev) => {
        const key = cartLineKey(line)
        const idx = prev.findIndex((item) => cartLineKey(item) === key)
        if (idx === -1) return [...prev, line]
        return prev.map((item, i) =>
          i === idx ? { ...item, qty: Math.min(99, item.qty + 1) } : item,
        )
      })
    },
    [],
  )

  const removeFromCart = useCallback(
    (productId: string, opts?: { size?: string; delivery?: DeliveryMethod }) => {
      setCart((prev) => {
        const idx = prev.findIndex(
          (item) =>
            item.productId === productId &&
            (opts?.size === undefined || item.size === opts.size) &&
            (opts?.delivery === undefined || item.delivery === opts.delivery),
        )
        if (idx === -1) return prev
        const line = prev[idx]
        if (!line || line.qty <= 1) return prev.filter((_, i) => i !== idx)
        return prev.map((item, i) =>
          i === idx ? { ...item, qty: item.qty - 1 } : item,
        )
      })
    },
    [],
  )

  const updateCartLine = useCallback(
    (line: CartLine, patch: Partial<Pick<CartLine, 'size' | 'delivery' | 'qty'>>) => {
      setCart((prev) => {
        const currentKey = cartLineKey(line)
        const rest = prev.filter((item) => cartLineKey(item) !== currentKey)
        const qty = patch.qty ?? line.qty
        if (qty <= 0) return rest
        const next: CartLine = {
          productId: line.productId,
          size: (patch.size ?? line.size).trim().slice(0, 32),
          delivery: patch.delivery ?? line.delivery,
          qty: Math.max(1, Math.min(99, qty)),
        }
        const key = cartLineKey(next)
        const clash = rest.findIndex((item) => cartLineKey(item) === key)
        if (clash === -1) return [...rest, next]
        return rest.map((item, i) =>
          i === clash ? { ...item, qty: Math.min(99, item.qty + next.qty) } : item,
        )
      })
    },
    [],
  )

  const clearCart = useCallback(() => {
    setCart([])
  }, [])

  const cartCount = cart.reduce((sum, line) => sum + line.qty, 0)

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
        updateCartLine,
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

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Product } from './data/products'

const STORAGE_KEY = 'five-seasons:orders'

export type OrderStatus = 'new' | 'processing' | 'shipped' | 'done' | 'cancelled'

export type OrderItem = {
  productId: string
  name: string
  price: number
  qty: number
  image: string
  /** Manager who listed the SKU, if any. */
  publishedBy?: string
  size?: string
  delivery?: 'standard' | 'express'
}

export type Order = {
  id: string
  createdAt: number
  customerId: string
  customerName: string
  customerEmail: string
  items: OrderItem[]
  total: number
  discount: number
  status: OrderStatus
}

interface OrdersCtx {
  orders: Order[]
  placeOrder: (input: {
    customerId: string
    customerName: string
    customerEmail: string
    items: { product: Product; qty: number }[]
    discount?: number
  }) => Order
  ordersForCustomer: (customerId: string) => Order[]
  /** Orders that include at least one SKU published by this manager. */
  ordersForManager: (managerId: string) => Order[]
  setOrderStatus: (id: string, status: OrderStatus) => void
}

function loadOrders(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Order[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveOrders(list: Order[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

const Ctx = createContext<OrdersCtx | null>(null)

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(() => loadOrders())

  const placeOrder = useCallback(
    (input: {
      customerId: string
      customerName: string
      customerEmail: string
      items: { product: Product; qty: number }[]
      discount?: number
    }) => {
      const discount = input.discount ?? 0
      const items: OrderItem[] = input.items.map(({ product, qty }) => ({
        productId: product.id,
        name: product.name,
        price: product.price,
        qty,
        image: product.image,
        publishedBy: product.publishedBy,
      }))
      const total = items.reduce((s, i) => s + i.price * i.qty, 0) - discount
      const order: Order = {
        id: `ord-${Date.now().toString(36)}`,
        createdAt: Date.now(),
        customerId: input.customerId,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        items,
        total: Math.max(0, total),
        discount,
        status: 'new',
      }
      setOrders((prev) => {
        const next = [order, ...prev]
        saveOrders(next)
        return next
      })
      return order
    },
    [],
  )

  const ordersForCustomer = useCallback(
    (customerId: string) => orders.filter((o) => o.customerId === customerId),
    [orders],
  )

  const ordersForManager = useCallback(
    (managerId: string) =>
      orders.filter((o) => o.items.some((i) => i.publishedBy === managerId)),
    [orders],
  )

  const setOrderStatus = useCallback((id: string, status: OrderStatus) => {
    setOrders((prev) => {
      const next = prev.map((o) => (o.id === id ? { ...o, status } : o))
      saveOrders(next)
      return next
    })
  }, [])

  const value = useMemo(
    () => ({
      orders,
      placeOrder,
      ordersForCustomer,
      ordersForManager,
      setOrderStatus,
    }),
    [orders, placeOrder, ordersForCustomer, ordersForManager, setOrderStatus],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useOrders() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useOrders outside OrdersProvider')
  return ctx
}

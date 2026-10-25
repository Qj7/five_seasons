'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Product } from './data/products'
import { useAuth } from './auth'

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
      items: {
        product: Product
        qty: number
        size?: string
        delivery?: 'standard' | 'express'
        price?: number
      }[]
      discount?: number
    }) => Promise<Order>
  ordersForCustomer: (customerId: string) => Order[]
  /** Orders that include at least one SKU published by this manager. */
  ordersForManager: (managerId: string) => Order[]
  setOrderStatus: (id: string, status: OrderStatus) => void
}

type ServerOrder = {
  id: string
  createdAt: string
  customerId: string
  customerName: string
  customerEmail: string
  total: number
  discount: number
  status: string
  items: {
    productId: string
    name: string
    price: number
    qty: number
    image: string
    size: string | null
    delivery: string | null
    publishedBy: string | null
  }[]
}

function mapServerOrder(o: ServerOrder): Order {
  return {
    id: o.id,
    createdAt: new Date(o.createdAt).getTime(),
    customerId: o.customerId,
    customerName: o.customerName,
    customerEmail: o.customerEmail,
    total: o.total,
    discount: o.discount,
    status: o.status as OrderStatus,
    items: o.items.map((i) => ({
      productId: i.productId,
      name: i.name,
      price: i.price,
      qty: i.qty,
      image: i.image,
      size: i.size ?? undefined,
      delivery:
        i.delivery === 'express' || i.delivery === 'standard' ? i.delivery : undefined,
      publishedBy: i.publishedBy ?? undefined,
    })),
  }
}

function mergeById(a: Order[], b: Order[]): Order[] {
  const byId = new Map<string, Order>()
  for (const o of [...a, ...b]) byId.set(o.id, o)
  return [...byId.values()].sort((x, y) => y.createdAt - x.createdAt)
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
  const { user, isManager } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  /** True once the server confirmed DB-backed orders are available. */
  const [serverMode, setServerMode] = useState(false)

  // Load orders from the server when available; fall back to localStorage.
  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const res = await fetch('/api/orders')
        const data = (await res.json().catch(() => null)) as
          | { orders: ServerOrder[]; serverOrders: boolean }
          | null
        if (!active) return
        if (data?.serverOrders) {
          setServerMode(true)
          let next = (data.orders ?? []).map(mapServerOrder)
          if (isManager) {
            try {
              const res2 = await fetch('/api/orders?scope=manager')
              const data2 = (await res2.json().catch(() => null)) as
                | { orders: ServerOrder[] }
                | null
              if (data2?.orders) next = mergeById(next, data2.orders.map(mapServerOrder))
            } catch {
              /* ignore */
            }
          }
          if (active) setOrders(next)
          return
        }
      } catch {
        /* fall through to local */
      }
      if (active) {
        setServerMode(false)
        setOrders(loadOrders())
      }
    })()
    return () => {
      active = false
    }
  }, [user, isManager])

  const placeOrder = useCallback(
    async (input: {
      customerId: string
      customerName: string
      customerEmail: string
      items: {
        product: Product
        qty: number
        size?: string
        delivery?: 'standard' | 'express'
        price?: number
      }[]
      discount?: number
    }): Promise<Order> => {
      const discount = input.discount ?? 0
      const items: OrderItem[] = input.items.map(({ product, qty, size, delivery, price }) => ({
        productId: product.id,
        name: product.name,
        price: price ?? product.price,
        qty,
        image: product.image,
        publishedBy: product.publishedBy,
        size,
        delivery,
      }))
      const deliveryMethod = items.some((item) => item.delivery === 'express')
        ? 'express'
        : 'standard'

      if (serverMode) {
        try {
          const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items, discount, deliveryMethod }),
          })
          if (res.ok) {
            const { order } = (await res.json()) as { order: ServerOrder }
            const mapped = mapServerOrder(order)
            setOrders((prev) => [mapped, ...prev])
            return mapped
          }
        } catch {
          /* fall through to local */
        }
      }

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
    [serverMode],
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

  const setOrderStatus = useCallback(
    (id: string, status: OrderStatus) => {
      if (serverMode) {
        void fetch(`/api/orders/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        }).catch(() => {})
      }
      setOrders((prev) => {
        const next = prev.map((o) => (o.id === id ? { ...o, status } : o))
        if (!serverMode) saveOrders(next)
        return next
      })
    },
    [serverMode],
  )

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

import { baseProducts, type Product } from './data/products'

export const LOCAL_STORAGE_KEY = 'five-seasons:published-products'

/** Server endpoint backing the shared storefront catalog (Prisma / fallback). */
export const CATALOG_API = '/api/catalog'

export function loadLocalPublished(): Product[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Product[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveLocalPublished(list: Product[]) {
  if (!list.length) {
    localStorage.removeItem(LOCAL_STORAGE_KEY)
    return
  }
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list))
}

export function clearLocalPublished() {
  localStorage.removeItem(LOCAL_STORAGE_KEY)
}

export async function fetchSharedPublished(): Promise<Product[]> {
  try {
    const res = await fetch(`${CATALOG_API}?t=${Date.now()}`, { cache: 'no-store' })
    if (!res.ok) return []
    const parsed = (await res.json()) as Product[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/** SKU already listed in the shop (built-in or shared storefront catalog). */
export function storeHasSku(store: Product[], sku: string) {
  if (store.some((p) => p.id === sku)) return true
  return baseProducts.some((p) => p.id === sku)
}

export type SyncResult = { ok: true } | { ok: false; reason: string }

/** Persist the shared storefront catalog via the API (DB on Vercel, file in dev). */
export async function syncSharedPublished(list: Product[]): Promise<SyncResult> {
  try {
    const res = await fetch(CATALOG_API, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(list),
    })
    if (res.ok) return { ok: true }
    return { ok: false, reason: `catalog sync HTTP ${res.status}` }
  } catch (err) {
    return {
      ok: false,
      reason: err instanceof Error ? err.message : 'catalog sync failed',
    }
  }
}

export type FlushResult = {
  /** Shared storefront catalog after flush. */
  store: Product[]
  /** Pending SKUs that still need a successful sync (kept in localStorage). */
  pending: Product[]
  /** True when localStorage was cleared. */
  cleared: boolean
  syncError?: string
}

/**
 * Drain manager localStorage into the shop catalog:
 * for each pending SKU, if it is not already in the store → add it;
 * on successful write, clear localStorage.
 */
export async function flushLocalStorageToStore(
  shared: Product[],
): Promise<FlushResult> {
  const pending = loadLocalPublished()
  if (!pending.length) {
    return { store: shared, pending: [], cleared: true }
  }

  const toList = pending.filter((p) => !storeHasSku(shared, p.id))

  // Everything already in the shop — just drop the local staging copy.
  if (!toList.length) {
    clearLocalPublished()
    return { store: shared, pending: [], cleared: true }
  }

  const nextStore = [...toList, ...shared]
  const sync = await syncSharedPublished(nextStore)
  if (!sync.ok) {
    saveLocalPublished(toList)
    return {
      store: shared,
      pending: toList,
      cleared: false,
      syncError: sync.reason,
    }
  }

  clearLocalPublished()
  return { store: nextStore, pending: [], cleared: true }
}

import { baseProducts, type Product } from './data/products'

export const LOCAL_STORAGE_KEY = 'five-seasons:published-products'
export const SHARED_CATALOG_PATH = 'shared-published.json'

/** Dev middleware + optional production GitHub sync. */
export const SYNC_API_PATH = '/api/shared-catalog'

function sharedCatalogUrl() {
  return `${import.meta.env.BASE_URL}${SHARED_CATALOG_PATH}?t=${Date.now()}`
}

export function loadLocalPublished(): Product[] {
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
    const res = await fetch(sharedCatalogUrl(), { cache: 'no-store' })
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

/**
 * Push the shared storefront catalog.
 * Dev: Vite middleware writes public/shared-published.json.
 * Prod: GitHub Contents API when VITE_CATALOG_TOKEN is set.
 */
export async function syncSharedPublished(list: Product[]): Promise<SyncResult> {
  if (import.meta.env.DEV) {
    try {
      const res = await fetch(SYNC_API_PATH, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(list),
      })
      if (res.ok) return { ok: true }
      return { ok: false, reason: `dev sync HTTP ${res.status}` }
    } catch (err) {
      return { ok: false, reason: err instanceof Error ? err.message : 'dev sync failed' }
    }
  }

  const token = import.meta.env.VITE_CATALOG_TOKEN as string | undefined
  const repo = (import.meta.env.VITE_CATALOG_REPO as string | undefined) || 'Qj7/five_seasons'
  if (!token) {
    return {
      ok: false,
      reason: 'no VITE_CATALOG_TOKEN — cannot write shared catalog',
    }
  }

  try {
    const path = `public/${SHARED_CATALOG_PATH}`
    const api = `https://api.github.com/repos/${repo}/contents/${path}`
    const existing = await fetch(api, {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
      },
    })
    const sha =
      existing.status === 200
        ? ((await existing.json()) as { sha?: string }).sha
        : undefined

    const content = btoa(
      unescape(encodeURIComponent(JSON.stringify(list, null, 2) + '\n')),
    )
    const put = await fetch(api, {
      method: 'PUT',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'chore: sync manager-published catalog',
        content,
        sha,
      }),
    })
    if (!put.ok) {
      const body = await put.text()
      return { ok: false, reason: `GitHub ${put.status}: ${body.slice(0, 180)}` }
    }
    return { ok: true }
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : 'GitHub sync failed' }
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
  const alreadyListed = pending.filter((p) => storeHasSku(shared, p.id))

  // Everything already in the shop — just drop the local staging copy.
  if (!toList.length) {
    clearLocalPublished()
    return { store: shared, pending: [], cleared: true }
  }

  const nextStore = [...toList, ...shared]
  const sync = await syncSharedPublished(nextStore)
  if (!sync.ok) {
    // Keep only SKUs that still need listing; drop duplicates already in store.
    saveLocalPublished(toList)
    return {
      store: shared,
      pending: toList,
      cleared: false,
      syncError: sync.reason,
    }
  }

  clearLocalPublished()
  // alreadyListed were skipped intentionally — they are gone with the clear.
  void alreadyListed
  return { store: nextStore, pending: [], cleared: true }
}

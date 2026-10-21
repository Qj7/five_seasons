import type { Product } from './data/products'

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
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list))
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

/** Merge shared + local by id. Local wins so in-progress edits stay on this device. */
export function mergePublished(shared: Product[], local: Product[]): Product[] {
  const byId = new Map<string, Product>()
  for (const p of shared) byId.set(p.id, p)
  for (const p of local) byId.set(p.id, p)
  return [...byId.values()].sort((a, b) => {
    const tb = b.id.startsWith('mgr-') ? 1 : 0
    const ta = a.id.startsWith('mgr-') ? 1 : 0
    if (tb !== ta) return tb - ta
    return b.id.localeCompare(a.id)
  })
}

export type SyncResult = { ok: true } | { ok: false; reason: string }

/**
 * Push the full published list to the shared storefront catalog.
 * Dev: Vite middleware writes public/shared-published.json (visible after refresh to others on same origin file).
 * Prod: GitHub Contents API when VITE_CATALOG_TOKEN is set; otherwise no-op (localStorage still works).
 */
export async function syncSharedPublished(list: Product[]): Promise<SyncResult> {
  // Prefer local Vite middleware in development — writes the JSON into the repo.
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
      reason: 'no VITE_CATALOG_TOKEN — product saved on this device only',
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

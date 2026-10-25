export type DeliveryMethod = 'standard' | 'express'

export type CartLine = {
  productId: string
  qty: number
  size: string
  delivery: DeliveryMethod
}

const SEP = '\u001f'

export function cartLineKey(line: Pick<CartLine, 'productId' | 'size' | 'delivery'>) {
  return `${line.productId}${SEP}${line.size}${SEP}${line.delivery}`
}

/** Accepts the current line list or the old `{ [productId]: qty }` map. */
export function normalizeCart(input: unknown): CartLine[] {
  const raw: unknown[] = Array.isArray(input)
    ? input
    : input && typeof input === 'object'
      ? Object.entries(input as Record<string, unknown>).map(([productId, qty]) => ({
          productId,
          qty,
          size: '',
          delivery: 'standard',
        }))
      : []

  const map = new Map<string, CartLine>()
  for (const row of raw) {
    if (!row || typeof row !== 'object') continue
    const rec = row as Record<string, unknown>
    const productId = String(rec.productId ?? '')
      .trim()
      .slice(0, 80)
    if (!productId) continue
    const qty = Math.max(1, Math.min(99, Math.round(Number(rec.qty) || 1)))
    const size = String(rec.size ?? '')
      .trim()
      .slice(0, 32)
    const delivery: DeliveryMethod = rec.delivery === 'express' ? 'express' : 'standard'
    const line: CartLine = { productId, qty, size, delivery }
    const key = cartLineKey(line)
    const prev = map.get(key)
    if (prev) prev.qty = Math.min(99, prev.qty + qty)
    else map.set(key, line)
    if (map.size >= 100) break
  }
  return [...map.values()]
}

/** Guest lines are added on top of the account cart (same size + delivery sums). */
export function mergeCart(account: CartLine[], guest: CartLine[]): CartLine[] {
  return normalizeCart([...account, ...guest])
}

export function normalizeFavoriteIds(input: unknown): string[] {
  if (!Array.isArray(input)) return []
  const ids = input
    .map((value) => String(value).trim().slice(0, 80))
    .filter(Boolean)
  return [...new Set(ids)].slice(0, 200)
}

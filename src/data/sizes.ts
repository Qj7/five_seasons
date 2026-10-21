import type { Category } from './products'
import { departmentOf } from './products'

/** Size chips shown on PDP + manager picker. Label lives in `eu` for all systems. */
export type SizeOption = {
  eu: string
  mw: string
}

export type SizeSystem = 'eu' | 'alpha' | 'waist' | 'onesize'

/**
 * Full shoe palette. Includes plain numbers (39, 45…)
 * and Crocs-style ranges (37–38), plus larger sizes up to 50.
 */
export const SIZE_PALETTE: SizeOption[] = [
  { eu: '35', mw: 'M3/W5' },
  { eu: '36', mw: 'M4/W6' },
  { eu: '36–37', mw: 'M4/W6' },
  { eu: '37', mw: 'M5/W7' },
  { eu: '37–38', mw: 'M5/W7' },
  { eu: '38', mw: 'M6/W8' },
  { eu: '38–39', mw: 'M6/W8' },
  { eu: '39', mw: 'M7/W9' },
  { eu: '39–40', mw: 'M7/W9' },
  { eu: '40', mw: 'M7.5/W9.5' },
  { eu: '40–41', mw: 'M8/W10' },
  { eu: '41', mw: 'M8/W10' },
  { eu: '41–42', mw: 'M8/W10' },
  { eu: '42', mw: 'M9/W11' },
  { eu: '42–43', mw: 'M9/W11' },
  { eu: '43', mw: 'M10/W12' },
  { eu: '43–44', mw: 'M10/W12' },
  { eu: '44', mw: 'M10.5/W12.5' },
  { eu: '44–45', mw: 'M11/W13' },
  { eu: '45', mw: 'M11/W13' },
  { eu: '45–46', mw: 'M11/W13' },
  { eu: '46', mw: 'M12/W14' },
  { eu: '46–47', mw: 'M12/W14' },
  { eu: '47', mw: 'M13/W15' },
  { eu: '47–48', mw: 'M13/W15' },
  { eu: '48', mw: 'M14/W16' },
  { eu: '49', mw: 'M15' },
  { eu: '50', mw: 'M16' },
]

/** Default Crocs-style ranges used when a product has no custom sizes. */
export const DEFAULT_SIZE_OPTIONS: SizeOption[] = [
  { eu: '36–37', mw: 'M4/W6' },
  { eu: '37–38', mw: 'M5/W7' },
  { eu: '38–39', mw: 'M6/W8' },
  { eu: '39–40', mw: 'M7/W9' },
  { eu: '41–42', mw: 'M8/W10' },
  { eu: '42–43', mw: 'M9/W11' },
  { eu: '43–44', mw: 'M10/W12' },
  { eu: '45–46', mw: 'M11/W13' },
]

/** Tops / outerwear / hoodies — alpha grid. */
export const CLOTHING_SIZE_PALETTE: SizeOption[] = [
  { eu: 'XS', mw: '—' },
  { eu: 'S', mw: '—' },
  { eu: 'M', mw: '—' },
  { eu: 'L', mw: '—' },
  { eu: 'XL', mw: '—' },
  { eu: 'XXL', mw: '—' },
  { eu: '3XL', mw: '—' },
]

/** Jeans — waist inches. */
export const JEANS_SIZE_PALETTE: SizeOption[] = [
  { eu: '28', mw: '—' },
  { eu: '29', mw: '—' },
  { eu: '30', mw: '—' },
  { eu: '31', mw: '—' },
  { eu: '32', mw: '—' },
  { eu: '33', mw: '—' },
  { eu: '34', mw: '—' },
  { eu: '36', mw: '—' },
  { eu: '38', mw: '—' },
  { eu: '40', mw: '—' },
]

/** Hats — small alpha + one-size. */
export const HAT_SIZE_PALETTE: SizeOption[] = [
  { eu: 'S', mw: '—' },
  { eu: 'M', mw: '—' },
  { eu: 'L', mw: '—' },
  { eu: 'One size', mw: '—' },
]

/** Bags, watches, glasses, wallets — single size. */
export const ACCESSORY_SIZE_PALETTE: SizeOption[] = [
  { eu: 'One size', mw: '—' },
]

const DEFAULT_SHOE_SIZES = ['36–37', '37–38', '38–39', '39–40', '41–42']
const DEFAULT_CLOTHING_SIZES = ['S', 'M', 'L', 'XL']
const DEFAULT_JEANS_SIZES = ['30', '32', '34', '36']
const DEFAULT_HAT_SIZES = ['M', 'L']
const DEFAULT_ACCESSORY_SIZES = ['One size']

export function sizeSystemFor(category: Category): SizeSystem {
  if (category === 'jeans') return 'waist'
  if (category === 'hats') return 'alpha'
  const dept = departmentOf(category)
  if (dept?.id === 'clothing') return 'alpha'
  if (dept?.id === 'accessories') return 'onesize'
  return 'eu'
}

export function sizePaletteFor(category: Category): SizeOption[] {
  if (category === 'jeans') return JEANS_SIZE_PALETTE
  if (category === 'hats') return HAT_SIZE_PALETTE
  const dept = departmentOf(category)
  if (dept?.id === 'clothing') return CLOTHING_SIZE_PALETTE
  if (dept?.id === 'accessories') return ACCESSORY_SIZE_PALETTE
  return SIZE_PALETTE
}

export function defaultSizesFor(category: Category): string[] {
  if (category === 'jeans') return [...DEFAULT_JEANS_SIZES]
  if (category === 'hats') return [...DEFAULT_HAT_SIZES]
  const dept = departmentOf(category)
  if (dept?.id === 'clothing') return [...DEFAULT_CLOTHING_SIZES]
  if (dept?.id === 'accessories') return [...DEFAULT_ACCESSORY_SIZES]
  return [...DEFAULT_SHOE_SIZES]
}

/** PDP / form section title for the size grid. */
export function sizeSectionLabel(category: Category): string {
  const system = sizeSystemFor(category)
  if (system === 'waist') return 'Размеры (талия)'
  if (system === 'alpha') return 'Размеры'
  if (system === 'onesize') return 'Размер'
  return 'Размеры EU'
}

const byEu = new Map(
  [
    ...SIZE_PALETTE,
    ...CLOTHING_SIZE_PALETTE,
    ...JEANS_SIZE_PALETTE,
    ...HAT_SIZE_PALETTE,
    ...ACCESSORY_SIZE_PALETTE,
  ].map((s) => [normalizeSizeLabel(s.eu), s]),
)

/** Normalize en/em dashes and spaces so "37-38" matches "37–38". */
export function normalizeSizeLabel(label: string) {
  return label
    .trim()
    .replace(/\s+/g, '')
    .replace(/[-−–—]/g, '–')
}

export function sizeOptionFor(eu: string): SizeOption {
  const key = normalizeSizeLabel(eu)
  return byEu.get(key) ?? { eu: key, mw: '—' }
}

export function resolveSizeOptions(eus: string[] | undefined): SizeOption[] {
  if (!eus?.length) return DEFAULT_SIZE_OPTIONS
  return eus.map(sizeOptionFor)
}

/** "3-7" → "3–7 дней", "5" → "5 дней", "от 3 до 7" kept as-is if already words. */
export function formatDeliveryDays(raw: string | undefined, fallback: string): string {
  const value = (raw ?? '').trim()
  if (!value) return fallback
  if (/[а-яa-z]/i.test(value) && !/^\d/.test(value)) return value
  const normalized = normalizeSizeLabel(value).replace(/–/g, '–')
  if (normalized.includes('–')) {
    const [a, b] = normalized.split('–')
    return `${a}–${b} дней`
  }
  return `${normalized} ${Number(normalized) === 1 ? 'день' : Number(normalized) < 5 ? 'дня' : 'дней'}`
}

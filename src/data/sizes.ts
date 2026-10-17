/** EU size chips shown on PDP + manager picker. Singles and ranges both supported. */
export type SizeOption = {
  eu: string
  mw: string
}

/**
 * Full palette managers can enable. Includes plain numbers (39, 45…)
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

const byEu = new Map(SIZE_PALETTE.map((s) => [normalizeSizeLabel(s.eu), s]))

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

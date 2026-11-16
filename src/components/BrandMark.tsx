import { useId } from 'react'

const FLAG = {
  red: '#d92a1f',
  coral: '#ff6b3d',
  teal: '#128a7e',
  green: '#146b30',
  pink: '#ff6fae',
} as const

const TONGUE = 'M0 0C0-.6.35-1 .8-1 .62-.7.7-.3 1 0Z'
const COUNT = 9

/** Five-elements flag: red field, flame tongues on the fly edges, nested squares. */
export function BrandMark({
  size = 32,
  className,
  label,
}: {
  size?: number
  className?: string
  label?: string
}) {
  const id = useId()
  const top = Array.from({ length: COUNT }, (_, i) => `translate(${1 + i * 9.8} 5.5) scale(9.8 5.5)`)
  const right = Array.from({ length: COUNT }, (_, i) => `translate(89.5 ${5 + i * 10}) rotate(90) scale(10 10.5)`)
  const bottom = Array.from({ length: COUNT }, (_, i) => `translate(${89 - i * 9.9} 94.5) rotate(180) scale(9.9 5.5)`)

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
    >
      <defs>
        <path id={id} d={TONGUE} />
      </defs>
      <g fill={FLAG.red}>
        <rect x="0" y="5" width="90" height="90" />
        {[...top, ...right, ...bottom].map((t) => (
          <use key={t} href={`#${id}`} transform={t} />
        ))}
      </g>
      <rect x="7" y="12" width="76" height="76" fill={FLAG.coral} />
      <rect x="12.25" y="17.25" width="65.5" height="65.5" fill={FLAG.teal} />
      <rect x="17.5" y="22.5" width="55" height="55" fill={FLAG.green} />
      <rect x="22.75" y="27.75" width="44.5" height="44.5" fill={FLAG.pink} />
    </svg>
  )
}

/** Wordmark: 5 and SEASONS, same size, Satoshi Bold. */
export function BrandLogo({ size = 22, compact = false }: { size?: number; compact?: boolean }) {
  const word = compact ? Math.max(13, Math.round(size * 0.68)) : size
  return (
    <span
      className={`brand-logo ${compact ? 'brand-logo--compact' : ''}`}
      style={{ fontSize: word }}
      aria-label="Five Seasons"
    >
      <span className="brand-logo__name">5 SEASONS</span>
    </span>
  )
}

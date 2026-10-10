import { useId } from 'react'

/** Default user avatar: an anonymous guy in a red hoodie with a paper bag over his head. */
export function UserAvatar({
  size = 32,
  className,
  label,
}: {
  size?: number
  className?: string
  label?: string
}) {
  const id = useId()
  const bg = `${id}-bg`
  const clip = `${id}-clip`

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
    >
      <defs>
        <linearGradient id={bg} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d6ecff" />
          <stop offset="1" stopColor="#8fbfff" />
        </linearGradient>
        <clipPath id={clip}>
          <circle cx="50" cy="50" r="48" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <rect width="100" height="100" fill={`url(#${bg})`} />
        <path d="M12 104c2-22 18-33 38-33s36 11 38 33z" fill="#d42a1e" />
        <path d="M37 72c3 7 8 11 13 11s10-4 13-11c-4-1.5-8.5-2-13-2s-9 .5-13 2z" fill="#a8190f" />
        <path d="M44 62h12v10c-2 2-4 3-6 3s-4-1-6-3z" fill="#e3a07a" />
        <path
          d="M30 22l4-3 4 3 4-3 4 3 4-3 4 3 4-3 4 3 4-3 4 3 2.4 51H27.6z"
          fill="#d2ab72"
        />
        <path d="M30 22l4-3 4 3 2.4 51H27.6z" fill="#c09660" />
        <path d="M27.9 67h44.2l.3 6H27.6z" fill="#b8894f" />
        <g fill="#2e211b">
          <ellipse cx="42" cy="40" rx="4" ry="5" />
          <ellipse cx="58" cy="40" rx="4" ry="5" />
        </g>
        <path
          d="M41 51c4.5 4.5 13.5 4.5 18 0"
          fill="none"
          stroke="#2e211b"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <path d="M60 28l3-1M37 28l3 1" stroke="#a5824f" strokeWidth="1.6" strokeLinecap="round" />
        <g stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.85">
          <path d="M44 80v9" />
          <path d="M56 80v9" />
        </g>
      </g>
      <circle cx="50" cy="50" r="46.5" fill="none" stroke="#fff" strokeOpacity="0.7" strokeWidth="3" />
    </svg>
  )
}

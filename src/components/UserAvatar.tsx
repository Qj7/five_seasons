import { useId } from 'react'

/** Default guest avatar: a smiley Jibbitz-style charm on a pastel gradient. */
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
  const shine = `${id}-shine`

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
          <stop offset="0" stopColor="#ffb3d1" />
          <stop offset="0.55" stopColor="#c9b6ff" />
          <stop offset="1" stopColor="#8fd3ff" />
        </linearGradient>
        <radialGradient id={shine} cx="0.35" cy="0.3" r="0.6">
          <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill={`url(#${bg})`} />
      <circle cx="50" cy="50" r="48" fill={`url(#${shine})`} />
      <circle cx="50" cy="50" r="46" fill="none" stroke="#fff" strokeOpacity="0.7" strokeWidth="3" />
      <g fill="#1b1b2f">
        <ellipse cx="36" cy="44" rx="5.5" ry="7.5" />
        <ellipse cx="64" cy="44" rx="5.5" ry="7.5" />
      </g>
      <g fill="#fff">
        <circle cx="38" cy="41" r="2" />
        <circle cx="66" cy="41" r="2" />
      </g>
      <g fill="#ff6fae" opacity="0.55">
        <ellipse cx="26" cy="60" rx="7" ry="4.5" />
        <ellipse cx="74" cy="60" rx="7" ry="4.5" />
      </g>
      <path
        d="M36 61c3.5 6 8.2 9 14 9s10.5-3 14-9"
        fill="none"
        stroke="#1b1b2f"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  )
}

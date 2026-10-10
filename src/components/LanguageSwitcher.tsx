import { useEffect, useId, useRef, useState } from 'react'
import { useI18n } from '../i18n'
import { LANGS, type Lang } from '../locales/langs'

export function LanguageSwitcher() {
  const { lang, setLang, t } = useI18n()
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const current = LANGS.find((l) => l.id === lang) ?? LANGS[0]

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={wrapRef} className={`lang-switch${open ? ' is-open' : ''}`}>
      <button
        type="button"
        className="lang-switch__btn"
        aria-label={t('Язык')}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <Flag lang={current.id} />
        <span>{current.short}</span>
        <ChevronDown />
      </button>

      {open && (
        <ul className="lang-switch__menu" role="listbox" aria-label={t('Язык')}>
          {LANGS.map((l) => (
            <li key={l.id}>
              <button
                type="button"
                role="option"
                aria-selected={l.id === lang}
                className={`lang-switch__option${l.id === lang ? ' is-active' : ''}`}
                onClick={() => {
                  setLang(l.id)
                  setOpen(false)
                }}
              >
                <Flag lang={l.id} />
                <span className="lang-switch__name">{l.name}</span>
                {l.id === lang && <CheckIcon />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Flag({ lang }: { lang: Lang }) {
  return (
    <span className="lang-switch__flag" aria-hidden>
      {lang === 'ru' ? <FlagRU /> : <FlagGB />}
    </span>
  )
}

function FlagRU() {
  return (
    <svg viewBox="0 0 9 6" preserveAspectRatio="none">
      <rect width="9" height="2" fill="#fff" />
      <rect y="2" width="9" height="2" fill="#0039a6" />
      <rect y="4" width="9" height="2" fill="#d52b1e" />
    </svg>
  )
}

function FlagGB() {
  const id = `gb${useId().replace(/[^\w-]/g, '')}`
  return (
    <svg viewBox="0 0 60 30" preserveAspectRatio="xMidYMid slice">
      <clipPath id={id}>
        <path d="M30 15h30v15zv15H0zH0V0zV0h30z" />
      </clipPath>
      <rect width="60" height="30" fill="#012169" />
      <path d="M0 0l60 30m0-30L0 30" stroke="#fff" strokeWidth="6" />
      <path d="M0 0l60 30m0-30L0 30" stroke="#c8102e" strokeWidth="4" clipPath={`url(#${id})`} />
      <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10" />
      <path d="M30 0v30M0 15h60" stroke="#c8102e" strokeWidth="6" />
    </svg>
  )
}

function ChevronDown() {
  return (
    <svg className="lang-switch__chevron" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M3 4.5 6 7.5 9 4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg className="lang-switch__check" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M3.5 8.2 6.4 11l6.1-6.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

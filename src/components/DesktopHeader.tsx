import { useEffect, useRef, useState } from 'react'
import { catalogDepartments, type CatalogDepartment } from '../data/products'
import { useStore } from '../store'
import { useI18n } from '../i18n'
import { BrandLogo } from './BrandMark'
import { LanguageSwitcher } from './LanguageSwitcher'
import { UserAvatar } from './UserAvatar'

export function DesktopHeader() {
  const {
    tab,
    setTab,
    setSearch,
    setCatalogFilter,
    openBrands,
    cartCount,
    favorites,
    brandStack,
    selectedProductId,
  } = useStore()
  const { t } = useI18n()
  const [openMenu, setOpenMenu] = useState<CatalogDepartment['id'] | null>(null)
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!openMenu) return
    const onPointerDown = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setOpenMenu(null)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenMenu(null)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [openMenu])

  const go = (filter: string | null) => {
    setSearch('')
    setCatalogFilter(filter)
    setTab('catalog')
    setOpenMenu(null)
  }

  const catalogActive = tab === 'catalog' && brandStack.length === 0 && !selectedProductId

  return (
    <header className="desktop-header">
      <div className="desktop-header__inner">
        <button type="button" className="desktop-header__logo" onClick={() => setTab('home')}>
          <BrandLogo size={20} />
        </button>

        <nav className="desktop-header__nav" aria-label={t('Основная навигация')} ref={navRef}>
          <button
            type="button"
            className={`desktop-header__link ${brandStack.length > 0 ? 'is-active' : ''}`}
            onClick={() => {
              setOpenMenu(null)
              openBrands()
            }}
          >
            {t('Бренды')}
          </button>
          {catalogDepartments.map((dept) => (
            <div key={dept.id} className={`desktop-header__dept ${openMenu === dept.id ? 'is-open' : ''}`}>
              <button
                type="button"
                className="desktop-header__link desktop-header__dept-btn"
                aria-expanded={openMenu === dept.id}
                onClick={() => setOpenMenu((cur) => (cur === dept.id ? null : dept.id))}
              >
                {t(dept.label)}
                <ChevronDown />
              </button>
              {openMenu === dept.id && (
                <div className="desktop-header__menu" role="menu">
                  <button type="button" role="menuitem" onClick={() => go(dept.id)}>
                    {t('Все')}
                  </button>
                  {dept.categories.map((c) => (
                    <button key={c.id} type="button" role="menuitem" onClick={() => go(c.id)}>
                      {t(c.label)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          <button
            type="button"
            className={`desktop-header__catalog ${catalogActive ? 'is-active' : ''}`}
            onClick={() => {
              setOpenMenu(null)
              go('__browse__')
            }}
          >
            <GridIcon />
            {t('Каталог')}
          </button>
        </nav>

        <div className="desktop-header__tools">
          <LanguageSwitcher />
          <button
            type="button"
            className={`desktop-header__icon desktop-header__icon--user ${tab === 'profile' ? 'is-active' : ''}`}
            aria-label={t('Профиль')}
            onClick={() => setTab('profile')}
          >
            <UserAvatar size={34} />
          </button>
          <button
            type="button"
            className={`desktop-header__action ${tab === 'favorites' ? 'is-active' : ''}`}
            onClick={() => setTab('favorites')}
          >
            <span className="desktop-header__icon">
              <HeartIcon />
              {favorites.size > 0 && <span className="desktop-header__badge">{favorites.size}</span>}
            </span>
            <span className="desktop-header__action-label">{t('Избранное')}</span>
          </button>
          <button
            type="button"
            className={`desktop-header__action desktop-header__action--cart ${tab === 'cart' ? 'is-active' : ''}`}
            onClick={() => setTab('cart')}
          >
            <span className="desktop-header__icon desktop-header__icon--cart">
              <BagIcon />
              {cartCount > 0 && <span className="desktop-header__badge">{cartCount}</span>}
            </span>
            <span className="desktop-header__action-label">{t('Корзина')}</span>
          </button>
        </div>
      </div>
    </header>
  )
}

function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="3" width="7.5" height="7.5" rx="1.6" fill="currentColor" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.6" fill="currentColor" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.6" fill="currentColor" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.6" fill="currentColor" />
    </svg>
  )
}

function ChevronDown() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="M2.5 4.5 6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 20.5s-7-4.4-9.2-8.6A5 5 0 0 1 12 7.2a5 5 0 0 1 9.2 4.7C19 16.1 12 20.5 12 20.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  )
}

function BagIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6.5 8h11l-.8 11H7.3L6.5 8Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M9 8V6.8A3 3 0 0 1 12 3.8 3 3 0 0 1 15 6.8V8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

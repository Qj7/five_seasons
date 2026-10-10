import type { ReactNode } from 'react'
import { useStore, type Tab } from '../store'
import { UserAvatar } from './UserAvatar'
import { useI18n } from '../i18n'

const items: { id: Tab; label: string; icon: () => ReactNode }[] = [
  {
    id: 'home',
    label: 'Главная',
    icon: () => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5Z" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'catalog',
    label: 'Каталог',
    icon: () => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    id: 'favorites',
    label: 'Избранное',
    icon: () => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 21s-7-4.6-9.5-9A5.2 5.2 0 0 1 12 6.2 5.2 5.2 0 0 1 21.5 12C19 16.4 12 21 12 21z" />
      </svg>
    ),
  },
  {
    id: 'cart',
    label: 'Корзина',
    icon: () => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M6 7h15l-1.5 9H8L6 7Z" strokeLinejoin="round" />
        <path d="M6 7 5 3H2" strokeLinecap="round" />
        <circle cx="9" cy="20" r="1.2" fill="currentColor" stroke="none" />
        <circle cx="17" cy="20" r="1.2" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    id: 'profile',
    label: 'Профиль',
    icon: () => (
      <span className="nav-avatar">
        <UserAvatar size={24} />
      </span>
    ),
  },
]

export function BottomNav() {
  const { tab, setTab, cartCount, favorites } = useStore()
  const { t } = useI18n()

  return (
    <nav className="bottom-nav" aria-label={t('Основная навигация')}>
      {items.map((item) => {
        const active = tab === item.id
        return (
          <button
            key={item.id}
            type="button"
            className={`bottom-nav__item ${active ? 'is-active' : ''}`}
            onClick={() => setTab(item.id)}
          >
            <span className="bottom-nav__icon">
              {item.icon()}
              {item.id === 'cart' && cartCount > 0 && (
                <span className="bottom-nav__badge">{cartCount}</span>
              )}
              {item.id === 'favorites' && favorites.size > 0 && (
                <span className="bottom-nav__badge">{favorites.size}</span>
              )}
            </span>
            <span className="bottom-nav__label">{t(item.label)}</span>
          </button>
        )
      })}
    </nav>
  )
}

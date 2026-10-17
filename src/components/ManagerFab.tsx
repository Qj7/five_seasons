import { useAuth } from '../auth'
import { useStore } from '../store'
import { useI18n } from '../i18n'

/** Catalog-side shortcut for managers — primary place to add SKUs. */
export function ManagerFab() {
  const { isManager } = useAuth()
  const { tab, managerOpen, selectedProductId, brandStack, openManager } = useStore()
  const { t } = useI18n()

  if (!isManager) return null
  if (managerOpen || selectedProductId || brandStack.length > 0) return null
  if (tab !== 'catalog' && tab !== 'home') return null

  return (
    <button
      type="button"
      className="manager-fab"
      onClick={() => openManager('hub')}
      aria-label={t('Кабинет менеджера')}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 5v14M5 12h14"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>
      <span>{t('Кабинет')}</span>
    </button>
  )
}

import { useAuth } from '../auth'
import { formatPrice } from '../data/products'
import { useOrders, type OrderStatus } from '../orders'
import { useStore } from '../store'
import { useI18n } from '../i18n'

const STATUS_LABEL: Record<OrderStatus, string> = {
  new: 'Новый',
  processing: 'В работе',
  shipped: 'Отправлен',
  done: 'Завершён',
  cancelled: 'Отменён',
}

function BackChevron() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M15 6 9 12l6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function formatWhen(ts: number) {
  return new Date(ts).toLocaleString('ru-RU', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

type Props = {
  /** When set, only orders with this manager's SKUs. */
  managerId?: string
  onBack: () => void
}

export function OrdersPage({ managerId, onBack }: Props) {
  const { user, isManager } = useAuth()
  const { ordersForCustomer, ordersForManager, setOrderStatus } = useOrders()
  const { openProduct } = useStore()
  const { t } = useI18n()

  if (!user) {
    return (
      <div className="page">
        <header className="page-header page-header--with-back">
          <button type="button" className="catalog-back" onClick={onBack} aria-label={t('Назад')}>
            <BackChevron />
          </button>
          <h1>{t('Мои заказы')}</h1>
        </header>
        <div className="empty-state">
          <p>{t('Войдите, чтобы сохранять заказы.')}</p>
        </div>
      </div>
    )
  }

  const list = managerId
    ? ordersForManager(managerId)
    : ordersForCustomer(user.id)

  const title = managerId ? t('Заказы по моим товарам') : t('Мои заказы')

  return (
    <div className="page orders-page">
      <header className="page-header page-header--with-back">
        <button type="button" className="catalog-back" onClick={onBack} aria-label={t('Назад')}>
          <BackChevron />
        </button>
        <h1>{title}</h1>
      </header>

      {list.length === 0 ? (
        <div className="empty-state">
          <p>{t('Пока нет заказов')}</p>
          <span>
            {managerId
              ? t('Когда купят ваши товары, заказы появятся здесь.')
              : t('Оформите заказ в корзине — он появится в этом списке.')}
          </span>
        </div>
      ) : (
        <ul className="orders-list">
          {list.map((order) => (
            <li key={order.id} className="orders-card">
              <header className="orders-card__head">
                <div>
                  <strong>#{order.id.slice(-6).toUpperCase()}</strong>
                  <span>{formatWhen(order.createdAt)}</span>
                </div>
                {managerId && isManager ? (
                  <select
                    value={order.status}
                    aria-label={t('Статус')}
                    onChange={(e) => setOrderStatus(order.id, e.target.value as OrderStatus)}
                  >
                    {(Object.keys(STATUS_LABEL) as OrderStatus[]).map((s) => (
                      <option key={s} value={s}>
                        {t(STATUS_LABEL[s])}
                      </option>
                    ))}
                  </select>
                ) : (
                  <em className={`orders-card__status orders-card__status--${order.status}`}>
                    {t(STATUS_LABEL[order.status])}
                  </em>
                )}
              </header>

              {managerId ? (
                <p className="orders-card__buyer">
                  {order.customerName} · {order.customerEmail}
                </p>
              ) : null}

              <ul className="orders-card__items">
                {order.items
                  .filter((item) => !managerId || item.publishedBy === managerId)
                  .map((item) => (
                    <li key={`${order.id}-${item.productId}`}>
                      <button type="button" onClick={() => openProduct(item.productId)}>
                        <img src={item.image} alt="" />
                        <span>
                          <strong>{item.name}</strong>
                          <em>
                            {item.qty} × {formatPrice(item.price)}
                          </em>
                        </span>
                      </button>
                    </li>
                  ))}
              </ul>

              <footer className="orders-card__foot">
                <span>{t('Итого')}</span>
                <strong>{formatPrice(order.total)}</strong>
              </footer>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

import { formatPrice } from '../data/products'
import { useCatalog } from '../catalog'
import { useAuth } from '../auth'
import { useStore } from '../store'
import { ProductCard } from './ProductCard'
import { CrocVisual } from './CrocVisual'
import { UserAvatar } from './UserAvatar'
import { AuthForm } from './AuthForm'
import { useI18n } from '../i18n'

export function FavoritesPage() {
  const { favorites, setTab } = useStore()
  const { products } = useCatalog()
  const { t } = useI18n()
  const list = products.filter((p) => favorites.has(p.id))

  return (
    <div className="page">
      <header className="page-header">
        <h1>{t('Избранное')}</h1>
      </header>
      {list.length === 0 ? (
        <div className="empty-state">
          <p>{t('Пока пусто')}</p>
          <span>{t('Добавляйте Crocs и Jibbitz сердечком')}</span>
          <button type="button" className="btn-primary" onClick={() => setTab('catalog')}>
            {t('В каталог')}
          </button>
        </div>
      ) : (
        <div className="product-grid">
          {list.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}

export function CartPage() {
  const { cart, addToCart, removeFromCart, setTab, openProduct } = useStore()
  const { products } = useCatalog()
  const { t } = useI18n()
  const items = [...cart.entries()]
    .map(([id, qty]) => ({ product: products.find((p) => p.id === id)!, qty }))
    .filter((x) => x.product)

  const total = items.reduce((s, i) => s + i.product.price * i.qty, 0)
  const count = items.reduce((s, i) => s + i.qty, 0)

  let discount = 0
  if (count >= 4) discount = 600000
  else if (count >= 3) discount = 450000
  else if (count >= 2) discount = 300000

  return (
    <div className="page cart-page">
      <header className="page-header">
        <h1>{t('Корзина')}</h1>
      </header>

      {items.length === 0 ? (
        <div className="empty-state">
          <p>{t('Корзина пуста')}</p>
          <span>{t('Скидка до −600 000 ₫ при заказе нескольких пар')}</span>
          <button type="button" className="btn-primary" onClick={() => setTab('catalog')}>
            {t('Выбрать Crocs')}
          </button>
        </div>
      ) : (
        <>
          {discount > 0 && (
            <div className="cart-discount">
              {t('Скидка в корзине: −{amount}', { amount: formatPrice(discount) })}
            </div>
          )}
          <ul className="cart-list">
            {items.map(({ product, qty }) => (
              <li
                key={product.id}
                className="cart-item"
                role="button"
                tabIndex={0}
                onClick={() => openProduct(product.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    openProduct(product.id)
                  }
                }}
              >
                <div className="cart-item__img">
                  <CrocVisual product={product} />
                </div>
                <div className="cart-item__info">
                  <h3>{product.name}</h3>
                  <p>{formatPrice(product.price)}</p>
                  <div
                    className="cart-item__qty"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button type="button" onClick={() => removeFromCart(product.id)}>
                      −
                    </button>
                    <span>{qty}</span>
                    <button type="button" onClick={() => addToCart(product.id)}>
                      +
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="cart-footer">
            <div className="cart-footer__row">
              <span>{t('Итого')}</span>
              <strong>{formatPrice(total - discount)}</strong>
            </div>
            <button type="button" className="btn-primary btn-primary--block">
              {t('Оформить заказ')}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

const PROFILE_MENU = ['Мои заказы', 'Адреса доставки', 'Баллы и бонусы', 'Поддержка', 'О магазине']

export function ProfilePage() {
  const { t } = useI18n()
  const { user, isManager, logout } = useAuth()
  const { openManager } = useStore()

  if (!user) {
    return (
      <div className="page">
        <header className="page-header">
          <h1>{t('Профиль')}</h1>
        </header>
        <p className="profile-lead">
          {t('Войдите, чтобы сохранять заказы.')}
        </p>
        <AuthForm />
        <p className="profile-note">
          {t('Five Seasons — официальный ассортимент Classic Clog, BAPE × Crocs, Naruto × Crocs и Jibbitz.')}
        </p>
      </div>
    )
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>{t('Профиль')}</h1>
      </header>
      <div className="profile-card">
        <span className="profile-card__avatar">
          <UserAvatar size={48} label={user.name} />
        </span>
        <div>
          <h2>{user.name}</h2>
          <p>
            {isManager
              ? t('Менеджер · {email}', { email: user.email })
              : t('Покупатель · {email}', { email: user.email })}
          </p>
        </div>
      </div>

      {isManager ? (
        <button
          type="button"
          className="btn-primary btn-primary--block profile-publish-btn"
          onClick={openManager}
        >
          {t('Выложить товар')}
        </button>
      ) : null}

      <ul className="profile-menu">
        {PROFILE_MENU.map((item) => (
          <li key={item}>{t(item)}</li>
        ))}
      </ul>

      <button type="button" className="btn-secondary btn-secondary--block" onClick={logout}>
        {t('Выйти')}
      </button>

      <p className="profile-note">
        {t('Five Seasons — официальный ассортимент Classic Clog, BAPE × Crocs, Naruto × Crocs и Jibbitz.')}
      </p>
    </div>
  )
}

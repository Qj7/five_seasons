import { useState } from 'react'
import { formatPrice, unitPrice, type Product } from '../data/products'
import { resolveSizeOptions, sizeSystemFor } from '../data/sizes'
import { useCatalog } from '../catalog'
import { useAuth } from '../auth'
import { useOrders } from '../orders'
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

function needsSize(product: Product) {
  return product.modelGroup !== 'jibbitz' && sizeSystemFor(product.category) !== 'onesize'
}

export function CartPage() {
  const {
    cart,
    addToCart,
    removeFromCart,
    updateCartLine,
    clearCart,
    setTab,
    openProduct,
    openOrders,
  } = useStore()
  const { products } = useCatalog()
  const { user } = useAuth()
  const { placeOrder } = useOrders()
  const { t } = useI18n()
  const [checkoutMsg, setCheckoutMsg] = useState<string | null>(null)

  const items = cart
    .map((line) => ({
      line,
      product: products.find((p) => p.id === line.productId),
    }))
    .filter((row): row is { line: (typeof cart)[number]; product: Product } =>
      Boolean(row.product),
    )

  const total = items.reduce(
    (sum, row) => sum + unitPrice(row.product, row.line.delivery) * row.line.qty,
    0,
  )
  const count = items.reduce((sum, row) => sum + row.line.qty, 0)

  let discount = 0
  if (count >= 4) discount = 600000
  else if (count >= 3) discount = 450000
  else if (count >= 2) discount = 300000

  const checkout = async () => {
    if (!user) {
      setCheckoutMsg(t('Войдите, чтобы оформить заказ'))
      setTab('profile')
      return
    }
    if (items.some((row) => needsSize(row.product) && !row.line.size)) {
      setCheckoutMsg(t('Выберите размер для каждой позиции'))
      return
    }
    await placeOrder({
      customerId: user.id,
      customerName: user.name,
      customerEmail: user.email,
      items: items.map((row) => ({
        product: row.product,
        qty: row.line.qty,
        size: row.line.size || undefined,
        delivery: row.line.delivery,
        price: unitPrice(row.product, row.line.delivery),
      })),
      discount,
    })
    clearCart()
    setCheckoutMsg(null)
    openOrders()
  }

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
            {items.map(({ product, line }) => (
              <li
                key={`${product.id}-${line.size}-${line.delivery}`}
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
                  {needsSize(product) ? (
                    <label
                      className="cart-item__meta"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {t('Размер')}
                      <select
                        value={line.size}
                        onChange={(e) => updateCartLine(line, { size: e.target.value })}
                      >
                        <option value="">{t('Выберите размер')}</option>
                        {resolveSizeOptions(product.sizes).map((size) => (
                          <option key={size.eu} value={size.eu}>
                            {size.eu}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : null}
                  {line.delivery === 'express' ? (
                    <span className="cart-item__meta">{t('Экспресс')}</span>
                  ) : null}
                  <p>{formatPrice(unitPrice(product, line.delivery))}</p>
                  <div
                    className="cart-item__qty"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        removeFromCart(product.id, {
                          size: line.size,
                          delivery: line.delivery,
                        })
                      }
                    >
                      −
                    </button>
                    <span>{line.qty}</span>
                    <button
                      type="button"
                      onClick={() =>
                        addToCart(product.id, {
                          size: line.size,
                          delivery: line.delivery,
                        })
                      }
                    >
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
            {checkoutMsg ? <p className="auth-error">{checkoutMsg}</p> : null}
            <button type="button" className="btn-primary btn-primary--block" onClick={checkout}>
              {t('Оформить заказ')}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

const PROFILE_MENU = ['Адреса доставки', 'Баллы и бонусы', 'Поддержка', 'О магазине'] as const

export function ProfilePage() {
  const { t } = useI18n()
  const { user, isManager, logout } = useAuth()
  const { openManager, openOrders } = useStore()

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
          onClick={() => openManager('hub')}
        >
          {t('Кабинет менеджера')}
        </button>
      ) : null}

      <ul className="profile-menu">
        <li>
          <button type="button" className="profile-menu__btn" onClick={openOrders}>
            {t('Мои заказы')}
          </button>
        </li>
        {isManager ? (
          <li>
            <button
              type="button"
              className="profile-menu__btn"
              onClick={() => openManager('orders')}
            >
              {t('Заказы по моим товарам')}
            </button>
          </li>
        ) : null}
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

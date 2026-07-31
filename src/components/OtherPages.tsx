import { products, formatPrice } from '../data/products'
import { useStore } from '../store'
import { ProductCard } from './ProductCard'
import { CrocVisual } from './CrocVisual'

export function FavoritesPage() {
  const { favorites, setTab } = useStore()
  const list = products.filter((p) => favorites.has(p.id))

  return (
    <div className="page">
      <header className="page-header">
        <h1>Избранное</h1>
      </header>
      {list.length === 0 ? (
        <div className="empty-state">
          <p>Пока пусто</p>
          <span>Добавляйте Crocs и Jibbitz сердечком</span>
          <button type="button" className="btn-primary" onClick={() => setTab('catalog')}>
            В каталог
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
  const items = [...cart.entries()]
    .map(([id, qty]) => ({ product: products.find((p) => p.id === id)!, qty }))
    .filter((x) => x.product)

  const total = items.reduce((s, i) => s + i.product.price * i.qty, 0)
  const count = items.reduce((s, i) => s + i.qty, 0)

  let discount = 0
  if (count >= 4) discount = 2000
  else if (count >= 3) discount = 1500
  else if (count >= 2) discount = 1000

  return (
    <div className="page cart-page">
      <header className="page-header">
        <h1>Корзина</h1>
      </header>

      {items.length === 0 ? (
        <div className="empty-state">
          <p>Корзина пуста</p>
          <span>Скидка до −2 000 ₽ при заказе нескольких пар</span>
          <button type="button" className="btn-primary" onClick={() => setTab('catalog')}>
            Выбрать Crocs
          </button>
        </div>
      ) : (
        <>
          {discount > 0 && (
            <div className="cart-discount">
              Скидка в корзине: −{formatPrice(discount)}
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
              <span>Итого</span>
              <strong>{formatPrice(total - discount)}</strong>
            </div>
            <button type="button" className="btn-primary btn-primary--block">
              Оформить заказ
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export function ProfilePage() {
  return (
    <div className="page">
      <header className="page-header">
        <h1>Профиль</h1>
      </header>
      <div className="profile-card">
        <span className="profile-card__avatar">M</span>
        <div>
          <h2>Magic Shoes</h2>
          <p>Crocs · Jibbitz · Collabs</p>
        </div>
      </div>
      <ul className="profile-menu">
        <li>Мои заказы</li>
        <li>Адреса доставки</li>
        <li>Баллы и бонусы</li>
        <li>Поддержка</li>
        <li>О магазине</li>
      </ul>
      <p className="profile-note">
        Magic Shoes — официальный ассортимент Classic Clog, BAPE × Crocs, Naruto × Crocs и Jibbitz.
      </p>
    </div>
  )
}

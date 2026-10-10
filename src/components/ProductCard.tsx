import { formatPrice, type Product } from '../data/products'
import { useStore } from '../store'
import { useI18n } from '../i18n'
import { CrocVisual } from './CrocVisual'

export function ProductCard({ product }: { product: Product }) {
  const { favorites, toggleFavorite, addToCart, openProduct } = useStore()
  const { t } = useI18n()
  const liked = favorites.has(product.id)
  const price = formatPrice(product.price)

  return (
    <article
      className="product-card"
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
      <div className="product-card__media">
        {product.soldOut ? (
          <span className="product-card__badge">Sold out</span>
        ) : product.tag ? (
          <span className="product-card__badge product-card__badge--tag">
            {t(product.tag)}
          </span>
        ) : null}
        <button
          type="button"
          className={`product-card__heart ${liked ? 'is-liked' : ''}`}
          aria-label={t(liked ? 'Убрать из избранного' : 'В избранное')}
          onClick={(e) => {
            e.stopPropagation()
            toggleFavorite(product.id)
          }}
        >
          <HeartIcon filled={liked} />
        </button>
        <CrocVisual product={product} />
        <div className="product-card__dots" aria-hidden>
          <span className="is-active" />
          <span />
          <span />
        </div>
      </div>
      <div className="product-card__body">
        <p className="product-card__price">
          {product.fromPrice ? t('от {price}', { price }) : price}
        </p>
        <span className="product-card__split">
          {t('{price} × 2 в сплит', { price: formatPrice(Math.round(product.price / 2)) })}
        </span>
        <h3 className="product-card__name">{product.name}</h3>
        <p className="product-card__meta">
          {product.returnable ? (
            <span className="product-card__return">
              <DiamondIcon /> {t('Можно вернуть')}
            </span>
          ) : (
            t(product.delivery)
          )}
        </p>
        <button
          type="button"
          className={`product-card__add${product.soldOut ? ' is-disabled' : ''}`}
          disabled={product.soldOut}
          onClick={(e) => {
            e.stopPropagation()
            if (!product.soldOut) addToCart(product.id)
          }}
        >
          {product.soldOut ? 'Sold out' : t('В корзину')}
        </button>
      </div>
    </article>
  )
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? '#ff3b5c' : 'none'} stroke={filled ? '#ff3b5c' : '#222'} strokeWidth="1.8">
      <path d="M12 21s-7-4.6-9.5-9A5.2 5.2 0 0 1 12 6.2 5.2 5.2 0 0 1 21.5 12C19 16.4 12 21 12 21z" />
    </svg>
  )
}

function DiamondIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor">
      <path d="M6 0L12 6L6 12L0 6L6 0Z" />
    </svg>
  )
}

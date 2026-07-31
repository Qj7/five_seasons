import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import crocsLogo from '../assets/crocs-logo.png'
import {
  formatPrice,
  products,
  type Category,
  type Product,
} from '../data/products'
import { useStore } from '../store'

const SIZES = ['36', '37', '37,5', '38', '38,5', '39', '40', '41', '42', '43']

const CATEGORY_TAGS: Record<Category, string[]> = {
  classic: ['Обувь', 'Classic Clog', 'Crocs'],
  bape: ['Обувь', 'BAPE × Crocs', 'Collab'],
  naruto: ['Обувь', 'Naruto × Crocs', 'Аниме'],
  jibbitz: ['Аксессуары', 'Jibbitz', 'Украшения'],
  popular: ['Обувь', 'Хит', 'Crocs'],
  salehe: ['Обувь', 'Salehe Bembury', 'Collab'],
  cars: ['Обувь', 'Cars × Crocs', 'Collab'],
  pokemon: ['Обувь', 'Pokémon × Crocs', 'Collab'],
  harry: ['Обувь', 'Harry Potter', 'Collab'],
  spiderman: ['Обувь', 'Spider-Man', 'Marvel'],
  hellokitty: ['Обувь', 'Hello Kitty', 'Collab'],
  demonslayer: ['Обувь', 'Demon Slayer', 'Аниме'],
  sonic: ['Обувь', 'Sonic × Crocs', 'Collab'],
}

const FEATURES: Record<string, string> = {
  jibbitz: 'Съёмные, совместимы с Classic Clog, яркие дизайны',
  default:
    'Лёгкие, амортизируют удары, нескользящие, износостойкие, воздухопроницаемые',
}

function heroLines(product: Product): { mark: string; lines: string[] } {
  if (product.category === 'jibbitz') {
    return { mark: 'JIBBITZ', lines: product.name.replace(/^Jibbitz\s+/i, '').split(/\s+/).slice(0, 4) }
  }

  const mark = product.name.includes('×')
    ? product.name.split(/\s*×/)[0].trim().split(/\s+/)[0].toUpperCase()
    : 'CROCS'

  const rest = product.name
    .replace(/^[^×]+×\s*Crocs\s*/i, '')
    .replace(/^Crocs\s+/i, '')
    .trim()

  // One word per line — like the NB reference stack
  const lines = rest.split(/\s+/).filter(Boolean).slice(0, 5)
  return { mark, lines: lines.length ? lines : [product.name] }
}

const REVIEWS = [
  {
    user: 'masha_k',
    when: '2 месяца назад',
    pros: 'Очень удобные, цвет как на фото.',
    cons: 'Нет',
    comment: 'Беру уже вторую пару — супер на каждый день.',
  },
  {
    user: 'alex',
    when: 'в прошлом году',
    pros: 'Лёгкие и яркие, сидят отлично.',
    cons: 'Популярная модель',
    comment: 'Jibbitz сверху — огонь. Рекомендую размер как обычно.',
  },
]

export function ProductPage({ productId }: { productId: string }) {
  const { closeProduct, favorites, toggleFavorite, addToCart } = useStore()
  const product = products.find((p) => p.id === productId)
  const [size, setSize] = useState('37')
  const [delivery, setDelivery] = useState<'standard' | 'express'>('standard')

  useEffect(() => {
    const main = document.querySelector('.app-main')
    main?.scrollTo({ top: 0 })
  }, [productId])

  const liked = product ? favorites.has(product.id) : false
  const { mark, lines } = useMemo(
    () => (product ? heroLines(product) : { mark: '', lines: [] }),
    [product],
  )

  if (!product) {
    return (
      <div className="page">
        <p>Товар не найден</p>
        <button type="button" className="btn-primary" onClick={closeProduct}>
          Назад
        </button>
      </div>
    )
  }

  const tags = CATEGORY_TAGS[product.category] ?? ['Обувь', 'Crocs']
  const features = FEATURES[product.category] ?? FEATURES.default
  const sku = product.id.replace(/-/g, '').toUpperCase()
  const expressPrice = Math.round(product.price * 1.35)
  const buyPrice = delivery === 'express' ? expressPrice : product.price
  const isJibbitz = product.category === 'jibbitz'

  return (
    <div className="pdp">
      <section className="pdp-hero">
        <div className="pdp__topbar">
          <button
            type="button"
            className="pdp__back"
            aria-label="Назад"
            onClick={closeProduct}
          >
            <BackIcon />
          </button>
          <p className="pdp__brand logo">MAGIC SHOES</p>
        </div>

        <div className="pdp-hero__title" aria-hidden="true">
          <img
            className="pdp-hero__logo"
            src={crocsLogo}
            alt=""
            draggable={false}
          />
          <span className="pdp-hero__kind">
            {product.tag === 'Collab' ? 'collab' : 'Origin'}
          </span>
          <span className="pdp-hero__mark">{mark}</span>
          {lines.map((line, i) => (
            <span key={i} className="pdp-hero__line">
              {line}
            </span>
          ))}
        </div>

        <div className="pdp-hero__shoe" aria-hidden="true">
          <div className="pdp-hero__shoe-shift">
            <div className="pdp-hero__shoe-spin">
              <img
                src={`${product.image}?cut=1`}
                alt=""
                draggable={false}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Photo strip + original / actions */}
      <section className="pdp-panel">
        <div className="pdp-gallery">
          <img src={product.image} alt="" />
        </div>

        <div className="pdp-toolbar">
          <div className="pdp-original">
            <CheckIcon />
            <span>Оригинал</span>
            <InfoIcon />
          </div>
          <div className="pdp-toolbar__actions">
            <button type="button" aria-label="Поделиться">
              <ShareIcon />
            </button>
            <button
              type="button"
              aria-label={liked ? 'Убрать из избранного' : 'В избранное'}
              className={liked ? 'is-liked' : ''}
              onClick={() => toggleFavorite(product.id)}
            >
              <HeartIcon filled={liked} />
            </button>
          </div>
        </div>

        <div className="pdp-tags">
          {tags.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>

        <div className="pdp-specs">
          <div>
            <h4>Артикул</h4>
            <p>{sku}</p>
          </div>
          <div>
            <h4>Особенности</h4>
            <p>{features}</p>
          </div>
          <div>
            <h4>Посадка</h4>
            <p>{isJibbitz ? 'Универсальная' : 'Унисекс'}</p>
          </div>
        </div>

        {!isJibbitz && (
          <div className="pdp-sizes">
            <span className="pdp-sizes__label">EU</span>
            <div className="pdp-sizes__track">
              {SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={size === s ? 'is-active' : ''}
                  onClick={() => setSize(s)}
                >
                  {s}
                </button>
              ))}
            </div>
            <ChevronDown />
          </div>
        )}

        <div className="pdp-links">
          {!isJibbitz && (
            <a href="#size-guide" onClick={(e) => e.preventDefault()}>
              <RulerIcon /> Как определить размер обуви
            </a>
          )}
          {product.returnable && (
            <a href="#returns" onClick={(e) => e.preventDefault()}>
              <DiamondIcon /> Этот товар можно вернуть, если он вам не подойдет.
              Как вернуть товар?
            </a>
          )}
        </div>

        <div className="pdp-delivery">
          <button
            type="button"
            className={delivery === 'standard' ? 'is-active' : ''}
            onClick={() => setDelivery('standard')}
          >
            <strong>{formatPrice(product.price)}</strong>
            <span>{product.delivery}</span>
          </button>
          <button
            type="button"
            className={delivery === 'express' ? 'is-active' : ''}
            onClick={() => setDelivery('express')}
          >
            <strong>{formatPrice(expressPrice)}</strong>
            <span>Сегодня или завтра</span>
          </button>
        </div>

        <p className="pdp-note">
          Доставка в Москву. Товар проходит таможню — сроки могут чуть сдвинуться.{' '}
          <button type="button">Подробнее</button>
        </p>
      </section>

      <section className="pdp-panel pdp-panel--flush">
        <div className="pdp-photo">
          <img src={product.image} alt={product.name} />
        </div>
      </section>

      <section className="pdp-panel">
        <div className="pdp-guarantee">
          <div className="pdp-guarantee__check">
            <CheckBig />
          </div>
          <h3>Тройная гарантия оригинальности</h3>
          <p>
            Товар сертифицирован и опломбирован, проверен по 16 параметрам. Если
            получите подделку — тройной возврат денег.
          </p>
          <button type="button">
            Как мы проверяем товары <ChevronRight />
          </button>
        </div>
      </section>

      <section className="pdp-panel">
        <button type="button" className="pdp-reviews__head">
          <span>Отзывы на этот товар</span>
          <ChevronRight />
        </button>
        <div className="pdp-reviews__score">
          <strong>4.9</strong>
          <div>
            <div className="pdp-stars" aria-hidden>
              {'★★★★★'}
            </div>
            <p>392 оценки · 141 отзыв</p>
          </div>
        </div>

        <div className="pdp-reviews__photos">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="pdp-reviews__thumb">
              <img src={product.image} alt="" style={{ objectPosition: `${i * 20}% center` }} />
            </div>
          ))}
        </div>

        <div className="pdp-reviews__cards">
          {REVIEWS.map((r) => (
            <article key={r.user} className="pdp-review">
              <header>
                <span className="pdp-review__avatar">{r.user[0].toUpperCase()}</span>
                <div>
                  <strong>{r.user}</strong>
                  <span>{r.when}</span>
                </div>
              </header>
              <div className="pdp-stars pdp-stars--sm">{'★★★★★'}</div>
              <p>
                <b>Достоинства:</b> {r.pros}
              </p>
              <p>
                <b>Недостатки:</b> {r.cons}
              </p>
              <p>
                <b>Комментарий:</b> {r.comment}
              </p>
            </article>
          ))}
        </div>

        <button type="button" className="pdp-brand-reviews">
          Отзывы на Crocs <ChevronRight />
        </button>
      </section>

      <div className="pdp-spacer" aria-hidden />

      {createPortal(
        <div className="pdp-buybar pdp-buybar--sticky">
          <button
            type="button"
            className="pdp-buybar__cart"
            onClick={() => addToCart(product.id)}
          >
            В корзину
          </button>
          <button
            type="button"
            className="pdp-buybar__buy"
            onClick={() => addToCart(product.id)}
          >
            Купить {formatPrice(buyPrice)}
          </button>
        </div>,
        document.querySelector('.app-shell') ?? document.body,
      )}
    </div>
  )
}

function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M15 18 9 12l6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="8" fill="#22c55e" />
      <path d="M4.5 8.2 6.8 10.5 11.5 5.5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#9ca3af" strokeWidth="1.4">
      <circle cx="8" cy="8" r="6.5" />
      <path d="M8 7.2v4M8 5.2h.01" strokeLinecap="round" />
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3v12M8 7l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" strokeLinecap="round" />
    </svg>
  )
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? '#ff3b5c' : 'none'} stroke={filled ? '#ff3b5c' : 'currentColor'} strokeWidth="1.8">
      <path d="M12 21s-7-4.6-9.5-9A5.2 5.2 0 0 1 12 6.2 5.2 5.2 0 0 1 21.5 12C19 16.4 12 21 12 21z" />
    </svg>
  )
}

function ChevronDown() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2">
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function RulerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="8" width="18" height="8" rx="1.5" />
      <path d="M7 8v3M11 8v2M15 8v3M19 8v2" strokeLinecap="round" />
    </svg>
  )
}

function DiamondIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 12 12" fill="currentColor">
      <path d="M6 0L12 6L6 12L0 6L6 0Z" />
    </svg>
  )
}

function CheckBig() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#fff" strokeWidth="2.2">
      <circle cx="14" cy="14" r="12" />
      <path d="m8.5 14.5 3.5 3.5 7.5-8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

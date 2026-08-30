import { useState } from 'react'
import {
  bestsellers,
  collabCollections,
  collections,
  narutoSeries,
  products,
  top20,
} from '../data/products'
import { useStore } from '../store'
import { ProductCard } from './ProductCard'
import { CrocVisual } from './CrocVisual'

function productById(id: string) {
  return products.find((p) => p.id === id)
}

const categoryChips = [
  { id: 'salehe', name: 'Salehe Bembury', sampleId: 'salehe-green' },
  { id: 'cars', name: 'Lightning McQueen', sampleId: 'cars-1' },
  { id: 'characters', name: 'Characters', sampleId: 'char-peanut' },
  { id: 'minecraft', name: 'Minecraft', sampleId: 'minecraft-green' },
  { id: 'spongebob', name: 'SpongeBob', sampleId: 'spongebob-1' },
  { id: 'bape', name: 'BAPE', sampleId: 'bape-pink' },
  { id: 'naruto', name: 'Naruto', sampleId: 'naruto-1' },
  { id: 'exclusive', name: 'Exclusive', sampleId: 'excl-mint' },
  { id: 'classic', name: 'Classic', sampleId: 'classic-white' },
]

export function HomePage() {
  const { setTab, setCatalogFilter, search, setSearch, openProduct } = useStore()
  const [banner, setBanner] = useState(0)

  const openCatalog = (filter: string | null) => {
    setSearch('')
    setCatalogFilter(filter)
    setTab('catalog')
  }

  const justBought = ['salehe-green', 'cars-1', 'minecraft-green', 'spongebob-1']
    .map(productById)
    .filter((p): p is NonNullable<typeof p> => Boolean(p))

  const bannerSlides = [
    {
      filter: 'salehe',
      eyebrow: 'FASHION DROP',
      title: 'SALEHE POLLEX',
      desc: 'Salehe Bembury × Crocs — культовый Pollex Clog',
      cta: 'Смотреть Salehe',
      productId: 'salehe-black-grey',
      theme: 'pink' as const,
    },
    {
      filter: 'cars',
      eyebrow: 'PIXAR CARS',
      title: 'MCQUEEN',
      desc: 'Lightning McQueen и Mater — в наличии',
      cta: 'Смотреть Cars',
      productId: 'cars-1',
      theme: 'orange' as const,
    },
    {
      filter: 'minecraft',
      eyebrow: 'GAMING',
      title: 'MINECRAFT × CROCS',
      desc: 'Creeper и блоки — для фанатов игры',
      cta: 'Выбрать Minecraft',
      productId: 'minecraft-green',
      theme: 'naruto' as const,
    },
  ]

  const slide = bannerSlides[banner]
  const bannerProduct = productById(slide.productId)

  return (
    <div className="page home">
      <header className="home-header">
        <h1 className="logo">MAGIC SHOES</h1>
        <label className="search">
          <SearchIcon />
          <input
            type="search"
            placeholder="Найти Crocs или Jibbitz"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') openCatalog(null)
            }}
          />
        </label>
      </header>

      <section className="hero-banners">
        <div
          className={`hero-banner hero-banner--${slide.theme}`}
          data-slide={banner}
          onClick={() => bannerProduct && openProduct(bannerProduct.id)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) =>
            e.key === 'Enter' && bannerProduct && openProduct(bannerProduct.id)
          }
        >
          <div className="hero-banner__text">
            <p className="hero-banner__eyebrow">{slide.eyebrow}</p>
            <h2>{slide.title}</h2>
            <p className="hero-banner__desc">{slide.desc}</p>
            <span className="hero-banner__cta">{slide.cta}</span>
          </div>
          <div className="hero-banner__visual">
            {bannerProduct && <CrocVisual product={bannerProduct} tall />}
          </div>
        </div>
        <div className="hero-dots">
          {bannerSlides.map((_, i) => (
            <button
              key={i}
              type="button"
              className={banner === i ? 'is-active' : ''}
              aria-label={`Баннер ${i + 1}`}
              onClick={() => setBanner(i)}
            />
          ))}
        </div>
      </section>

      <section className="action-grid">
        <div className="action-stack">
          <div className="action-card action-card--points">
            <span className="action-card__label">Баллы</span>
            <span className="action-card__value">
              0 <PointsIcon />
            </span>
          </div>
          <button
            type="button"
            className="action-card action-card--site"
            onClick={() => openCatalog(null)}
          >
            <span className="action-card__label">
              Сайт Magic Shoes <Chevron />
            </span>
            <span className="action-card__hint">Выбрать и заказать на сайте</span>
          </button>
        </div>
        <button
          type="button"
          className="action-card action-card--order"
          onClick={() => openCatalog(null)}
        >
          <span className="action-card__order-title">Выбрать и заказать</span>
          <span className="action-card__arrow">
            <ArrowRight />
          </span>
        </button>
      </section>

      <section className="promo-discount" onClick={() => setTab('cart')} role="button" tabIndex={0}>
        <div className="promo-discount__text">
          <h2>Скидки в корзине!</h2>
          <ul>
            <li>−300 000 ₫ на вторые</li>
            <li>−450 000 ₫ на третьи</li>
            <li>−600 000 ₫ на четвёртые</li>
          </ul>
        </div>
        <div className="promo-discount__art" aria-hidden>
          <img
            src={`${import.meta.env.BASE_URL}brands/bape-ape.png`}
            alt=""
            className="promo-discount__logo promo-discount__logo--ape"
          />
          {productById('bape-purple') && (
            <CrocVisual product={productById('bape-purple')!} />
          )}
        </div>
      </section>

      <section className="section">
        <div className="section__head">
          <h2>Коллекции</h2>
          <button type="button" className="section__all" onClick={() => openCatalog(null)}>
            Все <Chevron />
          </button>
        </div>
        <div className="brand-row">
          {collections.map((c) => {
            const sample = products.find((p) => p.category === c.id)
            if (!sample) return null
            return (
              <button
                key={c.id}
                type="button"
                className="brand-card"
                onClick={() => openCatalog(c.id)}
              >
                <div className="brand-card__logo">
                  <CrocVisual product={sample} />
                </div>
                <span>{c.name}</span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="section">
        <div className="section__head section__head--stack">
          <div>
            <h2>Новые коллабы</h2>
            <p className="section__sub">
              Salehe, Cars, Characters, Minecraft, SpongeBob, Simpsons и South Park
            </p>
          </div>
          <button type="button" className="section__all" onClick={() => openCatalog(null)}>
            Все <Chevron />
          </button>
        </div>
        <div className="brand-row">
          {collabCollections.map((c) => {
            const sample = products.find((p) => p.category === c.id)
            if (!sample) return null
            return (
              <button
                key={c.id}
                type="button"
                className="brand-card"
                onClick={() => openCatalog(c.id)}
              >
                <div className="brand-card__logo">
                  <CrocVisual product={sample} />
                </div>
                <span>{c.name}</span>
              </button>
            )
          })}
        </div>
        <div className="product-grid" style={{ marginTop: 16 }}>
          {[
            'salehe-green',
            'cars-1',
            'char-peanut',
            'minecraft-green',
            'spongebob-1',
            'simpsons-1',
            'bape-pink',
            'naruto-1',
          ]
            .map(productById)
            .filter((p): p is NonNullable<typeof p> => Boolean(p))
            .map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
        </div>
      </section>

      <section className="section">
        <div className="section__head section__head--stack">
          <div>
            <h2>Naruto × Crocs — вся серия</h2>
            <p className="section__sub">
              Naruto, Kakashi, Sasuke, Itachi, Minato и Jiraiya
            </p>
          </div>
          <button type="button" className="section__all" onClick={() => openCatalog('naruto')}>
            Все <Chevron />
          </button>
        </div>
        <div className="product-grid">
          {narutoSeries.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section__head">
          <h2>Бестселлеры</h2>
          <button type="button" className="section__all" onClick={() => openCatalog('popular')}>
            Все <Chevron />
          </button>
        </div>
        <div className="product-grid">
          {bestsellers.slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="chips-row" aria-label="Категории">
        {categoryChips.map((c) => {
          const sample = productById(c.sampleId)
          if (!sample) return null
          return (
            <button
              key={c.id}
              type="button"
              className="chip"
              onClick={() => openCatalog(c.id)}
            >
              <span className="chip__img">
                <CrocVisual product={sample} />
              </span>
              <span>{c.name}</span>
            </button>
          )
        })}
      </section>

      <section className="section">
        <div className="section__head">
          <h2>Только что купили</h2>
          <button type="button" className="section__all" onClick={() => openCatalog(null)}>
            Все <Chevron />
          </button>
        </div>
        <div className="product-grid">
          {justBought.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section__head section__head--stack">
          <div>
            <h2>Топ 20 популярных</h2>
            <p className="section__sub">В наличии — самовывоз или доставка 1–2 дня</p>
          </div>
          <button type="button" className="section__all" onClick={() => openCatalog('popular')}>
            Все <Chevron />
          </button>
        </div>
        <div className="product-grid">
          {top20.slice(0, 6).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="curated">
        <h2>Актуальные подборки</h2>
        <p>
          Salehe Bembury, Lightning McQueen, Characters, Minecraft, SpongeBob,
          Simpsons и South Park — собрали главные дропы.
        </p>
        <button type="button" onClick={() => openCatalog('salehe')}>
          Открыть коллабы
        </button>
      </section>
    </div>
  )
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  )
}

function Chevron() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 2l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PointsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="url(#pg)" />
      <text x="12" y="16" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700" fontFamily="Syne,sans-serif">
        M
      </text>
      <defs>
        <linearGradient id="pg" x1="0" y1="0" x2="24" y2="24">
          <stop stopColor="#ff6b9d" />
          <stop offset="1" stopColor="#76ba0f" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function ArrowRight() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#76ba0f" strokeWidth="2.4">
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

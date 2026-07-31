import { useState } from 'react'
import {
  bestsellers,
  collabCollections,
  collections,
  narutoSeries,
  products,
  top20,
  type Category,
} from '../data/products'
import { useStore } from '../store'
import { ProductCard } from './ProductCard'
import { CrocVisual } from './CrocVisual'

const stories = [
  {
    id: 'salehe',
    title: 'Salehe',
    subtitle: 'Pollex',
    bg: 'linear-gradient(145deg, #0d7377 0%, #2ec4b6 60%, #14919b 100%)',
    filter: 'salehe' as Category,
  },
  {
    id: 'cars',
    title: 'McQueen',
    subtitle: 'Cars',
    bg: 'linear-gradient(145deg, #e10600 0%, #ff4d00 50%, #ffd100 100%)',
    filter: 'cars' as Category,
  },
  {
    id: 'pokemon',
    title: 'Pokémon',
    subtitle: 'Charizard',
    bg: 'linear-gradient(145deg, #f26522 0%, #ff8c42 50%, #1a1a1a 100%)',
    filter: 'pokemon' as Category,
  },
  {
    id: 'spiderman',
    title: 'Spider-Man',
    subtitle: 'Marvel',
    bg: 'linear-gradient(145deg, #e10600 0%, #0051ba 100%)',
    filter: 'spiderman' as Category,
  },
  {
    id: 'sonic',
    title: 'Sonic',
    subtitle: 'Blue blur',
    bg: 'linear-gradient(145deg, #0066cc 0%, #00a0e3 50%, #e10600 100%)',
    filter: 'sonic' as Category,
  },
  {
    id: 'demon',
    title: 'Demon Slayer',
    subtitle: 'Tanjiro',
    bg: 'linear-gradient(145deg, #1a3a3a 0%, #2d6b5a 50%, #0a1a1a 100%)',
    filter: 'demonslayer' as Category,
  },
  {
    id: 'harry',
    title: 'Harry Potter',
    subtitle: 'Wizarding',
    bg: 'linear-gradient(145deg, #740001 0%, #d3a625 100%)',
    filter: 'harry' as Category,
  },
  {
    id: 'kitty',
    title: 'Hello Kitty',
    subtitle: 'Sanrio',
    bg: 'linear-gradient(145deg, #ffb6c1 0%, #ff85a2 50%, #fff0f5 100%)',
    filter: 'hellokitty' as Category,
  },
  {
    id: 'bape-pink',
    title: 'BAPE Pink',
    subtitle: 'ABC Camo',
    bg: 'linear-gradient(145deg, #f5a0c8 0%, #e87aad 50%, #c45a8c 100%)',
    filter: 'bape' as Category,
  },
  {
    id: 'naruto',
    title: 'Naruto',
    subtitle: 'Вся серия',
    bg: 'linear-gradient(145deg, #f26522 0%, #ff8c42 50%, #1e3a5f 100%)',
    filter: 'naruto' as Category,
  },
]

const categoryChips = [
  { id: 'salehe', name: 'Salehe Bembury', sample: products.find((p) => p.id === 'salehe-1')! },
  { id: 'cars', name: 'Lightning McQueen', sample: products.find((p) => p.id === 'cars-1')! },
  { id: 'pokemon', name: 'Pokémon', sample: products.find((p) => p.id === 'poke-1')! },
  { id: 'spiderman', name: 'Spider-Man', sample: products.find((p) => p.id === 'spider-1')! },
  { id: 'sonic', name: 'Sonic', sample: products.find((p) => p.id === 'sonic-1')! },
  { id: 'demonslayer', name: 'Demon Slayer', sample: products.find((p) => p.id === 'demon-1')! },
  { id: 'harry', name: 'Harry Potter', sample: products.find((p) => p.id === 'harry-1')! },
  { id: 'hellokitty', name: 'Hello Kitty', sample: products.find((p) => p.id === 'kitty-1')! },
]

const looks = [
  {
    id: 'look-salehe',
    title: 'Salehe Pollex',
    likes: 210,
    shares: 64,
    product: products.find((p) => p.id === 'salehe-1')!,
  },
  {
    id: 'look-mcqueen',
    title: 'Lightning McQueen',
    likes: 188,
    shares: 51,
    product: products.find((p) => p.id === 'cars-1')!,
  },
  {
    id: 'look-sonic',
    title: 'Sonic the Hedgehog',
    likes: 142,
    shares: 33,
    product: products.find((p) => p.id === 'sonic-1')!,
  },
  {
    id: 'look-demon',
    title: 'Demon Slayer Tanjiro',
    likes: 167,
    shares: 40,
    product: products.find((p) => p.id === 'demon-1')!,
  },
]

export function HomePage() {
  const { setTab, setCatalogFilter, search, setSearch, openProduct } = useStore()
  const [banner, setBanner] = useState(0)

  const openCatalog = (filter: string | null) => {
    setCatalogFilter(filter)
    setTab('catalog')
  }

  const justBought = [
    products.find((p) => p.id === 'salehe-1')!,
    products.find((p) => p.id === 'cars-1')!,
    products.find((p) => p.id === 'sonic-1')!,
    products.find((p) => p.id === 'poke-1')!,
  ]

  const bannerSlides = [
    {
      filter: 'salehe',
      eyebrow: 'FASHION DROP',
      title: 'SALEHE POLLEX',
      desc: 'Salehe Bembury × Crocs — культовый Pollex Clog',
      cta: 'Смотреть Salehe',
      productId: 'salehe-1',
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
      filter: 'sonic',
      eyebrow: 'GAMING',
      title: 'SONIC × CROCS',
      desc: 'Sonic и Shadow — синий блюр на ногах',
      cta: 'Выбрать Sonic',
      productId: 'sonic-1',
      theme: 'naruto' as const,
    },
  ]

  const slide = bannerSlides[banner]

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

      <section className="stories" aria-label="Подборки">
        {stories.map((s) => (
          <button
            key={s.id}
            type="button"
            className="story"
            style={{ background: s.bg }}
            onClick={() => openCatalog(s.filter)}
          >
            <span className="story__title">{s.title}</span>
            <span className="story__sub">{s.subtitle}</span>
            {s.id === 'salehe' && <span className="story__deco story__deco--dots" />}
            {s.id === 'cars' && <span className="story__deco story__deco--sale">95</span>}
            {s.id === 'pokemon' && <span className="story__deco story__deco--leaf" />}
            {s.id === 'spiderman' && <span className="story__deco story__deco--num">S</span>}
            {s.id === 'sonic' && <span className="story__deco story__deco--num">S</span>}
            {s.id === 'demon' && <span className="story__deco story__deco--camo" />}
            {s.id === 'harry' && <span className="story__deco story__deco--num">H</span>}
            {s.id === 'kitty' && <span className="story__deco story__deco--dots" />}
            {s.id === 'bape-pink' && <span className="story__deco story__deco--camo" />}
            {s.id === 'naruto' && <span className="story__deco story__deco--leaf" />}
          </button>
        ))}
      </section>

      <section className="hero-banners">
        <div
          className={`hero-banner hero-banner--${slide.theme}`}
          data-slide={banner}
          onClick={() => openProduct(slide.productId)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && openProduct(slide.productId)}
        >
          <div className="hero-banner__text">
            <p className="hero-banner__eyebrow">{slide.eyebrow}</p>
            <h2>{slide.title}</h2>
            <p className="hero-banner__desc">{slide.desc}</p>
            <span className="hero-banner__cta">{slide.cta}</span>
          </div>
          <div className="hero-banner__visual">
            <CrocVisual product={products.find((p) => p.id === slide.productId)!} tall />
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
            <li>−1 000 ₽ на вторые</li>
            <li>−1 500 ₽ на третьи</li>
            <li>−2 000 ₽ на четвёртые</li>
          </ul>
        </div>
        <div className="promo-discount__art" aria-hidden>
          <CrocVisual product={products.find((p) => p.id === 'bape-3')!} />
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
            const sample = products.find((p) => p.category === c.id)!
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
              Salehe, Cars, Pokémon, Harry Potter, Spider-Man, Hello Kitty, Demon Slayer, Sonic
            </p>
          </div>
          <button type="button" className="section__all" onClick={() => openCatalog(null)}>
            Все <Chevron />
          </button>
        </div>
        <div className="brand-row">
          {collabCollections.map((c) => {
            const sample = products.find((p) => p.category === c.id)!
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
            'salehe-1',
            'cars-1',
            'poke-1',
            'harry-1',
            'spider-1',
            'kitty-1',
            'demon-1',
            'sonic-1',
          ].map((id) => (
            <ProductCard key={id} product={products.find((p) => p.id === id)!} />
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
        {categoryChips.map((c) => (
          <button
            key={c.id}
            type="button"
            className="chip"
            onClick={() => openCatalog(c.id)}
          >
            <span className="chip__img">
              <CrocVisual product={c.sample} />
            </span>
            <span>{c.name}</span>
          </button>
        ))}
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

      <section className="section looks-section">
        <p className="looks-intro">
          Salehe, McQueen, Sonic и Demon Slayer — свежие коллабы Magic Shoes
        </p>
        <div className="looks-row">
          {looks.map((look) => (
            <article
              key={look.id}
              className="look-card"
              role="button"
              tabIndex={0}
              onClick={() => openProduct(look.product.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  openProduct(look.product.id)
                }
              }}
            >
              <CrocVisual product={look.product} tall />
              <div className="look-card__overlay">
                <h3>{look.title}</h3>
                <div className="look-card__stats">
                  <span>
                    <HeartMini /> {look.likes}
                  </span>
                  <span>
                    <ShareMini /> {look.shares}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
        <button type="button" className="looks-all" onClick={() => openCatalog('naruto')}>
          Смотреть все
        </button>
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
          Salehe Bembury, Lightning McQueen, Pokémon, Harry Potter, Spider-Man, Hello Kitty,
          Demon Slayer и Sonic — собрали главные дропы.
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

function HeartMini() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff" stroke="#fff" strokeWidth="1">
      <path d="M12 21s-7-4.6-9.5-9A5.2 5.2 0 0 1 12 6.2 5.2 5.2 0 0 1 21.5 12C19 16.4 12 21 12 21z" />
    </svg>
  )
}

function ShareMini() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
      <path d="M22 2 11 13" strokeLinecap="round" />
      <path d="M22 2 15 22l-4-9-9-4 20-7Z" strokeLinejoin="round" />
    </svg>
  )
}

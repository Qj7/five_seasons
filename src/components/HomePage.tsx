import { useState } from 'react'
import {
  bestsellers,
  collabCollections,
  collections,
  narutoSeries,
  products,
  top20,
} from '../data/products'
import {
  brandBySlug,
  brands,
  featuredBrandSlugs,
  type Brand,
  type BrandGroup,
} from '../data/brands'
import { useStore } from '../store'
import { ProductCard } from './ProductCard'
import { CrocVisual } from './CrocVisual'
import { BrandTile } from './BrandsPage'
import { BrandLogo, BrandMark } from './BrandMark'
import { LanguageSwitcher } from './LanguageSwitcher'
import { useI18n } from '../i18n'

function productById(id: string) {
  return products.find((p) => p.id === id)
}

const featuredBrands = featuredBrandSlugs
  .map(brandBySlug)
  .filter((b): b is Brand => Boolean(b))

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
  const { setTab, setCatalogFilter, search, setSearch, openBrands } = useStore()
  const { t } = useI18n()
  const [banner, setBanner] = useState(0)

  const openCatalog = (filter: string | null) => {
    setSearch('')
    setCatalogFilter(filter)
    setTab('catalog')
  }

  const justBought = ['salehe-green', 'cars-1', 'minecraft-green', 'spongebob-1']
    .map(productById)
    .filter((p): p is NonNullable<typeof p> => Boolean(p))

  const bannerSlides: {
    eyebrow: string
    title: string
    desc: string
    cta: string
    group?: BrandGroup
    logos: string[]
    theme: 'fire' | 'sand' | 'night'
  }[] = [
    {
      eyebrow: 'НОВЫЙ СЕЗОН',
      title: '99 БРЕНДОВ',
      desc: 'Обувь, одежда и аксессуары — только оригиналы',
      cta: 'Смотреть бренды',
      logos: ['nike', 'adidas', 'new-balance', 'jordan'],
      theme: 'fire',
    },
    {
      eyebrow: 'STREETWEAR',
      title: 'ОДЕЖДА',
      desc: 'Stone Island, Supreme, Stüssy и The North Face',
      cta: 'Выбрать одежду',
      group: 'clothing',
      logos: ['stone-island', 'supreme', 'stussy', 'the-north-face'],
      theme: 'sand',
    },
    {
      eyebrow: 'PREMIUM',
      title: 'ЛЮКС',
      desc: 'Prada, Gucci, Dior и Balenciaga — с доставкой',
      cta: 'Смотреть люкс',
      group: 'luxury',
      logos: ['prada', 'gucci', 'dior', 'balenciaga'],
      theme: 'night',
    },
  ]

  const slide = bannerSlides[banner]
  const slideLogos = slide.logos
    .map(brandBySlug)
    .filter((b): b is Brand => Boolean(b))

  return (
    <div className="page home">
      <header className="home-header">
        <div className="home-header__top">
          <h1 className="logo">
            <BrandLogo />
          </h1>
          <LanguageSwitcher />
        </div>
        <label className="search">
          <SearchIcon />
          <input
            type="search"
            placeholder={t('Найти бренд, обувь или одежду')}
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
          onClick={() => openBrands(slide.group)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && openBrands(slide.group)}
        >
          <BrandMark size={170} className="hero-banner__mark" />
          <div className="hero-banner__text">
            <p className="hero-banner__eyebrow">{t(slide.eyebrow)}</p>
            <h2>{t(slide.title)}</h2>
            <p className="hero-banner__desc">{t(slide.desc)}</p>
            <span className="hero-banner__cta">{t(slide.cta)}</span>
          </div>
          <div className="hero-banner__logos" aria-hidden>
            {slideLogos.map((b) => (
              <span key={b.slug} className="hero-banner__logo">
                <img src={b.logo} alt="" />
              </span>
            ))}
          </div>
        </div>
        <div className="hero-dots">
          {bannerSlides.map((_, i) => (
            <button
              key={i}
              type="button"
              className={banner === i ? 'is-active' : ''}
              aria-label={t('Баннер {n}', { n: i + 1 })}
              onClick={() => setBanner(i)}
            />
          ))}
        </div>
      </section>

      <section className="section home-brands">
        <div className="section__head section__head--stack">
          <div>
            <h2>{t('Бренды')}</h2>
            <p className="section__sub">
              {t('Обувь, одежда и аксессуары — {n} брендов', { n: brands.length })}
            </p>
          </div>
          <button type="button" className="section__all" onClick={() => openBrands()}>
            {t('Все')} <Chevron />
          </button>
        </div>
        <div className="brand-grid">
          {featuredBrands.map((b) => (
            <BrandTile key={b.slug} brand={b} />
          ))}
          <button type="button" className="brand-tile brand-tile--all" onClick={() => openBrands()}>
            <span className="brand-tile__logo">
              <span className="brand-tile__count">{brands.length}</span>
            </span>
            <span className="brand-tile__name">{t('Все бренды')}</span>
          </button>
        </div>
      </section>

      <section className="action-grid">
        <div className="action-stack">
          <div className="action-card action-card--points">
            <span className="action-card__label">{t('Баллы')}</span>
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
              {t('Сайт Five Seasons')} <Chevron />
            </span>
            <span className="action-card__hint">{t('Выбрать и заказать на сайте')}</span>
          </button>
        </div>
        <button
          type="button"
          className="action-card action-card--order"
          onClick={() => openCatalog(null)}
        >
          <span className="action-card__order-title">{t('Выбрать и заказать')}</span>
          <span className="action-card__arrow">
            <ArrowRight />
          </span>
        </button>
      </section>

      <section className="promo-discount" onClick={() => setTab('cart')} role="button" tabIndex={0}>
        <div className="promo-discount__text">
          <h2>{t('Скидки в корзине!')}</h2>
          <ul>
            <li>{t('−300 000 ₫ на вторые')}</li>
            <li>{t('−450 000 ₫ на третьи')}</li>
            <li>{t('−600 000 ₫ на четвёртые')}</li>
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
          <h2>{t('Коллекции')}</h2>
          <button type="button" className="section__all" onClick={() => openCatalog(null)}>
            {t('Все')} <Chevron />
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
            <h2>{t('Новые коллабы')}</h2>
            <p className="section__sub">
              {t('Salehe, Cars, Characters, Minecraft, SpongeBob, Simpsons и South Park')}
            </p>
          </div>
          <button type="button" className="section__all" onClick={() => openCatalog(null)}>
            {t('Все')} <Chevron />
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
            <h2>{t('Naruto × Crocs — вся серия')}</h2>
            <p className="section__sub">
              {t('Naruto, Kakashi, Sasuke, Itachi, Minato и Jiraiya')}
            </p>
          </div>
          <button type="button" className="section__all" onClick={() => openCatalog('naruto')}>
            {t('Все')} <Chevron />
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
          <h2>{t('Бестселлеры')}</h2>
          <button type="button" className="section__all" onClick={() => openCatalog('popular')}>
            {t('Все')} <Chevron />
          </button>
        </div>
        <div className="product-grid">
          {bestsellers.slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="chips-row" aria-label={t('Категории')}>
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
          <h2>{t('Только что купили')}</h2>
          <button type="button" className="section__all" onClick={() => openCatalog(null)}>
            {t('Все')} <Chevron />
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
            <h2>{t('Топ 20 популярных')}</h2>
            <p className="section__sub">{t('В наличии — самовывоз или доставка 1–2 дня')}</p>
          </div>
          <button type="button" className="section__all" onClick={() => openCatalog('popular')}>
            {t('Все')} <Chevron />
          </button>
        </div>
        <div className="product-grid">
          {top20.slice(0, 6).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="curated">
        <h2>{t('Актуальные подборки')}</h2>
        <p>
          {t(
            'Salehe Bembury, Lightning McQueen, Characters, Minecraft, SpongeBob, Simpsons и South Park — собрали главные дропы.',
          )}
        </p>
        <button type="button" onClick={() => openCatalog('salehe')}>
          {t('Открыть коллабы')}
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
  return <BrandMark size={24} />
}

function ArrowRight() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

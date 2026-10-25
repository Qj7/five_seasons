import { A11y, Mousewheel, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide, type SwiperClass } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/pagination'
import {
  catalogDepartments,
  type Category,
  type Product,
} from '../data/products'
import {
  brandBySlug,
  brands,
  featuredBrandSlugs,
  type Brand,
  type BrandGroup,
} from '../data/brands'
import { useCatalog } from '../catalog'
import { useStore } from '../store'
import { ProductCard } from './ProductCard'
import { BrandTile } from './BrandsPage'
import { BrandLogo, BrandMark } from './BrandMark'
import { LanguageSwitcher } from './LanguageSwitcher'
import { useI18n } from '../i18n'

function productById(catalog: Product[], id: string) {
  return catalog.find((p) => p.id === id)
}

const featuredBrands = featuredBrandSlugs
  .map(brandBySlug)
  .filter((b): b is Brand => Boolean(b))

const categoryImage = (id: Category) => `/catalog/${id}.jpg?v=5`

const newSneakerIds = ['nb-530-white', 'dunk-cacao', 'aj1-chicago']
const crocsPreviewIds = ['classic-white', 'classic-black']

type BannerSlide = {
  eyebrow: string
  count?: string
  title: string
  desc: string
  cta: string
  group?: BrandGroup
  logos?: string[]
  art?: string
  theme: 'fire' | 'water' | 'sand' | 'night'
  go: 'brands' | 'catalog'
  filter?: string | null
}

const bannerSlides: BannerSlide[] = [
  {
    eyebrow: 'НОВЫЙ СЕЗОН',
    count: '99',
    title: 'БРЕНДОВ',
    desc: 'Обувь, одежда и аксессуары — только оригиналы',
    cta: 'Смотреть бренды',
    logos: ['nike', 'adidas', 'new-balance', 'jordan'],
    theme: 'fire',
    go: 'brands',
  },
  {
    eyebrow: 'ЯНДЕКС',
    title: 'СТАНЦИЯ',
    desc: 'Умная колонка с Алисой — музыка, погода и таймеры',
    cta: 'В каталог',
    art: `/promo/yandex-station.png?v=1`,
    theme: 'water',
    go: 'catalog',
  },
  {
    eyebrow: 'STREETWEAR',
    title: 'ОДЕЖДА',
    desc: 'Stone Island, Supreme, Stüssy и The North Face',
    cta: 'Выбрать одежду',
    group: 'clothing',
    logos: ['stone-island', 'supreme', 'stussy', 'the-north-face'],
    theme: 'sand',
    go: 'brands',
  },
  {
    eyebrow: 'PREMIUM',
    title: 'ЛЮКС',
    desc: 'Prada, Gucci, Dior и Balenciaga — с доставкой',
    cta: 'Смотреть люкс',
    group: 'luxury',
    logos: ['prada', 'gucci', 'dior', 'balenciaga'],
    theme: 'night',
    go: 'brands',
  },
]

export function HomePage() {
  const { setTab, setCatalogFilter, search, setSearch, openBrands } = useStore()
  const { products } = useCatalog()
  const { t } = useI18n()

  const openCatalog = (filter: string | null) => {
    setSearch('')
    setCatalogFilter(filter)
    setTab('catalog')
  }

  const pick = (ids: string[]) =>
    ids
      .map((id) => productById(products, id))
      .filter((p): p is Product => Boolean(p))

  const publishedSneakers = products.filter(
    (p) => p.publishedBy && p.category === 'sneakers',
  )
  const newSneakers = [
    ...publishedSneakers,
    ...pick(newSneakerIds).filter(
      (p) => !publishedSneakers.some((m) => m.id === p.id),
    ),
  ].slice(0, 6)
  const crocsPreview = pick(crocsPreviewIds)

  const openSlide = (slide: BannerSlide) => {
    if (slide.go === 'catalog') openCatalog(slide.filter ?? null)
    else openBrands(slide.group)
  }

  const onBannerClick = (swiper: SwiperClass) => {
    if (!swiper.allowClick) return
    const i = swiper.clickedIndex
    if (typeof i !== 'number') return
    const slide = bannerSlides[i]
    if (slide) openSlide(slide)
  }

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

      <section className="hero-banners" aria-roledescription="carousel">
        <Swiper
          className="hero-track"
          modules={[Pagination, Mousewheel, A11y]}
          slidesPerView={1}
          spaceBetween={0}
          speed={350}
          threshold={5}
          resistanceRatio={0.65}
          nested
          simulateTouch
          grabCursor
          mousewheel={{
            enabled: true,
            forceToAxis: true,
            sensitivity: 1,
            releaseOnEdges: true,
          }}
          pagination={{ clickable: true }}
          onClick={onBannerClick}
          a11y={{
            prevSlideMessage: t('Назад'),
            nextSlideMessage: t('Далее'),
            paginationBulletMessage: t('Баннер {n}', { n: '{{index}}' }),
          }}
        >
          {bannerSlides.map((slide) => {
            const logos = (slide.logos ?? [])
              .map(brandBySlug)
              .filter((b): b is Brand => Boolean(b))
            return (
              <SwiperSlide key={slide.title}>
                <div
                  className={`hero-banner hero-banner--${slide.theme}`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') openSlide(slide)
                  }}
                >
                  <BrandMark size={170} className="hero-banner__mark" />
                  <div className="hero-banner__text">
                    <p className="hero-banner__eyebrow">{t(slide.eyebrow)}</p>
                    <h2 className="hero-banner__title">
                      {slide.count && <span className="hero-banner__count">{slide.count}</span>}
                      <span>{t(slide.title)}</span>
                    </h2>
                    <p className="hero-banner__desc">{t(slide.desc)}</p>
                    <span className="hero-banner__cta">{t(slide.cta)}</span>
                  </div>
                  {slide.art ? (
                    <div className="hero-banner__art" aria-hidden>
                      <img src={slide.art} alt="" draggable={false} />
                    </div>
                  ) : (
                    <div className="hero-banner__logos" aria-hidden>
                      {logos.map((b) => (
                        <span key={b.slug} className="hero-banner__logo">
                          <img src={b.logo} alt="" draggable={false} />
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </SwiperSlide>
            )
          })}
        </Swiper>
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
            className="promo-discount__shoe"
            src={`/products/sneakers/aj1-chicago-cut.png?v=1`}
            alt=""
          />
        </div>
      </section>

      <section className="section home-categories" aria-label={t('Категории')}>
        <div className="section__head">
          <h2>{t('Категории')}</h2>
          <button type="button" className="section__all" onClick={() => openCatalog(null)}>
            {t('Все')} <Chevron />
          </button>
        </div>
        {catalogDepartments.map((dept) => (
          <div key={dept.id} className="catalog-section">
            <div className="section__head">
              <h2>{t(dept.label)}</h2>
            </div>
            <div className="catalog-mosaic catalog-mosaic--shop">
              {dept.categories.map((c) => {
                const third =
                  dept.id === 'accessories' &&
                  (c.id === 'glasses' || c.id === 'wallets' || c.id === 'cardholders')
                return (
                  <button
                    key={c.id}
                    type="button"
                    className={`catalog-tile catalog-tile--shop ${third ? 'catalog-tile--third' : 'catalog-tile--pair'}`}
                    onClick={() => openCatalog(c.id)}
                  >
                    <span className="catalog-tile__label">{t(c.label)}</span>
                    <span className="catalog-tile__media catalog-tile__media--shop" aria-hidden>
                      <img src={categoryImage(c.id)} alt="" />
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </section>

      <section className="section">
        <div className="section__head">
          <h2>{t('Новые кроссовки')}</h2>
          <button type="button" className="section__all" onClick={() => openCatalog('sneakers')}>
            {t('Все')} <Chevron />
          </button>
        </div>
        <div className="product-grid">
          {newSneakers.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section__head">
          <h2>{t('Кроксы')}</h2>
          <button type="button" className="section__all" onClick={() => openCatalog('slippers')}>
            {t('Все')} <Chevron />
          </button>
        </div>
        <div className="product-grid">
          {crocsPreview.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
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

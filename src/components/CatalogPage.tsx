import { useMemo, useState } from 'react'
import {
  brandsOf,
  products,
  top20,
  type Category,
  type Product,
} from '../data/products'
import { brands } from '../data/brands'
import { useStore } from '../store'
import { ProductCard } from './ProductCard'
import { BrandTile } from './BrandsPage'
import { useI18n } from '../i18n'

type Audience = 'adults' | 'kids'
type CardSize = 'wide' | 'narrow' | 'half' | 'full'

const asset = (path: string) =>
  `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`

interface ShoeSection {
  id: string
  label: string
  size: CardSize
  /** Horizontal side-view (wide / half) or vertical top-down pair (narrow). */
  adultImage: string
  kidsImage: string
  /** For narrow cards without a pair shot — stack of horizontal shoes. */
  adultStack?: string[]
  kidsStack?: string[]
  match: (p: Product) => boolean
}

const shoeSections: ShoeSection[] = [
  {
    id: 'classic',
    label: 'Classic клоги',
    size: 'wide',
    adultImage: asset('products/new/classic-black.png'),
    kidsImage: asset('products/new/classic-white.png'),
    match: (p) => p.category === 'classic',
  },
  {
    id: 'bape',
    label: 'BAPE',
    size: 'narrow',
    adultImage: asset('products/new/bape-blue.png'),
    kidsImage: asset('products/new/bape-pink.png'),
    match: (p) => p.category === 'bape',
  },
  {
    id: 'collabs',
    label: 'Коллабы',
    size: 'full',
    adultImage: asset('products/new/pollex-green.png'),
    kidsImage: asset('products/new/cars-mcqueen.png'),
    match: (p) =>
      !['classic', 'exclusive', 'bayaband', 'jibbitz', 'bape'].includes(
        p.category,
      ) && p.category !== 'popular',
  },
  {
    id: 'exclusive',
    label: 'Exclusive',
    size: 'half',
    adultImage: asset('products/new/exclusive-mint.png'),
    kidsImage: asset('products/new/exclusive-pink.png'),
    match: (p) => p.category === 'exclusive',
  },
  {
    id: 'bayaband',
    label: 'Bayaband',
    size: 'half',
    adultImage: asset('products/new/bayaband-black.png'),
    kidsImage: asset('products/new/bayaband-white.png'),
    match: (p) => p.category === 'bayaband',
  },
]

const accessorySections: ShoeSection[] = [
  {
    id: 'jibbitz',
    label: 'Jibbitz',
    size: 'wide',
    adultImage: asset('products/jibbitz-pack.png'),
    kidsImage: asset('products/jibbitz-fruit.jpg'),
    match: (p) => p.category === 'jibbitz',
  },
  {
    id: 'popular',
    label: 'Топ 20',
    size: 'narrow',
    adultImage: asset('products/new/naruto-jiraiya.png'),
    kidsImage: asset('products/new/naruto-itachi.png'),
    match: (p) => Boolean(p.popularRank),
  },
]

const filters: { id: string | null; label: string }[] = [
  { id: null, label: 'Все' },
  { id: 'popular', label: 'Топ 20' },
  { id: 'classic', label: 'Classic' },
  { id: 'exclusive', label: 'Exclusive' },
  { id: 'bayaband', label: 'Bayaband' },
  { id: 'bape', label: 'BAPE' },
  { id: 'naruto', label: 'Naruto' },
  { id: 'salehe', label: 'Salehe' },
  { id: 'cars', label: 'Cars' },
  { id: 'characters', label: 'Characters' },
  { id: 'minecraft', label: 'Minecraft' },
  { id: 'spongebob', label: 'SpongeBob' },
  { id: 'simpsons', label: 'Simpsons' },
  { id: 'southpark', label: 'South Park' },
  { id: 'jibbitz', label: 'Jibbitz' },
]

function Chevron() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function BackChevron() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M15 6l-6 6 6 6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function CatalogPage() {
  const { catalogFilter, setCatalogFilter, search, setSearch } = useStore()
  const { t } = useI18n()
  const [audience, setAudience] = useState<Audience>('adults')
  const [sectionId, setSectionId] = useState<string | null>(null)

  const allSections = useMemo(() => [...shoeSections, ...accessorySections], [])
  const activeSection = allSections.find((s) => s.id === sectionId) ?? null

  /** Mosaic browse vs section / filter / search results */
  const showBrowse = !catalogFilter && !sectionId && !search.trim()

  let list = products
  if (sectionId === 'all') {
    list = products
  } else if (sectionId === 'popular') {
    list = top20
  } else if (sectionId && activeSection) {
    list = products.filter(activeSection.match)
  } else if (sectionId) {
    // Fallback: treat unknown section id as category id
    list = products.filter((p) => p.category === (sectionId as Category))
  } else if (catalogFilter === 'popular') {
    list = top20
  } else if (catalogFilter) {
    list = products.filter((p) => p.category === (catalogFilter as Category))
  }

  const q = search.trim().toLowerCase()
  const matchedBrands = q
    ? brands.filter((b) => b.name.toLowerCase().includes(q)).slice(0, 8)
    : []

  if (q) {
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        matchedBrands.some((b) => brandsOf(p).includes(b.slug)),
    )
  }

  const openSection = (id: string) => {
    setSectionId(id)
    setCatalogFilter(null)
    setSearch('')
  }

  const selectFilter = (id: string | null) => {
    setSectionId(null)
    setCatalogFilter(id)
  }

  const backToBrowse = () => {
    setSectionId(null)
    setCatalogFilter(null)
    setSearch('')
  }

  const sectionTitle = t(
    sectionId === 'all'
      ? 'Все товары'
      : (activeSection?.label ??
        filters.find((f) => f.id === catalogFilter)?.label ??
        (search.trim() ? 'Поиск' : 'Каталог')),
  )

  return (
    <div className="page catalog">
      <header
        className={`page-header ${
          showBrowse ? 'page-header--center' : 'page-header--with-back'
        }`}
      >
        {!showBrowse && (
          <button
            type="button"
            className="catalog-back"
            onClick={backToBrowse}
            aria-label={t('Назад')}
          >
            <BackChevron />
          </button>
        )}
        <h1>{showBrowse ? t('Каталог') : sectionTitle}</h1>
        <label className="search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            placeholder={t('Найти бренд, обувь или одежду')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </header>

      {showBrowse ? (
        <>
          <div className="gender-tabs" role="tablist" aria-label={t('Возраст')}>
            <button
              type="button"
              role="tab"
              aria-selected={audience === 'adults'}
              className={`gender-tabs__btn ${audience === 'adults' ? 'is-active' : ''}`}
              onClick={() => setAudience('adults')}
            >
              {t('Взрослым')}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={audience === 'kids'}
              className={`gender-tabs__btn ${audience === 'kids' ? 'is-active' : ''}`}
              onClick={() => setAudience('kids')}
            >
              {t('Детям')}
            </button>
          </div>

          <CatalogSection
            title={t('Обувь')}
            sections={shoeSections}
            audience={audience}
            onAll={() => openSection('all')}
            onOpen={openSection}
          />

          <CatalogSection
            title={t('Аксессуары')}
            sections={accessorySections}
            audience={audience}
            onAll={() => openSection('jibbitz')}
            onOpen={openSection}
          />
        </>
      ) : (
        <>
          {!search.trim() && !sectionId && (
            <div className="filter-row">
              {filters.map((f) => (
                <button
                  key={f.label}
                  type="button"
                  className={`filter-pill ${
                    catalogFilter === f.id ? 'is-active' : ''
                  }`}
                  onClick={() => selectFilter(f.id)}
                >
                  {t(f.label)}
                </button>
              ))}
            </div>
          )}

          {matchedBrands.length > 0 && (
            <div className="brand-grid catalog-brands">
              {matchedBrands.map((b) => (
                <BrandTile key={b.slug} brand={b} />
              ))}
            </div>
          )}

          <p className="catalog-count">{t('{n} товаров', { n: list.length })}</p>

          <div className="product-grid">
            {list.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          {list.length === 0 && (
            <p className="empty">{t('Ничего не найдено. Попробуйте другой запрос.')}</p>
          )}
        </>
      )}
    </div>
  )
}

function CatalogSection({
  title,
  sections,
  audience,
  onAll,
  onOpen,
}: {
  title: string
  sections: ShoeSection[]
  audience: Audience
  onAll: () => void
  onOpen: (id: string) => void
}) {
  const { t } = useI18n()
  return (
    <section className="catalog-section">
      <div className="section__head">
        <h2>{title}</h2>
        <button type="button" className="section__all" onClick={onAll}>
          {t('Все')} <Chevron />
        </button>
      </div>
      <div className="catalog-mosaic">
        {sections.map((s) => {
          const stack =
            audience === 'adults' ? s.adultStack : s.kidsStack
          const image = audience === 'adults' ? s.adultImage : s.kidsImage
          // All current catalog shots are side-profile — use horizontal fill
          const mediaMode = stack ? 'stack' : 'horizontal'

          return (
            <button
              key={s.id}
              type="button"
              className={`catalog-tile catalog-tile--${s.size}`}
              onClick={() => onOpen(s.id)}
            >
              <span className="catalog-tile__label">{t(s.label)}</span>
              {mediaMode === 'stack' ? (
                <div className="catalog-tile__media catalog-tile__media--stack" aria-hidden>
                  {stack!.map((src, i) => (
                    <img key={i} src={src} alt="" loading="lazy" decoding="async" />
                  ))}
                </div>
              ) : (
                <div
                  className="catalog-tile__media catalog-tile__media--horizontal"
                  aria-hidden
                >
                  <img src={image} alt="" loading="lazy" decoding="async" />
                </div>
              )}
            </button>
          )
        })}
      </div>
    </section>
  )
}

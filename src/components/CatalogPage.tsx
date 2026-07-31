import { useMemo, useState } from 'react'
import { products, top20, type Category, type Product } from '../data/products'
import { useStore } from '../store'
import { ProductCard } from './ProductCard'

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
    adultImage: asset('products/classic-pepper.png'),
    kidsImage: asset('products/classic-turquoise.png'),
    match: (p) =>
      p.category === 'classic' &&
      !/Slide|Crush|Echo|Literide|Platform/i.test(p.name),
  },
  {
    id: 'bape',
    label: 'BAPE',
    size: 'narrow',
    adultImage: asset('products/bape-blue.png'),
    kidsImage: asset('products/bape-blue.png'),
    match: (p) => p.category === 'bape',
  },
  {
    id: 'collabs',
    label: 'Коллабы',
    size: 'full',
    adultImage: asset('products/salehe-pollex.png'),
    kidsImage: asset('products/cars-mcqueen.png'),
    match: (p) =>
      !['classic', 'jibbitz', 'bape'].includes(p.category) &&
      p.category !== 'popular',
  },
  {
    id: 'slides',
    label: 'Слайды',
    size: 'half',
    adultImage: asset('products/slide-black.png'),
    kidsImage: asset('products/platform-bone.png'),
    match: (p) => /Slide/i.test(p.name),
  },
  {
    id: 'echo',
    label: 'Echo',
    size: 'half',
    adultImage: asset('products/echo-black.png'),
    kidsImage: asset('products/echo-stucco.png'),
    match: (p) => /Echo/i.test(p.name),
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
    adultImage: asset('products/naruto-jiraiya.png'),
    kidsImage: asset('products/naruto-itachi.png'),
    match: (p) => Boolean(p.popularRank),
  },
]

const filters: { id: string | null; label: string }[] = [
  { id: null, label: 'Все' },
  { id: 'popular', label: 'Топ 20' },
  { id: 'classic', label: 'Classic' },
  { id: 'bape', label: 'BAPE' },
  { id: 'naruto', label: 'Naruto' },
  { id: 'salehe', label: 'Salehe' },
  { id: 'cars', label: 'Cars' },
  { id: 'pokemon', label: 'Pokémon' },
  { id: 'harry', label: 'Harry Potter' },
  { id: 'spiderman', label: 'Spider-Man' },
  { id: 'hellokitty', label: 'Hello Kitty' },
  { id: 'demonslayer', label: 'Demon Slayer' },
  { id: 'sonic', label: 'Sonic' },
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

export function CatalogPage() {
  const { catalogFilter, setCatalogFilter, search, setSearch } = useStore()
  const [audience, setAudience] = useState<Audience>('adults')
  const [sectionId, setSectionId] = useState<string | null>(null)

  const allSections = useMemo(() => [...shoeSections, ...accessorySections], [])
  const activeSection = allSections.find((s) => s.id === sectionId) ?? null

  let list = products
  if (sectionId === 'all') {
    list = products
  } else if (sectionId === 'popular') {
    list = top20
  } else if (sectionId && activeSection) {
    list = products.filter(activeSection.match)
  } else if (catalogFilter === 'popular') {
    list = top20
  } else if (catalogFilter) {
    list = products.filter((p) => p.category === (catalogFilter as Category))
  }

  if (search.trim()) {
    const q = search.trim().toLowerCase()
    list = list.filter((p) => p.name.toLowerCase().includes(q))
  }

  const openSection = (id: string) => {
    setSectionId(id === 'all' ? null : id)
    setCatalogFilter(null)
  }

  const selectFilter = (id: string | null) => {
    setSectionId(null)
    setCatalogFilter(id)
  }

  return (
    <div className="page catalog">
      <header className="page-header page-header--center">
        <h1>Каталог</h1>
        <label className="search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            placeholder="Найти Crocs или Jibbitz"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </header>

      <div className="gender-tabs" role="tablist" aria-label="Возраст">
        <button
          type="button"
          role="tab"
          aria-selected={audience === 'adults'}
          className={`gender-tabs__btn ${audience === 'adults' ? 'is-active' : ''}`}
          onClick={() => setAudience('adults')}
        >
          Взрослым
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={audience === 'kids'}
          className={`gender-tabs__btn ${audience === 'kids' ? 'is-active' : ''}`}
          onClick={() => setAudience('kids')}
        >
          Детям
        </button>
      </div>

      <CatalogSection
        title="Обувь"
        sections={shoeSections}
        audience={audience}
        onAll={() => openSection('all')}
        onOpen={openSection}
      />

      <CatalogSection
        title="Аксессуары"
        sections={accessorySections}
        audience={audience}
        onAll={() => openSection('jibbitz')}
        onOpen={openSection}
      />

      <div className="filter-row">
        {filters.map((f) => (
          <button
            key={f.label}
            type="button"
            className={`filter-pill ${
              !sectionId && catalogFilter === f.id ? 'is-active' : ''
            }`}
            onClick={() => selectFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <p className="catalog-count">{list.length} товаров</p>

      <div className="product-grid">
        {list.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {list.length === 0 && (
        <p className="empty">Ничего не найдено. Попробуйте другой запрос.</p>
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
  return (
    <section className="catalog-section">
      <div className="section__head">
        <h2>{title}</h2>
        <button type="button" className="section__all" onClick={onAll}>
          Все <Chevron />
        </button>
      </div>
      <div className="catalog-mosaic">
        {sections.map((s) => {
          const isNarrow = s.size === 'narrow'
          const stack =
            audience === 'adults' ? s.adultStack : s.kidsStack
          const image = audience === 'adults' ? s.adultImage : s.kidsImage

          return (
            <button
              key={s.id}
              type="button"
              className={`catalog-tile catalog-tile--${s.size}`}
              onClick={() => onOpen(s.id)}
            >
              <span className="catalog-tile__label">{s.label}</span>
              {isNarrow && stack ? (
                <div className="catalog-tile__media catalog-tile__media--stack" aria-hidden>
                  {stack.map((src, i) => (
                    <img key={i} src={src} alt="" loading="lazy" decoding="async" />
                  ))}
                </div>
              ) : (
                <div
                  className={`catalog-tile__media catalog-tile__media--${
                    isNarrow ? 'vertical' : 'horizontal'
                  }`}
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

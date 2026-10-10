import { useMemo, useState } from 'react'
import {
  brandBySlug,
  brandGroups,
  brands,
  type Brand,
  type BrandGroup,
} from '../data/brands'
import { productsOfBrand } from '../data/products'
import { useStore } from '../store'
import { ProductCard } from './ProductCard'
import { useI18n } from '../i18n'

export function BrandTile({ brand }: { brand: Brand }) {
  const { openBrand } = useStore()
  return (
    <button
      type="button"
      className="brand-tile"
      onClick={() => openBrand(brand.slug)}
    >
      <span className="brand-tile__logo">
        <img src={brand.logo} alt={brand.name} loading="lazy" decoding="async" />
      </span>
      <span className="brand-tile__name">{brand.name}</span>
    </button>
  )
}

export function BrandsPage({ initialGroup = null }: { initialGroup?: BrandGroup | null }) {
  const { closeBrand } = useStore()
  const { t } = useI18n()
  const [query, setQuery] = useState('')
  const [group, setGroup] = useState<BrandGroup | null>(initialGroup)

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return brands.filter(
      (b) =>
        (!group || b.group === group) &&
        (!q || b.name.toLowerCase().includes(q) || b.slug.includes(q)),
    )
  }, [query, group])

  return (
    <div className="page brands-page">
      <header className="page-header page-header--with-back">
        <button
          type="button"
          className="catalog-back"
          onClick={closeBrand}
          aria-label={t('Назад')}
        >
          <BackChevron />
        </button>
        <h1>{t('Бренды')}</h1>
        <label className="search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            placeholder={t('Найти бренд')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </header>

      <div className="filter-row">
        <button
          type="button"
          className={`filter-pill ${group === null ? 'is-active' : ''}`}
          onClick={() => setGroup(null)}
        >
          {t('Все')}
        </button>
        {brandGroups.map((g) => (
          <button
            key={g.id}
            type="button"
            className={`filter-pill ${group === g.id ? 'is-active' : ''}`}
            onClick={() => setGroup(g.id)}
          >
            {t(g.label)}
          </button>
        ))}
      </div>

      <p className="catalog-count">{t('{n} брендов', { n: list.length })}</p>

      <div className="brand-grid">
        {list.map((b) => (
          <BrandTile key={b.slug} brand={b} />
        ))}
      </div>

      {list.length === 0 && (
        <p className="empty">{t('Бренд не найден. Попробуйте другой запрос.')}</p>
      )}
    </div>
  )
}

export function BrandPage({ slug }: { slug: string }) {
  const { closeBrand, setTab } = useStore()
  const { t } = useI18n()
  const brand = brandBySlug(slug)
  const list = useMemo(() => productsOfBrand(slug), [slug])
  const groupLabel = brandGroups.find((g) => g.id === brand?.group)?.label

  if (!brand) return null

  return (
    <div className="page brand-page">
      <header className="page-header page-header--with-back">
        <button
          type="button"
          className="catalog-back"
          onClick={closeBrand}
          aria-label={t('Назад')}
        >
          <BackChevron />
        </button>
        <h1>{brand.name}</h1>
      </header>

      <section className="brand-hero">
        <span className="brand-hero__logo">
          <img src={brand.logo} alt={brand.name} />
        </span>
        <div>
          <p className="brand-hero__group">{groupLabel && t(groupLabel)}</p>
          <p className="brand-hero__count">
            {list.length > 0
              ? t('{n} товаров в наличии', { n: list.length })
              : t('Скоро в каталоге')}
          </p>
        </div>
      </section>

      {list.length > 0 ? (
        <div className="product-grid">
          {list.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>{t('Готовим поставку')}</p>
          <span>
            {t(
              'Товары {brand} появятся в Five Seasons совсем скоро. Пока посмотрите, что уже есть в наличии.',
              { brand: brand.name },
            )}
          </span>
          <button type="button" className="btn-primary" onClick={() => setTab('catalog')}>
            {t('Открыть каталог')}
          </button>
        </div>
      )}
    </div>
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

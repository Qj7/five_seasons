import { useMemo, useState } from 'react'
import {
  brandsOf,
  catalogDepartments,
  type CatalogDepartment,
  type Category,
  type Product,
} from '../data/products'
import { brands } from '../data/brands'
import { useCatalog } from '../catalog'
import { useStore } from '../store'
import { ProductCard } from './ProductCard'
import { BrandTile } from './BrandsPage'
import { useI18n } from '../i18n'

type Audience = 'men' | 'women'

const categoryImage = (id: Category, audience: Audience) =>
  `${import.meta.env.BASE_URL}catalog/${audience === 'women' ? 'women/' : ''}${id}.jpg?v=5`

function matchesGender(product: Product, audience: Audience) {
  return !product.gender || product.gender === 'unisex' || product.gender === audience
}

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
  const { products } = useCatalog()
  const { t } = useI18n()
  const [audience, setAudience] = useState<Audience>('men')
  const [deptId, setDeptId] = useState<CatalogDepartment['id'] | null>(null)
  const [sectionId, setSectionId] = useState<Category | null>(null)

  const department = catalogDepartments.find((d) => d.id === deptId) ?? null
  const knownCategory = catalogDepartments
    .flatMap((d) => d.categories)
    .find((c) => c.id === catalogFilter)

  const showBrowse = !deptId && !catalogFilter && !search.trim()

  const openDepartment = (id: CatalogDepartment['id'], category?: Category) => {
    setDeptId(id)
    setSectionId(category ?? null)
    setCatalogFilter(null)
    setSearch('')
  }

  const backToBrowse = () => {
    setDeptId(null)
    setSectionId(null)
    setCatalogFilter(null)
    setSearch('')
  }

  const list = useMemo(() => {
    let next = products.filter((p) => matchesGender(p, audience))
    if (department) {
      const ids = new Set(department.categories.map((c) => c.id))
      next = next.filter((p) => ids.has(p.category))
      if (sectionId) next = next.filter((p) => p.category === sectionId)
    } else if (knownCategory) {
      next = next.filter((p) => p.category === knownCategory.id)
    } else if (catalogFilter) {
      next = next.filter(
        (p) => p.modelGroup === catalogFilter || p.category === catalogFilter,
      )
    }
    const q = search.trim().toLowerCase()
    if (q) {
      const matched = brands.filter((b) => b.name.toLowerCase().includes(q))
      next = next.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.colorName.toLowerCase().includes(q) ||
          matched.some((b) => brandsOf(p).includes(b.slug)),
      )
    }
    return next
  }, [products, audience, department, sectionId, knownCategory, catalogFilter, search])

  const q = search.trim().toLowerCase()
  const matchedBrands = q
    ? brands.filter((b) => b.name.toLowerCase().includes(q)).slice(0, 8)
    : []

  const sectionTitle = department
    ? t(audience === 'men' ? department.menTitle : department.womenTitle)
    : knownCategory
      ? t(knownCategory.label)
      : search.trim()
        ? t('Поиск')
        : t('Каталог')

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
        {!showBrowse && (
          <label className="search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              placeholder={t('Поиск')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        )}
      </header>

      {showBrowse ? (
        <>
          <div className="gender-tabs" role="tablist" aria-label={t('Пол')}>
            <button
              type="button"
              role="tab"
              aria-selected={audience === 'men'}
              className={`gender-tabs__btn ${audience === 'men' ? 'is-active' : ''}`}
              onClick={() => setAudience('men')}
            >
              {t('Мужчинам')}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={audience === 'women'}
              className={`gender-tabs__btn ${audience === 'women' ? 'is-active' : ''}`}
              onClick={() => setAudience('women')}
            >
              {t('Женщинам')}
            </button>
          </div>

          {catalogDepartments.map((dept) => (
            <CatalogSection
              key={dept.id}
              audience={audience}
              department={dept}
              onAll={() => openDepartment(dept.id)}
              onOpen={(category) => openDepartment(dept.id, category)}
            />
          ))}
        </>
      ) : (
        <>
          <div className="gender-tabs" role="tablist" aria-label={t('Пол')}>
            <button
              type="button"
              role="tab"
              aria-selected={audience === 'men'}
              className={`gender-tabs__btn ${audience === 'men' ? 'is-active' : ''}`}
              onClick={() => setAudience('men')}
            >
              {t('Мужчинам')}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={audience === 'women'}
              className={`gender-tabs__btn ${audience === 'women' ? 'is-active' : ''}`}
              onClick={() => setAudience('women')}
            >
              {t('Женщинам')}
            </button>
          </div>

          {department && (
            <div className="filter-row catalog-subcats">
              {department.categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`filter-pill ${sectionId === c.id ? 'is-active' : ''}`}
                  onClick={() => setSectionId((cur) => (cur === c.id ? null : c.id))}
                >
                  {t(c.short)}
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
  audience,
  department,
  onAll,
  onOpen,
}: {
  audience: Audience
  department: CatalogDepartment
  onAll: () => void
  onOpen: (id: Category) => void
}) {
  const { t } = useI18n()
  return (
    <section className="catalog-section">
      <div className="section__head">
        <h2>{t(department.label)}</h2>
        <button type="button" className="section__all" onClick={onAll}>
          {t('Все')} <Chevron />
        </button>
      </div>
      <div className="catalog-mosaic catalog-mosaic--shop">
        {department.categories.map((c) => {
          const third =
            department.id === 'accessories' &&
            (c.id === 'glasses' || c.id === 'wallets' || c.id === 'cardholders')
          return (
            <button
              key={c.id}
              type="button"
              className={`catalog-tile catalog-tile--shop ${third ? 'catalog-tile--third' : 'catalog-tile--pair'}`}
              onClick={() => onOpen(c.id)}
            >
              <span className="catalog-tile__label">{t(c.label)}</span>
              <span className="catalog-tile__media catalog-tile__media--shop" aria-hidden>
                <img src={categoryImage(c.id, audience)} alt="" loading="lazy" decoding="async" />
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

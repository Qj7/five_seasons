import { useEffect, useId, useMemo, useState, type FormEvent } from 'react'
import { useAuth } from '../auth'
import { useCatalog } from '../catalog'
import {
  catalogDepartments,
  departmentOf,
  formatPrice,
  type Category,
  type Gender,
} from '../data/products'
import { brands, type BrandGroup } from '../data/brands'
import { SIZE_PALETTE, normalizeSizeLabel } from '../data/sizes'
import { useStore } from '../store'
import { useI18n } from '../i18n'
import { CrocVisual } from './CrocVisual'
import { CoverImageField } from './CoverImageField'
import { GalleryUploader } from './GalleryUploader'
import { OrdersPage } from './OrdersPage'

function brandsForCategory(category: Category) {
  const dept = departmentOf(category)
  if (!dept) return brands
  const groups: BrandGroup[] =
    dept.id === 'accessories'
      ? ['accessories', 'luxury']
      : dept.id === 'shoes'
        ? ['footwear']
        : ['clothing']
  return brands.filter((b) => groups.includes(b.group))
}

function BackChevron() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M15 6 9 12l6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ManagerHub() {
  const { user } = useAuth()
  const { published, removePublished } = useCatalog()
  const { setManagerScreen, openProduct, closeManager } = useStore()
  const { t } = useI18n()
  const mine = published.filter((p) => p.publishedBy === user?.id)

  return (
    <div className="page manager-page">
      <header className="page-header page-header--with-back">
        <button
          type="button"
          className="catalog-back"
          onClick={closeManager}
          aria-label={t('Назад')}
        >
          <BackChevron />
        </button>
        <h1>{t('Кабинет менеджера')}</h1>
      </header>

      <p className="manager-page__lead">
        {t('Личный кабинет · {name}', { name: user?.name ?? '' })}
      </p>

      <div className="manager-hub__actions">
        <button
          type="button"
          className="manager-hub__card manager-hub__card--primary"
          onClick={() => setManagerScreen('new')}
        >
          <strong>{t('Новый товар')}</strong>
          <span>{t('Обложка, размеры, галерея, доставка')}</span>
        </button>
        <button
          type="button"
          className="manager-hub__card"
          onClick={() => setManagerScreen('orders')}
        >
          <strong>{t('Мои заказы')}</strong>
          <span>{t('Заказы покупателей по вашим SKU')}</span>
        </button>
        <button
          type="button"
          className="manager-hub__card"
          onClick={() => setManagerScreen('listings')}
        >
          <strong>{t('Мои товары')}</strong>
          <span>{t('{n} публикаций', { n: mine.length })}</span>
        </button>
      </div>

      {mine.length > 0 ? (
        <section className="manager-list">
          <h2>{t('Недавние')}</h2>
          <ul>
            {mine.slice(0, 4).map((p) => (
              <li key={p.id} className="manager-list__item">
                <button
                  type="button"
                  className="manager-list__open"
                  onClick={() => openProduct(p.id)}
                >
                  <span className="manager-list__thumb">
                    <CrocVisual product={p} />
                  </span>
                  <span>
                    <strong>{p.name}</strong>
                    <em>{formatPrice(p.price)}</em>
                  </span>
                </button>
                <button
                  type="button"
                  className="manager-list__remove"
                  onClick={() => removePublished(p.id)}
                >
                  {t('Снять')}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}

function ManagerListings() {
  const { user } = useAuth()
  const { published, removePublished } = useCatalog()
  const { setManagerScreen, openProduct } = useStore()
  const { t } = useI18n()
  const mine = published.filter((p) => p.publishedBy === user?.id)

  return (
    <div className="page manager-page">
      <header className="page-header page-header--with-back">
        <button
          type="button"
          className="catalog-back"
          onClick={() => setManagerScreen('hub')}
          aria-label={t('Назад')}
        >
          <BackChevron />
        </button>
        <h1>{t('Мои товары')}</h1>
      </header>

      {mine.length === 0 ? (
        <div className="empty-state">
          <p>{t('Пока ничего не опубликовано')}</p>
          <button
            type="button"
            className="btn-primary"
            onClick={() => setManagerScreen('new')}
          >
            {t('Новый товар')}
          </button>
        </div>
      ) : (
        <section className="manager-list">
          <ul>
            {mine.map((p) => (
              <li key={p.id} className="manager-list__item">
                <button
                  type="button"
                  className="manager-list__open"
                  onClick={() => openProduct(p.id)}
                >
                  <span className="manager-list__thumb">
                    <CrocVisual product={p} />
                  </span>
                  <span>
                    <strong>{p.name}</strong>
                    <em>
                      {p.colorName} · {formatPrice(p.price)}
                    </em>
                  </span>
                </button>
                <button
                  type="button"
                  className="manager-list__remove"
                  onClick={() => removePublished(p.id)}
                >
                  {t('Снять')}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function NewProductForm() {
  const { user } = useAuth()
  const { publishProduct } = useCatalog()
  const { setManagerScreen, openProduct } = useStore()
  const { t } = useI18n()
  const formId = useId()

  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState<Category>('sneakers')
  const [gender, setGender] = useState<Gender>('men')
  const [brand, setBrand] = useState('nike')
  const [colorName, setColorName] = useState('')
  const [coverImage, setCoverImage] = useState<string | null>(null)
  const [gallery, setGallery] = useState<string[]>([])
  const [sizes, setSizes] = useState<string[]>([
    '36–37',
    '37–38',
    '38–39',
    '39–40',
    '41–42',
  ])
  const [customSize, setCustomSize] = useState('')
  const [expressSurcharge, setExpressSurcharge] = useState('1000000')
  const [expressDays, setExpressDays] = useState('3-7')
  const [standardDays, setStandardDays] = useState('25-35')
  const [error, setError] = useState<string | null>(null)

  const brandOptions = useMemo(() => brandsForCategory(category), [category])

  useEffect(() => {
    if (!brandOptions.some((b) => b.slug === brand)) {
      setBrand(brandOptions[0]?.slug ?? '')
    }
  }, [brandOptions, brand])

  const priceNum = Number(String(price).replace(/\s/g, '')) || 0
  const surchargeNum = Number(String(expressSurcharge).replace(/\s/g, '')) || 0
  const expressTotal = priceNum + surchargeNum
  const formatAmount = (n: number) =>
    n > 0 ? n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : ''
  const parseAmount = (raw: string) => Number(raw.replace(/[^\d]/g, '')) || 0

  const onCoverChange = (url: string | null) => {
    setError(null)
    const prev = coverImage
    setCoverImage(url)
    setGallery((g) => {
      const withoutPrev = prev ? g.filter((x) => x !== prev) : g
      if (!url) return withoutPrev
      return [url, ...withoutPrev.filter((x) => x !== url)]
    })
  }

  const toggleSize = (eu: string) => {
    const key = normalizeSizeLabel(eu)
    setSizes((prev) => {
      const has = prev.some((s) => normalizeSizeLabel(s) === key)
      if (has) return prev.filter((s) => normalizeSizeLabel(s) !== key)
      return [...prev, eu]
    })
  }

  const addCustomSize = () => {
    const raw = customSize.trim()
    if (!raw) return
    const key = normalizeSizeLabel(raw)
    if (!key) return
    setSizes((prev) =>
      prev.some((s) => normalizeSizeLabel(s) === key) ? prev : [...prev, key],
    )
    setCustomSize('')
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!user) return
    setError(null)

    if (!name.trim()) {
      setError(t('Укажите название'))
      return
    }
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      setError(t('Укажите корректную цену'))
      return
    }
    if (!brand) {
      setError(t('Выберите бренд'))
      return
    }
    if (!coverImage && gallery.length === 0) {
      setError(t('Добавьте фото товара'))
      return
    }
    if (sizes.length === 0) {
      setError(t('Выберите хотя бы один размер'))
      return
    }
    if (!expressDays.trim() || !standardDays.trim()) {
      setError(t('Укажите сроки доставки'))
      return
    }

    const image = coverImage || gallery[0]
    const created = publishProduct(
      {
        name,
        price: priceNum,
        category,
        gender,
        brand,
        colorName: colorName || undefined,
        image,
        gallery: gallery.length ? gallery : [image],
        sizes,
        expressDays,
        expressSurcharge: Math.max(0, surchargeNum),
        standardDays,
      },
      user.id,
    )
    openProduct(created.id)
  }

  return (
    <div className="page manager-page">
      <header className="page-header page-header--with-back">
        <button
          type="button"
          className="catalog-back"
          onClick={() => setManagerScreen('hub')}
          aria-label={t('Назад')}
        >
          <BackChevron />
        </button>
        <h1>{t('Новый товар')}</h1>
      </header>

      <form className="auth-form manager-form" onSubmit={onSubmit} noValidate>
        <fieldset className="manager-form__section">
          <legend>{t('Обложка')}</legend>
          <CoverImageField
            value={coverImage}
            onChange={onCoverChange}
            onError={setError}
            caption={name}
          />
          <label className="auth-field" htmlFor={`${formId}-name`}>
            <span>{t('Название')}</span>
            <input
              id={`${formId}-name`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={'Nike Dunk Low "Cacao Wow"'}
              required
            />
          </label>
          <label className="auth-field" htmlFor={`${formId}-price`}>
            <span>{t('Цена')}</span>
            <input
              id={`${formId}-price`}
              inputMode="numeric"
              value={price}
              onChange={(e) => setPrice(e.target.value.replace(/[^\d]/g, ''))}
              placeholder="3 090 000"
              required
            />
          </label>
        </fieldset>

        {/* 2. Category / brand / gender */}
        <fieldset className="manager-form__section">
          <legend>{t('Категория и бренд')}</legend>
          <label className="auth-field" htmlFor={`${formId}-category`}>
            <span>{t('Категория')}</span>
            <select
              id={`${formId}-category`}
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
            >
              {catalogDepartments.map((dept) => (
                <optgroup key={dept.id} label={t(dept.label)}>
                  {dept.categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {t(c.label)}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>

          <label className="auth-field" htmlFor={`${formId}-brand`}>
            <span>{t('Бренд')}</span>
            <select
              id={`${formId}-brand`}
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              required
            >
              {brandOptions.map((b) => (
                <option key={b.slug} value={b.slug}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>

          <div className="mgr-gender">
            <span className="mgr-gender__label">{t('Посадка')}</span>
            <div className="mgr-gender__toggle">
              <button
                type="button"
                className={gender === 'men' ? 'is-active' : ''}
                onClick={() => setGender('men')}
              >
                {t('Мужская')}
              </button>
              <button
                type="button"
                className={gender === 'women' ? 'is-active' : ''}
                onClick={() => setGender('women')}
              >
                {t('Женская')}
              </button>
            </div>
          </div>

          <label className="auth-field" htmlFor={`${formId}-color`}>
            <span>{t('Название цвета')}</span>
            <input
              id={`${formId}-color`}
              value={colorName}
              onChange={(e) => setColorName(e.target.value)}
              placeholder="Cacao Wow"
            />
          </label>
        </fieldset>

        {/* 3. Sizes */}
        <fieldset className="manager-form__section">
          <legend>{t('Размеры EU')}</legend>
          <p className="manager-form__section-hint">
            {t('Можно выбрать диапазоны (37–38) и целые числа (42, 45…). Отметьте доступные.')}
          </p>
          <div className="mgr-sizes">
            {SIZE_PALETTE.map((s) => {
              const on = sizes.some((x) => normalizeSizeLabel(x) === normalizeSizeLabel(s.eu))
              return (
                <button
                  key={s.eu}
                  type="button"
                  className={`mgr-sizes__chip${on ? ' is-active' : ''}`}
                  onClick={() => toggleSize(s.eu)}
                >
                  {s.eu}
                </button>
              )
            })}
          </div>
          <div className="mgr-sizes__custom">
            <input
              value={customSize}
              onChange={(e) => setCustomSize(e.target.value)}
              placeholder={t('Свой размер, напр. 51 или 48–49')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addCustomSize()
                }
              }}
            />
            <button type="button" onClick={addCustomSize}>
              {t('Добавить')}
            </button>
          </div>
          {sizes.length > 0 ? (
            <p className="manager-form__section-hint">
              {t('Выбрано: {list}', { list: sizes.join(', ') })}
            </p>
          ) : null}
        </fieldset>

        {/* 4. Gallery */}
        <fieldset className="manager-form__section">
          <legend>{t('Галерея')}</legend>
          <p className="manager-form__section-hint">
            {t('Несколько фото с превью. Первое — обложка, порядок можно менять стрелками.')}
          </p>
          <GalleryUploader
            images={gallery}
            onChange={setGallery}
            onError={setError}
          />
        </fieldset>

        {/* 5. Delivery */}
        <fieldset className="manager-form__section">
          <legend>{t('Доставка')}</legend>

          <div className="mgr-delivery-preview">
            <div className="mgr-delivery-preview__express">
              <span className="mgr-delivery-preview__badge">{t('Экспресс')}</span>
              <label className="mgr-delivery-preview__price" htmlFor={`${formId}-ex-price`}>
                <input
                  id={`${formId}-ex-price`}
                  inputMode="numeric"
                  value={formatAmount(expressTotal)}
                  onChange={(e) => {
                    const total = parseAmount(e.target.value)
                    setExpressSurcharge(String(Math.max(0, total - priceNum)))
                  }}
                  placeholder="1 000 000"
                  aria-label={t('Экспресс: цена')}
                />
                <span aria-hidden="true">₫</span>
              </label>
              <label className="mgr-delivery-preview__days" htmlFor={`${formId}-ex-days`}>
                <input
                  id={`${formId}-ex-days`}
                  value={expressDays}
                  onChange={(e) => setExpressDays(e.target.value)}
                  placeholder="3-7"
                  aria-label={t('Экспресс: дни')}
                />
                <span aria-hidden="true">{t('дней')}</span>
              </label>
            </div>
            <div className="mgr-delivery-preview__standard">
              <span>{t('Стандартная')}</span>
              <label className="mgr-delivery-preview__price" htmlFor={`${formId}-st-price`}>
                <input
                  id={`${formId}-st-price`}
                  inputMode="numeric"
                  value={formatAmount(priceNum)}
                  onChange={(e) => setPrice(e.target.value.replace(/[^\d]/g, ''))}
                  placeholder="0"
                  aria-label={t('Цена')}
                />
                <span aria-hidden="true">₫</span>
              </label>
              <label className="mgr-delivery-preview__days" htmlFor={`${formId}-st-days`}>
                <input
                  id={`${formId}-st-days`}
                  value={standardDays}
                  onChange={(e) => setStandardDays(e.target.value)}
                  placeholder="25-35"
                  aria-label={t('Стандартная: дни')}
                />
                <span aria-hidden="true">{t('дней')}</span>
              </label>
            </div>
          </div>
        </fieldset>

        {error ? <p className="auth-error">{error}</p> : null}

        <button type="submit" className="btn-primary btn-primary--block">
          {t('Опубликовать товар')}
        </button>
      </form>
    </div>
  )
}

export function ManagerPage() {
  const { user, isManager } = useAuth()
  const { managerScreen, setManagerScreen, closeManager, setTab } = useStore()
  const { t } = useI18n()

  if (!user || !isManager) {
    return (
      <div className="page">
        <header className="page-header page-header--with-back">
          <button
            type="button"
            className="catalog-back"
            onClick={closeManager}
            aria-label={t('Назад')}
          >
            <BackChevron />
          </button>
          <h1>{t('Кабинет менеджера')}</h1>
        </header>
        <div className="empty-state">
          <p>{t('Нужны права менеджера')}</p>
          <span>{t('Войдите под аккаунтом менеджера во вкладке Профиль.')}</span>
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              closeManager()
              setTab('profile')
            }}
          >
            {t('В профиль')}
          </button>
        </div>
      </div>
    )
  }

  if (managerScreen === 'orders') {
    return <OrdersPage managerId={user.id} onBack={() => setManagerScreen('hub')} />
  }
  if (managerScreen === 'new') return <NewProductForm />
  if (managerScreen === 'listings') return <ManagerListings />
  return <ManagerHub />
}

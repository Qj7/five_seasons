import { useEffect, useId, useMemo, useState, type FormEvent } from 'react'
import { useAuth } from '../auth'
import { useCatalog, type PublishInput } from '../catalog'
import {
  catalogDepartments,
  departmentOf,
  formatPrice,
  variantsOf,
  type Category,
  type Gender,
  type Product,
} from '../data/products'
import { brands, type BrandGroup } from '../data/brands'
import {
  defaultSizesFor,
  normalizeSizeLabel,
  sizePaletteFor,
  sizeSectionLabel,
} from '../data/sizes'
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

function formatAmount(n: number) {
  return n > 0 ? n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : ''
}

function parseAmount(raw: string) {
  return Number(raw.replace(/[^\d]/g, '')) || 0
}

function newExtraKey() {
  return `c-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

type ExtraColor = {
  key: string
  colorName: string
  coverImage: string | null
  gallery: string[]
}

function emptyExtra(): ExtraColor {
  return { key: newExtraKey(), colorName: '', coverImage: null, gallery: [] }
}

function ListingActions({ product }: { product: Product }) {
  const { removePublished } = useCatalog()
  const { openManagerEdit, openManagerAddColor, openProduct } = useStore()
  const { t } = useI18n()

  return (
    <div className="manager-list__actions">
      <button
        type="button"
        className="manager-list__action"
        onClick={() => openManagerEdit(product.id)}
      >
        {t('Изменить')}
      </button>
      <button
        type="button"
        className="manager-list__action"
        onClick={() => openManagerAddColor(product.id)}
      >
        {t('Добавить цвет')}
      </button>
      <button
        type="button"
        className="manager-list__action"
        onClick={() => openProduct(product.id)}
      >
        {t('Открыть')}
      </button>
      <button
        type="button"
        className="manager-list__remove"
        onClick={() => removePublished(product.id)}
      >
        {t('Снять')}
      </button>
    </div>
  )
}

function ManagerHub() {
  const { user } = useAuth()
  const { published } = useCatalog()
  const { openManagerNew, setManagerScreen, openManagerEdit, closeManager } =
    useStore()
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
          onClick={openManagerNew}
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
              <li key={p.id} className="manager-list__item manager-list__item--stack">
                <button
                  type="button"
                  className="manager-list__open"
                  onClick={() => openManagerEdit(p.id)}
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
                <ListingActions product={p} />
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
  const { published } = useCatalog()
  const { setManagerScreen, openManagerNew, openManagerEdit } = useStore()
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
          <button type="button" className="btn-primary" onClick={openManagerNew}>
            {t('Новый товар')}
          </button>
        </div>
      ) : (
        <section className="manager-list">
          <ul>
            {mine.map((p) => (
              <li key={p.id} className="manager-list__item manager-list__item--stack">
                <button
                  type="button"
                  className="manager-list__open"
                  onClick={() => openManagerEdit(p.id)}
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
                <ListingActions product={p} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function productToFormState(p: Product) {
  return {
    name: p.name,
    price: String(p.price),
    category: p.category,
    gender: (p.gender ?? 'unisex') as Gender,
    brand: p.brand ?? '',
    features: p.features ?? '',
    colorName: p.colorName === 'Default' ? '' : p.colorName,
    coverImage: p.image || null,
    gallery: p.gallery?.length ? [...p.gallery] : p.image ? [p.image] : [],
    sizes: p.sizes?.length ? [...p.sizes] : defaultSizesFor(p.category),
    expressTotal: String(p.price + (p.expressSurcharge ?? 0)),
    expressDays: p.expressDays ?? '3-7',
    standardDays: p.standardDays ?? '25-35',
    modelGroup: p.modelGroup,
  }
}

/** One extra colorway block: own cover + name + gallery (= own PDP object). */
function ExtraColorBlock({
  index,
  value,
  onChange,
  onRemove,
  onError,
}: {
  index: number
  value: ExtraColor
  onChange: (next: ExtraColor) => void
  onRemove: () => void
  onError: (message: string) => void
}) {
  const { t } = useI18n()
  const formId = useId()

  return (
    <fieldset className="manager-form__section mgr-extra-color">
      <legend>
        {t('Цвет {n}', { n: index + 2 })}
        <button
          type="button"
          className="mgr-extra-color__remove"
          onClick={onRemove}
        >
          {t('Убрать цвет')}
        </button>
      </legend>
      <p className="manager-form__section-hint">
        {t('Отдельная карточка со своими фото — как цвета у Crocs.')}
      </p>
      <CoverImageField
        value={value.coverImage}
        onChange={(url) => onChange({ ...value, coverImage: url })}
        onError={onError}
        caption={value.colorName}
      />
      <label className="auth-field" htmlFor={`${formId}-cname`}>
        <span>{t('Название цвета')}</span>
        <input
          id={`${formId}-cname`}
          value={value.colorName}
          onChange={(e) => onChange({ ...value, colorName: e.target.value })}
          placeholder="Black"
        />
      </label>
      <div>
        <span className="mgr-extra-color__gallery-label">{t('Галерея')}</span>
        <GalleryUploader
          images={value.gallery}
          onChange={(gallery) => onChange({ ...value, gallery })}
          onError={onError}
        />
      </div>
    </fieldset>
  )
}

function NewProductForm() {
  const { user } = useAuth()
  const { products, publishProduct, updatePublished } = useCatalog()
  const {
    setManagerScreen,
    openProduct,
    managerEditId,
    managerColorSourceId,
  } = useStore()
  const { t } = useI18n()
  const formId = useId()

  const editing = managerEditId
    ? products.find((p) => p.id === managerEditId)
    : null
  const colorSource = managerColorSourceId
    ? products.find((p) => p.id === managerColorSourceId)
    : null

  const mode: 'create' | 'edit' | 'addColor' = editing
    ? 'edit'
    : colorSource
      ? 'addColor'
      : 'create'

  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState<Category>('sneakers')
  const [gender, setGender] = useState<Gender>('men')
  const [brand, setBrand] = useState('nike')
  const [colorName, setColorName] = useState('')
  const [features, setFeatures] = useState('')
  const [coverImage, setCoverImage] = useState<string | null>(null)
  const [gallery, setGallery] = useState<string[]>([])
  const [sizes, setSizes] = useState<string[]>(() => defaultSizesFor('sneakers'))
  const [customSize, setCustomSize] = useState('')
  const [expressTotal, setExpressTotal] = useState('')
  const [expressDays, setExpressDays] = useState('3-7')
  const [standardDays, setStandardDays] = useState('25-35')
  const [modelGroup, setModelGroup] = useState<string | null>(null)
  const [moreColors, setMoreColors] = useState(false)
  const [extras, setExtras] = useState<ExtraColor[]>([])
  const [error, setError] = useState<string | null>(null)
  const [doneProducts, setDoneProducts] = useState<Product[] | null>(null)

  useEffect(() => {
    setDoneProducts(null)
    setError(null)
    setMoreColors(false)
    setExtras([])
    if (mode === 'edit' && editing) {
      const s = productToFormState(editing)
      setName(s.name)
      setPrice(s.price)
      setCategory(s.category)
      setGender(s.gender === 'unisex' ? 'men' : s.gender)
      setBrand(s.brand || brandsForCategory(s.category)[0]?.slug || '')
      setFeatures(s.features)
      setColorName(s.colorName)
      setCoverImage(s.coverImage)
      setGallery(s.gallery)
      setSizes(s.sizes)
      setExpressTotal(s.expressTotal)
      setExpressDays(s.expressDays)
      setStandardDays(s.standardDays)
      setModelGroup(s.modelGroup)
      return
    }
    if (mode === 'addColor' && colorSource) {
      const s = productToFormState(colorSource)
      setName(s.name)
      setPrice(s.price)
      setCategory(s.category)
      setGender(s.gender === 'unisex' ? 'men' : s.gender)
      setBrand(s.brand || brandsForCategory(s.category)[0]?.slug || '')
      setFeatures(s.features)
      setColorName('')
      setCoverImage(null)
      setGallery([])
      setSizes(s.sizes)
      setExpressTotal(s.expressTotal)
      setExpressDays(s.expressDays)
      setStandardDays(s.standardDays)
      setModelGroup(s.modelGroup)
      return
    }
    setName('')
    setPrice('')
    setCategory('sneakers')
    setGender('men')
    setBrand('nike')
    setFeatures('')
    setColorName('')
    setCoverImage(null)
    setGallery([])
    setSizes(defaultSizesFor('sneakers'))
    setExpressTotal('')
    setExpressDays('3-7')
    setStandardDays('25-35')
    setModelGroup(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, managerEditId, managerColorSourceId])

  const brandOptions = useMemo(() => brandsForCategory(category), [category])
  const sizePalette = useMemo(() => sizePaletteFor(category), [category])
  const sizesLegend = sizeSectionLabel(category)

  useEffect(() => {
    if (!brandOptions.some((b) => b.slug === brand)) {
      setBrand(brandOptions[0]?.slug ?? '')
    }
  }, [brandOptions, brand])

  const priceNum = parseAmount(price)
  const expressTotalNum = parseAmount(expressTotal)
  const surchargeNum = Math.max(0, expressTotalNum - priceNum)

  const colorways = useMemo(() => {
    const group = modelGroup || editing?.modelGroup || colorSource?.modelGroup
    if (!group) return [] as Product[]
    return variantsOf({ modelGroup: group } as Product, products)
  }, [modelGroup, editing, colorSource, products])

  const onCategoryChange = (next: Category) => {
    setCategory(next)
    setSizes(defaultSizesFor(next))
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
      prev.some((s) => normalizeSizeLabel(s) === key) ? prev : [...prev, raw.trim()],
    )
    setCustomSize('')
  }

  const enableMoreColors = (on: boolean) => {
    setMoreColors(on)
    if (on && extras.length === 0) setExtras([emptyExtra()])
    if (!on) setExtras([])
  }

  const addExtraColor = () => {
    setMoreColors(true)
    setExtras((prev) => [...prev, emptyExtra()])
  }

  const updateExtra = (key: string, next: ExtraColor) => {
    setExtras((prev) => prev.map((c) => (c.key === key ? next : c)))
  }

  const removeExtra = (key: string) => {
    setExtras((prev) => {
      const next = prev.filter((c) => c.key !== key)
      if (next.length === 0) setMoreColors(false)
      return next
    })
  }

  const validateShared = (): string | null => {
    if (!name.trim()) return t('Укажите название')
    if (!Number.isFinite(priceNum) || priceNum <= 0) return t('Укажите корректную цену')
    if (!Number.isFinite(expressTotalNum) || expressTotalNum <= 0) {
      return t('Укажите цену экспресс-доставки')
    }
    if (expressTotalNum < priceNum) return t('Экспресс не может быть дешевле цены')
    if (!brand) return t('Выберите бренд')
    if (sizes.length === 0) return t('Выберите хотя бы один размер')
    if (!expressDays.trim() || !standardDays.trim()) return t('Укажите сроки доставки')
    return null
  }

  const validateColor = (
    label: string,
    cover: string | null,
    gals: string[],
    cName: string,
    requireName: boolean,
  ): string | null => {
    if (!cover && gals.length === 0) {
      return t('Добавьте фото для цвета «{color}»', { color: label })
    }
    if (requireName && !cName.trim()) return t('Укажите название цвета')
    return null
  }

  const sharedFields = (): Omit<
    PublishInput,
    'colorName' | 'colorHex' | 'image' | 'gallery' | 'modelGroup'
  > => ({
    name,
    price: priceNum,
    category,
    gender,
    brand,
    features: features.trim() || undefined,
    sizes,
    expressDays,
    expressSurcharge: surchargeNum,
    standardDays,
  })

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!user) return
    setError(null)

    const sharedErr = validateShared()
    if (sharedErr) {
      setError(sharedErr)
      return
    }

    const primaryErr = validateColor(
      colorName.trim() || t('основной'),
      coverImage,
      gallery,
      colorName,
      mode === 'addColor' || moreColors,
    )
    if (primaryErr) {
      setError(primaryErr)
      return
    }

    if (moreColors) {
      for (let i = 0; i < extras.length; i++) {
        const ex = extras[i]
        const err = validateColor(
          ex.colorName.trim() || String(i + 2),
          ex.coverImage,
          ex.gallery,
          ex.colorName,
          true,
        )
        if (err) {
          setError(err)
          return
        }
      }
    }

    const shared = sharedFields()
    const primaryImage = coverImage || gallery[0]

    if (mode === 'edit' && editing) {
      const updated = updatePublished(editing.id, {
        ...shared,
        colorName: colorName || undefined,
        image: primaryImage,
        gallery,
        modelGroup: modelGroup || editing.modelGroup,
      })
      if (!updated) return

      const createdExtras: Product[] = []
      if (moreColors) {
        for (const ex of extras) {
          const img = ex.coverImage || ex.gallery[0]
          createdExtras.push(
            publishProduct(
              {
                ...shared,
                colorName: ex.colorName.trim(),
                image: img,
                gallery: ex.gallery,
                modelGroup: updated.modelGroup,
              },
              user.id,
            ),
          )
        }
      }
      setDoneProducts([updated, ...createdExtras])
      setModelGroup(updated.modelGroup)
      return
    }

    if (mode === 'addColor') {
      const created = publishProduct(
        {
          ...shared,
          colorName: colorName.trim() || undefined,
          image: primaryImage,
          gallery,
          modelGroup: modelGroup || undefined,
        },
        user.id,
      )
      setDoneProducts([created])
      setModelGroup(created.modelGroup)
      return
    }

    // create — primary + optional extras, one modelGroup
    const first = publishProduct(
      {
        ...shared,
        colorName: colorName.trim() || undefined,
        image: primaryImage,
        gallery,
      },
      user.id,
    )
    const created: Product[] = [first]
    if (moreColors) {
      for (const ex of extras) {
        const img = ex.coverImage || ex.gallery[0]
        created.push(
          publishProduct(
            {
              ...shared,
              colorName: ex.colorName.trim(),
              image: img,
              gallery: ex.gallery,
              modelGroup: first.modelGroup,
            },
            user.id,
          ),
        )
      }
    }
    setDoneProducts(created)
    setModelGroup(first.modelGroup)
  }

  const title =
    mode === 'edit'
      ? t('Редактирование')
      : mode === 'addColor'
        ? t('Новый цвет')
        : t('Новый товар')

  const submitLabel =
    mode === 'edit'
      ? t('Сохранить изменения')
      : mode === 'addColor'
        ? t('Опубликовать цвет')
        : moreColors && extras.length > 0
          ? t('Опубликовать ({n})', { n: 1 + extras.length })
          : t('Опубликовать товар')

  if (doneProducts?.length) {
    const primary = doneProducts[0]
    const group = variantsOf(primary, products)
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
          <h1>{title}</h1>
        </header>

        <div className="mgr-done">
          <p className="mgr-done__msg">
            {doneProducts.length > 1
              ? t('Опубликовано цветов: {n}', { n: doneProducts.length })
              : t('Товар «{name}» опубликован', { name: primary.name })}
          </p>

          <div className="mgr-colorways">
            <h4 className="mgr-colorways__label">{t('Цвета на странице товара')}</h4>
            <div className="mgr-colorways__list">
              {(group.length ? group : doneProducts).map((v) => (
                <button
                  key={v.id}
                  type="button"
                  className="mgr-colorways__swatch"
                  onClick={() => openProduct(v.id)}
                >
                  <img src={v.image} alt="" draggable={false} />
                  <span>{v.colorName}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mgr-done__actions">
            <button
              type="button"
              className="btn-primary btn-primary--block"
              onClick={() => openProduct(primary.id)}
            >
              {t('Открыть товар')}
            </button>
            <button
              type="button"
              className="mgr-done__secondary"
              onClick={() => setManagerScreen('listings')}
            >
              {t('Мои товары')}
            </button>
            <button
              type="button"
              className="mgr-done__secondary"
              onClick={() => setManagerScreen('hub')}
            >
              {t('В кабинет')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const showMultiColors = mode === 'create' || mode === 'edit'

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
        <h1>{title}</h1>
      </header>

      {mode === 'addColor' ? (
        <p className="manager-form__section-hint manager-page__lead">
          {t('Новый цвет той же модели — свои обложка и галерея.')}
        </p>
      ) : null}

      {colorways.length > 0 ? (
        <div className="mgr-colorways mgr-colorways--form">
          <h4 className="mgr-colorways__label">{t('Уже в каталоге')}</h4>
          <div className="mgr-colorways__list">
            {colorways.map((v) => (
              <div
                key={v.id}
                className={`mgr-colorways__swatch${
                  editing && v.id === editing.id ? ' is-active' : ''
                }`}
              >
                <img src={v.image} alt="" draggable={false} />
                <span>{v.colorName}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <form className="auth-form manager-form" onSubmit={onSubmit} noValidate>
        <fieldset className="manager-form__section">
          <legend>{t('Обложка')}</legend>
          <CoverImageField
            value={coverImage}
            onChange={(url) => {
              setError(null)
              setCoverImage(url)
            }}
            onError={setError}
            caption={colorName || name}
          />
          <label className="auth-field" htmlFor={`${formId}-name`}>
            <span>{t('Название')}</span>
            <input
              id={`${formId}-name`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={'Nike Dunk Low'}
              required
              disabled={mode === 'addColor'}
            />
          </label>
          {moreColors || mode === 'addColor' ? (
            <label className="auth-field" htmlFor={`${formId}-color`}>
              <span>{t('Название цвета')}</span>
              <input
                id={`${formId}-color`}
                value={colorName}
                onChange={(e) => setColorName(e.target.value)}
                placeholder="White"
              />
              <span className="manager-form__section-hint">
                {t('Устанавливается, когда у товара больше одного цвета')}
              </span>
            </label>
          ) : null}
        </fieldset>

        <fieldset className="manager-form__section">
          <legend>{t('Категория и бренд')}</legend>
          <label className="auth-field" htmlFor={`${formId}-category`}>
            <span>{t('Категория')}</span>
            <select
              id={`${formId}-category`}
              value={category}
              onChange={(e) => onCategoryChange(e.target.value as Category)}
              disabled={mode === 'addColor'}
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
              disabled={mode === 'addColor'}
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
                disabled={mode === 'addColor'}
              >
                {t('Мужская')}
              </button>
              <button
                type="button"
                className={gender === 'women' ? 'is-active' : ''}
                onClick={() => setGender('women')}
                disabled={mode === 'addColor'}
              >
                {t('Женская')}
              </button>
            </div>
          </div>

          <label className="auth-field" htmlFor={`${formId}-features`}>
            <span>{t('Особенности')}</span>
            <textarea
              id={`${formId}-features`}
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              placeholder={t(
                'Лёгкие, амортизируют удары, нескользящие…',
              )}
              rows={3}
              disabled={mode === 'addColor'}
            />
          </label>
        </fieldset>

        <fieldset className="manager-form__section">
          <legend>{t(sizesLegend)}</legend>
          <div className="mgr-sizes">
            {sizePalette.map((s) => {
              const on = sizes.some(
                (x) => normalizeSizeLabel(x) === normalizeSizeLabel(s.eu),
              )
              return (
                <button
                  key={s.eu}
                  type="button"
                  className={`mgr-sizes__chip${on ? ' is-active' : ''}`}
                  onClick={() => toggleSize(s.eu)}
                  disabled={mode === 'addColor'}
                >
                  {s.eu}
                </button>
              )
            })}
          </div>
          {mode !== 'addColor' ? (
            <div className="mgr-sizes__custom">
              <input
                value={customSize}
                onChange={(e) => setCustomSize(e.target.value)}
                placeholder={t('Свой размер')}
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
          ) : null}
        </fieldset>

        <fieldset className="manager-form__section">
          <legend>{t('Галерея')}</legend>
          <GalleryUploader
            images={gallery}
            onChange={setGallery}
            onError={setError}
          />
        </fieldset>

        <fieldset className="manager-form__section">
          <legend>{t('Цены и доставка')}</legend>

          <label className="auth-field" htmlFor={`${formId}-price`}>
            <span>{t('Цена')}</span>
            <input
              id={`${formId}-price`}
              inputMode="numeric"
              value={formatAmount(priceNum) || price}
              onChange={(e) => {
                const next = e.target.value.replace(/[^\d]/g, '')
                setPrice(next)
                const p = Number(next) || 0
                const ex = parseAmount(expressTotal)
                if (!expressTotal || ex < p) {
                  setExpressTotal(p > 0 ? String(p + 1_000_000) : '')
                }
              }}
              placeholder="3 090 000"
              required
              disabled={mode === 'addColor'}
            />
          </label>

          <div className="mgr-delivery-preview">
            <div className="mgr-delivery-preview__express">
              <span className="mgr-delivery-preview__badge">{t('Экспресс')}</span>
              <label
                className="mgr-delivery-preview__price"
                htmlFor={`${formId}-ex-price`}
              >
                <input
                  id={`${formId}-ex-price`}
                  inputMode="numeric"
                  value={formatAmount(expressTotalNum) || expressTotal}
                  onChange={(e) =>
                    setExpressTotal(e.target.value.replace(/[^\d]/g, ''))
                  }
                  placeholder="4 090 000"
                  aria-label={t('Экспресс доставка')}
                  disabled={mode === 'addColor'}
                />
                <span aria-hidden="true">₫</span>
              </label>
              <label
                className="mgr-delivery-preview__days"
                htmlFor={`${formId}-ex-days`}
              >
                <input
                  id={`${formId}-ex-days`}
                  value={expressDays}
                  onChange={(e) => setExpressDays(e.target.value)}
                  placeholder="3-7"
                  aria-label={t('Экспресс: дни')}
                  disabled={mode === 'addColor'}
                />
                <span aria-hidden="true">{t('дней')}</span>
              </label>
            </div>
            <div className="mgr-delivery-preview__standard">
              <span>{t('Стандартная')}</span>
              <label
                className="mgr-delivery-preview__price"
                htmlFor={`${formId}-st-price`}
              >
                <input
                  id={`${formId}-st-price`}
                  inputMode="numeric"
                  value={formatAmount(priceNum) || price}
                  onChange={(e) => {
                    const next = e.target.value.replace(/[^\d]/g, '')
                    setPrice(next)
                    const p = Number(next) || 0
                    const ex = parseAmount(expressTotal)
                    if (!expressTotal || ex < p) {
                      setExpressTotal(p > 0 ? String(p + 1_000_000) : '')
                    }
                  }}
                  placeholder="0"
                  aria-label={t('Стандартная доставка')}
                  disabled={mode === 'addColor'}
                />
                <span aria-hidden="true">₫</span>
              </label>
              <label
                className="mgr-delivery-preview__days"
                htmlFor={`${formId}-st-days`}
              >
                <input
                  id={`${formId}-st-days`}
                  value={standardDays}
                  onChange={(e) => setStandardDays(e.target.value)}
                  placeholder="25-35"
                  aria-label={t('Стандартная: дни')}
                  disabled={mode === 'addColor'}
                />
                <span aria-hidden="true">{t('дней')}</span>
              </label>
            </div>
          </div>
        </fieldset>

        {showMultiColors ? (
          <fieldset className="manager-form__section mgr-more-colors">
            <label className="mgr-more-colors__check">
              <input
                type="checkbox"
                checked={moreColors}
                onChange={(e) => enableMoreColors(e.target.checked)}
              />
              <span>{t('Другие цвета')}</span>
            </label>

            {moreColors
              ? extras.map((ex, i) => (
                  <ExtraColorBlock
                    key={ex.key}
                    index={i}
                    value={ex}
                    onChange={(next) => updateExtra(ex.key, next)}
                    onRemove={() => removeExtra(ex.key)}
                    onError={setError}
                  />
                ))
              : null}

            {moreColors ? (
              <button
                type="button"
                className="mgr-more-colors__add"
                onClick={addExtraColor}
              >
                {t('Добавить ещё цвет')}
              </button>
            ) : null}
          </fieldset>
        ) : null}

        {error ? <p className="auth-error">{error}</p> : null}

        <button type="submit" className="btn-primary btn-primary--block">
          {submitLabel}
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
        <div className="empty-state">
          <p>{t('Нужны права менеджера')}</p>
          <p className="manager-form__section-hint">
            {t('Войдите под аккаунтом менеджера во вкладке Профиль.')}
          </p>
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
    return (
      <OrdersPage
        managerId={user.id}
        onBack={() => setManagerScreen('hub')}
      />
    )
  }
  if (managerScreen === 'new') return <NewProductForm />
  if (managerScreen === 'listings') return <ManagerListings />
  return <ManagerHub />
}

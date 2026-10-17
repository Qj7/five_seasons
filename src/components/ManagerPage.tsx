import { useId, useState, type FormEvent } from 'react'
import { useAuth } from '../auth'
import { useCatalog } from '../catalog'
import {
  catalogDepartments,
  formatPrice,
  type Category,
  type Gender,
} from '../data/products'
import { useStore } from '../store'
import { useI18n } from '../i18n'
import { CrocVisual } from './CrocVisual'

type ColorRow = {
  key: string
  images: string[]
  colorName: string
}

const emptyColor = (): ColorRow => ({
  key: `c-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
  images: [],
  colorName: '',
})

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
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

export function ManagerPage() {
  const { user, isManager } = useAuth()
  const { published, publishProduct, removePublished } = useCatalog()
  const { closeManager, openProduct, setTab } = useStore()
  const { t } = useI18n()
  const formId = useId()
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState<Category>('sneakers')
  const [gender, setGender] = useState<Gender>('unisex')
  const [delivery, setDelivery] = useState('3 дня')
  const [colors, setColors] = useState<ColorRow[]>(() => [emptyColor()])
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

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
          <h1>{t('Новый товар')}</h1>
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

  const mine = published.filter((p) => p.publishedBy === user.id)

  const onImages = async (key: string, files: FileList | null) => {
    if (!files?.length) return
    setBusy(true)
    setError(null)
    try {
      const urls: string[] = []
      for (const file of [...files]) {
        if (!file.type.startsWith('image/')) {
          setError(t('Выберите файл изображения'))
          continue
        }
        if (file.size > 4 * 1024 * 1024) {
          setError(t('Фото должно быть меньше 4 МБ'))
          continue
        }
        urls.push(await readFileAsDataUrl(file))
      }
      if (urls.length) {
        setColors((rows) =>
          rows.map((row) => (row.key === key ? { ...row, images: urls } : row)),
        )
      }
    } catch {
      setError(t('Не удалось прочитать фото'))
    } finally {
      setBusy(false)
    }
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    const amount = Number(String(price).replace(/\s/g, ''))
    if (!name.trim()) {
      setError(t('Укажите название'))
      return
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setError(t('Укажите корректную цену'))
      return
    }
    if (colors.some((row) => !row.colorName.trim() || row.images.length === 0)) {
      setError(t('Для каждого цвета нужны фото и название'))
      return
    }
    const created = publishProduct(
      {
        name,
        price: amount,
        category,
        gender,
        delivery,
        colors: colors.map((row) => ({
          colorName: row.colorName,
          images: row.images,
        })),
      },
      user.id,
    )
    setName('')
    setPrice('')
    setCategory('sneakers')
    setGender('unisex')
    setDelivery('3 дня')
    setColors([emptyColor()])
    if (created[0]) openProduct(created[0].id)
  }

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
        <h1>{t('Новый товар')}</h1>
      </header>

      <p className="manager-page__lead">
        {t('Один цвет — одна карточка. Кнопка «+» добавляет ещё цвет той же модели.')}
      </p>

      <form className="auth-form manager-form" onSubmit={onSubmit} noValidate>
        <label className="auth-field" htmlFor={`${formId}-name`}>
          <span>{t('Название')}</span>
          <input
            id={`${formId}-name`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nike Dunk Low"
            required
          />
        </label>

        <div className="manager-form__row">
          <label className="auth-field" htmlFor={`${formId}-price`}>
            <span>{t('Цена (₫)')}</span>
            <input
              id={`${formId}-price`}
              inputMode="numeric"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="1799000"
              required
            />
          </label>
          <label className="auth-field" htmlFor={`${formId}-gender`}>
            <span>{t('Пол')}</span>
            <select
              id={`${formId}-gender`}
              value={gender}
              onChange={(e) => setGender(e.target.value as Gender)}
            >
              <option value="men">{t('Мужчинам')}</option>
              <option value="women">{t('Женщинам')}</option>
              <option value="unisex">{t('Унисекс')}</option>
            </select>
          </label>
        </div>

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

        <label className="auth-field" htmlFor={`${formId}-delivery`}>
          <span>{t('Доставка')}</span>
          <input
            id={`${formId}-delivery`}
            value={delivery}
            onChange={(e) => setDelivery(e.target.value)}
          />
        </label>

        <div className="color-rows">
          <span className="color-rows__label">{t('Цвета')}</span>
          {colors.map((row, index) => (
            <div key={row.key} className="color-row">
              <label className="color-row__photos">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => void onImages(row.key, e.target.files)}
                />
                {row.images.length > 0 ? (
                  <span className="color-row__thumbs">
                    {row.images.slice(0, 3).map((src) => (
                      <img key={src.slice(0, 48)} src={src} alt="" />
                    ))}
                  </span>
                ) : (
                  <span>{t('Фото')}</span>
                )}
              </label>
              <input
                className="color-row__name"
                value={row.colorName}
                placeholder={t('Название цвета')}
                aria-label={t('Название цвета')}
                onChange={(e) =>
                  setColors((rows) =>
                    rows.map((item) =>
                      item.key === row.key ? { ...item, colorName: e.target.value } : item,
                    ),
                  )
                }
              />
              {colors.length > 1 ? (
                <button
                  type="button"
                  className="color-row__remove"
                  aria-label={t('Убрать цвет')}
                  onClick={() =>
                    setColors((rows) => rows.filter((item) => item.key !== row.key))
                  }
                >
                  ×
                </button>
              ) : (
                <span className="color-row__index" aria-hidden>
                  {index + 1}
                </span>
              )}
            </div>
          ))}
          <button
            type="button"
            className="color-rows__add"
            onClick={() => setColors((rows) => [...rows, emptyColor()])}
          >
            +
          </button>
        </div>

        {error ? <p className="auth-error">{error}</p> : null}

        <button type="submit" className="btn-primary btn-primary--block" disabled={busy}>
          {busy ? t('Загрузка…') : t('Опубликовать товар')}
        </button>
      </form>

      <section className="manager-list">
        <h2>{t('Мои публикации ({n})', { n: mine.length })}</h2>
        {mine.length === 0 ? (
          <p className="manager-list__empty">{t('Пока ничего не опубликовано')}</p>
        ) : (
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
        )}
      </section>
    </div>
  )
}

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { A11y, FreeMode, Mousewheel, Thumbs, Zoom } from 'swiper/modules'
import { Swiper, SwiperSlide, type SwiperClass } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/zoom'
import { createPortal } from 'react-dom'
const crocsLogo = '/assets/crocs-logo.png'
const sizeChartImg = '/assets/size-guide/size-chart.png'
const sizeGuideStep1 = '/assets/size-guide/step-1.jpg'
const sizeGuideStep2 = '/assets/size-guide/step-2.jpg'
const sizeGuideStep3 = '/assets/size-guide/step-3.jpg'
const sizeGuideStep4 = '/assets/size-guide/step-4.jpg'
import {
  categoryMeta,
  departmentOf,
  formatPrice,
  unitPrice,
  galleryOf,
  variantsOf,
  type Product,
} from '../data/products'
import { brands } from '../data/brands'
import {
  formatDeliveryDays,
  resolveSizeOptions,
  sizeSystemFor,
} from '../data/sizes'
import { useCatalog } from '../catalog'
import { useStore } from '../store'
import { BrandLogo } from './BrandMark'
import { useI18n } from '../i18n'

const SIZE_GUIDE_STEPS = [
  {
    image: sizeGuideStep1,
    caption: '1. Поставьте ногу на бумагу.',
  },
  {
    image: sizeGuideStep2,
    caption: '2. Отметьте ручкой пятку и большой палец.',
  },
  {
    image: sizeGuideStep3,
    caption: '3. Измерьте полученное расстояние линейкой.',
  },
  {
    image: sizeGuideStep4,
    caption: '4. Подберите кроксы согласно размерной сетке',
  },
] as const

type SizeSystem = 'eu' | 'mw'

function categoryTags(product: Product): string[] {
  const dept = departmentOf(product.category)
  const meta = categoryMeta(product.category)
  if (product.modelGroup === 'jibbitz') return ['Аксессуары', 'Jibbitz', 'Украшения']
  if (product.brand) {
    const brandName = brands.find((b) => b.slug === product.brand)?.name ?? product.brand
    return [dept?.label ?? 'Обувь', meta?.label ?? 'Кроссовки и кеды', brandName]
  }
  return [dept?.label ?? 'Обувь', meta?.label ?? 'Тапки', 'Crocs']
}

const FEATURES: Record<string, string> = {
  jibbitz: 'Съёмные, совместимы с Classic Clog, яркие дизайны',
  sneakers: 'Кожа и сетка, амортизирующая подошва, повседневная посадка',
  default:
    'Лёгкие, амортизируют удары, нескользящие, износостойкие, воздухопроницаемые',
}

function heroLines(product: Product): { mark: string; lines: string[] } {
  if (product.modelGroup === 'jibbitz') {
    return { mark: 'JIBBITZ', lines: product.name.replace(/^Jibbitz\s+/i, '').split(/\s+/).slice(0, 4) }
  }

  const mark = product.name.includes('×')
    ? product.name.split(/\s*×/)[0].trim().split(/\s+/)[0].toUpperCase()
    : 'CROCS'

  const rest = product.name
    .replace(/^[^×]+×\s*Crocs\s*/i, '')
    .replace(/^Crocs\s+/i, '')
    .trim()

  // One word per line — like the NB reference stack
  const lines = rest.split(/\s+/).filter(Boolean).slice(0, 5)
  return { mark, lines: lines.length ? lines : [product.name] }
}

/** One line, scaled so the product name fills the hero row. */
function FitTitle({ text }: { text: string }) {
  const ref = useRef<HTMLHeadingElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    const box = el?.parentElement
    if (!el || !box) return

    const fit = () => {
      const available = box.clientWidth
      if (available <= 0) return
      const max = 28
      el.style.fontSize = `${max}px`
      const width = el.scrollWidth
      if (width <= 0) return
      el.style.fontSize = `${Math.min(max, (available / width) * max * 0.985)}px`
    }

    fit()
    document.fonts?.ready.then(fit)
    const ro = new ResizeObserver(fit)
    ro.observe(box)
    return () => ro.disconnect()
  }, [text])

  return (
    <h1 ref={ref} className="pdp-hero__product-name">
      {text}
    </h1>
  )
}

const REVIEWS = [
  {
    user: 'masha_k',
    when: '2 месяца назад',
    pros: 'Очень удобные, цвет как на фото.',
    cons: 'Нет',
    comment: 'Беру уже вторую пару — супер на каждый день.',
  },
  {
    user: 'alex',
    when: 'в прошлом году',
    pros: 'Лёгкие и яркие, сидят отлично.',
    cons: 'Популярная модель',
    comment: 'Jibbitz сверху — огонь. Рекомендую размер как обычно.',
  },
]

export function ProductPage({ productId }: { productId: string }) {
  const { closeProduct, openProduct, favorites, toggleFavorite, addToCart, setTab } =
    useStore()
  const { products } = useCatalog()
  const { t } = useI18n()
  const product = products.find((p) => p.id === productId)
  const [sizeSystem, setSizeSystem] = useState<SizeSystem>('eu')
  const [sizeIndex, setSizeIndex] = useState(1)
  const [delivery, setDelivery] = useState<'standard' | 'express'>('standard')
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const selectSize = (system: SizeSystem, index: number) => {
    setSizeSystem(system)
    setSizeIndex(index)
  }

  useEffect(() => {
    const main = document.querySelector('.app-main')
    main?.scrollTo({ top: 0 })
    setSizeIndex(0)
    setDelivery('standard')
  }, [productId])

  useEffect(() => {
    if (!sizeGuideOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSizeGuideOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [sizeGuideOpen])

  const liked = product ? favorites.has(product.id) : false
  const variants = useMemo(
    () => (product ? variantsOf(product, products) : []),
    [product, products],
  )
  const { mark, lines } = useMemo(
    () => (product ? heroLines(product) : { mark: '', lines: [] }),
    [product],
  )
  const gallery = useMemo(
    () => (product ? galleryOf(product) : []),
    [product],
  )

  if (!product) {
    return (
      <div className="page">
        <p>{t('Товар не найден')}</p>
        <button type="button" className="btn-primary" onClick={closeProduct}>
          {t('Назад')}
        </button>
      </div>
    )
  }

  const tags = categoryTags(product)
  const features =
    product.features?.trim() ||
    (product.modelGroup === 'jibbitz'
      ? FEATURES.jibbitz
      : product.category === 'sneakers'
        ? FEATURES.sneakers
        : FEATURES.default)
  const isStudio = product.category !== 'slippers'
  const isSneaker =
    product.category === 'sneakers' || product.category === 'custom-sneakers'
  const sku = product.id.replace(/-/g, '').toUpperCase()
  const sizeOptions = resolveSizeOptions(product.sizes)
  const catalogSizeSystem = sizeSystemFor(product.category)
  const sizeLabel =
    catalogSizeSystem === 'eu'
      ? 'EU:'
      : catalogSizeSystem === 'waist'
        ? 'W:'
        : ''
  const expressPrice = unitPrice(product, 'express')
  const buyPrice = unitPrice(product, delivery)
  const isJibbitz = product.modelGroup === 'jibbitz'
  const selectedSize = sizeOptions[Math.min(sizeIndex, Math.max(sizeOptions.length - 1, 0))]
  const sizeValue = isJibbitz
    ? ''
    : sizeSystem === 'mw' && selectedSize?.mw && selectedSize.mw !== '—'
      ? selectedSize.mw
      : selectedSize?.eu ?? ''
  const putInCart = () => addToCart(product.id, { size: sizeValue, delivery })
  const expressEta = formatDeliveryDays(
    product.expressDays,
    t('от 3 до 7 дней'),
  )
  const standardEta = formatDeliveryDays(product.standardDays, t('25–35 дней'))

  return (
    <div className="pdp">
      <section
        className={`pdp-hero${isStudio ? ' pdp-hero--studio' : ''}${
          isSneaker ? ' pdp-hero--sneaker' : ''
        }`}
      >
        <div className="pdp__topbar">
          <button
            type="button"
            className="pdp__back"
            aria-label={t('Назад')}
            onClick={closeProduct}
          >
            <BackIcon />
          </button>
          <p className="pdp__brand logo">
            <BrandLogo size={22} compact />
          </p>
        </div>

        {isStudio && (
          <div className="pdp-hero__identity">
            <FitTitle text={product.name} />
          </div>
        )}

        {!isStudio && <div className="pdp-hero__title" aria-hidden="true">
          <img
            className="pdp-hero__logo"
            src={crocsLogo}
            alt=""
            draggable={false}
          />
          <span className="pdp-hero__kind">
            {product.tag === 'Collab' ? 'collab' : 'Origin'}
          </span>
          <span className="pdp-hero__mark">{mark}</span>
          {lines.map((line, i) => (
            <span key={i} className="pdp-hero__line">
              {line}
            </span>
          ))}
        </div>}

        <div className="pdp-hero__shoe" aria-hidden="true">
          <div className="pdp-hero__shoe-shift">
            <div className="pdp-hero__shoe-spin">
              <img
                src={isStudio ? product.image : `${product.image}?cut=1`}
                alt=""
                draggable={false}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Original / actions */}
      <section className="pdp-panel">
        <div className="pdp-toolbar">
          <div className="pdp-original">
            <CheckIcon />
            <span>{t('Оригинал')}</span>
            <OriginalityInfo />
          </div>
          <div className="pdp-toolbar__actions">
            <ShareButton product={product} />
            <button
              type="button"
              aria-label={t(liked ? 'Убрать из избранного' : 'В избранное')}
              className={liked ? 'is-liked' : ''}
              onClick={() => toggleFavorite(product.id)}
            >
              <HeartIcon filled={liked} />
            </button>
          </div>
        </div>

        <div className="pdp-tags">
          {tags.map((tag) => (
            <span key={tag}>{t(tag)}</span>
          ))}
        </div>

        <div className="pdp-specs">
          <div>
            <h4>{t('Артикул')}</h4>
            <p>{sku}</p>
          </div>
          <div>
            <h4>{t('Особенности')}</h4>
            <p>{t(features)}</p>
          </div>
          <div>
            <h4>{t('Посадка')}</h4>
            <p>
              {t(
                product.gender === 'men'
                  ? 'Мужская'
                  : product.gender === 'women'
                    ? 'Женская'
                    : isJibbitz
                      ? 'Универсальная'
                      : 'Унисекс',
              )}
            </p>
          </div>
        </div>

        {variants.length > 1 && (
          <div className="pdp-colors">
            <h4 className="pdp-colors__label">
              {t('Цвет — {color}', { color: product.colorName })}
            </h4>
            <div className="pdp-colors__list">
              {variants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  className={`pdp-colors__swatch${
                    v.id === product.id ? ' is-active' : ''
                  }${v.soldOut ? ' is-sold-out' : ''}`}
                  aria-label={v.colorName}
                  aria-current={v.id === product.id ? 'true' : undefined}
                  onClick={() => openProduct(v.id)}
                >
                  <img src={v.image} alt="" draggable={false} />
                  <span>{v.colorName}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {!isJibbitz && (
          <div className="pdp-sizes">
            <div className="pdp-sizes__row">
              {sizeLabel ? (
                <span className="pdp-sizes__label">{sizeLabel}</span>
              ) : null}
              <div className="pdp-sizes__track">
                {sizeOptions.map((s, i) => (
                  <button
                    key={s.eu}
                    type="button"
                    className={
                      sizeSystem === 'eu' && sizeIndex === i ? 'is-active' : ''
                    }
                    onClick={() => selectSize('eu', i)}
                  >
                    {s.eu}
                  </button>
                ))}
              </div>
            </div>
            <div className="pdp-sizes__row">
              <span className="pdp-sizes__label">M/W:</span>
              <div className="pdp-sizes__track">
                {sizeOptions.map((s, i) => (
                  <button
                    key={`${s.eu}-${s.mw}`}
                    type="button"
                    className={
                      sizeSystem === 'mw' && sizeIndex === i ? 'is-active' : ''
                    }
                    onClick={() => selectSize('mw', i)}
                  >
                    {s.mw}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {!isJibbitz && (
          <div className="pdp-links">
            <button type="button" onClick={() => setSizeGuideOpen(true)}>
              <RulerIcon /> {t('Как определить размер обуви')}
            </button>
          </div>
        )}

        <PhotoCarousel key={product.id} images={gallery} alt={product.name} />

        <div className="pdp-delivery">
          <button
            type="button"
            className={`pdp-delivery__option pdp-delivery__option--express${
              delivery === 'express' ? ' is-active' : ''
            }`}
            onClick={() => setDelivery('express')}
          >
            <span className="pdp-delivery__badge">{t('Экспресс')}</span>
            <span className="pdp-delivery__price">{formatPrice(expressPrice)}</span>
            <span className="pdp-delivery__eta">{expressEta}</span>
          </button>
          <button
            type="button"
            className={`pdp-delivery__option pdp-delivery__option--standard${
              delivery === 'standard' ? ' is-active' : ''
            }`}
            onClick={() => setDelivery('standard')}
          >
            <strong className="pdp-delivery__name">{t('Стандартная')}</strong>
            <span className="pdp-delivery__price">{formatPrice(product.price)}</span>
            <span className="pdp-delivery__eta">{standardEta}</span>
          </button>
        </div>
      </section>

      <section className="pdp-panel">
        <button type="button" className="pdp-reviews__head">
          <span>{t('Отзывы на этот товар')}</span>
          <ChevronRight />
        </button>
        <div className="pdp-reviews__score">
          <strong>4.9</strong>
          <div>
            <div className="pdp-stars" aria-hidden>
              {'★★★★★'}
            </div>
            <p>{t('392 оценки · 141 отзыв')}</p>
          </div>
        </div>

        <div className="pdp-reviews__cards">
          {REVIEWS.map((r) => (
            <article key={r.user} className="pdp-review">
              <header>
                <span className="pdp-review__avatar">{r.user[0].toUpperCase()}</span>
                <div>
                  <strong>{r.user}</strong>
                  <span>{t(r.when)}</span>
                </div>
              </header>
              <div className="pdp-stars pdp-stars--sm">{'★★★★★'}</div>
              <p>
                <b>{t('Достоинства:')}</b> {t(r.pros)}
              </p>
              <p>
                <b>{t('Недостатки:')}</b> {t(r.cons)}
              </p>
              <p>
                <b>{t('Комментарий:')}</b> {t(r.comment)}
              </p>
            </article>
          ))}
        </div>
      </section>

      <div className="pdp-spacer" aria-hidden />

      {mounted &&
        createPortal(
        product.soldOut ? (
          <div className="pdp-buybar pdp-buybar--sticky pdp-buybar--sold-out">
            <span className="pdp-buybar__sold-out">Sold out</span>
          </div>
        ) : (
          <div className="pdp-buybar pdp-buybar--sticky">
            <button
              type="button"
              className="pdp-buybar__cart"
              onClick={putInCart}
            >
              {t('В корзину')}
            </button>
            <button
              type="button"
              className="pdp-buybar__buy"
              onClick={() => {
                putInCart()
                setTab('cart')
              }}
            >
              {t('Купить {price}', { price: formatPrice(buyPrice) })}
            </button>
          </div>
        ),
        document.querySelector('.app-shell') ?? document.body,
      )}

      {mounted &&
        sizeGuideOpen &&
        createPortal(
          <SizeGuideSheet onClose={() => setSizeGuideOpen(false)} />,
          document.querySelector('.app-shell') ?? document.body,
        )}
    </div>
  )
}

function PhotoCarousel({ images, alt }: { images: string[]; alt: string }) {
  const { t } = useI18n()
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperClass | null>(null)
  const [failed, setFailed] = useState<Set<string>>(() => new Set())

  const slides = useMemo(
    () => images.filter((src) => !failed.has(src)),
    [images, failed],
  )

  useEffect(() => {
    setFailed(new Set())
  }, [images])

  const markFailed = (src: string) => {
    setFailed((prev) => {
      if (prev.has(src)) return prev
      const next = new Set(prev)
      next.add(src)
      return next
    })
  }

  if (slides.length === 0) return null

  if (slides.length === 1) {
    return (
      <div className="pdp-gallery pdp-gallery--single">
        <img
          src={slides[0]}
          alt={alt}
          draggable={false}
          onError={() => markFailed(slides[0])}
        />
      </div>
    )
  }

  const photoLabel = (n: number | string) =>
    t('Фото {n} из {total}', { n, total: slides.length })

  return (
    <div className="pdp-gallery">
      <Swiper
        className="pdp-gallery__main"
        modules={[Thumbs, Zoom, Mousewheel, A11y]}
        zoom={{ maxRatio: 3 }}
        watchOverflow
        spaceBetween={0}
        slidesPerView={1}
        speed={320}
        threshold={5}
        resistanceRatio={0.65}
        nested
        simulateTouch
        touchReleaseOnEdges
        mousewheel={{
          enabled: true,
          forceToAxis: true,
          sensitivity: 1,
          releaseOnEdges: true,
        }}
        thumbs={{
          swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
        }}
        a11y={{
          prevSlideMessage: t('Назад'),
          nextSlideMessage: t('Далее'),
        }}
      >
        {slides.map((src, i) => (
          <SwiperSlide key={src}>
            <div className="swiper-zoom-container">
              <img
                src={src}
                alt={i === 0 ? alt : photoLabel(i + 1)}
                draggable={false}
                onError={() => markFailed(src)}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <Swiper
        className="pdp-gallery__thumbs"
        modules={[Thumbs, FreeMode, A11y]}
        onSwiper={setThumbsSwiper}
        slidesPerView="auto"
        spaceBetween={8}
        freeMode
        watchSlidesProgress
      >
        {slides.map((src, i) => (
          <SwiperSlide key={src} aria-label={photoLabel(i + 1)}>
            <img src={src} alt="" draggable={false} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}

function SizeGuideSheet({ onClose }: { onClose: () => void }) {
  const { t } = useI18n()
  return (
    <div className="size-guide" role="presentation">
      <button
        type="button"
        className="size-guide__backdrop"
        aria-label={t('Закрыть')}
        onClick={onClose}
      />
      <div
        className="size-guide__sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="size-guide-title"
      >
        <header className="size-guide__head">
          <h2 id="size-guide-title">{t('Как определить размер обуви')}</h2>
          <button
            type="button"
            className="size-guide__close"
            aria-label={t('Закрыть')}
            onClick={onClose}
          >
            <CloseIcon />
          </button>
        </header>

        <div className="size-guide__body">
          <p className="size-guide__intro">
            {t(
              'Поставьте ногу на чистый лист бумаги. Измерьте расстояние от основания пятки до крайней точки самого длинного пальца. Измерьте обе стопы и используйте наибольшее значение для определения размера. При выборе размера ориентируйтесь на длину стопы.',
            )}
          </p>

          <ol className="size-guide__steps">
            {SIZE_GUIDE_STEPS.map((step, i) => (
              <li key={step.caption} className="size-guide__step">
                <img src={step.image} alt="" draggable={false} />
                <p>{t(step.caption)}</p>
                {i === SIZE_GUIDE_STEPS.length - 1 && (
                  <img
                    className="size-guide__chart"
                    src={sizeChartImg}
                    alt={t('Размерная сетка: EU, M/W и мм')}
                    draggable={false}
                  />
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}

function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M15 18 9 12l6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="8" fill="#22c55e" />
      <path d="M4.5 8.2 6.8 10.5 11.5 5.5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function productShareUrl(product: Product) {
  if (typeof window === 'undefined') return `/product/${product.id}`
  const url = new URL(window.location.href)
  url.searchParams.set('product', product.id)
  return url.toString()
}

function productShareText(product: Product) {
  return `${product.name} — ${formatPrice(product.price)} · FIVE SEASONS`
}

function ShareButton({ product }: { product: Product }) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  const [url, setUrl] = useState(`/product/${product.id}`)
  const text = productShareText(product)

  useEffect(() => {
    setUrl(productShareUrl(product))
  }, [product])
  const encodedUrl = encodeURIComponent(url)
  const encodedText = encodeURIComponent(text)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 1800)
    return () => window.clearTimeout(timer)
  }, [copied])

  const shareNative = async () => {
    if (!navigator.share) return false
    try {
      await navigator.share({ title: product.name, text, url })
      return true
    } catch (err) {
      // User cancelled — still counts as handled
      if (err instanceof DOMException && err.name === 'AbortError') return true
      return false
    }
  }

  const onShareClick = async () => {
    const shared = await shareNative()
    if (!shared) setOpen((v) => !v)
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch {
      window.prompt(t('Скопируйте ссылку:'), url)
    }
  }

  const networks = [
    {
      id: 'telegram',
      label: 'Telegram',
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      href: `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`,
    },
    {
      id: 'vk',
      label: t('ВКонтакте'),
      href: `https://vk.com/share.php?url=${encodedUrl}&title=${encodedText}`,
    },
  ] as const

  return (
    <div ref={wrapRef} className={`pdp-share${open ? ' is-open' : ''}`}>
      <button
        type="button"
        aria-label={t('Поделиться')}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={onShareClick}
      >
        <ShareIcon />
      </button>

      {open && (
        <div className="pdp-share__menu" role="menu" aria-label={t('Поделиться в соцсетях')}>
          {networks.map((n) => (
            <a
              key={n.id}
              role="menuitem"
              href={n.href}
              target="_blank"
              rel="noopener noreferrer"
              className="pdp-share__item"
              onClick={() => setOpen(false)}
            >
              <ShareNetworkIcon id={n.id} />
              {n.label}
            </a>
          ))}
          <button
            type="button"
            role="menuitem"
            className="pdp-share__item"
            onClick={copyLink}
          >
            <ShareNetworkIcon id="copy" />
            {t(copied ? 'Скопировано' : 'Скопировать ссылку')}
          </button>
        </div>
      )}
    </div>
  )
}

function ShareNetworkIcon({ id }: { id: 'telegram' | 'whatsapp' | 'vk' | 'copy' }) {
  if (id === 'telegram') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M21.5 3.3 2.8 10.6c-1.3.5-1.3 1.2-.2 1.5l4.8 1.5 1.8 5.6c.2.7.4.9 1 .9.6 0 .9-.3 1.2-.6l2.7-2.6 5.6 4.1c1 .6 1.8.3 2-.9L22.9 4.6c.3-1.3-.5-1.9-1.4-1.3Z" />
      </svg>
    )
  }
  if (id === 'whatsapp') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 2a9.9 9.9 0 0 0-8.5 14.9L2 22l5.3-1.4A9.9 9.9 0 1 0 12 2Zm5.5 14.1c-.2.7-1.3 1.2-1.8 1.3-.5.1-1.1.2-3.5-.7-2.9-1.2-4.8-4.1-4.9-4.3-.2-.2-1.3-1.7-1.3-3.3 0-1.5.8-2.3 1.1-2.6.3-.3.6-.4.8-.4h.6c.2 0 .4 0 .6.5l.8 2c.1.3 0 .5-.1.7l-.4.5c-.2.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.2 1.4 2.5 1.5.3.1.5.1.7-.1l1-.1.1c.3-.1.5 0 .6.2l1.1 1.8c.1.3 0 .6-.2.8Z" />
      </svg>
    )
  }
  if (id === 'vk') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12.8 18.2h1.3c.4 0 .5-.2.5-.4 0-.5.7-1.7 2.1-3.3 1.3-1.5 1.9-1.7 2.1-1.8.4-.2.6-.4.6-.7 0-.3-.3-.5-.7-.5h-1.9c-.3 0-.5.2-.6.4 0 0-.9 1.3-2.2 2.9-.3.4-.5.5-.7.5-.1 0-.3-.1-.3-.5V9.5c0-.4-.1-.6-.5-.6H11c-.3 0-.5.2-.4.4.2.6.8 1.5.8 1.5s.2.4 0 .4c-.1 0-.4-.1-.9-.7C9.8 10.2 9 9 8.7 8.6c-.1-.2-.3-.3-.6-.3H6.4c-.4 0-.6.2-.6.5 0 .3.3 1.1 1.6 2.9 1.7 2.3 3.6 3.6 5.4 3.6Z" />
      </svg>
    )
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="8" y="8" width="11" height="11" rx="2" />
      <path d="M6 14V6a2 2 0 0 1 2-2h8" strokeLinecap="round" />
    </svg>
  )
}

function canHover() {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
}

function OriginalityInfo() {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<number | null>(null)

  const clearClose = () => {
    if (closeTimer.current != null) {
      window.clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }

  const show = () => {
    clearClose()
    setOpen(true)
  }

  const hideSoon = () => {
    clearClose()
    closeTimer.current = window.setTimeout(() => setOpen(false), 120)
  }

  const onHoverEnter = () => {
    if (canHover()) show()
  }

  const onHoverLeave = () => {
    if (canHover()) hideSoon()
  }

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  useEffect(() => () => clearClose(), [])

  return (
    <div
      ref={wrapRef}
      className={`pdp-original__info${open ? ' is-open' : ''}`}
      onMouseEnter={onHoverEnter}
      onMouseLeave={onHoverLeave}
    >
      <button
        type="button"
        className="pdp-original__info-btn"
        aria-label={t('Об оригинальности')}
        aria-expanded={open}
        aria-controls="pdp-originality-tip"
        onClick={() => setOpen((v) => !v)}
      >
        <InfoIcon />
      </button>

      {open && (
        <div
          id="pdp-originality-tip"
          className="pdp-original__popover"
          role="dialog"
          aria-labelledby="pdp-originality-title"
          onMouseEnter={onHoverEnter}
          onMouseLeave={onHoverLeave}
        >
          <button
            type="button"
            className="pdp-original__popover-close"
            aria-label={t('Закрыть')}
            onClick={() => setOpen(false)}
          >
            <CloseIcon />
          </button>
          <h3 id="pdp-originality-title">{t('100% оригинальная продукция')}</h3>
          <p className="pdp-original__popover-lead">
            {t(
              'Мы поставляем исключительно оригинальную обувь Crocs напрямую из Вьетнама — ключевого региона производства бренда, где выпускается более половина мирового объема.',
            )}
          </p>
          <p>
            {t(
              'Поставки и контроль качества осуществляются в рамках прямых соглашений с производителем и под курированием официального офиса компании в Saigon Centre Tower 2 (Хошимин).',
            )}
          </p>
        </div>
      )}
    </div>
  )
}

function InfoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#9ca3af" strokeWidth="1.4">
      <circle cx="8" cy="8" r="6.5" />
      <path d="M8 7.2v4M8 5.2h.01" strokeLinecap="round" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3v12M8 7l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" strokeLinecap="round" />
    </svg>
  )
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? '#ff3b5c' : 'none'} stroke={filled ? '#ff3b5c' : 'currentColor'} strokeWidth="1.8">
      <path d="M12 21s-7-4.6-9.5-9A5.2 5.2 0 0 1 12 6.2 5.2 5.2 0 0 1 21.5 12C19 16.4 12 21 12 21z" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function RulerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="8" width="18" height="8" rx="1.5" />
      <path d="M7 8v3M11 8v2M15 8v3M19 8v2" strokeLinecap="round" />
    </svg>
  )
}

import type { Product } from '../data/products'
import { useI18n } from '../i18n'

export function CrocVisual({
  product,
  tall,
}: {
  product: Product
  tall?: boolean
}) {
  const { t } = useI18n()
  return (
    <div
      className={`croc-visual ${tall ? 'croc-visual--tall' : ''}`}
      data-cat={product.category}
    >
      <img
        className="croc-visual__img"
        src={product.image}
        alt={product.name}
        loading="lazy"
        decoding="async"
      />
      {product.tag && <span className="croc-visual__badge">{t(product.tag)}</span>}
    </div>
  )
}

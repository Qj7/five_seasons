import type { Product } from '../data/products'

export function CrocVisual({
  product,
  tall,
}: {
  product: Product
  tall?: boolean
}) {
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
      {product.tag && <span className="croc-visual__badge">{product.tag}</span>}
    </div>
  )
}

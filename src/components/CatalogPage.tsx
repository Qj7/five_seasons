import { products, top20, type Category } from '../data/products'
import { useStore } from '../store'
import { ProductCard } from './ProductCard'

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

export function CatalogPage() {
  const { catalogFilter, setCatalogFilter, search, setSearch } = useStore()

  let list = products
  if (catalogFilter === 'popular') list = top20
  else if (catalogFilter) list = products.filter((p) => p.category === (catalogFilter as Category))

  if (search.trim()) {
    const q = search.trim().toLowerCase()
    list = list.filter((p) => p.name.toLowerCase().includes(q))
  }

  return (
    <div className="page catalog">
      <header className="page-header">
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

      <div className="filter-row">
        {filters.map((f) => (
          <button
            key={f.label}
            type="button"
            className={`filter-pill ${catalogFilter === f.id ? 'is-active' : ''}`}
            onClick={() => setCatalogFilter(f.id)}
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

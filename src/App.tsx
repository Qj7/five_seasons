import { StoreProvider, useStore } from './store'
import { BottomNav } from './components/BottomNav'
import { HomePage } from './components/HomePage'
import { CatalogPage } from './components/CatalogPage'
import { FavoritesPage, CartPage, ProfilePage } from './components/OtherPages'
import { ProductPage } from './components/ProductPage'
import './App.css'

function Screens() {
  const { tab, selectedProductId } = useStore()

  return (
    <div className={`app-shell ${selectedProductId ? 'app-shell--pdp' : ''}`}>
      <main className="app-main">
        {selectedProductId ? (
          <ProductPage productId={selectedProductId} />
        ) : (
          <>
            {tab === 'home' && <HomePage />}
            {tab === 'catalog' && <CatalogPage />}
            {tab === 'favorites' && <FavoritesPage />}
            {tab === 'cart' && <CartPage />}
            {tab === 'profile' && <ProfilePage />}
          </>
        )}
      </main>
      <BottomNav />
    </div>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <Screens />
    </StoreProvider>
  )
}

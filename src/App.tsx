import { useEffect } from 'react'
import { StoreProvider, useStore } from './store'
import { LangProvider } from './i18n'
import { BottomNav } from './components/BottomNav'
import { HomePage } from './components/HomePage'
import { CatalogPage } from './components/CatalogPage'
import { FavoritesPage, CartPage, ProfilePage } from './components/OtherPages'
import { ProductPage } from './components/ProductPage'
import { BrandPage, BrandsPage } from './components/BrandsPage'
import type { BrandGroup } from './data/brands'
import './App.css'

function Screens() {
  const { tab, selectedProductId, brandStack } = useStore()
  const brandScreen = brandStack.at(-1)

  useEffect(() => {
    document.querySelector('.app-main')?.scrollTo({ top: 0 })
  }, [brandScreen])

  return (
    <div className={`app-shell ${selectedProductId ? 'app-shell--pdp' : ''}`}>
      <main className="app-main">
        {selectedProductId ? (
          <ProductPage productId={selectedProductId} />
        ) : brandScreen?.startsWith('all') ? (
          <BrandsPage
            key={brandScreen}
            initialGroup={(brandScreen.split(':')[1] as BrandGroup) || null}
          />
        ) : brandScreen ? (
          <BrandPage key={brandScreen} slug={brandScreen} />
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
    <LangProvider>
      <StoreProvider>
        <Screens />
      </StoreProvider>
    </LangProvider>
  )
}

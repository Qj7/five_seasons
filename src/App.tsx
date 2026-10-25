'use client'

import { useEffect } from 'react'
import { StoreProvider, useStore } from './store'
import { LangProvider } from './i18n'
import { AuthProvider } from './auth'
import { CatalogProvider } from './catalog'
import { OrdersProvider } from './orders'
import { BottomNav } from './components/BottomNav'
import { HomePage } from './components/HomePage'
import { CatalogPage } from './components/CatalogPage'
import { FavoritesPage, CartPage, ProfilePage } from './components/OtherPages'
import { ProductPage } from './components/ProductPage'
import { BrandPage, BrandsPage } from './components/BrandsPage'
import { ManagerPage } from './components/ManagerPage'
import { ManagerFab } from './components/ManagerFab'
import { OrdersPage } from './components/OrdersPage'
import type { BrandGroup } from './data/brands'

function Screens() {
  const { tab, selectedProductId, brandStack, managerOpen, ordersOpen, closeOrders } =
    useStore()
  const brandScreen = brandStack.at(-1)

  useEffect(() => {
    document.querySelector('.app-main')?.scrollTo({ top: 0 })
  }, [brandScreen, managerOpen, ordersOpen, selectedProductId])

  return (
    <div className={`app-shell ${selectedProductId ? 'app-shell--pdp' : ''}`}>
      <main className="app-main">
        {selectedProductId ? (
          <ProductPage productId={selectedProductId} />
        ) : managerOpen ? (
          <ManagerPage />
        ) : ordersOpen ? (
          <OrdersPage onBack={closeOrders} />
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
      <ManagerFab />
      <BottomNav />
    </div>
  )
}

export default function App({ initialPath }: { initialPath?: string }) {
  return (
    <LangProvider>
      <AuthProvider>
        <CatalogProvider>
          <OrdersProvider>
            <StoreProvider initialPath={initialPath}>
              <Screens />
            </StoreProvider>
          </OrdersProvider>
        </CatalogProvider>
      </AuthProvider>
    </LangProvider>
  )
}

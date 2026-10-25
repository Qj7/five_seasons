import type { Tab } from './store'
import type { ManagerScreen } from './store'

/** Primary navigable surfaces that we mirror into the URL. */
export interface NavState {
  tab: Tab
  selectedProductId: string | null
  managerOpen: boolean
  managerScreen: ManagerScreen
  ordersOpen: boolean
  /** Top of the brand navigation stack ('all' | 'all:<group>' | '<slug>'). */
  brandScreen: string | null
}

const TAB_PATHS: Record<Exclude<Tab, 'home'>, string> = {
  catalog: '/catalog',
  favorites: '/favorites',
  cart: '/cart',
  profile: '/profile',
}

const MANAGER_SCREENS: ManagerScreen[] = ['hub', 'new', 'orders', 'listings']

/** Derive the canonical URL path for the current primary navigation state. */
export function computePath(nav: NavState): string {
  if (nav.selectedProductId) return `/product/${nav.selectedProductId}`
  if (nav.managerOpen) {
    return nav.managerScreen && nav.managerScreen !== 'hub'
      ? `/admin/${nav.managerScreen}`
      : '/admin'
  }
  if (nav.ordersOpen) return '/orders'
  if (nav.brandScreen) {
    if (nav.brandScreen === 'all' || nav.brandScreen.startsWith('all:')) return '/brands'
    return `/brands/${nav.brandScreen}`
  }
  if (nav.tab === 'home') return '/'
  return TAB_PATHS[nav.tab]
}

export interface ParsedRoute {
  tab: Tab
  selectedProductId: string | null
  managerOpen: boolean
  managerScreen: ManagerScreen
  ordersOpen: boolean
  /** Initial brand stack to seed (empty when not on a brand route). */
  brandStack: string[]
}

const DEFAULT_ROUTE: ParsedRoute = {
  tab: 'home',
  selectedProductId: null,
  managerOpen: false,
  managerScreen: 'hub',
  ordersOpen: false,
  brandStack: [],
}

/** Parse a URL path into initial navigation state for the store. */
export function parsePath(path: string | undefined | null): ParsedRoute {
  if (!path || path === '/') return { ...DEFAULT_ROUTE }
  const segments = path.split('?')[0].split('/').filter(Boolean)
  const [head, ...rest] = segments

  switch (head) {
    case 'catalog':
      return { ...DEFAULT_ROUTE, tab: 'catalog' }
    case 'favorites':
      return { ...DEFAULT_ROUTE, tab: 'favorites' }
    case 'cart':
      return { ...DEFAULT_ROUTE, tab: 'cart' }
    case 'profile':
      return { ...DEFAULT_ROUTE, tab: 'profile' }
    case 'product':
      return rest[0]
        ? { ...DEFAULT_ROUTE, selectedProductId: decodeURIComponent(rest[0]) }
        : { ...DEFAULT_ROUTE }
    case 'orders':
      return { ...DEFAULT_ROUTE, ordersOpen: true }
    case 'admin': {
      const screen = (rest[0] as ManagerScreen) ?? 'hub'
      return {
        ...DEFAULT_ROUTE,
        managerOpen: true,
        managerScreen: MANAGER_SCREENS.includes(screen) ? screen : 'hub',
      }
    }
    case 'brands':
      return rest[0]
        ? { ...DEFAULT_ROUTE, brandStack: ['all', decodeURIComponent(rest[0])] }
        : { ...DEFAULT_ROUTE, brandStack: ['all'] }
    default:
      return { ...DEFAULT_ROUTE }
  }
}

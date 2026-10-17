import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type Role = 'customer' | 'manager'

export interface User {
  id: string
  email: string
  name: string
  role: Role
}

interface StoredAccount extends User {
  password: string
}

const SESSION_KEY = 'five-seasons:session'
const CUSTOMERS_KEY = 'five-seasons:customers'

/** Seeded manager accounts — they can publish products. */
export const MANAGER_ACCOUNTS: StoredAccount[] = [
  {
    id: 'mgr-anna',
    email: 'anna@fiveseasons.vn',
    name: 'Анна',
    role: 'manager',
    password: 'AnnaMgr2024',
  },
  {
    id: 'mgr-dmitry',
    email: 'dmitry@fiveseasons.vn',
    name: 'Дмитрий',
    role: 'manager',
    password: 'DmitryMgr2024',
  },
  {
    id: 'mgr-lena',
    email: 'lena@fiveseasons.vn',
    name: 'Лена',
    role: 'manager',
    password: 'LenaMgr2024',
  },
]

function loadCustomers(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(CUSTOMERS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as StoredAccount[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveCustomers(list: StoredAccount[]) {
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(list))
}

function loadSession(): User | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const user = JSON.parse(raw) as User
    if (!user?.id || !user?.email) return null
    return user
  } catch {
    return null
  }
}

function toPublic(account: StoredAccount): User {
  const { password: _, ...user } = account
  return user
}

function findAccount(email: string): StoredAccount | undefined {
  const normalized = email.trim().toLowerCase()
  return (
    MANAGER_ACCOUNTS.find((a) => a.email === normalized) ??
    loadCustomers().find((a) => a.email === normalized)
  )
}

interface AuthCtx {
  user: User | null
  isManager: boolean
  login: (email: string, password: string) => { ok: true } | { ok: false; error: string }
  register: (
    name: string,
    email: string,
    password: string,
  ) => { ok: true } | { ok: false; error: string }
  logout: () => void
}

const Ctx = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => loadSession())

  const login = useCallback((email: string, password: string) => {
    const account = findAccount(email)
    if (!account || account.password !== password) {
      return { ok: false as const, error: 'Неверный email или пароль' }
    }
    const publicUser = toPublic(account)
    localStorage.setItem(SESSION_KEY, JSON.stringify(publicUser))
    setUser(publicUser)
    return { ok: true as const }
  }, [])

  const register = useCallback((name: string, email: string, password: string) => {
    const trimmedName = name.trim()
    const normalized = email.trim().toLowerCase()
    if (!trimmedName) return { ok: false as const, error: 'Укажите имя' }
    if (!normalized.includes('@')) return { ok: false as const, error: 'Некорректный email' }
    if (password.length < 6) {
      return { ok: false as const, error: 'Пароль должен быть не короче 6 символов' }
    }
    if (findAccount(normalized)) {
      return { ok: false as const, error: 'Аккаунт с таким email уже есть' }
    }
    const account: StoredAccount = {
      id: `user-${Date.now()}`,
      email: normalized,
      name: trimmedName,
      role: 'customer',
      password,
    }
    const next = [...loadCustomers(), account]
    saveCustomers(next)
    const publicUser = toPublic(account)
    localStorage.setItem(SESSION_KEY, JSON.stringify(publicUser))
    setUser(publicUser)
    return { ok: true as const }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY)
    setUser(null)
  }, [])

  const value = useMemo<AuthCtx>(
    () => ({
      user,
      isManager: user?.role === 'manager',
      login,
      register,
      logout,
    }),
    [user, login, register, logout],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth outside AuthProvider')
  return ctx
}

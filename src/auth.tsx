'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type Role = 'customer' | 'manager' | 'admin'

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

/** Seeded manager accounts — they can publish products (GitHub Pages + local). */
export const MANAGER_ACCOUNTS: StoredAccount[] = [
  {
    id: 'mgr-nikita',
    email: 'nikita@fiveseasons.vn',
    name: 'Никита',
    role: 'manager',
    password: 'NikitaMgr2024',
  },
  {
    id: 'mgr-anna',
    email: 'anna@fiveseasons.vn',
    name: 'Анна',
    role: 'manager',
    password: 'AnnaMgr2024',
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

export type AuthResult = { ok: true } | { ok: false; error: string }

interface AuthCtx {
  user: User | null
  /** False until the first /api/auth/me check finishes (SSR-safe). */
  authReady: boolean
  isManager: boolean
  login: (email: string, password: string) => Promise<AuthResult>
  register: (name: string, email: string, password: string) => Promise<AuthResult>
  logout: () => void
}

const Ctx = createContext<AuthCtx | null>(null)

/** Local (no-DB) fallback login so dev + GitHub Pages still work. */
function localLogin(email: string, password: string): AuthResult {
  const account = findAccount(email)
  if (!account || account.password !== password) {
    return { ok: false, error: 'Неверный email или пароль' }
  }
  const publicUser = toPublic(account)
  localStorage.setItem(SESSION_KEY, JSON.stringify(publicUser))
  return { ok: true }
}

function localRegister(name: string, email: string, password: string): AuthResult {
  const trimmedName = name.trim()
  const normalized = email.trim().toLowerCase()
  if (!trimmedName) return { ok: false, error: 'Укажите имя' }
  if (!normalized.includes('@')) return { ok: false, error: 'Некорректный email' }
  if (password.length < 6) {
    return { ok: false, error: 'Пароль должен быть не короче 6 символов' }
  }
  if (findAccount(normalized)) {
    return { ok: false, error: 'Аккаунт с таким email уже есть' }
  }
  const account: StoredAccount = {
    id: `user-${Date.now()}`,
    email: normalized,
    name: trimmedName,
    role: 'customer',
    password,
  }
  saveCustomers([...loadCustomers(), account])
  localStorage.setItem(SESSION_KEY, JSON.stringify(toPublic(account)))
  return { ok: true }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [serverAuth, setServerAuth] = useState(false)

  // Reconcile with the server; fall back to the local session when there's no DB.
  useEffect(() => {
    const local = loadSession()
    let active = true
    ;(async () => {
      try {
        const res = await fetch('/api/auth/me')
        const data = (await res.json().catch(() => null)) as
          | { user: User | null; serverAuth: boolean }
          | null
        if (!active) return
        if (data?.serverAuth) {
          setServerAuth(true)
          setUser(data.user ?? null)
        } else {
          setServerAuth(false)
          setUser(local)
        }
      } catch {
        if (active) setUser(local)
      } finally {
        if (active) setAuthReady(true)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  const login = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      if (serverAuth) {
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          })
          const data = (await res.json().catch(() => ({}))) as {
            user?: User
            error?: string
          }
          if (res.ok && data.user) {
            setUser(data.user)
            return { ok: true }
          }
          if (res.status !== 503) {
            return { ok: false, error: data.error ?? 'Неверный email или пароль' }
          }
        } catch {
          /* fall through to local */
        }
      }
      const result = localLogin(email, password)
      if (result.ok) setUser(loadSession())
      return result
    },
    [serverAuth],
  )

  const register = useCallback(
    async (name: string, email: string, password: string): Promise<AuthResult> => {
      if (serverAuth) {
        try {
          const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
          })
          const data = (await res.json().catch(() => ({}))) as {
            user?: User
            error?: string
          }
          if (res.ok && data.user) {
            setUser(data.user)
            return { ok: true }
          }
          if (res.status !== 503) {
            return { ok: false, error: data.error ?? 'Не удалось создать аккаунт' }
          }
        } catch {
          /* fall through to local */
        }
      }
      const result = localRegister(name, email, password)
      if (result.ok) setUser(loadSession())
      return result
    },
    [serverAuth],
  )

  const logout = useCallback(() => {
    void fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
    localStorage.removeItem(SESSION_KEY)
    setUser(null)
  }, [])

  const value = useMemo<AuthCtx>(
    () => ({
      user,
      authReady,
      isManager: user?.role === 'manager' || user?.role === 'admin',
      login,
      register,
      logout,
    }),
    [user, authReady, login, register, logout],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth outside AuthProvider')
  return ctx
}

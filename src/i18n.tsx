import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { en } from './locales/en'
import type { Lang } from './locales/langs'

const STORAGE_KEY = 'five-seasons:lang'

type Vars = Record<string, string | number>

function translate(lang: Lang, text: string, vars?: Vars) {
  const s = lang === 'en' ? (en[text] ?? text) : text
  return vars ? s.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m)) : s
}

function initialLang(): Lang {
  if (typeof window === 'undefined') return 'ru'
  const saved = localStorage.getItem(STORAGE_KEY)
  return saved === 'en' || saved === 'ru' ? saved : 'ru'
}

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void } | null>(null)

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(initialLang)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang)
    document.documentElement.lang = lang
    document.title = translate(lang, 'Five Seasons — обувь, одежда и аксессуары')
  }, [lang])

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>
}

export function useI18n() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useI18n must be used inside LangProvider')
  const { lang, setLang } = ctx
  const t = useCallback((text: string, vars?: Vars) => translate(lang, text, vars), [lang])
  return { lang, setLang, t }
}

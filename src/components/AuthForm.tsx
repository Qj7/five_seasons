import { useId, useState, type FormEvent } from 'react'
import { MANAGER_ACCOUNTS, useAuth } from '../auth'
import { useI18n } from '../i18n'

type Mode = 'login' | 'register'

export function AuthForm() {
  const { login, register } = useAuth()
  const { t } = useI18n()
  const formId = useId()
  const [mode, setMode] = useState<Mode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [showManagers, setShowManagers] = useState(false)

  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const result =
        mode === 'login'
          ? await login(email, password)
          : await register(name, email, password)
      if (!result.ok) setError(t(result.error))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-panel">
      <div className="auth-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'login'}
          className={mode === 'login' ? 'is-active' : undefined}
          onClick={() => {
            setMode('login')
            setError(null)
          }}
        >
          {t('Вход')}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'register'}
          className={mode === 'register' ? 'is-active' : undefined}
          onClick={() => {
            setMode('register')
            setError(null)
          }}
        >
          {t('Регистрация')}
        </button>
      </div>

      <form className="auth-form" onSubmit={onSubmit} noValidate>
        {mode === 'register' ? (
          <label className="auth-field" htmlFor={`${formId}-name`}>
            <span>{t('Имя')}</span>
            <input
              id={`${formId}-name`}
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
        ) : null}

        <label className="auth-field" htmlFor={`${formId}-email`}>
          <span>{t('Email')}</span>
          <input
            id={`${formId}-email`}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label className="auth-field" htmlFor={`${formId}-password`}>
          <span>{t('Пароль')}</span>
          <input
            id={`${formId}-password`}
            type="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </label>

        {error ? <p className="auth-error">{error}</p> : null}

        <button
          type="submit"
          className="btn-primary btn-primary--block"
          disabled={submitting}
        >
          {mode === 'login' ? t('Войти') : t('Создать аккаунт')}
        </button>
      </form>

      <button
        type="button"
        className="auth-hint-toggle"
        onClick={() => setShowManagers((v) => !v)}
      >
        {showManagers ? t('Скрыть аккаунты менеджеров') : t('Аккаунты менеджеров')}
      </button>

      {showManagers ? (
        <ul className="auth-managers">
          {MANAGER_ACCOUNTS.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => {
                  setMode('login')
                  setEmail(m.email)
                  setPassword(m.password)
                  setError(null)
                }}
              >
                <strong>{m.name}</strong>
                <span>{m.email}</span>
                <em>{m.password}</em>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

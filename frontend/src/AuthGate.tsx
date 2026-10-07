import { useEffect, useState } from 'react'
import { api, setAuthToken, type AuthUser } from './lib/api'
import { useUiStore } from './store/useUiStore'

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined)
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('arch_token')
    if (!token) {
      setUser(null)
      return
    }
    api
      .me()
      .then(setUser)
      .catch(() => {
        setAuthToken(null)
        setUser(null)
      })
  }, [])

  if (user === undefined) {
    return (
      <div className="empty">
        <h2>Загрузка…</h2>
      </div>
    )
  }

  if (!user) {
    const submit = async () => {
      setError('')
      try {
        const res =
          mode === 'login'
            ? await api.login({ email, password })
            : await api.register({ email, password, display_name: displayName })
        setAuthToken(res.token)
        setUser(res.user)
        const s = await api.settings()
        useUiStore.getState().setSettings(s)
        useUiStore.getState().setLibraryCollapsed(!s.library_open)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Не удалось войти')
      }
    }
    return (
      <div className="auth-screen">
        <header className="topbar">
          <div className="brand">
            <div className="brand-mark" />
            Architecture Canvas
          </div>
        </header>
        <div className="auth-body">
          <div className="auth-hero">
            <img
              className="auth-pic"
              src="/api/auth-illustration"
              alt=""
              width={1400}
              height={1400}
            />
          </div>
          <form
            className="auth-card"
            onSubmit={(e) => {
              e.preventDefault()
              submit()
            }}
          >
            <h1>{mode === 'login' ? 'Вход' : 'Регистрация'}</h1>
            {mode === 'register' ? (
              <div className="field">
                <label>Имя</label>
                <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
              </div>
            ) : null}
            <div className="field">
              <label>Почта</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="field">
              <label>Пароль</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </div>
            {error ? <p style={{ color: 'var(--danger)' }}>{error}</p> : null}
            <button className="btn primary" type="submit">
              {mode === 'login' ? 'Войти' : 'Создать аккаунт'}
            </button>
            <p className="auth-switch">
              <button className="btn" type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
                {mode === 'login' ? 'Зарегистрироваться' : 'Войти'}
              </button>
            </p>
          </form>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export function logoutAndReload() {
  api.logout().catch(() => undefined)
  setAuthToken(null)
  window.location.href = '/'
}

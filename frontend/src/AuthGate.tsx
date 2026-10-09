import { useEffect, useState } from 'react'
import { api, setAuthToken, type AuthUser } from './lib/api'
import { useUiStore } from './store/useUiStore'

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined)
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

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
      setInfo('')
      try {
        if (mode === 'forgot') {
          if (!email.includes('@')) {
            setError('Укажите корректный адрес почты')
            return
          }
          const res = await api.forgotPassword(email)
          setInfo(res.message)
          return
        }
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
              width={2400}
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
            <h1>{mode === 'forgot' ? 'Восстановление пароля' : mode === 'login' ? 'Вход' : 'Регистрация'}</h1>
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
            {mode !== 'forgot' ? (
              <div className="field">
                <label>Пароль</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
              </div>
            ) : null}
            {error ? <p style={{ color: 'var(--danger)' }}>{error}</p> : null}
            {info ? <p className="hint">{info}</p> : null}
            {mode === 'forgot' ? (
              <>
                <button className="btn primary" type="submit">
                  Отправить ссылку
                </button>
                <p>
                  <button className="btn ghost" type="button" onClick={() => setMode('login')}>
                    Вернуться к авторизации
                  </button>
                </p>
              </>
            ) : (
              <>
                <div className="auth-actions">
                  <button
                    className={`btn ${mode === 'login' ? 'primary' : ''}`}
                    type={mode === 'login' ? 'submit' : 'button'}
                    onClick={mode === 'login' ? undefined : () => setMode('login')}
                  >
                    Войти
                  </button>
                  <button
                    className={`btn auth-register-btn ${mode === 'register' ? 'primary' : ''}`}
                    type={mode === 'register' ? 'submit' : 'button'}
                    onClick={mode === 'register' ? undefined : () => setMode('register')}
                  >
                    Зарегистрироваться
                  </button>
                </div>
                {mode === 'login' ? (
                  <p>
                    <button className="btn ghost" type="button" onClick={() => setMode('forgot')}>
                      Забыли пароль?
                    </button>
                  </p>
                ) : null}
              </>
            )}
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

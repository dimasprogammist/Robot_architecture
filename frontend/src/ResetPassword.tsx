import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { api } from './lib/api'

export function ResetPassword() {
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [repeat, setRepeat] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState('')

  const submit = async () => {
    setError('')
    if (password.length < 6) {
      setError('Пароль должен быть не короче 6 символов')
      return
    }
    if (password !== repeat) {
      setError('Пароли не совпадают')
      return
    }
    if (!token) {
      setError('В ссылке нет токена восстановления')
      return
    }
    try {
      const res = await api.resetPassword({ token, password, password_repeat: repeat })
      setDone(res.message)
      window.setTimeout(() => navigate('/'), 1200)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось сохранить пароль')
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
          <img className="auth-pic" src="/api/auth-illustration" alt="" width={2400} height={1400} />
        </div>
        <form
          className="auth-card"
          onSubmit={(e) => {
            e.preventDefault()
            void submit()
          }}
        >
          <h1>Новый пароль</h1>
          <div className="field">
            <label>Новый пароль</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>
          <div className="field">
            <label>Повторить пароль</label>
            <input type="password" value={repeat} onChange={(e) => setRepeat(e.target.value)} required minLength={6} />
          </div>
          {error ? <p style={{ color: 'var(--danger)' }}>{error}</p> : null}
          {done ? <p className="hint">{done}</p> : null}
          <button className="btn primary" type="submit">
            Сохранить новый пароль
          </button>
          <p>
            <Link to="/">Вернуться к авторизации</Link>
          </p>
        </form>
      </div>
    </div>
  )
}

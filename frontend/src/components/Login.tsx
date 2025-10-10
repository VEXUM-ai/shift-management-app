import React, { useState } from 'react'
import { FormError } from './FormError'
import { validateEmail } from '../utils/auth'

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<void>
  onGuestLogin: (name: string, password: string) => Promise<void>
  onAdminLogin: () => void
  onRegister: (name: string, email: string, password: string, transportationCost: number) => Promise<void>
  showAdminOption?: boolean
}

type LoginMode = 'select' | 'admin' | 'guest' | 'register'

export const Login: React.FC<LoginProps> = ({ onLogin, onGuestLogin, onAdminLogin, onRegister, showAdminOption = true }) => {
  const [mode, setMode] = useState<LoginMode>('select')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [transportationCost, setTransportationCost] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email || !password) {
      setError('メールアドレスとパスワードを入力してください')
      return
    }

    if (!validateEmail(email)) {
      setError('有効なメールアドレスを入力してください')
      return
    }

    setLoading(true)
    try {
      await onLogin(email, password)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('ログインに失敗しました')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name || !password) {
      setError('名前とパスワードを入力してください')
      return
    }

    setLoading(true)
    try {
      await onGuestLogin(name, password)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('ログインに失敗しました')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name || !email || !password || !transportationCost) {
      setError('すべての項目を入力してください')
      return
    }

    if (!validateEmail(email)) {
      setError('有効なメールアドレスを入力してください')
      return
    }

    const cost = parseFloat(transportationCost)
    if (isNaN(cost) || cost < 0) {
      setError('有効な交通費を入力してください')
      return
    }

    setLoading(true)
    try {
      await onRegister(name, email, password, cost)
      setMode('guest')
      setError(null)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('登録に失敗しました')
      }
    } finally {
      setLoading(false)
    }
  }

  // 選択画面
  if (mode === 'select') {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>🔐 シフト管理システム</h1>
            <p>ログイン方法を選択してください</p>
          </div>

          <div className="login-mode-select">
            <button
              type="button"
              className="mode-select-btn admin-btn"
              onClick={() => setMode('admin')}
            >
              <span className="role-icon">👔</span>
              <div>
                <h3>管理者ログイン</h3>
                <p>メールアドレスでログイン</p>
              </div>
            </button>

            <button
              type="button"
              className="mode-select-btn guest-btn"
              onClick={() => setMode('guest')}
            >
              <span className="role-icon">👤</span>
              <div>
                <h3>ゲストログイン</h3>
                <p>名前とパスワードでログイン</p>
              </div>
            </button>

            <button
              type="button"
              className="mode-select-btn register-btn"
              onClick={() => setMode('register')}
            >
              <span className="role-icon">✍️</span>
              <div>
                <h3>新規登録</h3>
                <p>アカウントを作成</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 管理者ログイン画面
  if (mode === 'admin') {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>👔 管理者ログイン</h1>
            <p>メールアドレスとパスワードを入力してください</p>
          </div>

          <form onSubmit={handleAdminSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">
                メールアドレス <span className="required">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError(null)
                }}
                placeholder="example@company.com"
                className={error && !email ? 'error' : ''}
                autoComplete="email"
                autoFocus
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                パスワード <span className="required">*</span>
              </label>
              <div className="password-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError(null)
                  }}
                  placeholder="パスワードを入力"
                  className={error && !password ? 'error' : ''}
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <FormError message={error} />

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'ログイン中...' : 'ログイン'}
            </button>

            <button
              type="button"
              className="back-btn"
              onClick={() => setMode('select')}
              disabled={loading}
            >
              ← 戻る
            </button>
          </form>
        </div>
      </div>
    )
  }

  // ゲストログイン画面
  if (mode === 'guest') {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>👤 ゲストログイン</h1>
            <p>名前とパスワードを入力してください</p>
          </div>

          <form onSubmit={handleGuestSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="name">
                名前 <span className="required">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setError(null)
                }}
                placeholder="山田太郎"
                className={error && !name ? 'error' : ''}
                autoFocus
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                パスワード <span className="required">*</span>
              </label>
              <div className="password-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError(null)
                  }}
                  placeholder="パスワードを入力"
                  className={error && !password ? 'error' : ''}
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <FormError message={error} />

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'ログイン中...' : 'ログイン'}
            </button>

            <button
              type="button"
              className="back-btn"
              onClick={() => setMode('select')}
              disabled={loading}
            >
              ← 戻る
            </button>
          </form>
        </div>
      </div>
    )
  }

  // 新規登録画面
  if (mode === 'register') {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>✍️ 新規登録</h1>
            <p>アカウント情報を入力してください</p>
          </div>

          <form onSubmit={handleRegisterSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="name">
                名前 <span className="required">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setError(null)
                }}
                placeholder="山田太郎"
                className={error && !name ? 'error' : ''}
                autoFocus
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">
                メールアドレス <span className="required">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError(null)
                }}
                placeholder="example@company.com"
                className={error && !email ? 'error' : ''}
                autoComplete="email"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                パスワード <span className="required">*</span>
              </label>
              <div className="password-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError(null)
                  }}
                  placeholder="パスワードを入力"
                  className={error && !password ? 'error' : ''}
                  autoComplete="new-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="transportationCost">
                オフィスまでの交通費（円） <span className="required">*</span>
              </label>
              <input
                id="transportationCost"
                type="number"
                value={transportationCost}
                onChange={(e) => {
                  setTransportationCost(e.target.value)
                  setError(null)
                }}
                placeholder="500"
                className={error && !transportationCost ? 'error' : ''}
                disabled={loading}
                min="0"
                step="1"
              />
            </div>

            <FormError message={error} />

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? '登録中...' : '登録'}
            </button>

            <button
              type="button"
              className="back-btn"
              onClick={() => setMode('select')}
              disabled={loading}
            >
              ← 戻る
            </button>
          </form>
        </div>
      </div>
    )
  }

  return null
}

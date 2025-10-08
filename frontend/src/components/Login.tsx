import React, { useState } from 'react'
import { FormError } from './FormError'
import { validateEmail } from '../utils/auth'

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<void>
  onAdminLogin: () => void
  showAdminOption?: boolean
}

export const Login: React.FC<LoginProps> = ({ onLogin, onAdminLogin, showAdminOption = true }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // バリデーション
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

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🔐 ログイン</h1>
          <p>シフト管理システムへようこそ</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
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

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>

        {showAdminOption && (
          <>
            <div className="login-divider">
              <span>または</span>
            </div>

            <button
              type="button"
              className="admin-access-btn"
              onClick={onAdminLogin}
              disabled={loading}
            >
              <span className="role-icon">👔</span>
              <span>管理者としてアクセス</span>
            </button>

            <div className="login-help">
              <p className="help-text">
                💡 初回ログインの場合、管理者に登録を依頼してください
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

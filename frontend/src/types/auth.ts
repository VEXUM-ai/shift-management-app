// 認証関連の型定義

export interface User {
  id: number
  name: string
  email: string
  password?: string // ハッシュ化されたパスワード（表示時は除外）
  is_admin: boolean
  created_at?: string
  last_login?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthState {
  isAuthenticated: boolean
  user: User | null
  token: string | null
}

export type UserRole = 'admin' | 'member'

import { apiCall } from '../utils/api'

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  user: {
    id: number
    name: string
    email: string
    is_admin: boolean
  }
  token: string
  refreshToken?: string
}

/**
 * バックエンドAPIを使用したログイン
 */
export const loginWithBackend = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const response = await apiCall<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

  // セッション情報を保存
  const session = {
    userId: response.user.id,
    userName: response.user.name,
    userEmail: response.user.email,
    userRole: response.user.is_admin ? 'admin' : 'member',
    token: response.token,
    timestamp: new Date().toISOString(),
  }

  localStorage.setItem('shift_app_auth_session', JSON.stringify(session))

  return response
}

/**
 * ユーザー登録（管理者のみ）
 */
export const registerUser = async (userData: {
  name: string
  email: string
  password: string
  is_admin?: boolean
}) => {
  return apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  })
}

/**
 * 現在のユーザー情報を取得
 */
export const getCurrentUser = async () => {
  return apiCall('/auth/me', {
    method: 'GET',
  })
}

/**
 * パスワード変更
 */
export const changePassword = async (
  currentPassword: string,
  newPassword: string
) => {
  return apiCall('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  })
}

/**
 * バックエンドが有効かチェック
 */
export const isBackendEnabled = (): boolean => {
  return import.meta.env.VITE_ENABLE_BACKEND === 'true'
}

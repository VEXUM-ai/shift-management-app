// API ユーティリティ関数

// 環境に応じたAPIベースURL設定
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

// トークン管理
export const getAuthToken = (): string | null => {
  const session = localStorage.getItem('shift_app_auth_session')
  if (!session) return null

  try {
    const parsed = JSON.parse(session)
    return parsed.token || null
  } catch {
    return null
  }
}

// APIエラーハンドリング
export async function handleApiError(response: Response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'エラーが発生しました' }))
    throw new Error(errorData.error || `HTTPエラー: ${response.status}`)
  }
  return response.json()
}

// 共通API呼び出し関数
export async function apiCall<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  try {
    const token = getAuthToken()
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options?.headers,
    }

    // 認証トークンがあれば追加
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers,
      ...options,
    })
    return await handleApiError(response)
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error)
    throw error
  }
}

// GET リクエスト
export async function apiGet<T>(endpoint: string): Promise<T> {
  return apiCall<T>(endpoint, { method: 'GET' })
}

// POST リクエスト
export async function apiPost<T>(endpoint: string, data: any): Promise<T> {
  return apiCall<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// PUT リクエスト
export async function apiPut<T>(endpoint: string, data: any): Promise<T> {
  return apiCall<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

// DELETE リクエスト
export async function apiDelete<T>(endpoint: string): Promise<T> {
  return apiCall<T>(endpoint, { method: 'DELETE' })
}

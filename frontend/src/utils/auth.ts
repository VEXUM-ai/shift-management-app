// 認証ユーティリティ関数

/**
 * 簡易的なパスワードハッシュ化（SHA-256使用）
 * 注: 本番環境では必ずバックエンドでbcryptなどを使用すること
 */
export const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

/**
 * パスワードの検証
 */
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
}

/**
 * パスワードの強度チェック
 */
export const validatePasswordStrength = (password: string): { valid: boolean; message: string } => {
  if (password.length < 6) {
    return { valid: false, message: 'パスワードは6文字以上である必要があります' }
  }

  if (password.length > 100) {
    return { valid: false, message: 'パスワードは100文字以内にしてください' }
  }

  // 数字と文字を含むか
  const hasNumber = /\d/.test(password)
  const hasLetter = /[a-zA-Z]/.test(password)

  if (!hasNumber || !hasLetter) {
    return { valid: false, message: 'パスワードは英字と数字を両方含む必要があります' }
  }

  return { valid: true, message: '' }
}

/**
 * メールアドレスの検証
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * セッショントークンの生成
 */
export const generateSessionToken = (): string => {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * セッションの有効期限チェック（24時間）
 */
export const isSessionValid = (timestamp: string): boolean => {
  const sessionTime = new Date(timestamp).getTime()
  const now = Date.now()
  const twentyFourHours = 24 * 60 * 60 * 1000
  return (now - sessionTime) < twentyFourHours
}

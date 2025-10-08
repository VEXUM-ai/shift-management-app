// バリデーションユーティリティ

// 日付形式チェック (YYYY-MM-DD)
export function isValidDate(dateString: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(dateString)) return false

  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date.getTime())
}

// 時間形式チェック (HH:MM)
export function isValidTime(timeString: string): boolean {
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/
  return timeRegex.test(timeString)
}

// メールアドレスチェック
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 数値範囲チェック
export function isValidNumber(value: any, min: number = 0, max?: number): boolean {
  const num = Number(value)
  if (isNaN(num)) return false
  if (num < min) return false
  if (max !== undefined && num > max) return false
  return true
}

// 時間の論理チェック（終了時間 > 開始時間）
export function isEndTimeAfterStartTime(startTime: string, endTime: string): boolean {
  if (!isValidTime(startTime) || !isValidTime(endTime)) return false
  return endTime > startTime
}

// 文字列のトリムと長さチェック
export function isValidString(value: string, minLength: number = 1, maxLength: number = 100): boolean {
  const trimmed = value.trim()
  return trimmed.length >= minLength && trimmed.length <= maxLength
}

// ファイルサイズチェック（バイト単位）
export function isValidFileSize(file: File, maxSizeInMB: number = 5): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024
  return file.size <= maxSizeInBytes
}

// 画像ファイルタイプチェック
export function isValidImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  return validTypes.includes(file.type)
}

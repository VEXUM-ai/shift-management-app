// フォーマッターユーティリティ

// 日付フォーマット (YYYY-MM-DD → YYYY年MM月DD日)
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString

  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  return `${year}年${month}月${day}日`
}

// 時間フォーマット (HH:MM)
export function formatTime(timeString: string): string {
  if (!timeString) return '-'
  return timeString
}

// 通貨フォーマット (数値 → ¥1,000)
export function formatCurrency(amount: number | string | undefined): string {
  if (amount === undefined || amount === null) return '¥0'

  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num)) return '¥0'

  return `¥${num.toLocaleString('ja-JP')}`
}

// 勤務時間計算 (HH:MM - HH:MM → 時間)
export function calculateWorkHours(startTime: string, endTime: string): number {
  if (!startTime || !endTime) return 0

  const start = new Date(`2000-01-01 ${startTime}`)
  const end = new Date(`2000-01-01 ${endTime}`)

  const diffMs = end.getTime() - start.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)

  return Math.round(diffHours * 100) / 100
}

// 月の表示形式 (YYYY-MM → YYYY年MM月)
export function formatMonth(monthString: string): string {
  if (!monthString) return ''

  const [year, month] = monthString.split('-')
  return `${year}年${month}月`
}

// CSV エクスポート用のエスケープ
export function escapeCsvValue(value: any): string {
  if (value === null || value === undefined) return ''

  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }

  return str
}

// CSVデータ生成
export function generateCsv(headers: string[], rows: any[][]): string {
  const csvHeaders = headers.map(escapeCsvValue).join(',')
  const csvRows = rows.map(row => row.map(escapeCsvValue).join(','))

  return [csvHeaders, ...csvRows].join('\n')
}

// CSVダウンロード
export function downloadCsv(filename: string, csvContent: string): void {
  const bom = '\uFEFF'
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
  URL.revokeObjectURL(link.href)
}

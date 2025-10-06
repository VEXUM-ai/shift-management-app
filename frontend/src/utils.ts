// CSV出力
export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) {
    alert('出力するデータがありません')
    return
  }

  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => {
      const value = row[header] ?? ''
      return typeof value === 'string' && value.includes(',') ? `"${value}"` : value
    }).join(','))
  ].join('\n')

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
}

// Slack通知
export async function sendSlackNotification(message: string, webhookUrl?: string) {
  const url = webhookUrl || import.meta.env.VITE_SLACK_WEBHOOK_URL

  if (!url) {
    console.warn('Slack Webhook URLが設定されていません')
    return false
  }

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: message })
    })
    return true
  } catch (error) {
    console.error('Slack notification failed:', error)
    return false
  }
}

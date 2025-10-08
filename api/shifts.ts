import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getShifts, setShifts } from './_storage'

// バリデーション関数
function validateShiftData(data: any): { valid: boolean; error?: string } {
  if (!data.employee_name || typeof data.employee_name !== 'string' || data.employee_name.trim().length === 0) {
    return { valid: false, error: 'メンバー名は必須です' }
  }

  if (!data.location || typeof data.location !== 'string' || data.location.trim().length === 0) {
    return { valid: false, error: '勤務地は必須です' }
  }

  if (!data.date || typeof data.date !== 'string') {
    return { valid: false, error: '日付は必須です' }
  }

  // 日付形式チェック (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(data.date)) {
    return { valid: false, error: '日付はYYYY-MM-DD形式で入力してください' }
  }

  if (!data.start_time || typeof data.start_time !== 'string') {
    return { valid: false, error: '開始時間は必須です' }
  }

  if (!data.end_time || typeof data.end_time !== 'string') {
    return { valid: false, error: '終了時間は必須です' }
  }

  // 時間形式チェック (HH:MM)
  const timeRegex = /^\d{2}:\d{2}$/
  if (!timeRegex.test(data.start_time)) {
    return { valid: false, error: '開始時間はHH:MM形式で入力してください' }
  }

  if (!timeRegex.test(data.end_time)) {
    return { valid: false, error: '終了時間はHH:MM形式で入力してください' }
  }

  // 時間の論理チェック
  if (data.start_time >= data.end_time) {
    return { valid: false, error: '終了時間は開始時間より後にしてください' }
  }

  if (data.transportation_fee !== undefined) {
    const fee = Number(data.transportation_fee)
    if (isNaN(fee) || fee < 0) {
      return { valid: false, error: '交通費は0以上の数値で入力してください' }
    }
  }

  return { valid: true }
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    const { id } = req.query

    if (req.method === 'GET') {
      const shifts = getShifts()
      // 日付順にソート（新しい順）
      const sorted = shifts.sort((a, b) => {
        const dateCompare = b.date.localeCompare(a.date)
        if (dateCompare !== 0) return dateCompare
        return b.start_time.localeCompare(a.start_time)
      })
      return res.json(sorted)
    }

    if (req.method === 'POST') {
      const validation = validateShiftData(req.body)
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error })
      }

      const { employee_name, location, date, start_time, end_time, transportation_fee, status } = req.body

      const shifts = getShifts()
      const newShift = {
        id: Date.now(),
        employee_name: employee_name.trim(),
        location: location.trim(),
        date,
        start_time,
        end_time,
        transportation_fee: Number(transportation_fee) || 0,
        status: status || '提出済み',
        created_at: new Date().toISOString()
      }
      shifts.push(newShift)
      setShifts(shifts)
      return res.status(201).json({ id: newShift.id, message: 'シフトを提出しました' })
    }

    if (req.method === 'PUT') {
      if (!id) {
        return res.status(400).json({ error: 'IDが必要です' })
      }

      const validation = validateShiftData(req.body)
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error })
      }

      const shifts = getShifts()
      const index = shifts.findIndex(s => s.id === Number(id))

      if (index === -1) {
        return res.status(404).json({ error: 'シフトが見つかりません' })
      }

      const { employee_name, location, date, start_time, end_time, transportation_fee, status } = req.body
      shifts[index] = {
        ...shifts[index],
        employee_name: employee_name.trim(),
        location: location.trim(),
        date,
        start_time,
        end_time,
        transportation_fee: Number(transportation_fee) || 0,
        status: status || shifts[index].status,
        updated_at: new Date().toISOString()
      }
      setShifts(shifts)
      return res.json({ message: 'シフトを更新しました' })
    }

    if (req.method === 'DELETE') {
      if (!id) {
        return res.status(400).json({ error: 'IDが必要です' })
      }

      const shifts = getShifts()
      const initialLength = shifts.length
      const filtered = shifts.filter(s => s.id !== Number(id))

      if (filtered.length === initialLength) {
        return res.status(404).json({ error: 'シフトが見つかりません' })
      }

      setShifts(filtered)
      return res.json({ message: 'シフトを削除しました' })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error: any) {
    console.error('API Error:', error)
    return res.status(500).json({ error: 'サーバーエラーが発生しました', details: error.message })
  }
}

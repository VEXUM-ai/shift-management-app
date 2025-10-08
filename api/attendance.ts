import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getAttendance, setAttendance } from './_storage'

// バリデーション関数
function validateAttendanceData(data: any, isClockOut: boolean = false): { valid: boolean; error?: string } {
  if (!isClockOut) {
    if (!data.employee_name || typeof data.employee_name !== 'string' || data.employee_name.trim().length === 0) {
      return { valid: false, error: 'メンバー名は必須です' }
    }

    if (!data.date || typeof data.date !== 'string') {
      return { valid: false, error: '日付は必須です' }
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(data.date)) {
      return { valid: false, error: '日付はYYYY-MM-DD形式で入力してください' }
    }

    if (!data.clock_in || typeof data.clock_in !== 'string') {
      return { valid: false, error: '出勤時間は必須です' }
    }

    const timeRegex = /^\d{2}:\d{2}$/
    if (!timeRegex.test(data.clock_in)) {
      return { valid: false, error: '出勤時間はHH:MM形式で入力してください' }
    }
  } else {
    if (!data.clock_out || typeof data.clock_out !== 'string') {
      return { valid: false, error: '退勤時間は必須です' }
    }

    const timeRegex = /^\d{2}:\d{2}$/
    if (!timeRegex.test(data.clock_out)) {
      return { valid: false, error: '退勤時間はHH:MM形式で入力してください' }
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
    const { action, id } = req.query

    if (req.method === 'GET') {
      const attendance = getAttendance()
      // 日付順にソート（新しい順）
      const sorted = attendance.sort((a, b) => {
        const dateCompare = b.date.localeCompare(a.date)
        if (dateCompare !== 0) return dateCompare
        return (b.clock_in || '').localeCompare(a.clock_in || '')
      })
      return res.json(sorted)
    }

    if (req.method === 'POST' && action === 'clock-in') {
      const validation = validateAttendanceData(req.body, false)
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error })
      }

      const { employee_name, date, clock_in } = req.body

      const attendance = getAttendance()

      // 同日同メンバーの未退勤記録チェック
      const existingRecord = attendance.find(
        a => a.employee_name === employee_name.trim() && a.date === date && !a.clock_out
      )
      if (existingRecord) {
        return res.status(409).json({ error: '既に出勤記録があります。退勤記録を先に登録してください' })
      }

      const newRecord = {
        id: Date.now(),
        employee_name: employee_name.trim(),
        date,
        clock_in,
        created_at: new Date().toISOString()
      }
      attendance.push(newRecord)
      setAttendance(attendance)
      return res.status(201).json({ id: newRecord.id, message: '出勤を記録しました' })
    }

    if (req.method === 'PUT' && action === 'clock-out') {
      if (!id) {
        return res.status(400).json({ error: 'IDが必要です' })
      }

      const validation = validateAttendanceData(req.body, true)
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error })
      }

      const attendance = getAttendance()
      const index = attendance.findIndex(a => a.id === Number(id))

      if (index === -1) {
        return res.status(404).json({ error: '出勤記録が見つかりません' })
      }

      if (attendance[index].clock_out) {
        return res.status(409).json({ error: '既に退勤記録が登録されています' })
      }

      const { clock_out } = req.body

      // 退勤時間が出勤時間より後かチェック
      if (clock_out <= attendance[index].clock_in) {
        return res.status(400).json({ error: '退勤時間は出勤時間より後にしてください' })
      }

      const clockIn = new Date(`2000-01-01 ${attendance[index].clock_in}`)
      const clockOut = new Date(`2000-01-01 ${clock_out}`)
      const totalHours = Math.round((clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60) * 100) / 100

      attendance[index] = {
        ...attendance[index],
        clock_out,
        total_hours: totalHours,
        updated_at: new Date().toISOString()
      }
      setAttendance(attendance)
      return res.json({ message: '退勤を記録しました', total_hours: totalHours })
    }

    if (req.method === 'DELETE') {
      if (!id) {
        return res.status(400).json({ error: 'IDが必要です' })
      }

      const attendance = getAttendance()
      const initialLength = attendance.length
      const filtered = attendance.filter(a => a.id !== Number(id))

      if (filtered.length === initialLength) {
        return res.status(404).json({ error: '勤怠記録が見つかりません' })
      }

      setAttendance(filtered)
      return res.json({ message: '勤怠記録を削除しました' })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error: any) {
    console.error('API Error:', error)
    return res.status(500).json({ error: 'サーバーエラーが発生しました', details: error.message })
  }
}

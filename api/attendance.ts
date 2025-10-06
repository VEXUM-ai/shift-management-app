import type { VercelRequest, VercelResponse } from '@vercel/node'

let attendance: any[] = []

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const { action, id } = req.query

  if (req.method === 'GET') {
    return res.json(attendance)
  }

  if (req.method === 'POST' && action === 'clock-in') {
    const newRecord = {
      id: Date.now(),
      ...req.body,
      created_at: new Date().toISOString()
    }
    attendance.push(newRecord)
    return res.json({ id: newRecord.id, message: '出勤を記録しました' })
  }

  if (req.method === 'PUT' && action === 'clock-out') {
    const index = attendance.findIndex(a => a.id === Number(id))
    if (index !== -1) {
      const clockIn = new Date(`2000-01-01 ${attendance[index].clock_in}`)
      const clockOut = new Date(`2000-01-01 ${req.body.clock_out}`)
      const totalHours = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60)

      attendance[index] = {
        ...attendance[index],
        clock_out: req.body.clock_out,
        total_hours: totalHours
      }
      return res.json({ message: '退勤を記録しました', total_hours: totalHours })
    }
    return res.status(404).json({ error: '出勤記録が見つかりません' })
  }

  if (req.method === 'DELETE') {
    attendance = attendance.filter(a => a.id !== Number(id))
    return res.json({ message: '勤怠記録を削除しました' })
  }

  res.status(405).json({ error: 'Method not allowed' })
}

import type { VercelRequest, VercelResponse } from '@vercel/node'

// In-memory storage (for demo purposes)
let shifts: any[] = []

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method === 'GET') {
    return res.json(shifts)
  }

  if (req.method === 'POST') {
    const newShift = {
      id: Date.now(),
      ...req.body,
      created_at: new Date().toISOString()
    }
    shifts.push(newShift)
    return res.json({ id: newShift.id, message: 'シフトを提出しました' })
  }

  if (req.method === 'PUT') {
    const { id } = req.query
    const index = shifts.findIndex(s => s.id === Number(id))
    if (index !== -1) {
      shifts[index] = { ...shifts[index], ...req.body }
      return res.json({ message: 'シフトを更新しました' })
    }
    return res.status(404).json({ error: 'シフトが見つかりません' })
  }

  if (req.method === 'DELETE') {
    const { id } = req.query
    shifts = shifts.filter(s => s.id !== Number(id))
    return res.json({ message: 'シフトを削除しました' })
  }

  res.status(405).json({ error: 'Method not allowed' })
}

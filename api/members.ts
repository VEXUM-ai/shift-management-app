import type { VercelRequest, VercelResponse } from '@vercel/node'

let members: any[] = []

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const { id } = req.query

  if (req.method === 'GET') {
    return res.json(members)
  }

  if (req.method === 'POST') {
    const { name, email } = req.body
    const newMember = {
      id: Date.now(),
      name,
      email,
      created_at: new Date().toISOString()
    }
    members.push(newMember)
    return res.json({ id: newMember.id, message: 'メンバーを追加しました' })
  }

  if (req.method === 'DELETE') {
    members = members.filter(m => m.id !== Number(id))
    return res.json({ message: 'メンバーを削除しました' })
  }

  res.status(405).json({ error: 'Method not allowed' })
}

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getMembers, setMembers } from './_storage'

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const { id } = req.query

  if (req.method === 'GET') {
    const members = getMembers()
    return res.json(members)
  }

  if (req.method === 'POST') {
    const { name, email, office_transport_fee } = req.body
    const members = getMembers()
    const newMember = {
      id: Date.now(),
      name,
      email,
      office_transport_fee: office_transport_fee || 0,
      created_at: new Date().toISOString()
    }
    members.push(newMember)
    setMembers(members)
    return res.json({ id: newMember.id, message: 'メンバーを追加しました' })
  }

  if (req.method === 'PUT') {
    const { name, email, office_transport_fee } = req.body
    const members = getMembers()
    const index = members.findIndex(m => m.id === Number(id))

    if (index !== -1) {
      members[index] = {
        ...members[index],
        name,
        email,
        office_transport_fee: office_transport_fee || 0,
        updated_at: new Date().toISOString()
      }
      setMembers(members)
      return res.json({ message: 'メンバー情報を更新しました' })
    }

    return res.status(404).json({ error: 'メンバーが見つかりません' })
  }

  if (req.method === 'DELETE') {
    const members = getMembers()
    const filtered = members.filter(m => m.id !== Number(id))
    setMembers(filtered)
    return res.json({ message: 'メンバーを削除しました' })
  }

  res.status(405).json({ error: 'Method not allowed' })
}

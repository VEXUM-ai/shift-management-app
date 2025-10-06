import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getMembers, setMembers } from './_storage'

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method === 'GET') {
    const members = getMembers()
    return res.json({
      status: 'ok',
      memberCount: members.length,
      members: members
    })
  }

  if (req.method === 'POST') {
    const members = getMembers()
    const testMember = {
      id: Date.now(),
      name: 'テストユーザー',
      email: 'test@example.com',
      office_transport_fee: 500,
      created_at: new Date().toISOString()
    }
    members.push(testMember)
    setMembers(members)

    return res.json({
      status: 'created',
      member: testMember,
      totalMembers: members.length
    })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

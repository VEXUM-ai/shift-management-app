import type { VercelRequest, VercelResponse } from '@vercel/node'

let locations: any[] = []

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const { id } = req.query

  if (req.method === 'GET') {
    return res.json(locations)
  }

  if (req.method === 'POST') {
    const { name, hourly_wage, type, logo } = req.body
    const newLocation = {
      id: Date.now(),
      name,
      hourly_wage,
      type,
      logo: logo || '',
      created_at: new Date().toISOString()
    }
    locations.push(newLocation)
    return res.json({ id: newLocation.id, message: '常駐先を追加しました' })
  }

  if (req.method === 'DELETE') {
    locations = locations.filter(l => l.id !== Number(id))
    return res.json({ message: '常駐先を削除しました' })
  }

  res.status(405).json({ error: 'Method not allowed' })
}

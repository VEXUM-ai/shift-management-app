import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getLocations, setLocations } from './_storage'

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const { id } = req.query

  if (req.method === 'GET') {
    const locations = getLocations()
    return res.json(locations)
  }

  if (req.method === 'POST') {
    const { name, hourly_wage, type, logo, member_transport_fees } = req.body
    const locations = getLocations()
    const newLocation = {
      id: Date.now(),
      name,
      hourly_wage,
      type,
      logo: logo || '',
      member_transport_fees: member_transport_fees || {},
      created_at: new Date().toISOString()
    }
    locations.push(newLocation)
    setLocations(locations)
    return res.json({ id: newLocation.id, message: '常駐先を追加しました' })
  }

  if (req.method === 'PUT') {
    const { member_transport_fees } = req.body
    const locations = getLocations()
    const index = locations.findIndex(l => l.id === Number(id))

    if (index !== -1) {
      locations[index] = {
        ...locations[index],
        member_transport_fees: member_transport_fees || locations[index].member_transport_fees,
        updated_at: new Date().toISOString()
      }
      setLocations(locations)
      return res.json({ message: '常駐先情報を更新しました' })
    }

    return res.status(404).json({ error: '常駐先が見つかりません' })
  }

  if (req.method === 'DELETE') {
    const locations = getLocations()
    const filtered = locations.filter(l => l.id !== Number(id))
    setLocations(filtered)
    return res.json({ message: '常駐先を削除しました' })
  }

  res.status(405).json({ error: 'Method not allowed' })
}

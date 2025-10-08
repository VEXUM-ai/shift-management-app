import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getLocations, setLocations } from './_storage'

// バリデーション関数
function validateLocationData(data: any): { valid: boolean; error?: string } {
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    return { valid: false, error: '常駐先名は必須です' }
  }

  if (data.name.length > 100) {
    return { valid: false, error: '常駐先名は100文字以内で入力してください' }
  }

  if (data.hourly_wage !== undefined) {
    const wage = Number(data.hourly_wage)
    if (isNaN(wage) || wage < 0) {
      return { valid: false, error: '時給は0以上の数値で入力してください' }
    }
  }

  if (data.type && !['office', 'client'].includes(data.type)) {
    return { valid: false, error: 'タイプは "office" または "client" を指定してください' }
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
      const locations = getLocations()
      return res.json(locations)
    }

    if (req.method === 'POST') {
      const { name, hourly_wage, type, logo, member_transport_fees, transportation_fee } = req.body

      const validation = validateLocationData(req.body)
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error })
      }

      const locations = getLocations()

      // 重複チェック
      if (locations.some(l => l.name === name.trim())) {
        return res.status(409).json({ error: '同じ名前の常駐先が既に存在します' })
      }

      const newLocation = {
        id: Date.now(),
        name: name.trim(),
        hourly_wage: Number(hourly_wage) || 0,
        type: type || 'client',
        logo: logo || '',
        member_transport_fees: member_transport_fees || {},
        transportation_fee: Number(transportation_fee) || 0,
        created_at: new Date().toISOString()
      }
      locations.push(newLocation)
      setLocations(locations)
      return res.status(201).json({ id: newLocation.id, message: '常駐先を追加しました' })
    }

    if (req.method === 'PUT') {
      if (!id) {
        return res.status(400).json({ error: 'IDが必要です' })
      }

      const validation = validateLocationData(req.body)
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error })
      }

      const { name, hourly_wage, type, logo, member_transport_fees, transportation_fee } = req.body
      const locations = getLocations()
      const index = locations.findIndex(l => l.id === Number(id))

      if (index === -1) {
        return res.status(404).json({ error: '常駐先が見つかりません' })
      }

      // 他の常駐先と名前が重複しないかチェック
      if (name) {
        const duplicateIndex = locations.findIndex(l => l.name === name.trim() && l.id !== Number(id))
        if (duplicateIndex !== -1) {
          return res.status(409).json({ error: '同じ名前の常駐先が既に存在します' })
        }
      }

      locations[index] = {
        ...locations[index],
        ...(name !== undefined && { name: name.trim() }),
        ...(hourly_wage !== undefined && { hourly_wage: Number(hourly_wage) }),
        ...(type !== undefined && { type }),
        ...(logo !== undefined && { logo }),
        ...(transportation_fee !== undefined && { transportation_fee: Number(transportation_fee) }),
        member_transport_fees: member_transport_fees || locations[index].member_transport_fees,
        updated_at: new Date().toISOString()
      }
      setLocations(locations)
      return res.json({ message: '常駐先情報を更新しました' })
    }

    if (req.method === 'DELETE') {
      if (!id) {
        return res.status(400).json({ error: 'IDが必要です' })
      }

      const locations = getLocations()
      const initialLength = locations.length
      const filtered = locations.filter(l => l.id !== Number(id))

      if (filtered.length === initialLength) {
        return res.status(404).json({ error: '常駐先が見つかりません' })
      }

      setLocations(filtered)
      return res.json({ message: '常駐先を削除しました' })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error: any) {
    console.error('API Error:', error)
    return res.status(500).json({ error: 'サーバーエラーが発生しました', details: error.message })
  }
}

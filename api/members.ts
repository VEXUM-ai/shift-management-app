import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getMembers, setMembers } from './_storage'

// バリデーション関数
function validateMemberData(data: any): { valid: boolean; error?: string } {
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    return { valid: false, error: 'メンバー名は必須です' }
  }

  if (data.name.length > 100) {
    return { valid: false, error: 'メンバー名は100文字以内で入力してください' }
  }

  if (data.email && typeof data.email === 'string') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      return { valid: false, error: '有効なメールアドレスを入力してください' }
    }
  }

  if (data.office_transport_fee !== undefined) {
    const fee = Number(data.office_transport_fee)
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
      const members = getMembers()
      return res.json(members)
    }

    if (req.method === 'POST') {
      const { name, email, office_transport_fee } = req.body

      const validation = validateMemberData(req.body)
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error })
      }

      const members = getMembers()

      // 重複チェック
      if (members.some(m => m.name === name.trim())) {
        return res.status(409).json({ error: '同じ名前のメンバーが既に存在します' })
      }

      const newMember = {
        id: Date.now(),
        name: name.trim(),
        email: email?.trim() || '',
        office_transport_fee: Number(office_transport_fee) || 0,
        created_at: new Date().toISOString()
      }
      members.push(newMember)
      setMembers(members)
      return res.status(201).json({ id: newMember.id, message: 'メンバーを追加しました' })
    }

    if (req.method === 'PUT') {
      if (!id) {
        return res.status(400).json({ error: 'IDが必要です' })
      }

      const validation = validateMemberData(req.body)
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error })
      }

      const { name, email, office_transport_fee } = req.body
      const members = getMembers()
      const index = members.findIndex(m => m.id === Number(id))

      if (index === -1) {
        return res.status(404).json({ error: 'メンバーが見つかりません' })
      }

      // 他のメンバーと名前が重複しないかチェック
      const duplicateIndex = members.findIndex(m => m.name === name.trim() && m.id !== Number(id))
      if (duplicateIndex !== -1) {
        return res.status(409).json({ error: '同じ名前のメンバーが既に存在します' })
      }

      members[index] = {
        ...members[index],
        name: name.trim(),
        email: email?.trim() || '',
        office_transport_fee: Number(office_transport_fee) || 0,
        updated_at: new Date().toISOString()
      }
      setMembers(members)
      return res.json({ message: 'メンバー情報を更新しました' })
    }

    if (req.method === 'DELETE') {
      if (!id) {
        return res.status(400).json({ error: 'IDが必要です' })
      }

      const members = getMembers()
      const initialLength = members.length
      const filtered = members.filter(m => m.id !== Number(id))

      if (filtered.length === initialLength) {
        return res.status(404).json({ error: 'メンバーが見つかりません' })
      }

      setMembers(filtered)
      return res.json({ message: 'メンバーを削除しました' })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error: any) {
    console.error('API Error:', error)
    return res.status(500).json({ error: 'サーバーエラーが発生しました', details: error.message })
  }
}

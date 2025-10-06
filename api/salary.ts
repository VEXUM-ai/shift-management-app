import type { VercelRequest, VercelResponse } from '@vercel/node'

let salary: any[] = []

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const { action, employee, month, id } = req.query

  if (req.method === 'GET') {
    if (employee && month) {
      const record = salary.find(s => s.employee_name === employee && s.month === month)
      return res.json(record || { message: '給与記録が見つかりません' })
    }
    return res.json(salary)
  }

  if (req.method === 'POST' && action === 'calculate') {
    const { employee_name, month, hourly_wage, total_hours } = req.body
    const total_salary = hourly_wage * total_hours

    const newRecord = {
      id: Date.now(),
      employee_name,
      month,
      hourly_wage,
      total_hours,
      total_salary,
      created_at: new Date().toISOString()
    }

    salary.push(newRecord)
    return res.json({
      id: newRecord.id,
      total_salary,
      message: '給与を計算しました'
    })
  }

  if (req.method === 'DELETE') {
    salary = salary.filter(s => s.id !== Number(id))
    return res.json({ message: '給与記録を削除しました' })
  }

  res.status(405).json({ error: 'Method not allowed' })
}

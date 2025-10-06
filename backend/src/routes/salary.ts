import express from 'express'
import db from '../database'

const router = express.Router()

// Get all salary records
router.get('/', (req, res) => {
  db.all('SELECT * FROM salary ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message })
      return
    }
    res.json(rows)
  })
})

// Calculate and save salary
router.post('/calculate', (req, res) => {
  const { employee_name, month, hourly_wage, total_hours } = req.body
  const total_salary = hourly_wage * total_hours

  db.run(
    'INSERT INTO salary (employee_name, month, hourly_wage, total_hours, total_salary) VALUES (?, ?, ?, ?, ?)',
    [employee_name, month, hourly_wage, total_hours, total_salary],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message })
        return
      }
      res.json({
        id: this.lastID,
        total_salary,
        message: '給与を計算しました'
      })
    }
  )
})

// Get salary by employee and month
router.get('/:employee/:month', (req, res) => {
  const { employee, month } = req.params

  db.get(
    'SELECT * FROM salary WHERE employee_name = ? AND month = ?',
    [employee, month],
    (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message })
        return
      }
      res.json(row || { message: '給与記録が見つかりません' })
    }
  )
})

// Delete salary record
router.delete('/:id', (req, res) => {
  const { id } = req.params

  db.run('DELETE FROM salary WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message })
      return
    }
    res.json({ message: '給与記録を削除しました' })
  })
})

export default router

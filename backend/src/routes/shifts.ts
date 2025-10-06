import express from 'express'
import db from '../database'

const router = express.Router()

// Get all shifts
router.get('/', (req, res) => {
  db.all('SELECT * FROM shifts ORDER BY date DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message })
      return
    }
    res.json(rows)
  })
})

// Create new shift
router.post('/', (req, res) => {
  const { employee_name, date, start_time, end_time } = req.body

  db.run(
    'INSERT INTO shifts (employee_name, date, start_time, end_time) VALUES (?, ?, ?, ?)',
    [employee_name, date, start_time, end_time],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message })
        return
      }
      res.json({ id: this.lastID, message: 'シフトを提出しました' })
    }
  )
})

// Update shift
router.put('/:id', (req, res) => {
  const { date, start_time, end_time, status } = req.body
  const { id } = req.params

  db.run(
    'UPDATE shifts SET date = ?, start_time = ?, end_time = ?, status = ? WHERE id = ?',
    [date, start_time, end_time, status, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message })
        return
      }
      res.json({ message: 'シフトを更新しました' })
    }
  )
})

// Delete shift
router.delete('/:id', (req, res) => {
  const { id } = req.params

  db.run('DELETE FROM shifts WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message })
      return
    }
    res.json({ message: 'シフトを削除しました' })
  })
})

export default router

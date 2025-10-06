import express from 'express'
import db from '../database'

const router = express.Router()

// Get all attendance records
router.get('/', (req, res) => {
  db.all('SELECT * FROM attendance ORDER BY date DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message })
      return
    }
    res.json(rows)
  })
})

// Clock in
router.post('/clock-in', (req, res) => {
  const { employee_name, date, clock_in } = req.body

  db.run(
    'INSERT INTO attendance (employee_name, date, clock_in) VALUES (?, ?, ?)',
    [employee_name, date, clock_in],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message })
        return
      }
      res.json({ id: this.lastID, message: '出勤を記録しました' })
    }
  )
})

// Clock out
router.put('/clock-out/:id', (req, res) => {
  const { clock_out } = req.body
  const { id } = req.params

  // Calculate total hours
  db.get('SELECT clock_in FROM attendance WHERE id = ?', [id], (err, row: any) => {
    if (err) {
      res.status(500).json({ error: err.message })
      return
    }

    if (!row) {
      res.status(404).json({ error: '出勤記録が見つかりません' })
      return
    }

    const clockInTime = new Date(`2000-01-01 ${row.clock_in}`)
    const clockOutTime = new Date(`2000-01-01 ${clock_out}`)
    const totalHours = (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60)

    db.run(
      'UPDATE attendance SET clock_out = ?, total_hours = ? WHERE id = ?',
      [clock_out, totalHours, id],
      function(err) {
        if (err) {
          res.status(500).json({ error: err.message })
          return
        }
        res.json({ message: '退勤を記録しました', total_hours: totalHours })
      }
    )
  })
})

// Delete attendance record
router.delete('/:id', (req, res) => {
  const { id } = req.params

  db.run('DELETE FROM attendance WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message })
      return
    }
    res.json({ message: '勤怠記録を削除しました' })
  })
})

export default router

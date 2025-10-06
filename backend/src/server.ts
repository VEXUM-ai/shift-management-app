import express from 'express'
import cors from 'cors'
import { initDatabase } from './database'
import shiftRoutes from './routes/shifts'
import attendanceRoutes from './routes/attendance'
import salaryRoutes from './routes/salary'

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// Initialize database
initDatabase()

// Routes
app.use('/api/shifts', shiftRoutes)
app.use('/api/attendance', attendanceRoutes)
app.use('/api/salary', salaryRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'シフト管理アプリ API' })
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})

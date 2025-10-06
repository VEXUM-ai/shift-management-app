import { useState } from 'react'
import './App.css'

type Tab = 'shift' | 'attendance' | 'salary'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('shift')

  return (
    <div className="app">
      <header>
        <h1>勤怠・シフト管理システム</h1>
      </header>

      <nav className="tabs">
        <button
          className={activeTab === 'shift' ? 'active' : ''}
          onClick={() => setActiveTab('shift')}
        >
          シフト管理
        </button>
        <button
          className={activeTab === 'attendance' ? 'active' : ''}
          onClick={() => setActiveTab('attendance')}
        >
          勤怠管理
        </button>
        <button
          className={activeTab === 'salary' ? 'active' : ''}
          onClick={() => setActiveTab('salary')}
        >
          給与計算
        </button>
      </nav>

      <main>
        {activeTab === 'shift' && <ShiftManagement />}
        {activeTab === 'attendance' && <AttendanceManagement />}
        {activeTab === 'salary' && <SalaryCalculation />}
      </main>
    </div>
  )
}

function ShiftManagement() {
  const [shifts, setShifts] = useState<any[]>([])
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')

  const addShift = () => {
    if (date && startTime && endTime) {
      setShifts([...shifts, { date, startTime, endTime, status: '提出済み' }])
      setDate('')
      setStartTime('')
      setEndTime('')
    }
  }

  return (
    <div className="section">
      <h2>シフト提出</h2>
      <div className="form">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          placeholder="日付"
        />
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          placeholder="開始時間"
        />
        <input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          placeholder="終了時間"
        />
        <button onClick={addShift}>シフト提出</button>
      </div>

      <h3>提出済みシフト</h3>
      <table>
        <thead>
          <tr>
            <th>日付</th>
            <th>開始時間</th>
            <th>終了時間</th>
            <th>ステータス</th>
          </tr>
        </thead>
        <tbody>
          {shifts.map((shift, index) => (
            <tr key={index}>
              <td>{shift.date}</td>
              <td>{shift.startTime}</td>
              <td>{shift.endTime}</td>
              <td>{shift.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function AttendanceManagement() {
  const [attendance, setAttendance] = useState<any[]>([])
  const [clockedIn, setClockedIn] = useState(false)
  const [currentEntry, setCurrentEntry] = useState<any>(null)

  const clockIn = () => {
    const now = new Date()
    setCurrentEntry({
      date: now.toLocaleDateString('ja-JP'),
      clockIn: now.toLocaleTimeString('ja-JP'),
      clockOut: null
    })
    setClockedIn(true)
  }

  const clockOut = () => {
    const now = new Date()
    const entry = {
      ...currentEntry,
      clockOut: now.toLocaleTimeString('ja-JP')
    }
    setAttendance([...attendance, entry])
    setClockedIn(false)
    setCurrentEntry(null)
  }

  return (
    <div className="section">
      <h2>勤怠打刻</h2>
      <div className="clock-buttons">
        <button onClick={clockIn} disabled={clockedIn}>出勤</button>
        <button onClick={clockOut} disabled={!clockedIn}>退勤</button>
      </div>
      {clockedIn && (
        <p className="status">出勤中: {currentEntry?.clockIn}</p>
      )}

      <h3>勤怠履歴</h3>
      <table>
        <thead>
          <tr>
            <th>日付</th>
            <th>出勤時刻</th>
            <th>退勤時刻</th>
          </tr>
        </thead>
        <tbody>
          {attendance.map((record, index) => (
            <tr key={index}>
              <td>{record.date}</td>
              <td>{record.clockIn}</td>
              <td>{record.clockOut}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SalaryCalculation() {
  const [hourlyWage, setHourlyWage] = useState('')
  const [hoursWorked, setHoursWorked] = useState('')
  const [totalSalary, setTotalSalary] = useState<number | null>(null)

  const calculateSalary = () => {
    const wage = parseFloat(hourlyWage)
    const hours = parseFloat(hoursWorked)
    if (!isNaN(wage) && !isNaN(hours)) {
      setTotalSalary(wage * hours)
    }
  }

  return (
    <div className="section">
      <h2>給与計算</h2>
      <div className="form">
        <input
          type="number"
          value={hourlyWage}
          onChange={(e) => setHourlyWage(e.target.value)}
          placeholder="時給（円）"
        />
        <input
          type="number"
          value={hoursWorked}
          onChange={(e) => setHoursWorked(e.target.value)}
          placeholder="勤務時間（時間）"
        />
        <button onClick={calculateSalary}>計算</button>
      </div>

      {totalSalary !== null && (
        <div className="result">
          <h3>計算結果</h3>
          <p className="salary-amount">¥{totalSalary.toLocaleString('ja-JP')}</p>
        </div>
      )}
    </div>
  )
}

export default App

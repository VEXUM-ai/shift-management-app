import { useState, useEffect } from 'react'
import './App.css'
import { LocationWithLogo, ShiftWithMonthlyView } from './components-enhanced'

type Tab = 'members' | 'locations' | 'shift' | 'attendance' | 'salary'

const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:3000/api'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('members')

  return (
    <div className="app">
      <header>
        <h1>勤怠・シフト管理システム</h1>
      </header>

      <nav className="tabs">
        <button
          className={activeTab === 'members' ? 'active' : ''}
          onClick={() => setActiveTab('members')}
        >
          メンバー管理
        </button>
        <button
          className={activeTab === 'locations' ? 'active' : ''}
          onClick={() => setActiveTab('locations')}
        >
          常駐先管理
        </button>
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
        {activeTab === 'members' && <MemberManagement />}
        {activeTab === 'locations' && <LocationWithLogo />}
        {activeTab === 'shift' && <ShiftWithMonthlyView />}
        {activeTab === 'attendance' && <AttendanceManagement />}
        {activeTab === 'salary' && <SalaryCalculation />}
      </main>
    </div>
  )
}

// メンバー管理
function MemberManagement() {
  const [members, setMembers] = useState<any[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      const response = await fetch(`${API_BASE}/members`)
      const data = await response.json()
      setMembers(data)
    } catch (error) {
      console.error('Error fetching members:', error)
    }
  }

  const addMember = async () => {
    if (name) {
      try {
        await fetch(`${API_BASE}/members`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email })
        })
        setName('')
        setEmail('')
        fetchMembers()
      } catch (error) {
        console.error('Error adding member:', error)
      }
    }
  }

  const deleteMember = async (id: number) => {
    try {
      await fetch(`${API_BASE}/members?id=${id}`, { method: 'DELETE' })
      fetchMembers()
    } catch (error) {
      console.error('Error deleting member:', error)
    }
  }

  return (
    <div className="section">
      <h2>メンバー登録</h2>
      <div className="form">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="名前"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="メールアドレス（任意）"
        />
        <button onClick={addMember}>メンバー追加</button>
      </div>

      <h3>メンバー一覧</h3>
      <table>
        <thead>
          <tr>
            <th>名前</th>
            <th>メールアドレス</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id}>
              <td>{member.name}</td>
              <td>{member.email || '-'}</td>
              <td>
                <button className="delete-btn" onClick={() => deleteMember(member.id)}>削除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// 常駐先管理
function LocationManagement() {
  const [locations, setLocations] = useState<any[]>([])
  const [name, setName] = useState('')
  const [hourlyWage, setHourlyWage] = useState('')

  useEffect(() => {
    fetchLocations()
  }, [])

  const fetchLocations = async () => {
    try {
      const response = await fetch(`${API_BASE}/locations`)
      const data = await response.json()
      setLocations(data)
    } catch (error) {
      console.error('Error fetching locations:', error)
    }
  }

  const addLocation = async () => {
    if (name && hourlyWage) {
      try {
        await fetch(`${API_BASE}/locations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            hourly_wage: parseFloat(hourlyWage),
            type: name === 'オフィス' ? 'office' : 'client'
          })
        })
        setName('')
        setHourlyWage('')
        fetchLocations()
      } catch (error) {
        console.error('Error adding location:', error)
      }
    }
  }

  const deleteLocation = async (id: number) => {
    try {
      await fetch(`${API_BASE}/locations?id=${id}`, { method: 'DELETE' })
      fetchLocations()
    } catch (error) {
      console.error('Error deleting location:', error)
    }
  }

  return (
    <div className="section">
      <h2>常駐先・勤務地登録</h2>
      <div className="form">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="常駐先名（例: オフィス、A社、B社）"
        />
        <input
          type="number"
          value={hourlyWage}
          onChange={(e) => setHourlyWage(e.target.value)}
          placeholder="時給（円）"
        />
        <button onClick={addLocation}>常駐先追加</button>
      </div>

      <h3>常駐先一覧</h3>
      <table>
        <thead>
          <tr>
            <th>常駐先名</th>
            <th>時給</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {locations.map((location) => (
            <tr key={location.id}>
              <td>{location.name}</td>
              <td>¥{location.hourly_wage?.toLocaleString('ja-JP')}</td>
              <td>
                <button className="delete-btn" onClick={() => deleteLocation(location.id)}>削除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// シフト管理（一括登録対応）
function ShiftManagement() {
  const [shifts, setShifts] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [bulkShifts, setBulkShifts] = useState<any[]>([{ date: '', startTime: '', endTime: '', member: '', location: '' }])

  useEffect(() => {
    fetchShifts()
    fetchMembers()
    fetchLocations()
  }, [])

  const fetchShifts = async () => {
    try {
      const response = await fetch(`${API_BASE}/shifts`)
      const data = await response.json()
      setShifts(data)
    } catch (error) {
      console.error('Error fetching shifts:', error)
    }
  }

  const fetchMembers = async () => {
    try {
      const response = await fetch(`${API_BASE}/members`)
      const data = await response.json()
      setMembers(data)
    } catch (error) {
      console.error('Error fetching members:', error)
    }
  }

  const fetchLocations = async () => {
    try {
      const response = await fetch(`${API_BASE}/locations`)
      const data = await response.json()
      setLocations(data)
    } catch (error) {
      console.error('Error fetching locations:', error)
    }
  }

  const addShiftRow = () => {
    setBulkShifts([...bulkShifts, { date: '', startTime: '', endTime: '', member: '', location: '' }])
  }

  const removeShiftRow = (index: number) => {
    setBulkShifts(bulkShifts.filter((_, i) => i !== index))
  }

  const updateShiftRow = (index: number, field: string, value: string) => {
    const updated = [...bulkShifts]
    updated[index][field] = value
    setBulkShifts(updated)
  }

  const submitBulkShifts = async () => {
    const validShifts = bulkShifts.filter(s => s.date && s.startTime && s.endTime && s.member && s.location)

    if (validShifts.length === 0) {
      alert('入力されたシフトがありません')
      return
    }

    try {
      for (const shift of validShifts) {
        await fetch(`${API_BASE}/shifts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            employee_name: shift.member,
            location: shift.location,
            date: shift.date,
            start_time: shift.startTime,
            end_time: shift.endTime,
            status: '提出済み'
          })
        })
      }
      setBulkShifts([{ date: '', startTime: '', endTime: '', member: '', location: '' }])
      fetchShifts()
      alert(`${validShifts.length}件のシフトを登録しました`)
    } catch (error) {
      console.error('Error submitting shifts:', error)
      alert('シフト登録に失敗しました')
    }
  }

  return (
    <div className="section">
      <h2>シフト一括登録</h2>
      <div className="bulk-shift-form">
        {bulkShifts.map((shift, index) => (
          <div key={index} className="shift-row">
            <select
              value={shift.member}
              onChange={(e) => updateShiftRow(index, 'member', e.target.value)}
            >
              <option value="">メンバー選択</option>
              {members.map(m => (
                <option key={m.id} value={m.name}>{m.name}</option>
              ))}
            </select>
            <select
              value={shift.location}
              onChange={(e) => updateShiftRow(index, 'location', e.target.value)}
            >
              <option value="">勤務地選択</option>
              {locations.map(l => (
                <option key={l.id} value={l.name}>{l.name}</option>
              ))}
            </select>
            <input
              type="date"
              value={shift.date}
              onChange={(e) => updateShiftRow(index, 'date', e.target.value)}
            />
            <input
              type="time"
              value={shift.startTime}
              onChange={(e) => updateShiftRow(index, 'startTime', e.target.value)}
              placeholder="開始"
            />
            <input
              type="time"
              value={shift.endTime}
              onChange={(e) => updateShiftRow(index, 'endTime', e.target.value)}
              placeholder="終了"
            />
            <button className="delete-btn" onClick={() => removeShiftRow(index)}>削除</button>
          </div>
        ))}
        <div className="bulk-actions">
          <button onClick={addShiftRow}>行追加</button>
          <button className="submit-btn" onClick={submitBulkShifts}>一括登録</button>
        </div>
      </div>

      <h3>提出済みシフト</h3>
      <table>
        <thead>
          <tr>
            <th>メンバー</th>
            <th>勤務地</th>
            <th>日付</th>
            <th>開始時間</th>
            <th>終了時間</th>
            <th>ステータス</th>
          </tr>
        </thead>
        <tbody>
          {shifts.map((shift, index) => (
            <tr key={index}>
              <td>{shift.employee_name}</td>
              <td>{shift.location || '-'}</td>
              <td>{shift.date}</td>
              <td>{shift.start_time}</td>
              <td>{shift.end_time}</td>
              <td>{shift.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// 勤怠管理（出勤先選択対応）
function AttendanceManagement() {
  const [attendance, setAttendance] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [clockedIn, setClockedIn] = useState(false)
  const [currentEntry, setCurrentEntry] = useState<any>(null)
  const [selectedMember, setSelectedMember] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')

  useEffect(() => {
    fetchAttendance()
    fetchMembers()
    fetchLocations()
  }, [])

  const fetchAttendance = async () => {
    try {
      const response = await fetch(`${API_BASE}/attendance`)
      const data = await response.json()
      setAttendance(data)
    } catch (error) {
      console.error('Error fetching attendance:', error)
    }
  }

  const fetchMembers = async () => {
    try {
      const response = await fetch(`${API_BASE}/members`)
      const data = await response.json()
      setMembers(data)
    } catch (error) {
      console.error('Error fetching members:', error)
    }
  }

  const fetchLocations = async () => {
    try {
      const response = await fetch(`${API_BASE}/locations`)
      const data = await response.json()
      setLocations(data)
    } catch (error) {
      console.error('Error fetching locations:', error)
    }
  }

  const clockIn = async () => {
    if (!selectedMember || !selectedLocation) {
      alert('メンバーと出勤先を選択してください')
      return
    }

    const now = new Date()
    const clockInTime = now.toLocaleTimeString('ja-JP')

    try {
      const response = await fetch(`${API_BASE}/attendance?action=clock-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_name: selectedMember,
          location: selectedLocation,
          date: now.toLocaleDateString('ja-JP'),
          clock_in: clockInTime
        })
      })
      const data = await response.json()
      setCurrentEntry({
        id: data.id,
        member: selectedMember,
        location: selectedLocation,
        date: now.toLocaleDateString('ja-JP'),
        clockIn: clockInTime,
        clockOut: null
      })
      setClockedIn(true)
    } catch (error) {
      console.error('Error clocking in:', error)
    }
  }

  const clockOut = async () => {
    const now = new Date()
    const clockOutTime = now.toLocaleTimeString('ja-JP')

    try {
      await fetch(`${API_BASE}/attendance?action=clock-out&id=${currentEntry.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clock_out: clockOutTime
        })
      })
      setClockedIn(false)
      setCurrentEntry(null)
      setSelectedMember('')
      setSelectedLocation('')
      fetchAttendance()
    } catch (error) {
      console.error('Error clocking out:', error)
    }
  }

  return (
    <div className="section">
      <h2>勤怠打刻</h2>
      <div className="form">
        <select
          value={selectedMember}
          onChange={(e) => setSelectedMember(e.target.value)}
          disabled={clockedIn}
        >
          <option value="">メンバー選択</option>
          {members.map(m => (
            <option key={m.id} value={m.name}>{m.name}</option>
          ))}
        </select>
        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          disabled={clockedIn}
        >
          <option value="">出勤先選択</option>
          {locations.map(l => (
            <option key={l.id} value={l.name}>{l.name}</option>
          ))}
        </select>
      </div>
      <div className="clock-buttons">
        <button onClick={clockIn} disabled={clockedIn}>出勤</button>
        <button onClick={clockOut} disabled={!clockedIn}>退勤</button>
      </div>
      {clockedIn && (
        <p className="status">
          {currentEntry?.member} - {currentEntry?.location} - 出勤中: {currentEntry?.clockIn}
        </p>
      )}

      <h3>勤怠履歴</h3>
      <table>
        <thead>
          <tr>
            <th>メンバー</th>
            <th>出勤先</th>
            <th>日付</th>
            <th>出勤時刻</th>
            <th>退勤時刻</th>
            <th>勤務時間</th>
          </tr>
        </thead>
        <tbody>
          {attendance.map((record, index) => (
            <tr key={index}>
              <td>{record.employee_name}</td>
              <td>{record.location || '-'}</td>
              <td>{record.date}</td>
              <td>{record.clock_in}</td>
              <td>{record.clock_out || '-'}</td>
              <td>{record.total_hours ? `${record.total_hours.toFixed(2)}時間` : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// 給与計算（出勤先別対応）
function SalaryCalculation() {
  const [members, setMembers] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [attendance, setAttendance] = useState<any[]>([])
  const [selectedMember, setSelectedMember] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [salaryBreakdown, setSalaryBreakdown] = useState<any>(null)

  useEffect(() => {
    fetchMembers()
    fetchLocations()
    fetchAttendance()
  }, [])

  const fetchMembers = async () => {
    try {
      const response = await fetch(`${API_BASE}/members`)
      const data = await response.json()
      setMembers(data)
    } catch (error) {
      console.error('Error fetching members:', error)
    }
  }

  const fetchLocations = async () => {
    try {
      const response = await fetch(`${API_BASE}/locations`)
      const data = await response.json()
      setLocations(data)
    } catch (error) {
      console.error('Error fetching locations:', error)
    }
  }

  const fetchAttendance = async () => {
    try {
      const response = await fetch(`${API_BASE}/attendance`)
      const data = await response.json()
      setAttendance(data)
    } catch (error) {
      console.error('Error fetching attendance:', error)
    }
  }

  const calculateSalary = () => {
    if (!selectedMember || !selectedMonth) {
      alert('メンバーと月を選択してください')
      return
    }

    // 該当メンバー・月の勤怠を抽出
    const targetRecords = attendance.filter(a =>
      a.employee_name === selectedMember &&
      a.date.startsWith(selectedMonth) &&
      a.total_hours
    )

    // 出勤先別に集計
    const breakdown: any = {}
    let totalHours = 0
    let totalSalary = 0

    targetRecords.forEach(record => {
      const location = record.location || 'その他'
      const locationData = locations.find(l => l.name === location)
      const hourlyWage = locationData?.hourly_wage || 0
      const salary = record.total_hours * hourlyWage

      if (!breakdown[location]) {
        breakdown[location] = {
          hours: 0,
          wage: hourlyWage,
          salary: 0
        }
      }

      breakdown[location].hours += record.total_hours
      breakdown[location].salary += salary
      totalHours += record.total_hours
      totalSalary += salary
    })

    setSalaryBreakdown({
      member: selectedMember,
      month: selectedMonth,
      breakdown,
      totalHours,
      totalSalary
    })
  }

  return (
    <div className="section">
      <h2>給与計算（出勤先別）</h2>
      <div className="form">
        <select
          value={selectedMember}
          onChange={(e) => setSelectedMember(e.target.value)}
        >
          <option value="">メンバー選択</option>
          {members.map(m => (
            <option key={m.id} value={m.name}>{m.name}</option>
          ))}
        </select>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          placeholder="対象月"
        />
        <button onClick={calculateSalary}>計算</button>
      </div>

      {salaryBreakdown && (
        <div className="result">
          <h3>計算結果: {salaryBreakdown.member} - {salaryBreakdown.month}</h3>

          <table>
            <thead>
              <tr>
                <th>出勤先</th>
                <th>勤務時間</th>
                <th>時給</th>
                <th>給与</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(salaryBreakdown.breakdown).map(([location, data]: [string, any]) => (
                <tr key={location}>
                  <td>{location}</td>
                  <td>{data.hours.toFixed(2)}時間</td>
                  <td>¥{data.wage.toLocaleString('ja-JP')}</td>
                  <td>¥{data.salary.toLocaleString('ja-JP')}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="total-row">
                <td>合計</td>
                <td>{salaryBreakdown.totalHours.toFixed(2)}時間</td>
                <td>-</td>
                <td>¥{salaryBreakdown.totalSalary.toLocaleString('ja-JP')}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  )
}

export default App

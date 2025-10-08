import { useState, useEffect, useMemo } from 'react'
import '../styles/SalaryReport.css'

const API_BASE = (import.meta as any).env.PROD ? '/api' : 'http://localhost:3001/api'

interface Member {
  id: number
  name: string
  email: string
}

interface Location {
  id: number
  name: string
  hourly_wage: number
}

interface Attendance {
  employee_name: string
  location: string
  date: string
  total_hours: number
}

interface SalaryData {
  member: string
  locationBreakdown: {
    location: string
    hours: number
    wage: number
    salary: number
  }[]
  totalHours: number
  totalSalary: number
}

export function SalaryReport() {
  const [members, setMembers] = useState<Member[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [membersRes, locationsRes, attendanceRes] = await Promise.all([
        fetch(`${API_BASE}/members`),
        fetch(`${API_BASE}/locations`),
        fetch(`${API_BASE}/attendance`)
      ])

      const membersData = await membersRes.json()
      const locationsData = await locationsRes.json()
      const attendanceData = await attendanceRes.json()

      setMembers(Array.isArray(membersData) ? membersData : [])
      setLocations(Array.isArray(locationsData) ? locationsData : [])
      setAttendance(Array.isArray(attendanceData) ? attendanceData : [])
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const salaryDataByMember = useMemo(() => {
    const result: SalaryData[] = []

    members.forEach(member => {
      const memberAttendance = attendance.filter(
        a => a.employee_name === member.name && a.date.startsWith(selectedMonth) && a.total_hours
      )

      const locationBreakdown: { [key: string]: { hours: number; wage: number } } = {}
      let totalHours = 0

      memberAttendance.forEach(record => {
        const location = locations.find(l => l.name === record.location)
        const wage = location?.hourly_wage || 0

        if (!locationBreakdown[record.location]) {
          locationBreakdown[record.location] = { hours: 0, wage }
        }

        locationBreakdown[record.location].hours += record.total_hours
        totalHours += record.total_hours
      })

      const breakdown = Object.entries(locationBreakdown).map(([location, data]) => ({
        location,
        hours: data.hours,
        wage: data.wage,
        salary: data.hours * data.wage
      }))

      const totalSalary = breakdown.reduce((sum, b) => sum + b.salary, 0)

      if (totalHours > 0) {
        result.push({
          member: member.name,
          locationBreakdown: breakdown,
          totalHours,
          totalSalary
        })
      }
    })

    return result.sort((a, b) => b.totalSalary - a.totalSalary)
  }, [members, locations, attendance, selectedMonth])

  const exportCSV = () => {
    if (salaryDataByMember.length === 0) {
      alert('出力するデータがありません')
      return
    }

    const csvRows: string[] = []
    csvRows.push('メンバー,勤務地,勤務時間,時給,給与')

    salaryDataByMember.forEach(data => {
      data.locationBreakdown.forEach(breakdown => {
        csvRows.push(
          `${data.member},${breakdown.location},${breakdown.hours.toFixed(2)},${breakdown.wage},${breakdown.salary.toLocaleString('ja-JP')}`
        )
      })
      csvRows.push(`${data.member} 合計,,${data.totalHours.toFixed(2)},,${data.totalSalary.toLocaleString('ja-JP')}`)
      csvRows.push('') // 空行
    })

    const csvContent = '\uFEFF' + csvRows.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `salary_report_${selectedMonth}.csv`
    link.click()
  }

  if (loading) {
    return <div className="salary-report-loading">データを読み込み中...</div>
  }

  if (error) {
    return <div className="salary-report-error">{error}</div>
  }

  return (
    <div className="salary-report">
      <div className="salary-report-header">
        <h2>メンバー別給与レポート</h2>
        <div className="controls">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
          <button onClick={exportCSV} className="export-btn">CSV出力</button>
          <button onClick={fetchAllData} className="refresh-btn">🔄 更新</button>
        </div>
      </div>

      {salaryDataByMember.length > 0 ? (
        <div className="salary-cards">
          {salaryDataByMember.map((data, index) => (
            <div key={index} className="salary-card">
              <div className="salary-card-header">
                <h3>{data.member}</h3>
                <div className="total-salary">¥{data.totalSalary.toLocaleString('ja-JP')}</div>
              </div>

              <div className="salary-details">
                <table>
                  <thead>
                    <tr>
                      <th>勤務地</th>
                      <th>勤務時間</th>
                      <th>時給</th>
                      <th>給与</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.locationBreakdown.map((breakdown, i) => (
                      <tr key={i}>
                        <td>{breakdown.location}</td>
                        <td>{breakdown.hours.toFixed(1)}h</td>
                        <td>¥{breakdown.wage.toLocaleString('ja-JP')}</td>
                        <td>¥{breakdown.salary.toLocaleString('ja-JP')}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="total-row">
                      <td>合計</td>
                      <td>{data.totalHours.toFixed(1)}h</td>
                      <td>-</td>
                      <td>¥{data.totalSalary.toLocaleString('ja-JP')}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-data">この月の給与データがありません</p>
      )}

      <div className="summary-section">
        <h3>全体サマリー</h3>
        <div className="summary-stats">
          <div className="summary-stat">
            <div className="summary-label">総メンバー数</div>
            <div className="summary-value">{salaryDataByMember.length}人</div>
          </div>
          <div className="summary-stat">
            <div className="summary-label">総勤務時間</div>
            <div className="summary-value">
              {salaryDataByMember.reduce((sum, d) => sum + d.totalHours, 0).toFixed(1)}h
            </div>
          </div>
          <div className="summary-stat">
            <div className="summary-label">総給与額</div>
            <div className="summary-value">
              ¥{salaryDataByMember.reduce((sum, d) => sum + d.totalSalary, 0).toLocaleString('ja-JP')}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

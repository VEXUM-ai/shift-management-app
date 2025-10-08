import { useState, useEffect, useMemo } from 'react'
import '../styles/Dashboard.css'

const API_BASE = (import.meta as any).env.PROD ? '/api' : 'http://localhost:3001/api'

interface DashboardStats {
  totalMembers: number
  totalLocations: number
  monthlyShifts: number
  monthlyHours: number
  monthlyPayroll: number
  todayAttendance: number
}

interface RecentActivity {
  id: number
  type: 'shift' | 'attendance' | 'member'
  message: string
  timestamp: string
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    totalLocations: 0,
    monthlyShifts: 0,
    monthlyHours: 0,
    monthlyPayroll: 0,
    todayAttendance: 0
  })
  const [members, setMembers] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [shifts, setShifts] = useState<any[]>([])
  const [attendance, setAttendance] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [membersRes, locationsRes, shiftsRes, attendanceRes] = await Promise.all([
        fetch(`${API_BASE}/members`),
        fetch(`${API_BASE}/locations`),
        fetch(`${API_BASE}/shifts`),
        fetch(`${API_BASE}/attendance`)
      ])

      const membersData = await membersRes.json()
      const locationsData = await locationsRes.json()
      const shiftsData = await shiftsRes.json()
      const attendanceData = await attendanceRes.json()

      setMembers(Array.isArray(membersData) ? membersData : [])
      setLocations(Array.isArray(locationsData) ? locationsData : [])
      setShifts(Array.isArray(shiftsData) ? shiftsData : [])
      setAttendance(Array.isArray(attendanceData) ? attendanceData : [])
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError('データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const calculatedStats = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7)
    const today = new Date().toISOString().slice(0, 10)

    const monthlyShiftsData = shifts.filter(s => s.date?.startsWith(currentMonth))
    const monthlyAttendanceData = attendance.filter(a => a.date?.startsWith(currentMonth))
    const todayAttendanceData = attendance.filter(a => a.date === today && !a.clock_out)

    let totalHours = 0
    let totalPayroll = 0

    monthlyAttendanceData.forEach(record => {
      if (record.total_hours) {
        totalHours += record.total_hours
        const location = locations.find(l => l.name === record.location)
        if (location) {
          totalPayroll += record.total_hours * location.hourly_wage
        }
      }
    })

    return {
      totalMembers: members.length,
      totalLocations: locations.length,
      monthlyShifts: monthlyShiftsData.length,
      monthlyHours: totalHours,
      monthlyPayroll: totalPayroll,
      todayAttendance: todayAttendanceData.length
    }
  }, [members, locations, shifts, attendance])

  const recentActivities = useMemo<RecentActivity[]>(() => {
    const activities: RecentActivity[] = []

    // 最近のシフト
    shifts.slice(-5).forEach((shift, index) => {
      activities.push({
        id: index,
        type: 'shift',
        message: `${shift.employee_name}さんのシフト登録: ${shift.date} ${shift.location}`,
        timestamp: shift.date
      })
    })

    return activities.reverse().slice(0, 10)
  }, [shifts])

  const topMembers = useMemo(() => {
    const memberStats = new Map<string, number>()

    attendance.forEach(record => {
      if (record.total_hours) {
        const current = memberStats.get(record.employee_name) || 0
        memberStats.set(record.employee_name, current + record.total_hours)
      }
    })

    return Array.from(memberStats.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, hours]) => ({ name, hours }))
  }, [attendance])

  if (loading) {
    return <div className="dashboard-loading">データを読み込み中...</div>
  }

  if (error) {
    return <div className="dashboard-error">{error}</div>
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>ダッシュボード</h2>
        <button className="refresh-btn" onClick={fetchAllData}>
          🔄 更新
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <div className="stat-label">登録メンバー</div>
            <div className="stat-value">{calculatedStats.totalMembers}人</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📍</div>
          <div className="stat-info">
            <div className="stat-label">勤務地数</div>
            <div className="stat-value">{calculatedStats.totalLocations}箇所</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-info">
            <div className="stat-label">今月のシフト</div>
            <div className="stat-value">{calculatedStats.monthlyShifts}件</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-info">
            <div className="stat-label">今月の総勤務時間</div>
            <div className="stat-value">{calculatedStats.monthlyHours.toFixed(1)}h</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <div className="stat-label">今月の総給与</div>
            <div className="stat-value">¥{calculatedStats.monthlyPayroll.toLocaleString('ja-JP')}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <div className="stat-label">本日の出勤者</div>
            <div className="stat-value">{calculatedStats.todayAttendance}人</div>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-section">
          <h3>勤務時間トップ5</h3>
          <div className="top-members">
            {topMembers.length > 0 ? (
              topMembers.map((member, index) => (
                <div key={index} className="top-member-item">
                  <div className="rank">#{index + 1}</div>
                  <div className="member-name">{member.name}</div>
                  <div className="member-hours">{member.hours.toFixed(1)}h</div>
                </div>
              ))
            ) : (
              <p className="no-data">データがありません</p>
            )}
          </div>
        </div>

        <div className="dashboard-section">
          <h3>最近のアクティビティ</h3>
          <div className="recent-activities">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon">
                    {activity.type === 'shift' && '📅'}
                    {activity.type === 'attendance' && '⏱️'}
                    {activity.type === 'member' && '👤'}
                  </div>
                  <div className="activity-content">
                    <div className="activity-message">{activity.message}</div>
                    <div className="activity-time">{activity.timestamp}</div>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data">アクティビティがありません</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect, useMemo } from 'react'
import '../styles/CalendarView.css'

const API_BASE = (import.meta as any).env.PROD ? '/api' : 'http://localhost:3001/api'

interface Shift {
  id: number
  employee_name: string
  location: string
  date: string
  start_time: string
  end_time: string
  status: string
}

export function CalendarView() {
  const [shifts, setShifts] = useState<Shift[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchShifts()
  }, [])

  const fetchShifts = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/shifts`)
      const data = await response.json()
      setShifts(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching shifts:', error)
    } finally {
      setLoading(false)
    }
  }

  const currentYear = selectedDate.getFullYear()
  const currentMonth = selectedDate.getMonth()

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = []

    // 前月の空白
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null)
    }

    // 当月の日付
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    return days
  }, [currentYear, currentMonth, daysInMonth, firstDayOfMonth])

  const getShiftsForDate = (day: number): Shift[] => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return shifts.filter(s => s.date === dateStr)
  }

  const previousMonth = () => {
    setSelectedDate(new Date(currentYear, currentMonth - 1, 1))
  }

  const nextMonth = () => {
    setSelectedDate(new Date(currentYear, currentMonth + 1, 1))
  }

  const goToToday = () => {
    setSelectedDate(new Date())
  }

  const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  const dayNames = ['日', '月', '火', '水', '木', '金', '土']

  return (
    <div className="calendar-view">
      <div className="calendar-header">
        <h2>シフトカレンダー</h2>
        <div className="calendar-controls">
          <button onClick={previousMonth}>◀</button>
          <button onClick={goToToday}>今日</button>
          <span className="current-month">{currentYear}年 {monthNames[currentMonth]}</span>
          <button onClick={nextMonth}>▶</button>
        </div>
      </div>

      {loading ? (
        <div className="calendar-loading">読み込み中...</div>
      ) : (
        <div className="calendar-grid">
          {dayNames.map(day => (
            <div key={day} className="calendar-day-name">
              {day}
            </div>
          ))}

          {calendarDays.map((day, index) => {
            const shiftsForDay = day ? getShiftsForDate(day) : []
            const isToday = day === new Date().getDate() &&
                           currentMonth === new Date().getMonth() &&
                           currentYear === new Date().getFullYear()

            return (
              <div
                key={index}
                className={`calendar-day ${!day ? 'empty' : ''} ${isToday ? 'today' : ''}`}
              >
                {day && (
                  <>
                    <div className="day-number">{day}</div>
                    <div className="day-shifts">
                      {shiftsForDay.map((shift, i) => (
                        <div
                          key={i}
                          className={`shift-item ${shift.status === '承認済み' ? 'approved' : ''}`}
                          title={`${shift.employee_name} - ${shift.location}\n${shift.start_time} - ${shift.end_time}`}
                        >
                          <div className="shift-member">{shift.employee_name}</div>
                          <div className="shift-time">{shift.start_time}</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}

      <div className="calendar-legend">
        <h3>凡例</h3>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color approved"></div>
            <span>承認済み</span>
          </div>
          <div className="legend-item">
            <div className="legend-color pending"></div>
            <span>提出済み</span>
          </div>
        </div>
      </div>
    </div>
  )
}

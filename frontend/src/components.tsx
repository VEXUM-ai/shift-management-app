// LocationManagement - 交通費対応版
import { useState, useEffect } from 'react'

const API_BASE = (import.meta as any).env.PROD ? '/api' : 'http://localhost:3001/api'

export function LocationManagementEnhanced() {
  const [locations, setLocations] = useState<any[]>([])
  const [name, setName] = useState('')
  const [hourlyWage, setHourlyWage] = useState('')
  const [transportationFee, setTransportationFee] = useState('')
  const [type, setType] = useState<'office' | 'client'>('client')

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
            transportation_fee: type === 'client' ? parseFloat(transportationFee || '0') : 0,
            type
          })
        })
        setName('')
        setHourlyWage('')
        setTransportationFee('')
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
        <select value={type} onChange={(e) => setType(e.target.value as 'office' | 'client')}>
          <option value="office">オフィス</option>
          <option value="client">常駐先</option>
        </select>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={type === 'office' ? 'オフィス' : '常駐先名（例: A社、B社）'}
        />
        <input
          type="number"
          value={hourlyWage}
          onChange={(e) => setHourlyWage(e.target.value)}
          placeholder="時給（円）"
        />
        {type === 'client' && (
          <input
            type="number"
            value={transportationFee}
            onChange={(e) => setTransportationFee(e.target.value)}
            placeholder="交通費（円/日）"
          />
        )}
        <button onClick={addLocation}>追加</button>
      </div>

      <h3>登録済み勤務地</h3>
      <table>
        <thead>
          <tr>
            <th>種別</th>
            <th>名称</th>
            <th>時給</th>
            <th>交通費（日）</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {locations.map((location) => (
            <tr key={location.id}>
              <td>{location.type === 'office' ? 'オフィス' : '常駐先'}</td>
              <td>{location.name}</td>
              <td>¥{location.hourly_wage?.toLocaleString('ja-JP')}</td>
              <td>{location.transportation_fee ? `¥${location.transportation_fee.toLocaleString('ja-JP')}` : '-'}</td>
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

// ShiftManagement - 交通費・Slack通知対応版
export function ShiftManagementEnhanced() {
  const [shifts, setShifts] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [bulkShifts, setBulkShifts] = useState<any[]>([
    { date: '', startTime: '', endTime: '', member: '', location: '', transportationFee: '' }
  ])

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
    setBulkShifts([...bulkShifts, { date: '', startTime: '', endTime: '', member: '', location: '', transportationFee: '' }])
  }

  const removeShiftRow = (index: number) => {
    setBulkShifts(bulkShifts.filter((_, i) => i !== index))
  }

  const updateShiftRow = (index: number, field: string, value: string) => {
    const updated = [...bulkShifts]
    updated[index][field] = value

    // 常駐先が選択されたら、その常駐先のデフォルト交通費を設定
    if (field === 'location') {
      const selectedLocation = locations.find(l => l.name === value)
      if (selectedLocation && selectedLocation.transportation_fee) {
        updated[index]['transportationFee'] = selectedLocation.transportation_fee.toString()
      }
    }

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
            transportation_fee: parseFloat(shift.transportationFee || '0'),
            status: '提出済み'
          })
        })
      }

      // Slack通知
      const message = `【シフト登録通知】\n${validShifts.length}件のシフトが登録されました\n${validShifts.map(s => `・${s.date} ${s.member} @ ${s.location}`).join('\n')}`
      await sendSlackNotification(message)

      setBulkShifts([{ date: '', startTime: '', endTime: '', member: '', location: '', transportationFee: '' }])
      fetchShifts()
      alert(`${validShifts.length}件のシフトを登録しました`)
    } catch (error) {
      console.error('Error submitting shifts:', error)
      alert('シフト登録に失敗しました')
    }
  }

  const sendSlackNotification = async (message: string) => {
    try {
      await fetch(`${API_BASE}/slack`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      })
    } catch (error) {
      console.log('Slack notification skipped:', error)
    }
  }

  const exportCSV = () => {
    if (shifts.length === 0) {
      alert('出力するデータがありません')
      return
    }

    const csvData = shifts.map(s => ({
      メンバー: s.employee_name,
      勤務地: s.location,
      日付: s.date,
      開始時間: s.start_time,
      終了時間: s.end_time,
      交通費: s.transportation_fee || 0,
      ステータス: s.status
    }))

    const headers = Object.keys(csvData[0])
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(h => row[h as keyof typeof row]).join(','))
    ].join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `shifts_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
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
                <option key={l.id} value={l.name}>
                  {l.name} ({l.type === 'office' ? 'オフィス' : '常駐先'})
                </option>
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
            <input
              type="number"
              value={shift.transportationFee}
              onChange={(e) => updateShiftRow(index, 'transportationFee', e.target.value)}
              placeholder="交通費"
            />
            <button className="delete-btn" onClick={() => removeShiftRow(index)}>削除</button>
          </div>
        ))}
        <div className="bulk-actions">
          <button onClick={addShiftRow}>行追加</button>
          <button className="submit-btn" onClick={submitBulkShifts}>一括登録</button>
          <button onClick={exportCSV}>CSV出力</button>
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
            <th>交通費</th>
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
              <td>¥{(shift.transportation_fee || 0).toLocaleString('ja-JP')}</td>
              <td>{shift.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

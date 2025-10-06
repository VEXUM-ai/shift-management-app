import { useState, useEffect } from 'react'

const API_BASE = (import.meta as any).env.PROD ? '/api' : 'http://localhost:3000/api'

// 常駐先管理 - ロゴアップロード対応
export function LocationWithLogo() {
  const [locations, setLocations] = useState<any[]>([])
  const [name, setName] = useState('')
  const [hourlyWage, setHourlyWage] = useState('')
  const [transportationFee, setTransportationFee] = useState('')
  const [type, setType] = useState<'office' | 'client'>('client')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>('')

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

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
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
            type,
            logo: logoPreview || ''
          })
        })
        setName('')
        setHourlyWage('')
        setTransportationFee('')
        setLogoFile(null)
        setLogoPreview('')
        fetchLocations()
      } catch (error) {
        console.error('Error adding location:', error)
      }
    }
  }

  const deleteLocation = async (id: number) => {
    if (confirm('この勤務地を削除しますか？')) {
      try {
        await fetch(`${API_BASE}/locations?id=${id}`, { method: 'DELETE' })
        fetchLocations()
      } catch (error) {
        console.error('Error deleting location:', error)
      }
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
        <div className="file-upload">
          <label htmlFor="logo-upload">ロゴ画像:</label>
          <input
            id="logo-upload"
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
          />
          {logoPreview && <img src={logoPreview} alt="Logo preview" className="logo-preview" />}
        </div>
        <button onClick={addLocation}>追加</button>
      </div>

      <h3>登録済み勤務地</h3>
      <div className="locations-grid">
        {locations.map((location) => (
          <div key={location.id} className="location-card">
            {location.logo && (
              <div className="location-logo">
                <img src={location.logo} alt={location.name} />
              </div>
            )}
            <div className="location-info">
              <span className="location-type">{location.type === 'office' ? 'オフィス' : '常駐先'}</span>
              <h4>{location.name}</h4>
              <p>時給: ¥{location.hourly_wage?.toLocaleString('ja-JP')}</p>
              {location.transportation_fee > 0 && (
                <p>交通費: ¥{location.transportation_fee.toLocaleString('ja-JP')}/日</p>
              )}
            </div>
            <button className="delete-btn" onClick={() => deleteLocation(location.id)}>削除</button>
          </div>
        ))}
      </div>
    </div>
  )
}

// シフト管理 - 月ごと表示・ロゴ表示対応
export function ShiftWithMonthlyView() {
  const [shifts, setShifts] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
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
    if (bulkShifts.length > 1) {
      setBulkShifts(bulkShifts.filter((_, i) => i !== index))
    }
  }

  const updateShiftRow = (index: number, field: string, value: string) => {
    const updated = [...bulkShifts]
    updated[index][field] = value

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
    const monthlyShifts = shifts.filter(s => s.date.startsWith(selectedMonth))

    if (monthlyShifts.length === 0) {
      alert('出力するデータがありません')
      return
    }

    const csvData = monthlyShifts.map(s => ({
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
    link.download = `shifts_${selectedMonth}.csv`
    link.click()
  }

  const getLocationLogo = (locationName: string) => {
    const location = locations.find(l => l.name === locationName)
    return location?.logo
  }

  // 月ごとにグループ化
  const monthlyShifts = shifts.filter(s => s.date.startsWith(selectedMonth))

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
        </div>
      </div>

      <h3>シフト履歴（月別表示）</h3>
      <div className="month-selector">
        <label>表示月:</label>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        />
        <button onClick={exportCSV}>CSV出力</button>
      </div>

      <div className="shifts-table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ロゴ</th>
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
            {monthlyShifts.map((shift, index) => {
              const logo = getLocationLogo(shift.location)
              return (
                <tr key={index}>
                  <td className="logo-cell">
                    {logo ? (
                      <img src={logo} alt={shift.location} className="table-logo" />
                    ) : (
                      <div className="no-logo">-</div>
                    )}
                  </td>
                  <td>{shift.employee_name}</td>
                  <td>{shift.location || '-'}</td>
                  <td>{shift.date}</td>
                  <td>{shift.start_time}</td>
                  <td>{shift.end_time}</td>
                  <td>¥{(shift.transportation_fee || 0).toLocaleString('ja-JP')}</td>
                  <td><span className="status-badge">{shift.status}</span></td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {monthlyShifts.length === 0 && (
          <p className="no-data">この月のシフトはありません</p>
        )}
      </div>
    </div>
  )
}

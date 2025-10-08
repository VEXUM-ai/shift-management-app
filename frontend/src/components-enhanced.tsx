import { useState, useEffect, useCallback, useMemo } from 'react'

// 型定義
interface Location {
  id: number
  name: string
  hourly_wage: number
  type: 'office' | 'client'
  logo: string
  transportation_fee?: number
  member_transport_fees?: Record<string, number>
}

interface Member {
  id: number
  name: string
  email: string
  office_transport_fee: number
}

interface Shift {
  id: number
  employee_name: string
  location: string
  date: string
  start_time: string
  end_time: string
  transportation_fee: number
  status: string
}

interface BulkShiftRow {
  date: string
  startTime: string
  endTime: string
  member: string
  location: string
  transportationFee: string
}

const API_BASE = (import.meta as any).env.PROD ? '/api' : 'http://localhost:3001/api'

// エラーハンドリングユーティリティ
async function handleApiError(response: Response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'エラーが発生しました' }))
    throw new Error(errorData.error || `HTTPエラー: ${response.status}`)
  }
  return response.json()
}

// 常駐先管理 - ロゴアップロード対応
export function LocationWithLogo() {
  const [locations, setLocations] = useState<Location[]>([])
  const [name, setName] = useState('')
  const [hourlyWage, setHourlyWage] = useState('')
  const [transportationFee, setTransportationFee] = useState('')
  const [type, setType] = useState<'office' | 'client'>('client')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLocations()
  }, [])

  const fetchLocations = useCallback(async () => {
    try {
      setError(null)
      const response = await fetch(`${API_BASE}/locations`)
      const data = await handleApiError(response)
      setLocations(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching locations:', error)
      setError(error instanceof Error ? error.message : '常駐先の取得に失敗しました')
    }
  }, [])

  const handleLogoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // ファイルサイズチェック (5MB制限)
      if (file.size > 5 * 1024 * 1024) {
        alert('ファイルサイズは5MB以下にしてください')
        return
      }

      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.onerror = () => {
        alert('画像の読み込みに失敗しました')
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const addLocation = useCallback(async () => {
    if (!name.trim()) {
      alert('常駐先名を入力してください')
      return
    }
    if (!hourlyWage || parseFloat(hourlyWage) <= 0) {
      alert('有効な時給を入力してください')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE}/locations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          hourly_wage: parseFloat(hourlyWage),
          transportation_fee: type === 'client' ? parseFloat(transportationFee || '0') : 0,
          type,
          logo: logoPreview || ''
        })
      })
      await handleApiError(response)

      setName('')
      setHourlyWage('')
      setTransportationFee('')
      setLogoFile(null)
      setLogoPreview('')
      await fetchLocations()
      alert('常駐先を追加しました')
    } catch (error) {
      console.error('Error adding location:', error)
      setError(error instanceof Error ? error.message : '常駐先の追加に失敗しました')
      alert(error instanceof Error ? error.message : '常駐先の追加に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [name, hourlyWage, transportationFee, type, logoPreview, fetchLocations])

  const deleteLocation = useCallback(async (id: number) => {
    if (!confirm('この勤務地を削除しますか？')) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE}/locations?id=${id}`, { method: 'DELETE' })
      await handleApiError(response)
      await fetchLocations()
      alert('常駐先を削除しました')
    } catch (error) {
      console.error('Error deleting location:', error)
      setError(error instanceof Error ? error.message : '常駐先の削除に失敗しました')
      alert(error instanceof Error ? error.message : '常駐先の削除に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [fetchLocations])

  return (
    <div className="section">
      <h2>常駐先・勤務地登録</h2>
      {error && <div className="error-message">{error}</div>}
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
        <button onClick={addLocation} disabled={loading}>
          {loading ? '処理中...' : '追加'}
        </button>
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
  const [shifts, setShifts] = useState<Shift[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [bulkShifts, setBulkShifts] = useState<BulkShiftRow[]>([
    { date: '', startTime: '', endTime: '', member: '', location: '', transportationFee: '' }
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingShift, setEditingShift] = useState<Shift | null>(null)

  useEffect(() => {
    fetchShifts()
    fetchMembers()
    fetchLocations()
  }, [])

  const fetchShifts = useCallback(async () => {
    try {
      setError(null)
      const response = await fetch(`${API_BASE}/shifts`)
      const data = await handleApiError(response)
      setShifts(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching shifts:', error)
      setError(error instanceof Error ? error.message : 'シフトの取得に失敗しました')
    }
  }, [])

  const fetchMembers = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/members`)
      const data = await handleApiError(response)
      setMembers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching members:', error)
    }
  }, [])

  const fetchLocations = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/locations`)
      const data = await handleApiError(response)
      setLocations(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching locations:', error)
    }
  }, [])

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

  const submitBulkShifts = useCallback(async () => {
    const validShifts = bulkShifts.filter(s => s.date && s.startTime && s.endTime && s.member && s.location)

    if (validShifts.length === 0) {
      alert('入力されたシフトがありません')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const errors: string[] = []

      // 並列リクエストで登録（パフォーマンス向上）
      const results = await Promise.allSettled(
        validShifts.map(shift =>
          fetch(`${API_BASE}/shifts`, {
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
          }).then(handleApiError)
        )
      )

      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          errors.push(`${validShifts[index].date} ${validShifts[index].member}: ${result.reason}`)
        }
      })

      if (errors.length > 0) {
        alert(`一部のシフト登録に失敗しました:\n${errors.join('\n')}`)
      }

      const successCount = results.filter(r => r.status === 'fulfilled').length

      if (successCount > 0) {
        // Slack通知
        const message = `【シフト登録通知】\n${successCount}件のシフトが登録されました\n${validShifts.slice(0, successCount).map(s => `・${s.date} ${s.member} @ ${s.location}`).join('\n')}`
        await sendSlackNotification(message)

        setBulkShifts([{ date: '', startTime: '', endTime: '', member: '', location: '', transportationFee: '' }])
        await fetchShifts()
        alert(`${successCount}件のシフトを登録しました${errors.length > 0 ? `（${errors.length}件失敗）` : ''}`)
      }
    } catch (error) {
      console.error('Error submitting shifts:', error)
      setError(error instanceof Error ? error.message : 'シフト登録に失敗しました')
      alert(error instanceof Error ? error.message : 'シフト登録に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [bulkShifts, fetchShifts])

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

  const getLocationLogo = useCallback((locationName: string) => {
    const location = locations.find(l => l.name === locationName)
    return location?.logo
  }, [locations])

  const startEditShift = (shift: Shift) => {
    setEditingShift(shift)
  }

  const updateShift = useCallback(async () => {
    if (!editingShift) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE}/shifts/${editingShift.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_name: editingShift.employee_name,
          location: editingShift.location,
          date: editingShift.date,
          start_time: editingShift.start_time,
          end_time: editingShift.end_time,
          transportation_fee: editingShift.transportation_fee,
          status: editingShift.status
        })
      })
      await handleApiError(response)
      setEditingShift(null)
      await fetchShifts()
      alert('シフトを更新しました')
    } catch (error) {
      console.error('Error updating shift:', error)
      setError(error instanceof Error ? error.message : 'シフトの更新に失敗しました')
      alert(error instanceof Error ? error.message : 'シフトの更新に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [editingShift, fetchShifts])

  const deleteShift = useCallback(async (id: number) => {
    if (!confirm('このシフトを削除しますか？')) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE}/shifts/${id}`, { method: 'DELETE' })
      await handleApiError(response)
      await fetchShifts()
      alert('シフトを削除しました')
    } catch (error) {
      console.error('Error deleting shift:', error)
      setError(error instanceof Error ? error.message : 'シフトの削除に失敗しました')
      alert(error instanceof Error ? error.message : 'シフトの削除に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [fetchShifts])

  // 月ごとにグループ化（useMemoでパフォーマンス最適化）
  const monthlyShifts = useMemo(
    () => shifts.filter(s => s.date && s.date.startsWith(selectedMonth)),
    [shifts, selectedMonth]
  )

  return (
    <div className="section">
      <h2>シフト一括登録</h2>
      {error && <div className="error-message">{error}</div>}
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
          <button onClick={addShiftRow} disabled={loading}>行追加</button>
          <button className="submit-btn" onClick={submitBulkShifts} disabled={loading}>
            {loading ? '登録中...' : '一括登録'}
          </button>
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
              <th>操作</th>
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
                  <td>
                    <button className="edit-btn" onClick={() => startEditShift(shift)} disabled={loading}>編集</button>
                    <button className="delete-btn" onClick={() => deleteShift(shift.id)} disabled={loading}>削除</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {monthlyShifts.length === 0 && (
          <p className="no-data">この月のシフトはありません</p>
        )}
      </div>

      {/* 編集モーダル */}
      {editingShift && (
        <div className="modal-overlay" onClick={() => setEditingShift(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>シフト編集</h3>
            <div className="edit-form">
              <div className="form-group">
                <label>メンバー</label>
                <select
                  value={editingShift.employee_name}
                  onChange={(e) => setEditingShift({...editingShift, employee_name: e.target.value})}
                >
                  {members.map(m => (
                    <option key={m.id} value={m.name}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>勤務地</label>
                <select
                  value={editingShift.location}
                  onChange={(e) => setEditingShift({...editingShift, location: e.target.value})}
                >
                  {locations.map(l => (
                    <option key={l.id} value={l.name}>{l.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>日付</label>
                <input
                  type="date"
                  value={editingShift.date}
                  onChange={(e) => setEditingShift({...editingShift, date: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>開始時間</label>
                <input
                  type="time"
                  value={editingShift.start_time}
                  onChange={(e) => setEditingShift({...editingShift, start_time: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>終了時間</label>
                <input
                  type="time"
                  value={editingShift.end_time}
                  onChange={(e) => setEditingShift({...editingShift, end_time: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>交通費</label>
                <input
                  type="number"
                  value={editingShift.transportation_fee}
                  onChange={(e) => setEditingShift({...editingShift, transportation_fee: parseFloat(e.target.value)})}
                />
              </div>
              <div className="form-group">
                <label>ステータス</label>
                <select
                  value={editingShift.status}
                  onChange={(e) => setEditingShift({...editingShift, status: e.target.value})}
                >
                  <option value="提出済み">提出済み</option>
                  <option value="承認済み">承認済み</option>
                  <option value="却下">却下</option>
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={updateShift} className="submit-btn" disabled={loading}>
                {loading ? '更新中...' : '更新'}
              </button>
              <button onClick={() => setEditingShift(null)} className="cancel-btn">キャンセル</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

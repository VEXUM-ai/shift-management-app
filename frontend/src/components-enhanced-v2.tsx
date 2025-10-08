import { useState, useCallback, useMemo } from 'react'
import { apiGet, apiPost, apiDelete } from './utils/api'
import { useDataFetch, useMultiDataFetch } from './hooks/useDataFetch'
import { isValidFileSize, isValidImageFile, isValidString, isValidNumber } from './utils/validation'
import { formatCurrency, downloadCsv, generateCsv } from './utils/formatters'
import { LoadingSpinner } from './components/LoadingSpinner'
import { ErrorMessage } from './components/ErrorMessage'
import type { Location, Member, Shift, BulkShiftRow } from './types'

// 常駐先管理 - 最適化版
export function LocationManagementOptimized() {
  const { data: locations, setData: setLocations, loading, error, refetch } = useDataFetch<Location[]>('/locations', [])
  const [name, setName] = useState('')
  const [hourlyWage, setHourlyWage] = useState('')
  const [transportationFee, setTransportationFee] = useState('')
  const [type, setType] = useState<'office' | 'client'>('client')
  const [logoPreview, setLogoPreview] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)

  const handleLogoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!isValidImageFile(file)) {
      alert('画像ファイル（JPEG, PNG, GIF, WebP）を選択してください')
      return
    }

    if (!isValidFileSize(file, 5)) {
      alert('ファイルサイズは5MB以下にしてください')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => setLogoPreview(reader.result as string)
    reader.onerror = () => alert('画像の読み込みに失敗しました')
    reader.readAsDataURL(file)
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!isValidString(name)) {
      alert('常駐先名を入力してください')
      return
    }

    if (!isValidNumber(hourlyWage, 0)) {
      alert('有効な時給を入力してください')
      return
    }

    setSubmitting(true)
    try {
      await apiPost('/locations', {
        name: name.trim(),
        hourly_wage: parseFloat(hourlyWage),
        transportation_fee: type === 'client' ? parseFloat(transportationFee || '0') : 0,
        type,
        logo: logoPreview || ''
      })

      setName('')
      setHourlyWage('')
      setTransportationFee('')
      setLogoPreview('')
      await refetch()
      alert('常駐先を追加しました')
    } catch (err) {
      alert(err instanceof Error ? err.message : '常駐先の追加に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }, [name, hourlyWage, transportationFee, type, logoPreview, refetch])

  const handleDelete = useCallback(async (id: number) => {
    if (!confirm('この勤務地を削除しますか？')) return

    setSubmitting(true)
    try {
      await apiDelete(`/locations?id=${id}`)
      await refetch()
      alert('常駐先を削除しました')
    } catch (err) {
      alert(err instanceof Error ? err.message : '常駐先の削除に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }, [refetch])

  if (loading && locations.length === 0) return <LoadingSpinner message="常駐先を読み込み中..." />
  if (error) return <ErrorMessage message={error} onRetry={refetch} />

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
          placeholder={type === 'office' ? 'オフィス名' : '常駐先名（例: A社、B社）'}
        />

        <input
          type="number"
          value={hourlyWage}
          onChange={(e) => setHourlyWage(e.target.value)}
          placeholder="時給（円）"
          min="0"
        />

        {type === 'client' && (
          <input
            type="number"
            value={transportationFee}
            onChange={(e) => setTransportationFee(e.target.value)}
            placeholder="交通費（円/日）"
            min="0"
          />
        )}

        <div className="file-upload">
          <label htmlFor="logo-upload">ロゴ画像 (最大5MB):</label>
          <input
            id="logo-upload"
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
          />
          {logoPreview && <img src={logoPreview} alt="Logo preview" className="logo-preview" />}
        </div>

        <button onClick={handleSubmit} disabled={submitting || loading}>
          {submitting ? '追加中...' : '追加'}
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
              <span className="location-type">
                {location.type === 'office' ? 'オフィス' : '常駐先'}
              </span>
              <h4>{location.name}</h4>
              <p>時給: {formatCurrency(location.hourly_wage)}</p>
              {location.transportation_fee && location.transportation_fee > 0 && (
                <p>交通費: {formatCurrency(location.transportation_fee)}/日</p>
              )}
            </div>
            <button
              className="delete-btn"
              onClick={() => handleDelete(location.id)}
              disabled={submitting}
            >
              削除
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// シフト管理 - 最適化版
export function ShiftManagementOptimized() {
  const {
    data1: shifts,
    data2: members,
    data3: locations,
    setData1: setShifts,
    loading,
    error,
    refetch
  } = useMultiDataFetch<Shift[], Member[], Location[]>('/shifts', '/members', '/locations')

  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [bulkShifts, setBulkShifts] = useState<BulkShiftRow[]>([
    { date: '', startTime: '', endTime: '', member: '', location: '', transportationFee: '' }
  ])
  const [submitting, setSubmitting] = useState(false)

  const addShiftRow = useCallback(() => {
    setBulkShifts(prev => [...prev, { date: '', startTime: '', endTime: '', member: '', location: '', transportationFee: '' }])
  }, [])

  const removeShiftRow = useCallback((index: number) => {
    if (bulkShifts.length > 1) {
      setBulkShifts(prev => prev.filter((_, i) => i !== index))
    }
  }, [bulkShifts.length])

  const updateShiftRow = useCallback((index: number, field: keyof BulkShiftRow, value: string) => {
    setBulkShifts(prev => {
      const updated = [...prev]
      updated[index][field] = value

      if (field === 'location' && locations) {
        const selectedLocation = locations.find(l => l.name === value)
        if (selectedLocation?.transportation_fee) {
          updated[index]['transportationFee'] = selectedLocation.transportation_fee.toString()
        }
      }

      return updated
    })
  }, [locations])

  const submitBulkShifts = useCallback(async () => {
    const validShifts = bulkShifts.filter(s =>
      s.date && s.startTime && s.endTime && s.member && s.location
    )

    if (validShifts.length === 0) {
      alert('入力されたシフトがありません')
      return
    }

    setSubmitting(true)
    try {
      const results = await Promise.allSettled(
        validShifts.map(shift =>
          apiPost('/shifts', {
            employee_name: shift.member,
            location: shift.location,
            date: shift.date,
            start_time: shift.startTime,
            end_time: shift.endTime,
            transportation_fee: parseFloat(shift.transportationFee || '0'),
            status: '提出済み'
          })
        )
      )

      const errors = results.filter(r => r.status === 'rejected')
      const successCount = results.length - errors.length

      if (successCount > 0) {
        // Slack通知
        try {
          await apiPost('/slack', {
            message: `【シフト登録通知】\n${successCount}件のシフトが登録されました`
          })
        } catch {
          // Slack通知の失敗は無視
        }

        setBulkShifts([{ date: '', startTime: '', endTime: '', member: '', location: '', transportationFee: '' }])
        await refetch()
        alert(`${successCount}件のシフトを登録しました${errors.length > 0 ? `（${errors.length}件失敗）` : ''}`)
      } else {
        alert('すべてのシフト登録に失敗しました')
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'シフト登録に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }, [bulkShifts, refetch])

  const exportCSV = useCallback(() => {
    if (!shifts) return

    const monthlyShifts = shifts.filter(s => s.date?.startsWith(selectedMonth))

    if (monthlyShifts.length === 0) {
      alert('出力するデータがありません')
      return
    }

    const headers = ['メンバー', '勤務地', '日付', '開始時間', '終了時間', '交通費', 'ステータス']
    const rows = monthlyShifts.map(s => [
      s.employee_name,
      s.location,
      s.date,
      s.start_time,
      s.end_time,
      s.transportation_fee || 0,
      s.status
    ])

    const csv = generateCsv(headers, rows)
    downloadCsv(`shifts_${selectedMonth}.csv`, csv)
  }, [shifts, selectedMonth])

  const monthlyShifts = useMemo(
    () => shifts?.filter(s => s.date?.startsWith(selectedMonth)) || [],
    [shifts, selectedMonth]
  )

  const getLocationLogo = useCallback((locationName: string) => {
    return locations?.find(l => l.name === locationName)?.logo
  }, [locations])

  if (loading) return <LoadingSpinner message="データを読み込み中..." />
  if (error) return <ErrorMessage message={error} onRetry={refetch} />

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
              {members?.map(m => (
                <option key={m.id} value={m.name}>{m.name}</option>
              ))}
            </select>

            <select
              value={shift.location}
              onChange={(e) => updateShiftRow(index, 'location', e.target.value)}
            >
              <option value="">勤務地選択</option>
              {locations?.map(l => (
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
              min="0"
            />

            <button className="delete-btn" onClick={() => removeShiftRow(index)} disabled={submitting}>
              削除
            </button>
          </div>
        ))}

        <div className="bulk-actions">
          <button onClick={addShiftRow} disabled={submitting}>行追加</button>
          <button className="submit-btn" onClick={submitBulkShifts} disabled={submitting}>
            {submitting ? '登録中...' : '一括登録'}
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
        <button onClick={exportCSV} disabled={monthlyShifts.length === 0}>
          CSV出力
        </button>
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
            {monthlyShifts.map((shift) => {
              const logo = getLocationLogo(shift.location)
              return (
                <tr key={shift.id}>
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
                  <td>{formatCurrency(shift.transportation_fee)}</td>
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

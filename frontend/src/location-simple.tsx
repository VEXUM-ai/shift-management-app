import { useState, useEffect } from 'react'

const API_BASE = (import.meta as any).env.PROD ? '/api' : 'http://localhost:3000/api'

// 常駐先管理 - シンプル版（交通費なし）
export function SimpleLocationManagement() {
  const [locations, setLocations] = useState<any[]>([])
  const [name, setName] = useState('')
  const [hourlyWage, setHourlyWage] = useState('')
  const [type, setType] = useState<'office' | 'client'>('client')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>('')
  const [editingId, setEditingId] = useState<number | null>(null)

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

  const startEdit = (location: any) => {
    setEditingId(location.id)
    setName(location.name)
    setHourlyWage(location.hourly_wage.toString())
    setType(location.type)
    setLogoPreview(location.logo || '')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setName('')
    setHourlyWage('')
    setType('client')
    setLogoFile(null)
    setLogoPreview('')
  }

  const addOrUpdateLocation = async () => {
    if (name && hourlyWage) {
      try {
        if (editingId) {
          // 更新
          await fetch(`${API_BASE}/locations?id=${editingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name,
              hourly_wage: parseFloat(hourlyWage),
              type,
              logo: logoPreview || ''
            })
          })
          alert('勤務地を更新しました')
        } else {
          // 新規追加
          await fetch(`${API_BASE}/locations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name,
              hourly_wage: parseFloat(hourlyWage),
              type,
              logo: logoPreview || ''
            })
          })
          alert('勤務地を追加しました')
        }
        cancelEdit()
        fetchLocations()
      } catch (error) {
        console.error('Error saving location:', error)
        alert('保存に失敗しました')
      }
    } else {
      alert('名前と時給を入力してください')
    }
  }

  const deleteLocation = async (id: number) => {
    if (confirm('この勤務地を削除しますか？')) {
      try {
        await fetch(`${API_BASE}/locations?id=${id}`, { method: 'DELETE' })
        fetchLocations()
        alert('勤務地を削除しました')
      } catch (error) {
        console.error('Error deleting location:', error)
        alert('削除に失敗しました')
      }
    }
  }

  return (
    <div className="section">
      <h2>常駐先・勤務地登録</h2>
      <p className="info-text">※ 交通費はメンバー管理でメンバーごとに設定します</p>

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
        <button onClick={addOrUpdateLocation}>
          {editingId ? '更新' : '追加'}
        </button>
        {editingId && (
          <button onClick={cancelEdit} style={{ marginLeft: '10px' }}>
            キャンセル
          </button>
        )}
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
            </div>
            <div className="location-actions">
              <button className="edit-btn" onClick={() => startEdit(location)}>編集</button>
              <button className="delete-btn" onClick={() => deleteLocation(location.id)}>削除</button>
            </div>
          </div>
        ))}
      </div>
      {locations.length === 0 && (
        <p className="no-data">勤務地が登録されていません</p>
      )}
    </div>
  )
}

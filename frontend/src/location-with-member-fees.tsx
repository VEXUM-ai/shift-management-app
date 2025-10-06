import { useState, useEffect } from 'react'

const API_BASE = (import.meta as any).env.PROD ? '/api' : 'http://localhost:3000/api'

// 常駐先管理 - メンバー別交通費設定
export function LocationWithMemberFees() {
  const [locations, setLocations] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [name, setName] = useState('')
  const [hourlyWage, setHourlyWage] = useState('')
  const [type, setType] = useState<'office' | 'client'>('client')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>('')
  const [memberTransportFees, setMemberTransportFees] = useState<{[key: number]: string}>({})
  const [selectedLocation, setSelectedLocation] = useState<any>(null)
  const [selectedMembers, setSelectedMembers] = useState<number[]>([])

  useEffect(() => {
    fetchLocations()
    fetchMembers()
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

  const fetchMembers = async () => {
    try {
      const response = await fetch(`${API_BASE}/members`)
      const data = await response.json()
      setMembers(data)
    } catch (error) {
      console.error('Error fetching members:', error)
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
    if (!name || !hourlyWage) {
      alert('名前と時給を入力してください')
      return
    }

    try {
      const response = await fetch(`${API_BASE}/locations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          hourly_wage: parseFloat(hourlyWage),
          type,
          logo: logoPreview || '',
          member_transport_fees: {}
        })
      })

      if (response.ok) {
        setName('')
        setHourlyWage('')
        setLogoFile(null)
        setLogoPreview('')
        fetchLocations()
        alert('勤務地を追加しました')
      }
    } catch (error) {
      console.error('Error adding location:', error)
      alert('追加に失敗しました')
    }
  }

  const deleteLocation = async (id: number) => {
    if (!confirm('この勤務地を削除しますか？')) return

    try {
      await fetch(`${API_BASE}/locations?id=${id}`, { method: 'DELETE' })
      fetchLocations()
      setSelectedLocation(null)
      alert('勤務地を削除しました')
    } catch (error) {
      console.error('Error deleting location:', error)
      alert('削除に失敗しました')
    }
  }

  const selectLocationForEdit = (location: any) => {
    setSelectedLocation(location)
    setMemberTransportFees(location.member_transport_fees || {})
    // メンバー交通費が設定されているメンバーIDを選択状態にする
    const assignedMemberIds = Object.keys(location.member_transport_fees || {}).map(Number)
    setSelectedMembers(assignedMemberIds)
  }

  const toggleMemberSelection = (memberId: number) => {
    if (selectedMembers.includes(memberId)) {
      setSelectedMembers(selectedMembers.filter(id => id !== memberId))
      // 選択解除時に交通費もクリア
      const newFees = { ...memberTransportFees }
      delete newFees[memberId]
      setMemberTransportFees(newFees)
    } else {
      setSelectedMembers([...selectedMembers, memberId])
    }
  }

  const updateMemberTransportFee = (memberId: number, value: string) => {
    setMemberTransportFees({
      ...memberTransportFees,
      [memberId]: value
    })
  }

  const saveMemberTransportFees = async () => {
    if (!selectedLocation) return

    try {
      const fees: {[key: number]: number} = {}
      // 選択されているメンバーのみ交通費を保存
      selectedMembers.forEach(memberId => {
        fees[memberId] = parseFloat(memberTransportFees[memberId] as string) || 0
      })

      const response = await fetch(`${API_BASE}/locations?id=${selectedLocation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          member_transport_fees: fees
        })
      })

      if (response.ok) {
        fetchLocations()
        setSelectedLocation(null)
        alert('メンバー登録と交通費設定を保存しました')
      }
    } catch (error) {
      console.error('Error saving transport fees:', error)
      alert('保存に失敗しました')
    }
  }

  const getMemberTransportFee = (locationId: number, memberId: number) => {
    const location = locations.find(l => l.id === locationId)
    return location?.member_transport_fees?.[memberId] || 0
  }

  return (
    <div className="section">
      <h2>常駐先・勤務地登録</h2>
      <p className="info-text">※ 常駐先を追加後、「交通費設定」ボタンで所属メンバーと交通費を登録できます</p>

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
          <label htmlFor="logo-upload">ロゴ:</label>
          <input
            id="logo-upload"
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
          />
          {logoPreview && <img src={logoPreview} alt="Logo" className="logo-preview" />}
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
            </div>
            <div className="location-actions">
              {location.type === 'client' && (
                <>
                  <button
                    className="edit-btn"
                    onClick={() => selectLocationForEdit(location)}
                  >
                    メンバー登録・交通費設定
                  </button>
                  {Object.keys(location.member_transport_fees || {}).length > 0 && (
                    <span className="member-count">
                      {Object.keys(location.member_transport_fees).length}人登録済み
                    </span>
                  )}
                </>
              )}
              <button className="delete-btn" onClick={() => deleteLocation(location.id)}>削除</button>
            </div>
          </div>
        ))}
      </div>
      {locations.length === 0 && (
        <p className="no-data">勤務地が登録されていません</p>
      )}

      {/* メンバー別交通費設定モーダル */}
      {selectedLocation && selectedLocation.type === 'client' && (
        <div className="modal-overlay" onClick={() => setSelectedLocation(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{selectedLocation.name} - メンバー登録・交通費設定</h3>
            <p className="modal-description">この常駐先に所属するメンバーを選択し、交通費を設定してください</p>

            <div className="transport-fees-list">
              {members.map(member => (
                <div key={member.id} className="transport-fee-item">
                  <div className="member-checkbox">
                    <input
                      type="checkbox"
                      id={`member-${member.id}`}
                      checked={selectedMembers.includes(member.id)}
                      onChange={() => toggleMemberSelection(member.id)}
                    />
                    <label htmlFor={`member-${member.id}`}>{member.name}</label>
                  </div>
                  {selectedMembers.includes(member.id) && (
                    <div className="fee-input-group">
                      <input
                        type="number"
                        value={memberTransportFees[member.id] || getMemberTransportFee(selectedLocation.id, member.id) || ''}
                        onChange={(e) => updateMemberTransportFee(member.id, e.target.value)}
                        placeholder="0"
                      />
                      <span>円/日</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {members.length === 0 && (
              <p className="no-data">メンバーを先に登録してください</p>
            )}

            <div className="modal-actions">
              <button onClick={saveMemberTransportFees} className="submit-btn">保存</button>
              <button onClick={() => setSelectedLocation(null)} className="cancel-btn">閉じる</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

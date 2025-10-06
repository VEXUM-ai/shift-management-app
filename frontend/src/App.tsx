import { useState, useEffect } from 'react'
import './App.css'

type Tab = 'members' | 'locations' | 'shift' | 'attendance' | 'salary'

// LocalStorage Keys
const STORAGE_KEYS = {
  MEMBERS: 'shift_app_members',
  LOCATIONS: 'shift_app_locations',
  SHIFTS: 'shift_app_shifts',
  ATTENDANCE: 'shift_app_attendance'
}

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
        {activeTab === 'locations' && <LocationManagement />}
        {activeTab === 'shift' && <ShiftManagement />}
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
  const [officeTransportFee, setOfficeTransportFee] = useState('')

  useEffect(() => {
    loadMembers()
  }, [])

  const loadMembers = () => {
    const stored = localStorage.getItem(STORAGE_KEYS.MEMBERS)
    if (stored) {
      setMembers(JSON.parse(stored))
    }
  }

  const saveMembers = (data: any[]) => {
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(data))
    setMembers(data)
  }

  const addMember = () => {
    if (!name) {
      alert('名前を入力してください')
      return
    }

    const newMember = {
      id: Date.now(),
      name,
      email,
      office_transport_fee: parseFloat(officeTransportFee || '0'),
      created_at: new Date().toISOString()
    }

    const updated = [...members, newMember]
    saveMembers(updated)

    setName('')
    setEmail('')
    setOfficeTransportFee('')
    alert('メンバーを追加しました')
  }

  const deleteMember = (id: number) => {
    if (!confirm('このメンバーを削除しますか？')) return
    const updated = members.filter(m => m.id !== id)
    saveMembers(updated)
  }

  return (
    <div className="section">
      <h2>📋 メンバー登録</h2>
      <div className="guide-box">
        <h3>使い方</h3>
        <ol>
          <li>メンバーの名前を入力してください（必須）</li>
          <li>メールアドレスを入力してください（任意）</li>
          <li>オフィスまでの交通費を入力してください</li>
          <li>「メンバー追加」ボタンをクリックして登録</li>
        </ol>
        <p className="note">💡 常駐先への交通費は「常駐先管理」タブで設定できます</p>
      </div>

      <div className="member-form">
        <div className="form-group">
          <label>名前 <span className="required">*必須</span></label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例: 山田太郎"
          />
        </div>

        <div className="form-group">
          <label>メールアドレス <span className="optional">任意</span></label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="例: yamada@example.com"
          />
        </div>

        <div className="form-group">
          <label>オフィスまでの交通費（円/日）</label>
          <input
            type="number"
            value={officeTransportFee}
            onChange={(e) => setOfficeTransportFee(e.target.value)}
            placeholder="例: 500"
          />
        </div>

        <div className="form-actions">
          <button onClick={addMember} className="submit-btn">
            ➕ メンバー追加
          </button>
        </div>
      </div>

      <h3>メンバー一覧</h3>
      <div className="members-table-wrapper">
        <table>
          <thead>
            <tr>
              <th>名前</th>
              <th>メール</th>
              <th>オフィス交通費</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id}>
                <td><strong>{member.name}</strong></td>
                <td>{member.email || '-'}</td>
                <td>¥{(member.office_transport_fee || 0).toLocaleString('ja-JP')}</td>
                <td>
                  <button className="delete-btn" onClick={() => deleteMember(member.id)}>削除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {members.length === 0 && (
          <p className="no-data">メンバーが登録されていません</p>
        )}
      </div>
    </div>
  )
}

// 常駐先管理
function LocationManagement() {
  const [locations, setLocations] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [name, setName] = useState('')
  const [hourlyWage, setHourlyWage] = useState('')
  const [type, setType] = useState<'office' | 'client'>('client')
  const [selectedLocation, setSelectedLocation] = useState<any>(null)
  const [memberTransportFees, setMemberTransportFees] = useState<{[key: number]: string}>({})
  const [selectedMembers, setSelectedMembers] = useState<number[]>([])

  useEffect(() => {
    loadLocations()
    loadMembers()
  }, [])

  const loadLocations = () => {
    const stored = localStorage.getItem(STORAGE_KEYS.LOCATIONS)
    if (stored) {
      setLocations(JSON.parse(stored))
    }
  }

  const loadMembers = () => {
    const stored = localStorage.getItem(STORAGE_KEYS.MEMBERS)
    if (stored) {
      setMembers(JSON.parse(stored))
    }
  }

  const saveLocations = (data: any[]) => {
    localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(data))
    setLocations(data)
  }

  const addLocation = () => {
    if (!name || !hourlyWage) {
      alert('名前と時給を入力してください')
      return
    }

    const newLocation = {
      id: Date.now(),
      name,
      hourly_wage: parseFloat(hourlyWage),
      type,
      member_transport_fees: {},
      created_at: new Date().toISOString()
    }

    const updated = [...locations, newLocation]
    saveLocations(updated)

    setName('')
    setHourlyWage('')
    alert('常駐先を追加しました')
  }

  const deleteLocation = (id: number) => {
    if (!confirm('この常駐先を削除しますか？')) return
    const updated = locations.filter(l => l.id !== id)
    saveLocations(updated)
    setSelectedLocation(null)
  }

  const openMemberSettings = (location: any) => {
    setSelectedLocation(location)
    const assignedMemberIds = Object.keys(location.member_transport_fees || {}).map(Number)
    setSelectedMembers(assignedMemberIds)
    setMemberTransportFees(location.member_transport_fees || {})
  }

  const toggleMemberSelection = (memberId: number) => {
    if (selectedMembers.includes(memberId)) {
      setSelectedMembers(selectedMembers.filter(id => id !== memberId))
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

  const saveMemberSettings = () => {
    if (!selectedLocation) return

    const fees: {[key: number]: number} = {}
    selectedMembers.forEach(memberId => {
      fees[memberId] = parseFloat(memberTransportFees[memberId] as string) || 0
    })

    const updated = locations.map(l =>
      l.id === selectedLocation.id
        ? { ...l, member_transport_fees: fees, updated_at: new Date().toISOString() }
        : l
    )

    saveLocations(updated)
    setSelectedLocation(null)
    alert('メンバー登録と交通費設定を保存しました')
  }

  return (
    <div className="section">
      <h2>🏢 常駐先・勤務地登録</h2>
      <div className="guide-box">
        <h3>使い方</h3>
        <ol>
          <li>「オフィス」または「常駐先」を選択してください</li>
          <li>勤務地の名前を入力してください</li>
          <li>時給を入力してください</li>
          <li>「追加」ボタンをクリックして登録</li>
          <li>常駐先の場合、「メンバー登録・交通費設定」ボタンで所属メンバーと交通費を設定できます</li>
        </ol>
      </div>

      <div className="form">
        <select value={type} onChange={(e) => setType(e.target.value as 'office' | 'client')}>
          <option value="office">🏠 オフィス</option>
          <option value="client">🏢 常駐先</option>
        </select>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={type === 'office' ? '例: 本社オフィス' : '例: A社、B社'}
        />
        <input
          type="number"
          value={hourlyWage}
          onChange={(e) => setHourlyWage(e.target.value)}
          placeholder="例: 1500"
        />
        <button onClick={addLocation}>➕ 追加</button>
      </div>

      <h3>登録済み常駐先</h3>
      <div className="locations-grid">
        {locations.map((location) => (
          <div key={location.id} className="location-card">
            <div className="location-info">
              <span className="location-type">{location.type === 'office' ? 'オフィス' : '常駐先'}</span>
              <h4>{location.name}</h4>
              <p>時給: ¥{location.hourly_wage?.toLocaleString('ja-JP')}</p>
              {Object.keys(location.member_transport_fees || {}).length > 0 && (
                <span className="member-count">
                  {Object.keys(location.member_transport_fees).length}人登録済み
                </span>
              )}
            </div>
            <div className="location-actions">
              {location.type === 'client' && (
                <button
                  className="edit-btn"
                  onClick={() => openMemberSettings(location)}
                >
                  メンバー登録・交通費設定
                </button>
              )}
              <button className="delete-btn" onClick={() => deleteLocation(location.id)}>削除</button>
            </div>
          </div>
        ))}
      </div>
      {locations.length === 0 && (
        <p className="no-data">常駐先が登録されていません</p>
      )}

      {/* メンバー設定モーダル */}
      {selectedLocation && selectedLocation.type === 'client' && (
        <div className="modal-overlay" onClick={() => setSelectedLocation(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>👥 {selectedLocation.name} - メンバー登録・交通費設定</h3>
            <div className="modal-guide">
              <p><strong>設定方法:</strong></p>
              <ol>
                <li>この常駐先に所属するメンバーにチェックを入れてください</li>
                <li>チェックを入れたメンバーの交通費を入力してください</li>
                <li>「保存」ボタンをクリックして設定を保存してください</li>
              </ol>
            </div>

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
                        value={memberTransportFees[member.id] || ''}
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
              <button onClick={saveMemberSettings} className="submit-btn">保存</button>
              <button onClick={() => setSelectedLocation(null)} className="cancel-btn">閉じる</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// 他の機能は既存のものを使用
function ShiftManagement() {
  return <div className="section"><h2>シフト管理</h2><p>準備中...</p></div>
}

function AttendanceManagement() {
  return <div className="section"><h2>勤怠管理</h2><p>準備中...</p></div>
}

function SalaryCalculation() {
  return <div className="section"><h2>給与計算</h2><p>準備中...</p></div>
}

export default App

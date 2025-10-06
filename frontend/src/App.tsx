import { useState, useEffect } from 'react'
import './App.css'

type Tab = 'members' | 'locations' | 'shift' | 'attendance' | 'salary'
type UserRole = 'admin' | 'member'

// LocalStorage Keys
const STORAGE_KEYS = {
  MEMBERS: 'shift_app_members',
  LOCATIONS: 'shift_app_locations',
  SHIFTS: 'shift_app_shifts',
  ATTENDANCE: 'shift_app_attendance',
  USER_ROLE: 'shift_app_user_role'
}

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('shift')
  const [userRole, setUserRole] = useState<UserRole>('member')
  const [isRoleSelected, setIsRoleSelected] = useState(false)

  useEffect(() => {
    const storedRole = localStorage.getItem(STORAGE_KEYS.USER_ROLE)
    if (storedRole) {
      setUserRole(storedRole as UserRole)
      setIsRoleSelected(true)
    }
  }, [])

  const selectRole = (role: UserRole) => {
    setUserRole(role)
    setIsRoleSelected(true)
    localStorage.setItem(STORAGE_KEYS.USER_ROLE, role)
  }

  const switchRole = () => {
    setIsRoleSelected(false)
    localStorage.removeItem(STORAGE_KEYS.USER_ROLE)
  }

  if (!isRoleSelected) {
    return (
      <div className="app">
        <div className="role-selection">
          <h1>🔐 ログイン</h1>
          <p>アクセス権限を選択してください</p>
          <div className="role-buttons">
            <button className="role-btn admin-btn" onClick={() => selectRole('admin')}>
              <span className="role-icon">👔</span>
              <span className="role-title">管理者</span>
              <span className="role-desc">メンバー管理・給与設定・全機能利用可能</span>
            </button>
            <button className="role-btn member-btn" onClick={() => selectRole('member')}>
              <span className="role-icon">👤</span>
              <span className="role-title">メンバー</span>
              <span className="role-desc">シフト提出・勤怠打刻のみ</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header>
        <h1>勤怠・シフト管理システム</h1>
        <div className="user-info">
          <span className="current-role">
            {userRole === 'admin' ? '👔 管理者' : '👤 メンバー'}
          </span>
          <button className="switch-role-btn" onClick={switchRole}>
            🔄 切り替え
          </button>
        </div>
      </header>

      <nav className="tabs">
        {userRole === 'admin' && (
          <>
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
          </>
        )}
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
        {userRole === 'admin' && (
          <button
            className={activeTab === 'salary' ? 'active' : ''}
            onClick={() => setActiveTab('salary')}
          >
            給与計算
          </button>
        )}
      </nav>

      <main>
        {activeTab === 'members' && userRole === 'admin' && <MemberManagement />}
        {activeTab === 'locations' && userRole === 'admin' && <LocationManagement />}
        {activeTab === 'shift' && <ShiftManagement />}
        {activeTab === 'attendance' && <AttendanceManagement />}
        {activeTab === 'salary' && userRole === 'admin' && <SalaryCalculation />}
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
  const [salaryType, setSalaryType] = useState<'hourly' | 'fixed'>('hourly')
  const [hourlyWage, setHourlyWage] = useState('')
  const [fixedSalary, setFixedSalary] = useState('')

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

    if (salaryType === 'hourly' && !hourlyWage) {
      alert('時給を入力してください')
      return
    }

    if (salaryType === 'fixed' && !fixedSalary) {
      alert('固定給与を入力してください')
      return
    }

    const newMember = {
      id: Date.now(),
      name,
      email,
      office_transport_fee: parseFloat(officeTransportFee || '0'),
      salary_type: salaryType,
      hourly_wage: salaryType === 'hourly' ? parseFloat(hourlyWage) : 0,
      fixed_salary: salaryType === 'fixed' ? parseFloat(fixedSalary) : 0,
      created_at: new Date().toISOString()
    }

    const updated = [...members, newMember]
    saveMembers(updated)

    setName('')
    setEmail('')
    setOfficeTransportFee('')
    setHourlyWage('')
    setFixedSalary('')
    alert('メンバーを追加しました')
  }

  const deleteMember = (id: number) => {
    if (!confirm('このメンバーを削除しますか？')) return
    const updated = members.filter(m => m.id !== id)
    saveMembers(updated)
  }

  return (
    <div className="section">
      <h2>👔 メンバー管理（管理者専用）</h2>
      <div className="guide-box">
        <h3>✨ 使い方</h3>
        <ol>
          <li><strong>基本情報:</strong> メンバーの名前とメールアドレスを入力</li>
          <li><strong>給与形態選択:</strong> 時給制または固定給与制を選択</li>
          <li><strong>給与額設定:</strong> 時給または月額固定給与を入力</li>
          <li><strong>交通費設定:</strong> オフィスまでの交通費を入力</li>
        </ol>
        <p className="note">💡 常駐先ごとの交通費は「常駐先管理」タブで個別設定できます</p>
      </div>

      <div className="member-form">
        <h3>👤 新しいメンバーを追加</h3>

        <div className="form-row">
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
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>給与形態 <span className="required">*必須</span></label>
            <select value={salaryType} onChange={(e) => setSalaryType(e.target.value as 'hourly' | 'fixed')}>
              <option value="hourly">⏰ 時給制</option>
              <option value="fixed">💰 固定給与制</option>
            </select>
          </div>

          {salaryType === 'hourly' ? (
            <div className="form-group">
              <label>時給（円） <span className="required">*必須</span></label>
              <input
                type="number"
                value={hourlyWage}
                onChange={(e) => setHourlyWage(e.target.value)}
                placeholder="例: 1500"
              />
            </div>
          ) : (
            <div className="form-group">
              <label>月額固定給与（円） <span className="required">*必須</span></label>
              <input
                type="number"
                value={fixedSalary}
                onChange={(e) => setFixedSalary(e.target.value)}
                placeholder="例: 250000"
              />
            </div>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>オフィスまでの交通費（円/日） <span className="optional">任意</span></label>
            <input
              type="number"
              value={officeTransportFee}
              onChange={(e) => setOfficeTransportFee(e.target.value)}
              placeholder="例: 500"
            />
          </div>
        </div>

        <div className="form-actions">
          <button onClick={addMember} className="submit-btn">
            ➕ メンバー追加
          </button>
        </div>
      </div>

      <h3>📋 登録済みメンバー一覧</h3>
      <div className="members-table-wrapper">
        <table>
          <thead>
            <tr>
              <th>名前</th>
              <th>メール</th>
              <th>給与形態</th>
              <th>給与額</th>
              <th>オフィス交通費</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id}>
                <td><strong>{member.name}</strong></td>
                <td>{member.email || '-'}</td>
                <td>
                  <span className={`salary-type-badge ${member.salary_type === 'hourly' ? 'hourly' : 'fixed'}`}>
                    {member.salary_type === 'hourly' ? '⏰ 時給制' : '💰 固定給与'}
                  </span>
                </td>
                <td>
                  {member.salary_type === 'hourly'
                    ? `¥${(member.hourly_wage || 0).toLocaleString('ja-JP')}/時間`
                    : `¥${(member.fixed_salary || 0).toLocaleString('ja-JP')}/月`
                  }
                </td>
                <td>¥{(member.office_transport_fee || 0).toLocaleString('ja-JP')}/日</td>
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
    if (!name) {
      alert('勤務地名を入力してください')
      return
    }

    const newLocation = {
      id: Date.now(),
      name,
      type,
      member_transport_fees: {},
      created_at: new Date().toISOString()
    }

    const updated = [...locations, newLocation]
    saveLocations(updated)

    setName('')
    alert('勤務地を追加しました')
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
        <h3>✨ 使い方（ステップバイステップ）</h3>
        <ol>
          <li><strong>STEP 1:</strong> まず「メンバー管理」タブでメンバーを登録してください（オフィス交通費も設定）</li>
          <li><strong>STEP 2:</strong> この画面で「オフィス」または「常駐先」を登録します</li>
          <li><strong>STEP 3:</strong> 常駐先を登録後、「👥 メンバー設定」ボタンをクリック</li>
          <li><strong>STEP 4:</strong> その常駐先に配属するメンバーを選択し、<strong>メンバーごとの交通費</strong>を設定</li>
        </ol>
        <p className="note">💡 メンバーによって交通費が異なる場合でも、個別に設定できます</p>
      </div>

      <div className="member-form">
        <h3>🏢 新しい勤務地を追加</h3>
        <p className="info-text">💡 給与設定はメンバー管理で行います。ここでは勤務地の登録とメンバー配属を行います。</p>

        <div className="form-row">
          <div className="form-group">
            <label>種別 <span className="required">*必須</span></label>
            <select value={type} onChange={(e) => setType(e.target.value as 'office' | 'client')}>
              <option value="office">🏠 オフィス</option>
              <option value="client">🏢 常駐先（クライアント先）</option>
            </select>
          </div>

          <div className="form-group">
            <label>勤務地名 <span className="required">*必須</span></label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={type === 'office' ? '例: 本社オフィス' : '例: A社、B社'}
            />
          </div>
        </div>

        <div className="form-actions">
          <button onClick={addLocation} className="submit-btn">➕ 勤務地を追加</button>
        </div>
      </div>

      <h3>📋 登録済み勤務地一覧</h3>
      <div className="locations-grid">
        {locations.map((location) => (
          <div key={location.id} className="location-card">
            <div className="location-info">
              <span className="location-type">{location.type === 'office' ? '🏠 オフィス' : '🏢 常駐先'}</span>
              <h4>{location.name}</h4>
              {Object.keys(location.member_transport_fees || {}).length > 0 && (
                <span className="member-count">
                  👥 {Object.keys(location.member_transport_fees).length}人配属済み
                </span>
              )}
            </div>
            <div className="location-actions">
              <button
                className="edit-btn"
                onClick={() => openMemberSettings(location)}
              >
                👥 メンバー設定
              </button>
              <button className="delete-btn" onClick={() => deleteLocation(location.id)}>削除</button>
            </div>
          </div>
        ))}
      </div>
      {locations.length === 0 && (
        <p className="no-data">常駐先が登録されていません</p>
      )}

      {/* メンバー設定モーダル */}
      {selectedLocation && (
        <div className="modal-overlay" onClick={() => setSelectedLocation(null)}>
          <div className="modal-content member-settings-modal" onClick={(e) => e.stopPropagation()}>
            <h3>👥 {selectedLocation.name} - メンバー別設定</h3>

            <div className="modal-guide">
              <p><strong>💡 この画面でできること:</strong></p>
              <ol>
                <li><strong>配属メンバーの選択</strong> - この{selectedLocation.type === 'office' ? 'オフィス' : '常駐先'}に所属するメンバーをチェック</li>
                <li><strong>メンバーごとの交通費設定</strong> - 各メンバーの交通費を個別に入力（人によって金額が異なってもOK）</li>
                <li><strong>保存して完了</strong> - 「保存」ボタンで設定を確定</li>
              </ol>
              <p className="note">
                {selectedLocation.type === 'office'
                  ? '📝 オフィス勤務の場合、メンバー管理で設定した「オフィス交通費」が優先されます'
                  : '📝 常駐先の場合、ここで設定した交通費が給与計算に使用されます'}
              </p>
            </div>

            <div className="member-settings-list">
              <h4>メンバー一覧</h4>
              {members.length === 0 && (
                <div className="info-text">
                  ⚠️ メンバーが登録されていません。先に「メンバー管理」タブでメンバーを登録してください。
                </div>
              )}

              {members.map(member => (
                <div key={member.id} className="member-setting-card">
                  <div className="member-select-row">
                    <div className="member-checkbox">
                      <input
                        type="checkbox"
                        id={`member-${member.id}`}
                        checked={selectedMembers.includes(member.id)}
                        onChange={() => toggleMemberSelection(member.id)}
                      />
                      <label htmlFor={`member-${member.id}`}>
                        <strong>{member.name}</strong>
                        {member.email && <span className="member-email">({member.email})</span>}
                      </label>
                    </div>
                    {selectedLocation.type === 'office' && (
                      <div className="member-office-fee">
                        オフィス交通費: ¥{(member.office_transport_fee || 0).toLocaleString('ja-JP')}/日
                      </div>
                    )}
                  </div>

                  {selectedMembers.includes(member.id) && (
                    <div className="fee-setting-row">
                      <label>
                        {selectedLocation.type === 'office' ? 'このオフィスでの交通費' : 'この常駐先での交通費'}
                        <span className="required">*必須</span>
                      </label>
                      <div className="fee-input-group">
                        <input
                          type="number"
                          value={memberTransportFees[member.id] || ''}
                          onChange={(e) => updateMemberTransportFee(member.id, e.target.value)}
                          placeholder="例: 500"
                        />
                        <span>円/日</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="modal-summary">
              <p>選択中のメンバー: <strong>{selectedMembers.length}人</strong></p>
            </div>

            <div className="modal-actions">
              <button onClick={saveMemberSettings} className="submit-btn">
                💾 保存（{selectedMembers.length}人のメンバー設定）
              </button>
              <button onClick={() => setSelectedLocation(null)} className="cancel-btn">キャンセル</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// シフト管理
function ShiftManagement() {
  const [shifts, setShifts] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [selectedMember, setSelectedMember] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [selectedMonth, setSelectedMonth] = useState('')
  const [editingShift, setEditingShift] = useState<any>(null)
  const [editStartTime, setEditStartTime] = useState('')
  const [editEndTime, setEditEndTime] = useState('')
  const [bulkMode, setBulkMode] = useState(false)
  const [calendarMonth, setCalendarMonth] = useState('')

  useEffect(() => {
    loadShifts()
    loadMembers()
    loadLocations()

    // 今月をデフォルト設定
    const now = new Date()
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    setSelectedMonth(monthStr)
    setCalendarMonth(monthStr)
  }, [])

  // カレンダーの日付を生成
  const generateCalendarDates = () => {
    if (!calendarMonth) return []

    const [year, month] = calendarMonth.split('-').map(Number)
    const firstDay = new Date(year, month - 1, 1)
    const lastDay = new Date(year, month, 0)
    const daysInMonth = lastDay.getDate()
    const startDayOfWeek = firstDay.getDay()

    const dates: (string | null)[] = []

    // 月の最初の曜日まで空白を追加
    for (let i = 0; i < startDayOfWeek; i++) {
      dates.push(null)
    }

    // 日付を追加
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      dates.push(dateStr)
    }

    return dates
  }

  const toggleDateSelection = (date: string) => {
    if (selectedDates.includes(date)) {
      setSelectedDates(selectedDates.filter(d => d !== date))
    } else {
      setSelectedDates([...selectedDates, date])
    }
  }

  const selectWeekdays = () => {
    if (!calendarMonth) return
    const [year, month] = calendarMonth.split('-').map(Number)
    const lastDay = new Date(year, month, 0).getDate()
    const weekdayDates: string[] = []

    for (let day = 1; day <= lastDay; day++) {
      const date = new Date(year, month - 1, day)
      const dayOfWeek = date.getDay()
      // 月曜日から金曜日 (1-5)
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        weekdayDates.push(dateStr)
      }
    }
    setSelectedDates(weekdayDates)
  }

  const selectWeekends = () => {
    if (!calendarMonth) return
    const [year, month] = calendarMonth.split('-').map(Number)
    const lastDay = new Date(year, month, 0).getDate()
    const weekendDates: string[] = []

    for (let day = 1; day <= lastDay; day++) {
      const date = new Date(year, month - 1, day)
      const dayOfWeek = date.getDay()
      // 土曜日と日曜日 (0, 6)
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        weekendDates.push(dateStr)
      }
    }
    setSelectedDates(weekendDates)
  }

  const selectAllDates = () => {
    if (!calendarMonth) return
    const [year, month] = calendarMonth.split('-').map(Number)
    const lastDay = new Date(year, month, 0).getDate()
    const allDates: string[] = []

    for (let day = 1; day <= lastDay; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      allDates.push(dateStr)
    }
    setSelectedDates(allDates)
  }

  const clearDates = () => {
    setSelectedDates([])
  }

  const loadShifts = () => {
    const stored = localStorage.getItem(STORAGE_KEYS.SHIFTS)
    if (stored) {
      setShifts(JSON.parse(stored))
    }
  }

  const loadMembers = () => {
    const stored = localStorage.getItem(STORAGE_KEYS.MEMBERS)
    if (stored) {
      setMembers(JSON.parse(stored))
    }
  }

  const loadLocations = () => {
    const stored = localStorage.getItem(STORAGE_KEYS.LOCATIONS)
    if (stored) {
      setLocations(JSON.parse(stored))
    }
  }

  const saveShifts = (data: any[]) => {
    localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(data))
    setShifts(data)
  }

  const addBulkShifts = () => {
    if (!selectedMember || !selectedLocation) {
      alert('メンバーと勤務地を選択してください')
      return
    }

    if (selectedDates.length === 0) {
      alert('日付を選択してください')
      return
    }

    const member = members.find(m => m.id === Number(selectedMember))
    const location = locations.find(l => l.id === Number(selectedLocation))

    const newShifts = selectedDates.map((date, index) => ({
      id: Date.now() + index,
      member_id: member.id,
      member_name: member.name,
      location_id: location.id,
      location_name: location.name,
      date,
      start_time: null,
      end_time: null,
      status: '提出済み',
      created_at: new Date().toISOString()
    }))

    const updated = [...shifts, ...newShifts]
    saveShifts(updated)

    setSelectedMember('')
    setSelectedLocation('')
    setSelectedDates([])
    alert(`${selectedDates.length}件のシフトを登録しました`)
  }

  const openEditTime = (shift: any) => {
    setEditingShift(shift)
    setEditStartTime(shift.start_time || '')
    setEditEndTime(shift.end_time || '')
  }

  const saveTime = () => {
    if (!editingShift) return

    if (!editStartTime || !editEndTime) {
      alert('開始時間と終了時間を入力してください')
      return
    }

    const updated = shifts.map(s =>
      s.id === editingShift.id
        ? { ...s, start_time: editStartTime, end_time: editEndTime, updated_at: new Date().toISOString() }
        : s
    )

    saveShifts(updated)
    setEditingShift(null)
    setEditStartTime('')
    setEditEndTime('')
    alert('時間を設定しました')
  }

  const deleteShift = (id: number) => {
    if (!confirm('このシフトを削除しますか？')) return
    const updated = shifts.filter(s => s.id !== id)
    saveShifts(updated)
  }

  const exportCSV = () => {
    const filtered = shifts.filter(s => s.date.startsWith(selectedMonth))

    if (filtered.length === 0) {
      alert('エクスポートするデータがありません')
      return
    }

    const header = ['メンバー', '勤務地', '日付', '開始時間', '終了時間', 'ステータス']
    const rows = filtered.map(s => [
      s.member_name,
      s.location_name,
      s.date,
      s.start_time,
      s.end_time,
      s.status
    ])

    const csv = [header, ...rows].map(row => row.join(',')).join('\n')
    const bom = '\uFEFF'
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `shifts_${selectedMonth}.csv`
    link.click()
  }

  const filteredShifts = selectedMonth
    ? shifts.filter(s => s.date.startsWith(selectedMonth)).sort((a, b) => a.date.localeCompare(b.date))
    : shifts.sort((a, b) => a.date.localeCompare(b.date))

  const calendarDates = generateCalendarDates()

  // カレンダービュー用のデータ構造を生成
  const generateCalendarView = () => {
    if (!selectedMonth) return []

    const [year, month] = selectedMonth.split('-').map(Number)
    const firstDay = new Date(year, month - 1, 1)
    const lastDay = new Date(year, month, 0)
    const daysInMonth = lastDay.getDate()
    const startDayOfWeek = firstDay.getDay()

    const calendar: any[] = []

    // 月の最初の曜日まで空白を追加
    for (let i = 0; i < startDayOfWeek; i++) {
      calendar.push({ isEmpty: true })
    }

    // 各日付のシフトデータを集約
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const dayShifts = shifts.filter(s => s.date === dateStr)

      calendar.push({
        date: dateStr,
        day,
        shifts: dayShifts,
        dayOfWeek: new Date(dateStr).getDay()
      })
    }

    return calendar
  }

  const calendarView = generateCalendarView()

  return (
    <div className="section">
      <h2>📅 シフト管理</h2>
      <div className="guide-box">
        <h3>✨ プロフェッショナル機能</h3>
        <ol>
          <li><strong>メンバーと勤務地を選択</strong></li>
          <li><strong>カレンダーから複数日付を選択</strong> - クリックで日付を選択/解除</li>
          <li><strong>便利な一括選択</strong> - 平日のみ、週末のみ、全選択、クリアボタン</li>
          <li><strong>選択した日付数を確認</strong> - リアルタイムで表示</li>
          <li><strong>一括登録</strong> - 複数日のシフトを一度に登録</li>
          <li><strong>時間は後から設定</strong> - 「時間設定」ボタンで個別に追加</li>
        </ol>
        <p className="note">💡 カレンダーで複数日付を選択することで、効率的にシフトを一括登録できます</p>
      </div>

      <div className="shift-form">
        <h3>🎯 基本情報</h3>
        <div className="form-row">
          <div className="form-group">
            <label>メンバー <span className="required">*必須</span></label>
            <select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
            >
              <option value="">選択してください</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>勤務地 <span className="required">*必須</span></label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
            >
              <option value="">選択してください</option>
              {locations.map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="calendar-container">
        <div className="calendar-header">
          <div className="form-group">
            <label>📆 カレンダー月を選択</label>
            <input
              type="month"
              value={calendarMonth}
              onChange={(e) => setCalendarMonth(e.target.value)}
            />
          </div>
        </div>

        <div className="calendar-quick-select">
          <button onClick={selectWeekdays} className="quick-select-btn">
            📅 平日のみ
          </button>
          <button onClick={selectWeekends} className="quick-select-btn">
            🎉 週末のみ
          </button>
          <button onClick={selectAllDates} className="quick-select-btn">
            ✅ 全選択
          </button>
          <button onClick={clearDates} className="quick-select-btn">
            🗑️ クリア
          </button>
        </div>

        <div className="calendar-grid">
          <div className="calendar-day-header sunday">日</div>
          <div className="calendar-day-header">月</div>
          <div className="calendar-day-header">火</div>
          <div className="calendar-day-header">水</div>
          <div className="calendar-day-header">木</div>
          <div className="calendar-day-header">金</div>
          <div className="calendar-day-header saturday">土</div>

          {calendarDates.map((date, index) => {
            if (date === null) {
              return <div key={`empty-${index}`} className="calendar-date empty"></div>
            }

            const dayOfWeek = new Date(date).getDay()
            const isSelected = selectedDates.includes(date)
            const day = parseInt(date.split('-')[2])

            let dayClass = 'calendar-date'
            if (dayOfWeek === 0) dayClass += ' sunday'
            if (dayOfWeek === 6) dayClass += ' saturday'
            if (isSelected) dayClass += ' selected'

            return (
              <div
                key={date}
                className={dayClass}
                onClick={() => toggleDateSelection(date)}
                title={date}
              >
                {day}
              </div>
            )
          })}
        </div>

        <div className="selection-summary">
          <h4>選択サマリー</h4>
          <p>選択日数: <strong>{selectedDates.length}日</strong></p>
          {selectedDates.length > 0 && (
            <div className="selected-dates-preview">
              {selectedDates.sort().slice(0, 10).map(date => (
                <span key={date} className="date-chip">{date.split('-')[2]}日</span>
              ))}
              {selectedDates.length > 10 && <span className="date-chip">+{selectedDates.length - 10}日</span>}
            </div>
          )}
        </div>

        <div className="bulk-submit-section">
          <button
            onClick={addBulkShifts}
            disabled={!selectedMember || !selectedLocation || selectedDates.length === 0}
          >
            ➕ {selectedDates.length > 0 ? `${selectedDates.length}日分` : ''}シフトを一括登録
          </button>
        </div>
      </div>

      <div className="filter-section">
        <h3>📊 シフト確認</h3>
        <div className="filter-bar">
          <div className="form-group">
            <label>月で絞り込み</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </div>
          <button onClick={exportCSV} className="export-btn">📥 CSV出力</button>
        </div>
      </div>

      {/* カレンダービュー */}
      <div className="shift-calendar-view">
        <h4>📅 カレンダー表示</h4>
        <div className="calendar-view-grid">
          <div className="calendar-view-header sunday">日</div>
          <div className="calendar-view-header">月</div>
          <div className="calendar-view-header">火</div>
          <div className="calendar-view-header">水</div>
          <div className="calendar-view-header">木</div>
          <div className="calendar-view-header">金</div>
          <div className="calendar-view-header saturday">土</div>

          {calendarView.map((cell, index) => {
            if (cell.isEmpty) {
              return <div key={`empty-${index}`} className="calendar-view-cell empty"></div>
            }

            const isWeekend = cell.dayOfWeek === 0 || cell.dayOfWeek === 6
            const hasShifts = cell.shifts.length > 0

            return (
              <div
                key={cell.date}
                className={`calendar-view-cell ${isWeekend ? 'weekend' : ''} ${hasShifts ? 'has-shifts' : ''}`}
              >
                <div className="cell-date">
                  {cell.day}
                  {hasShifts && <span className="shift-count-badge">{cell.shifts.length}</span>}
                </div>
                <div className="cell-shifts">
                  {cell.shifts.map((shift: any) => (
                    <div key={shift.id} className="mini-shift-card" onClick={() => openEditTime(shift)}>
                      <div className="mini-shift-member">{shift.member_name}</div>
                      <div className="mini-shift-location">{shift.location_name}</div>
                      {shift.start_time && shift.end_time && (
                        <div className="mini-shift-time">
                          {shift.start_time}-{shift.end_time}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
        {calendarView.length === 0 && (
          <p className="no-data">月を選択してください</p>
        )}
      </div>

      {/* テーブルビュー */}
      <div className="shift-table-view">
        <h4>📋 リスト表示（日付順）</h4>
        <div className="shifts-table-wrapper">
          <table>
            <thead>
              <tr>
                <th>日付</th>
                <th>メンバー</th>
                <th>勤務地</th>
                <th>開始時間</th>
                <th>終了時間</th>
                <th>ステータス</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredShifts.map((shift) => (
                <tr key={shift.id}>
                  <td><strong>{shift.date}</strong></td>
                  <td>{shift.member_name}</td>
                  <td>{shift.location_name}</td>
                  <td>{shift.start_time || <span className="pending">未設定</span>}</td>
                  <td>{shift.end_time || <span className="pending">未設定</span>}</td>
                  <td><span className="status-badge">{shift.status}</span></td>
                  <td>
                    <button className="edit-btn" onClick={() => openEditTime(shift)}>⏱ 時間設定</button>
                    <button className="delete-btn" onClick={() => deleteShift(shift.id)}>削除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredShifts.length === 0 && (
            <p className="no-data">シフトが登録されていません</p>
          )}
        </div>
      </div>

      {/* 時間設定モーダル */}
      {editingShift && (
        <div className="modal-overlay" onClick={() => setEditingShift(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>⏱ 勤務時間設定</h3>
            <div className="modal-guide">
              <p><strong>シフト情報:</strong></p>
              <p>メンバー: {editingShift.member_name}</p>
              <p>勤務地: {editingShift.location_name}</p>
              <p>日付: {editingShift.date}</p>
            </div>

            <div className="time-edit-form">
              <div className="form-group">
                <label>開始時間 <span className="required">*必須</span></label>
                <input
                  type="time"
                  value={editStartTime}
                  onChange={(e) => setEditStartTime(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>終了時間 <span className="required">*必須</span></label>
                <input
                  type="time"
                  value={editEndTime}
                  onChange={(e) => setEditEndTime(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={saveTime} className="submit-btn">保存</button>
              <button onClick={() => setEditingShift(null)} className="cancel-btn">キャンセル</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// 勤怠管理
function AttendanceManagement() {
  const [attendance, setAttendance] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [selectedMember, setSelectedMember] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [clockedIn, setClockedIn] = useState(false)
  const [currentEntry, setCurrentEntry] = useState<any>(null)
  const [selectedMonth, setSelectedMonth] = useState('')

  useEffect(() => {
    loadAttendance()
    loadMembers()
    loadLocations()

    const now = new Date()
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    setSelectedMonth(monthStr)
  }, [])

  const loadAttendance = () => {
    const stored = localStorage.getItem(STORAGE_KEYS.ATTENDANCE)
    if (stored) {
      setAttendance(JSON.parse(stored))
    }
  }

  const loadMembers = () => {
    const stored = localStorage.getItem(STORAGE_KEYS.MEMBERS)
    if (stored) {
      setMembers(JSON.parse(stored))
    }
  }

  const loadLocations = () => {
    const stored = localStorage.getItem(STORAGE_KEYS.LOCATIONS)
    if (stored) {
      setLocations(JSON.parse(stored))
    }
  }

  const saveAttendance = (data: any[]) => {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(data))
    setAttendance(data)
  }

  const clockIn = () => {
    if (!selectedMember || !selectedLocation) {
      alert('メンバーと勤務地を選択してください')
      return
    }

    const member = members.find(m => m.id === Number(selectedMember))
    const location = locations.find(l => l.id === Number(selectedLocation))
    const now = new Date()

    const newEntry = {
      id: Date.now(),
      member_id: member.id,
      member_name: member.name,
      location_id: location.id,
      location_name: location.name,
      date: now.toISOString().split('T')[0],
      clock_in: now.toTimeString().slice(0, 5),
      clock_out: null,
      total_hours: null,
      created_at: now.toISOString()
    }

    const updated = [...attendance, newEntry]
    saveAttendance(updated)

    setCurrentEntry(newEntry)
    setClockedIn(true)
    alert(`${member.name}さんが${location.name}に出勤しました`)
  }

  const clockOut = () => {
    if (!currentEntry) return

    const now = new Date()
    const clockOutTime = now.toTimeString().slice(0, 5)

    const clockInDate = new Date(`2000-01-01 ${currentEntry.clock_in}`)
    const clockOutDate = new Date(`2000-01-01 ${clockOutTime}`)
    const totalHours = (clockOutDate.getTime() - clockInDate.getTime()) / (1000 * 60 * 60)

    const updated = attendance.map(a =>
      a.id === currentEntry.id
        ? { ...a, clock_out: clockOutTime, total_hours: totalHours }
        : a
    )

    saveAttendance(updated)
    setClockedIn(false)
    setCurrentEntry(null)
    setSelectedMember('')
    setSelectedLocation('')
    alert(`退勤しました（勤務時間: ${totalHours.toFixed(2)}時間）`)
  }

  const deleteAttendance = (id: number) => {
    if (!confirm('この勤怠記録を削除しますか？')) return
    const updated = attendance.filter(a => a.id !== id)
    saveAttendance(updated)
  }

  const exportCSV = () => {
    const filtered = attendance.filter(a => a.date.startsWith(selectedMonth))

    if (filtered.length === 0) {
      alert('エクスポートするデータがありません')
      return
    }

    const header = ['メンバー', '勤務地', '日付', '出勤時刻', '退勤時刻', '勤務時間']
    const rows = filtered.map(a => [
      a.member_name,
      a.location_name,
      a.date,
      a.clock_in,
      a.clock_out || '-',
      a.total_hours ? `${a.total_hours.toFixed(2)}時間` : '-'
    ])

    const csv = [header, ...rows].map(row => row.join(',')).join('\n')
    const bom = '\uFEFF'
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `attendance_${selectedMonth}.csv`
    link.click()
  }

  const filteredAttendance = selectedMonth
    ? attendance.filter(a => a.date.startsWith(selectedMonth))
    : attendance

  return (
    <div className="section">
      <h2>⏰ 勤怠管理</h2>
      <div className="guide-box">
        <h3>使い方</h3>
        <ol>
          <li>メンバーと勤務地を選択してください</li>
          <li>「出勤」ボタンをクリックして出勤時刻を記録</li>
          <li>作業終了時に「退勤」ボタンをクリック</li>
          <li>勤務時間が自動計算されます</li>
        </ol>
      </div>

      <div className="attendance-form">
        <div className="form-row">
          <div className="form-group">
            <label>メンバー</label>
            <select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              disabled={clockedIn}
            >
              <option value="">選択してください</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>勤務地</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              disabled={clockedIn}
            >
              <option value="">選択してください</option>
              {locations.map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="clock-buttons">
          <button onClick={clockIn} disabled={clockedIn} className="clock-in-btn">
            🟢 出勤
          </button>
          <button onClick={clockOut} disabled={!clockedIn} className="clock-out-btn">
            🔴 退勤
          </button>
        </div>

        {clockedIn && currentEntry && (
          <div className="current-status">
            <p>
              <strong>出勤中:</strong> {currentEntry.member_name} - {currentEntry.location_name}
              <br />
              <strong>出勤時刻:</strong> {currentEntry.clock_in}
            </p>
          </div>
        )}
      </div>

      <div className="filter-section">
        <h3>📊 勤怠記録</h3>
        <div className="filter-bar">
          <div className="form-group">
            <label>月で絞り込み</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </div>
          <button onClick={exportCSV} className="export-btn">📥 CSV出力</button>
        </div>
      </div>

      <div className="attendance-table-wrapper">
        <table>
          <thead>
            <tr>
              <th>メンバー</th>
              <th>勤務地</th>
              <th>日付</th>
              <th>出勤時刻</th>
              <th>退勤時刻</th>
              <th>勤務時間</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredAttendance.map((record) => (
              <tr key={record.id}>
                <td><strong>{record.member_name}</strong></td>
                <td>{record.location_name}</td>
                <td>{record.date}</td>
                <td>{record.clock_in}</td>
                <td>{record.clock_out || <span className="pending">勤務中</span>}</td>
                <td>{record.total_hours ? `${record.total_hours.toFixed(2)}時間` : '-'}</td>
                <td>
                  <button className="delete-btn" onClick={() => deleteAttendance(record.id)}>削除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredAttendance.length === 0 && (
          <p className="no-data">勤怠記録がありません</p>
        )}
      </div>
    </div>
  )
}

// 給与計算
function SalaryCalculation() {
  const [members, setMembers] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [attendance, setAttendance] = useState<any[]>([])
  const [selectedMember, setSelectedMember] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [salaryData, setSalaryData] = useState<any>(null)

  useEffect(() => {
    loadMembers()
    loadLocations()
    loadAttendance()

    const now = new Date()
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    setSelectedMonth(monthStr)
  }, [])

  const loadMembers = () => {
    const stored = localStorage.getItem(STORAGE_KEYS.MEMBERS)
    if (stored) {
      setMembers(JSON.parse(stored))
    }
  }

  const loadLocations = () => {
    const stored = localStorage.getItem(STORAGE_KEYS.LOCATIONS)
    if (stored) {
      setLocations(JSON.parse(stored))
    }
  }

  const loadAttendance = () => {
    const stored = localStorage.getItem(STORAGE_KEYS.ATTENDANCE)
    if (stored) {
      setAttendance(JSON.parse(stored))
    }
  }

  const calculateSalary = () => {
    if (!selectedMember || !selectedMonth) {
      alert('メンバーと月を選択してください')
      return
    }

    const member = members.find(m => m.id === Number(selectedMember))
    const records = attendance.filter(a =>
      a.member_id === Number(selectedMember) &&
      a.date.startsWith(selectedMonth) &&
      a.total_hours
    )

    if (records.length === 0) {
      alert('該当する勤怠記録がありません')
      return
    }

    const breakdown: any = {}
    let totalHours = 0
    let totalSalary = 0
    let totalTransportFee = 0

    records.forEach(record => {
      const location = locations.find(l => l.id === record.location_id)
      const locationName = record.location_name
      const hourlyWage = location?.hourly_wage || 0
      const hours = record.total_hours
      const salary = hours * hourlyWage

      // 交通費計算
      let transportFee = 0
      if (location?.type === 'office') {
        transportFee = member.office_transport_fee || 0
      } else if (location?.type === 'client') {
        transportFee = location.member_transport_fees?.[member.id] || 0
      }

      if (!breakdown[locationName]) {
        breakdown[locationName] = {
          days: 0,
          hours: 0,
          hourlyWage,
          salary: 0,
          transportFee: 0,
          total: 0
        }
      }

      breakdown[locationName].days += 1
      breakdown[locationName].hours += hours
      breakdown[locationName].salary += salary
      breakdown[locationName].transportFee += transportFee
      breakdown[locationName].total += salary + transportFee

      totalHours += hours
      totalSalary += salary
      totalTransportFee += transportFee
    })

    setSalaryData({
      member: member.name,
      month: selectedMonth,
      breakdown,
      totalDays: records.length,
      totalHours,
      totalSalary,
      totalTransportFee,
      grandTotal: totalSalary + totalTransportFee
    })
  }

  const exportPDF = () => {
    if (!salaryData) {
      alert('先に給与計算を実行してください')
      return
    }

    alert('PDF出力機能は準備中です。現在はCSV出力をご利用ください。')
  }

  const exportCSV = () => {
    if (!salaryData) {
      alert('先に給与計算を実行してください')
      return
    }

    const header = ['勤務地', '出勤日数', '勤務時間', '時給', '給与', '交通費', '合計']
    const rows = Object.entries(salaryData.breakdown).map(([location, data]: [string, any]) => [
      location,
      `${data.days}日`,
      `${data.hours.toFixed(2)}時間`,
      `¥${data.hourlyWage.toLocaleString()}`,
      `¥${data.salary.toLocaleString()}`,
      `¥${data.transportFee.toLocaleString()}`,
      `¥${data.total.toLocaleString()}`
    ])

    const summary = [
      '',
      `合計: ${salaryData.totalDays}日`,
      `${salaryData.totalHours.toFixed(2)}時間`,
      '',
      `¥${salaryData.totalSalary.toLocaleString()}`,
      `¥${salaryData.totalTransportFee.toLocaleString()}`,
      `¥${salaryData.grandTotal.toLocaleString()}`
    ]

    const csv = [header, ...rows, summary].map(row => row.join(',')).join('\n')
    const bom = '\uFEFF'
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `salary_${salaryData.member}_${salaryData.month}.csv`
    link.click()
  }

  return (
    <div className="section">
      <h2>💰 給与計算</h2>
      <div className="guide-box">
        <h3>使い方</h3>
        <ol>
          <li>給与計算したいメンバーを選択してください</li>
          <li>対象月を選択してください</li>
          <li>「計算実行」ボタンをクリック</li>
          <li>勤務地別の給与・交通費が表示されます</li>
          <li>CSV出力で給与明細をダウンロードできます</li>
        </ol>
      </div>

      <div className="salary-form">
        <div className="form-row">
          <div className="form-group">
            <label>メンバー <span className="required">*必須</span></label>
            <select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
            >
              <option value="">選択してください</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>対象月 <span className="required">*必須</span></label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </div>
        </div>

        <div className="form-actions">
          <button onClick={calculateSalary} className="submit-btn">🧮 計算実行</button>
        </div>
      </div>

      {salaryData && (
        <div className="salary-result">
          <div className="result-header">
            <h3>📋 給与明細</h3>
            <div className="export-buttons">
              <button onClick={exportCSV} className="export-btn">📥 CSV出力</button>
            </div>
          </div>

          <div className="result-summary">
            <p><strong>対象:</strong> {salaryData.member}</p>
            <p><strong>対象月:</strong> {salaryData.month}</p>
          </div>

          <table className="salary-table">
            <thead>
              <tr>
                <th>勤務地</th>
                <th>出勤日数</th>
                <th>勤務時間</th>
                <th>時給</th>
                <th>給与</th>
                <th>交通費</th>
                <th>合計</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(salaryData.breakdown).map(([location, data]: [string, any]) => (
                <tr key={location}>
                  <td><strong>{location}</strong></td>
                  <td>{data.days}日</td>
                  <td>{data.hours.toFixed(2)}時間</td>
                  <td>¥{data.hourlyWage.toLocaleString()}</td>
                  <td>¥{data.salary.toLocaleString()}</td>
                  <td>¥{data.transportFee.toLocaleString()}</td>
                  <td><strong>¥{data.total.toLocaleString()}</strong></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="total-row">
                <td><strong>合計</strong></td>
                <td><strong>{salaryData.totalDays}日</strong></td>
                <td><strong>{salaryData.totalHours.toFixed(2)}時間</strong></td>
                <td>-</td>
                <td><strong>¥{salaryData.totalSalary.toLocaleString()}</strong></td>
                <td><strong>¥{salaryData.totalTransportFee.toLocaleString()}</strong></td>
                <td className="grand-total"><strong>¥{salaryData.grandTotal.toLocaleString()}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {!salaryData && (
        <div className="no-data">
          <p>メンバーと月を選択して「計算実行」をクリックしてください</p>
        </div>
      )}
    </div>
  )
}

export default App

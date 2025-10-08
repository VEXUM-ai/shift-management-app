import { useState, useEffect } from 'react'
import './App.css'

type Tab = 'members' | 'locations' | 'shift' | 'shiftlist' | 'attendance' | 'salary'
type UserRole = 'admin' | 'member'

// LocalStorage Keys
const STORAGE_KEYS = {
  MEMBERS: 'shift_app_members',
  LOCATIONS: 'shift_app_locations',
  SHIFTS: 'shift_app_shifts',
  ATTENDANCE: 'shift_app_attendance',
  USER_ROLE: 'shift_app_user_role',
  SELECTED_MEMBER_ID: 'shift_app_selected_member_id'
}

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('shift')
  const [userRole, setUserRole] = useState<UserRole>('member')
  const [isRoleSelected, setIsRoleSelected] = useState(false)
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null)
  const [members, setMembers] = useState<any[]>([])

  useEffect(() => {
    const storedRole = localStorage.getItem(STORAGE_KEYS.USER_ROLE)
    const storedMemberId = localStorage.getItem(STORAGE_KEYS.SELECTED_MEMBER_ID)
    const storedMembers = localStorage.getItem(STORAGE_KEYS.MEMBERS)

    if (storedMembers) {
      try {
        const parsed = JSON.parse(storedMembers)
        setMembers(Array.isArray(parsed) ? parsed : [])
      } catch (error) {
        console.error('Error parsing members:', error)
        setMembers([])
      }
    }

    if (storedRole && storedMemberId) {
      setUserRole(storedRole as UserRole)
      setSelectedMemberId(Number(storedMemberId))
      setIsRoleSelected(true)
    } else if (storedRole === 'admin') {
      setUserRole('admin')
      setIsRoleSelected(true)
    }
  }, [])

  const selectRole = (role: UserRole, memberId?: number) => {
    setUserRole(role)
    setIsRoleSelected(true)
    localStorage.setItem(STORAGE_KEYS.USER_ROLE, role)
    if (memberId) {
      setSelectedMemberId(memberId)
      localStorage.setItem(STORAGE_KEYS.SELECTED_MEMBER_ID, String(memberId))
    }
  }

  const switchRole = () => {
    setIsRoleSelected(false)
    setSelectedMemberId(null)
    localStorage.removeItem(STORAGE_KEYS.USER_ROLE)
    localStorage.removeItem(STORAGE_KEYS.SELECTED_MEMBER_ID)
  }

  if (!isRoleSelected) {
    const adminMembers = members.filter(m => m.is_admin)

    return (
      <div className="app">
        <div className="role-selection">
          <h1>🔐 ログイン</h1>
          <p>アクセス権限を選択してください</p>
          <div className="role-buttons">
            <button className="role-btn admin-btn" onClick={() => selectRole('admin')}>
              <span className="role-icon">👔</span>
              <span className="role-title">管理者（全体）</span>
              <span className="role-desc">メンバー管理・給与設定・全機能利用可能</span>
            </button>
            {adminMembers.length > 0 && (
              <div style={{ width: '100%', marginTop: '20px' }}>
                <h3 style={{ textAlign: 'center', marginBottom: '15px', color: '#667eea' }}>
                  👥 管理権限を持つメンバー
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {adminMembers.map(member => (
                    <button
                      key={member.id}
                      className="role-btn member-btn"
                      onClick={() => selectRole('admin', member.id)}
                      style={{ padding: '15px' }}
                    >
                      <span className="role-icon">👔</span>
                      <span className="role-title">{member.name}</span>
                      <span className="role-desc">個人ページ + 管理機能</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div style={{ width: '100%', marginTop: '20px' }}>
              <h3 style={{ textAlign: 'center', marginBottom: '15px', color: '#764ba2' }}>
                👤 一般メンバー
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(members || []).filter(m => !m.is_admin).map(member => (
                  <button
                    key={member.id}
                    className="role-btn member-btn"
                    onClick={() => selectRole('member', member.id)}
                    style={{ padding: '15px' }}
                  >
                    <span className="role-icon">👤</span>
                    <span className="role-title">{member.name}</span>
                    <span className="role-desc">シフト提出・勤怠打刻のみ</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentMember = selectedMemberId ? members.find(m => m.id === selectedMemberId) : null

  return (
    <div className="app">
      <header>
        <h1>勤怠・シフト管理システム</h1>
        <div className="user-info">
          <span className="current-role">
            {currentMember ? (
              <>
                {userRole === 'admin' && currentMember.is_admin ? '👔' : '👤'} {currentMember.name}
              </>
            ) : (
              <>
                {userRole === 'admin' ? '👔 管理者（全体）' : '👤 メンバー'}
              </>
            )}
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
              クライアント先管理
            </button>
          </>
        )}
        <button
          className={activeTab === 'shift' ? 'active' : ''}
          onClick={() => setActiveTab('shift')}
        >
          シフト登録
        </button>
        <button
          className={activeTab === 'shiftlist' ? 'active' : ''}
          onClick={() => setActiveTab('shiftlist')}
        >
          シフト一覧
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
        {activeTab === 'shift' && <ShiftManagement selectedMemberId={selectedMemberId} currentMemberName={currentMember?.name} />}
        {activeTab === 'shiftlist' && <ShiftListView selectedMemberId={selectedMemberId} currentMemberName={currentMember?.name} />}
        {activeTab === 'attendance' && <AttendanceManagement selectedMemberId={selectedMemberId} currentMemberName={currentMember?.name} />}
        {activeTab === 'salary' && userRole === 'admin' && <SalaryCalculation selectedMemberId={selectedMemberId} currentMemberName={currentMember?.name} />}
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
  const [isAdmin, setIsAdmin] = useState(false)
  const [editingMember, setEditingMember] = useState<any>(null)

  useEffect(() => {
    loadMembers()
  }, [])

  const loadMembers = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.MEMBERS)
      if (stored) {
        const parsed = JSON.parse(stored)
        setMembers(Array.isArray(parsed) ? parsed : [])
      }
    } catch (error) {
      console.error('Error loading members:', error)
      setMembers([])
    }
  }

  const saveMembers = (data: any[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(data))
      setMembers(data)
    } catch (error) {
      console.error('Error saving members:', error)
    }
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

    if (editingMember) {
      // 編集モード
      const updated = members.map(m =>
        m.id === editingMember.id
          ? {
              ...m,
              name,
              email,
              office_transport_fee: parseFloat(officeTransportFee || '0'),
              salary_type: salaryType,
              hourly_wage: salaryType === 'hourly' ? parseFloat(hourlyWage) : 0,
              fixed_salary: salaryType === 'fixed' ? parseFloat(fixedSalary) : 0,
              is_admin: isAdmin,
            }
          : m
      )
      saveMembers(updated)
      setEditingMember(null)
      alert('メンバー情報を更新しました')
    } else {
      // 新規追加モード
      const newMember = {
        id: Date.now(),
        name,
        email,
        office_transport_fee: parseFloat(officeTransportFee || '0'),
        salary_type: salaryType,
        hourly_wage: salaryType === 'hourly' ? parseFloat(hourlyWage) : 0,
        fixed_salary: salaryType === 'fixed' ? parseFloat(fixedSalary) : 0,
        is_admin: isAdmin,
        created_at: new Date().toISOString()
      }

      const updated = [...members, newMember]
      saveMembers(updated)
      alert('メンバーを追加しました')
    }

    setName('')
    setEmail('')
    setOfficeTransportFee('')
    setHourlyWage('')
    setFixedSalary('')
    setSalaryType('hourly')
    setIsAdmin(false)
  }

  const editMember = (member: any) => {
    setEditingMember(member)
    setName(member.name)
    setEmail(member.email || '')
    setOfficeTransportFee(String(member.office_transport_fee || ''))
    setSalaryType(member.salary_type)
    setHourlyWage(member.salary_type === 'hourly' ? String(member.hourly_wage || '') : '')
    setFixedSalary(member.salary_type === 'fixed' ? String(member.fixed_salary || '') : '')
    setIsAdmin(member.is_admin || false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelEdit = () => {
    setEditingMember(null)
    setName('')
    setEmail('')
    setOfficeTransportFee('')
    setHourlyWage('')
    setFixedSalary('')
    setSalaryType('hourly')
    setIsAdmin(false)
  }

  const deleteMember = (id: number) => {
    if (!confirm('このメンバーを削除しますか？')) return
    const updated = members.filter(m => m.id !== id)
    saveMembers(updated)
  }

  const importCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const lines = text.split('\n').filter(line => line.trim())

      // ヘッダー行をスキップ
      const dataLines = lines.slice(1)

      const importedMembers = dataLines.map((line, index) => {
        const parts = line.split('\t').map(part => part.trim())

        const name = parts[0] || ''
        const email = parts[1] || ''
        const salaryInfo = parts[2] || ''
        const transportFee = parts[3] || '0'

        // 給与形態を判定
        let salaryType: 'hourly' | 'fixed' = 'hourly'
        let hourlyWage = 0
        let fixedSalary = 0

        if (salaryInfo.includes('固定')) {
          salaryType = 'fixed'
          const match = salaryInfo.match(/(\d+)万円/)
          if (match) {
            fixedSalary = parseInt(match[1]) * 10000
          }
        } else if (salaryInfo.includes('時給')) {
          salaryType = 'hourly'
          const match = salaryInfo.match(/(\d+)円/)
          if (match) {
            hourlyWage = parseInt(match[1])
          }
        }

        // 交通費を数値に変換（カンマと¥記号を除去）
        const cleanTransportFee = transportFee.replace(/[¥,]/g, '')
        const officeTransportFeeValue = parseFloat(cleanTransportFee) || 0

        return {
          id: Date.now() + index,
          name,
          email,
          office_transport_fee: officeTransportFeeValue,
          salary_type: salaryType,
          hourly_wage: hourlyWage,
          fixed_salary: fixedSalary,
          created_at: new Date().toISOString()
        }
      }).filter(m => m.name) // 名前が空の行は除外

      if (importedMembers.length === 0) {
        alert('インポートできるデータがありませんでした')
        return
      }

      // 既存のメンバーに追加
      const updated = [...members, ...importedMembers]
      saveMembers(updated)
      alert(`${importedMembers.length}名のメンバーをインポートしました`)

      // ファイル入力をリセット
      e.target.value = ''
    }

    reader.readAsText(file, 'UTF-8')
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
        <h3>{editingMember ? '✏️ メンバー情報を編集' : '👤 新しいメンバーを追加'}</h3>

        {editingMember && (
          <div className="info-text">
            編集中: <strong>{editingMember.name}</strong>
          </div>
        )}

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

        <div className="form-row">
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '10px' }}>
              <input
                type="checkbox"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
              <span>👔 管理権限を付与（このメンバーに管理機能へのアクセスを許可）</span>
            </label>
            <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f0f8ff', borderRadius: '5px', fontSize: '14px', color: '#555' }}>
              💡 管理権限を持つメンバーは、ログイン画面で自分の名前を選択して個人ページ + 全管理機能にアクセスできます
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button onClick={addMember} className="submit-btn">
            {editingMember ? '💾 更新' : '➕ メンバー追加'}
          </button>
          {editingMember && (
            <button onClick={cancelEdit} className="cancel-btn">
              キャンセル
            </button>
          )}
        </div>
      </div>

      <h3>📋 登録済みメンバー一覧</h3>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '15px', alignItems: 'center' }}>
        <div>
          <label htmlFor="csv-import" className="submit-btn" style={{ cursor: 'pointer', display: 'inline-block' }}>
            📥 CSVインポート
          </label>
          <input
            id="csv-import"
            type="file"
            accept=".csv,.txt,.tsv"
            onChange={importCSV}
            style={{ display: 'none' }}
          />
        </div>
        <div style={{ color: '#666', fontSize: '14px' }}>
          形式: 名前 [TAB] メール [TAB] 給与情報（固定50万円 または 時給1500円） [TAB] 交通費（円）
        </div>
      </div>

      <div className="members-table-wrapper">
        <table>
          <thead>
            <tr>
              <th>名前</th>
              <th>メール</th>
              <th>給与形態</th>
              <th>給与額</th>
              <th>オフィス交通費</th>
              <th>管理権限</th>
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
                  {member.is_admin ? (
                    <span style={{ color: '#667eea', fontWeight: 'bold' }}>👔 管理者</span>
                  ) : (
                    <span style={{ color: '#999' }}>-</span>
                  )}
                </td>
                <td>
                  <button className="edit-btn" onClick={() => editMember(member)}>✏️ 編集</button>
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
  const [industry, setIndustry] = useState('')
  const [address, setAddress] = useState('')
  const [selectedLocation, setSelectedLocation] = useState<any>(null)
  const [memberTransportFees, setMemberTransportFees] = useState<{[key: number]: string}>({})
  const [selectedMembers, setSelectedMembers] = useState<number[]>([])
  const [editingLocation, setEditingLocation] = useState<any>(null)
  const [editName, setEditName] = useState('')
  const [editIndustry, setEditIndustry] = useState('')
  const [editAddress, setEditAddress] = useState('')
  const [sortOrder, setSortOrder] = useState<'name' | 'industry' | 'date'>('date')

  useEffect(() => {
    loadLocations()
    loadMembers()
  }, [])

  const loadLocations = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LOCATIONS)
      if (stored) {
        const parsed = JSON.parse(stored)
        setLocations(Array.isArray(parsed) ? parsed : [])
      }
    } catch (error) {
      console.error('Error loading locations:', error)
      setLocations([])
    }
  }

  const loadMembers = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.MEMBERS)
      if (stored) {
        const parsed = JSON.parse(stored)
        setMembers(Array.isArray(parsed) ? parsed : [])
      }
    } catch (error) {
      console.error('Error loading members:', error)
      setMembers([])
    }
  }

  const saveLocations = (data: any[]) => {
    localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(data))
    setLocations(data)
  }

  const addLocation = () => {
    if (!name) {
      alert('クライアント先名を入力してください')
      return
    }

    const newLocation = {
      id: Date.now(),
      name,
      industry: industry || '',
      address: address || '',
      type: 'client',
      member_transport_fees: {},
      created_at: new Date().toISOString()
    }

    const updated = [...locations, newLocation]
    saveLocations(updated)

    setName('')
    setIndustry('')
    setAddress('')
    alert('クライアント先を追加しました')
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

  const openEditLocation = (location: any) => {
    setEditingLocation(location)
    setEditName(location.name)
    setEditIndustry(location.industry || '')
    setEditAddress(location.address || '')
  }

  const cancelEditLocation = () => {
    setEditingLocation(null)
    setEditName('')
    setEditIndustry('')
    setEditAddress('')
  }

  const saveEditLocation = () => {
    if (!editName) {
      alert('クライアント先名を入力してください')
      return
    }

    const updated = locations.map(l =>
      l.id === editingLocation.id
        ? { ...l, name: editName, industry: editIndustry, address: editAddress, updated_at: new Date().toISOString() }
        : l
    )

    saveLocations(updated)
    cancelEditLocation()
    alert('クライアント先情報を更新しました')
  }

  const getSortedLocations = () => {
    const sorted = [...locations]
    if (sortOrder === 'name') {
      return sorted.sort((a, b) => a.name.localeCompare(b.name, 'ja'))
    } else if (sortOrder === 'industry') {
      return sorted.sort((a, b) => (a.industry || '').localeCompare(b.industry || '', 'ja'))
    } else {
      return sorted.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
    }
  }

  return (
    <div className="section">
      <h2>🏢 クライアント先管理（管理者専用）</h2>
      <div className="guide-box">
        <h3>✨ 使い方（ステップバイステップ）</h3>
        <ol>
          <li><strong>STEP 1:</strong> まず「メンバー管理」タブでメンバーを登録（給与・オフィス交通費設定）</li>
          <li><strong>STEP 2:</strong> この画面でクライアント先を登録（会社名・業界・場所）</li>
          <li><strong>STEP 3:</strong> クライアント先登録後、「👥 メンバー設定」ボタンをクリック</li>
          <li><strong>STEP 4:</strong> そのクライアント先に配属するメンバーを選択し、<strong>メンバーごとの交通費</strong>を設定</li>
        </ol>
        <p className="note">💡 メンバーによって交通費が異なる場合でも、個別に設定できます</p>
      </div>

      <div className="member-form">
        <h3>🏢 新しいクライアント先を追加</h3>
        <p className="info-text">💡 給与設定はメンバー管理で行います。ここではクライアント先の情報とメンバー配属を行います。</p>

        <div className="form-row">
          <div className="form-group">
            <label>クライアント先名 <span className="required">*必須</span></label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: 株式会社A、B商事"
            />
          </div>

          <div className="form-group">
            <label>業界 <span className="optional">任意</span></label>
            <input
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="例: IT、製造、金融"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>場所・住所 <span className="optional">任意</span></label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="例: 東京都渋谷区、大阪府大阪市"
            />
          </div>
        </div>

        <div className="form-actions">
          <button onClick={addLocation} className="submit-btn">➕ クライアント先を追加</button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3>📋 登録済みクライアント先一覧</h3>
        <div className="form-group" style={{ margin: 0, minWidth: '200px' }}>
          <label style={{ marginRight: '10px' }}>並び順:</label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'name' | 'industry' | 'date')}
            style={{ padding: '5px 10px' }}
          >
            <option value="date">登録日順（新しい順）</option>
            <option value="name">名前順（あいうえお順）</option>
            <option value="industry">業界順</option>
          </select>
        </div>
      </div>
      <div className="locations-grid">
        {getSortedLocations().map((location) => (
          <div key={location.id} className="location-card">
            <div className="location-info">
              <h4>🏢 {location.name}</h4>
              {location.industry && (
                <p className="location-industry">
                  <span className="label">業界:</span> {location.industry}
                </p>
              )}
              {location.address && (
                <p className="location-address">
                  <span className="label">場所:</span> {location.address}
                </p>
              )}
              {Object.keys(location.member_transport_fees || {}).length > 0 && (
                <span className="member-count">
                  👥 {Object.keys(location.member_transport_fees).length}人配属済み
                </span>
              )}
            </div>
            <div className="location-actions">
              <button
                className="edit-btn"
                onClick={() => openEditLocation(location)}
                style={{ backgroundColor: '#28a745' }}
              >
                ✏️ 編集
              </button>
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
        <p className="no-data">クライアント先が登録されていません</p>
      )}

      {/* クライアント先編集モーダル */}
      {editingLocation && (
        <div className="modal-overlay" onClick={cancelEditLocation}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <h3>✏️ クライアント先情報の編集</h3>

            <div className="member-form">
              <div className="form-group">
                <label>クライアント先名 <span className="required">*必須</span></label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="例: 株式会社A、B商事"
                />
              </div>

              <div className="form-group">
                <label>業界 <span className="optional">任意</span></label>
                <input
                  type="text"
                  value={editIndustry}
                  onChange={(e) => setEditIndustry(e.target.value)}
                  placeholder="例: IT、製造、金融"
                />
              </div>

              <div className="form-group">
                <label>場所・住所 <span className="optional">任意</span></label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="例: 東京都渋谷区、大阪府大阪市"
                />
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={saveEditLocation} className="submit-btn">
                💾 保存
              </button>
              <button onClick={cancelEditLocation} className="cancel-btn">キャンセル</button>
            </div>
          </div>
        </div>
      )}

      {/* メンバー設定モーダル */}
      {selectedLocation && (
        <div className="modal-overlay" onClick={() => setSelectedLocation(null)}>
          <div className="modal-content member-settings-modal" onClick={(e) => e.stopPropagation()}>
            <h3>👥 {selectedLocation.name} - メンバー別設定</h3>

            <div className="modal-guide">
              <p><strong>💡 この画面でできること:</strong></p>
              <ol>
                <li><strong>配属メンバーの選択</strong> - このクライアント先に配属するメンバーをチェック</li>
                <li><strong>メンバーごとの交通費設定</strong> - 各メンバーの交通費を個別に入力（人によって金額が異なってもOK）</li>
                <li><strong>保存して完了</strong> - 「保存」ボタンで設定を確定</li>
              </ol>
              <p className="note">
                📝 ここで設定した交通費が給与計算に使用されます
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
                  </div>

                  {selectedMembers.includes(member.id) && (
                    <div className="fee-setting-row">
                      <label>
                        このクライアント先での交通費
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
function ShiftManagement({ selectedMemberId, currentMemberName }: { selectedMemberId: number | null, currentMemberName?: string }) {
  const [shifts, setShifts] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [attendance, setAttendance] = useState<any[]>([])
  const [selectedMember, setSelectedMember] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [otherActivity, setOtherActivity] = useState('')
  const [isOtherSelected, setIsOtherSelected] = useState(false)
  const [memberType, setMemberType] = useState<'resident' | 'advisor'>('resident')
  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [selectedMonth, setSelectedMonth] = useState('')
  const [editingShift, setEditingShift] = useState<any>(null)
  const [editStartTime, setEditStartTime] = useState('')
  const [editEndTime, setEditEndTime] = useState('')
  const [bulkMode, setBulkMode] = useState(false)
  const [calendarMonth, setCalendarMonth] = useState('')
  const [filterMember, setFilterMember] = useState('')
  const [selectedShiftsForDelete, setSelectedShiftsForDelete] = useState<number[]>([])
  const [includeOffice, setIncludeOffice] = useState(false)
  const [editingShiftInfo, setEditingShiftInfo] = useState<any>(null)
  const [editMember, setEditMember] = useState('')
  const [editLocation, setEditLocation] = useState('')
  const [editIncludeOffice, setEditIncludeOffice] = useState(false)
  const [editIsOther, setEditIsOther] = useState(false)
  const [editOtherActivity, setEditOtherActivity] = useState('')

  useEffect(() => {
    loadShifts()
    loadMembers()
    loadLocations()
    loadAttendance()

    // 今月をデフォルト設定
    const now = new Date()
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    setSelectedMonth(monthStr)
    setCalendarMonth(monthStr)

    // 個人ページの場合は自動的にメンバーを選択
    if (selectedMemberId) {
      setSelectedMember(String(selectedMemberId))
    }
  }, [selectedMemberId])

  const loadAttendance = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ATTENDANCE)
      if (stored) {
        const parsed = JSON.parse(stored)
        setAttendance(Array.isArray(parsed) ? parsed : [])
      }
    } catch (error) {
      console.error('Error loading attendance:', error)
      setAttendance([])
    }
  }

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
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SHIFTS)
      if (stored) {
        const parsed = JSON.parse(stored)
        setShifts(Array.isArray(parsed) ? parsed : [])
      }
    } catch (error) {
      console.error('Error loading shifts:', error)
      setShifts([])
    }
  }

  const loadMembers = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.MEMBERS)
      if (stored) {
        const parsed = JSON.parse(stored)
        setMembers(Array.isArray(parsed) ? parsed : [])
      }
    } catch (error) {
      console.error('Error loading members:', error)
      setMembers([])
    }
  }

  const loadLocations = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LOCATIONS)
      if (stored) {
        const parsed = JSON.parse(stored)
        setLocations(Array.isArray(parsed) ? parsed : [])
      }
    } catch (error) {
      console.error('Error loading locations:', error)
      setLocations([])
    }
  }

  const saveShifts = (data: any[]) => {
    localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(data))
    setShifts(data)
  }

  const addBulkShifts = () => {
    if (!selectedMember) {
      alert('メンバーを選択してください')
      return
    }

    if (memberType === 'resident' && !isOtherSelected && selectedLocations.length === 0) {
      alert('勤務地を選択するか、「その他」を選択してください')
      return
    }

    if (isOtherSelected && !otherActivity) {
      alert('その他の活動内容を入力してください')
      return
    }

    if (selectedDates.length === 0) {
      alert('日付を選択してください')
      return
    }

    const member = members.find(m => m.id === Number(selectedMember))
    let updatedShifts = [...shifts]
    let addedCount = 0
    let updatedCount = 0

    selectedDates.forEach((date, dateIndex) => {
      if (isOtherSelected) {
        // その他の活動
        const existingShift = updatedShifts.find(s =>
          s.member_id === member.id &&
          s.date === date &&
          s.is_other === true
        )

        const shiftData = {
          member_id: member.id,
          member_name: member.name,
          location_id: 0,
          location_name: `その他: ${otherActivity}`,
          is_other: true,
          member_type: memberType,
          date,
          start_time: null,
          end_time: null,
          status: '提出済み'
        }

        if (existingShift) {
          // 既存のシフトを更新
          updatedShifts = updatedShifts.map(s =>
            s.id === existingShift.id ? { ...s, ...shiftData, updated_at: new Date().toISOString() } : s
          )
          updatedCount++
        } else {
          // 新規追加
          updatedShifts.push({
            id: Date.now() + dateIndex * 100,
            ...shiftData,
            created_at: new Date().toISOString()
          })
          addedCount++
        }
      } else if (memberType === 'advisor') {
        // アドバイザー（常駐先なし）
        const existingShift = updatedShifts.find(s =>
          s.member_id === member.id &&
          s.date === date &&
          s.location_id === -2
        )

        const shiftData = {
          member_id: member.id,
          member_name: member.name,
          location_id: -2,
          location_name: 'アドバイザー',
          is_other: false,
          member_type: memberType,
          date,
          start_time: null,
          end_time: null,
          status: '提出済み'
        }

        if (existingShift) {
          // 既存のシフトを更新
          updatedShifts = updatedShifts.map(s =>
            s.id === existingShift.id ? { ...s, ...shiftData, updated_at: new Date().toISOString() } : s
          )
          updatedCount++
        } else {
          // 新規追加
          updatedShifts.push({
            id: Date.now() + dateIndex * 100,
            ...shiftData,
            created_at: new Date().toISOString()
          })
          addedCount++
        }
      } else {
        // 常駐人材（複数のクライアント先）
        selectedLocations.forEach((locationId, locIndex) => {
          const location = locations.find(l => l.id === Number(locationId))
          const existingShift = updatedShifts.find(s =>
            s.member_id === member.id &&
            s.date === date &&
            s.location_id === location.id
          )

          const shiftData = {
            member_id: member.id,
            member_name: member.name,
            location_id: location.id,
            location_name: location.name,
            is_other: false,
            member_type: memberType,
            date,
            start_time: null,
            end_time: null,
            status: '提出済み'
          }

          if (existingShift) {
            // 既存のシフトを更新
            updatedShifts = updatedShifts.map(s =>
              s.id === existingShift.id ? { ...s, ...shiftData, updated_at: new Date().toISOString() } : s
            )
            updatedCount++
          } else {
            // 新規追加
            updatedShifts.push({
              id: Date.now() + dateIndex * 100 + locIndex * 10,
              ...shiftData,
              created_at: new Date().toISOString()
            })
            addedCount++
          }
        })

        // オフィスのシフトも追加
        if (includeOffice) {
          const existingOfficeShift = updatedShifts.find(s =>
            s.member_id === member.id &&
            s.date === date &&
            s.location_id === -1
          )

          const officeShiftData = {
            member_id: member.id,
            member_name: member.name,
            location_id: -1,
            location_name: 'オフィス',
            is_other: false,
            member_type: memberType,
            date,
            start_time: null,
            end_time: null,
            status: '提出済み'
          }

          if (existingOfficeShift) {
            // 既存のシフトを更新
            updatedShifts = updatedShifts.map(s =>
              s.id === existingOfficeShift.id ? { ...s, ...officeShiftData, updated_at: new Date().toISOString() } : s
            )
            updatedCount++
          } else {
            // 新規追加
            updatedShifts.push({
              id: Date.now() + dateIndex * 100 + 99,
              ...officeShiftData,
              created_at: new Date().toISOString()
            })
            addedCount++
          }
        }
      }
    })

    saveShifts(updatedShifts)

    setSelectedMember('')
    setSelectedLocation('')
    setSelectedLocations([])
    setOtherActivity('')
    setIsOtherSelected(false)
    setIncludeOffice(false)
    setMemberType('resident')
    setSelectedDates([])

    if (updatedCount > 0 && addedCount > 0) {
      alert(`シフト登録完了: 新規${addedCount}件、更新${updatedCount}件`)
    } else if (updatedCount > 0) {
      alert(`${updatedCount}件のシフトを更新しました`)
    } else {
      alert(`${addedCount}件のシフトを登録しました`)
    }
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

  const openEditShiftInfo = (shift: any) => {
    setEditingShiftInfo(shift)
    setEditMember(String(shift.member_id))

    if (shift.is_other) {
      setEditIsOther(true)
      setEditOtherActivity(shift.location_name.replace('その他: ', ''))
      setEditLocation('')
    } else if (shift.location_id === -1) {
      // オフィスのみの場合は編集不可（クライアント先のシフトから編集）
      alert('オフィスのシフトは、対応するクライアント先のシフトから編集してください')
      return
    } else {
      setEditIsOther(false)
      setEditLocation(String(shift.location_id))
      setEditOtherActivity('')

      // 同じ日付・メンバーでオフィスのシフトがあるかチェック
      const hasOffice = shifts.some(
        s => s.date === shift.date &&
             s.member_id === shift.member_id &&
             s.location_id === -1
      )
      setEditIncludeOffice(hasOffice)
    }
  }

  const saveShiftInfo = () => {
    if (!editingShiftInfo) return

    if (!editMember) {
      alert('メンバーを選択してください')
      return
    }

    if (!editIsOther && !editLocation) {
      alert('勤務地を選択してください')
      return
    }

    if (editIsOther && !editOtherActivity) {
      alert('その他の活動内容を入力してください')
      return
    }

    const member = members.find(m => m.id === Number(editMember))
    let locationData = { id: 0, name: '' }

    if (editIsOther) {
      locationData = {
        id: 0,
        name: `その他: ${editOtherActivity}`
      }
    } else {
      const location = locations.find(l => l.id === Number(editLocation))
      locationData = {
        id: location.id,
        name: location.name
      }
    }

    // 既存のシフトを更新
    let updated = shifts.map(s =>
      s.id === editingShiftInfo.id
        ? {
            ...s,
            member_id: member.id,
            member_name: member.name,
            location_id: locationData.id,
            location_name: locationData.name,
            is_other: editIsOther
          }
        : s
    )

    // オフィスシフトの処理
    const officeShift = shifts.find(
      s => s.date === editingShiftInfo.date &&
           s.member_id === editingShiftInfo.member_id &&
           s.location_id === -1
    )

    if (editIncludeOffice && !editIsOther) {
      // オフィスシフトを追加または更新
      if (!officeShift) {
        updated.push({
          id: Date.now(),
          member_id: member.id,
          member_name: member.name,
          location_id: -1,
          location_name: 'オフィス',
          is_other: false,
          date: editingShiftInfo.date,
          start_time: null,
          end_time: null,
          status: '提出済み',
          created_at: new Date().toISOString()
        })
      } else {
        updated = updated.map(s =>
          s.id === officeShift.id
            ? { ...s, member_id: member.id, member_name: member.name }
            : s
        )
      }
    } else if (!editIncludeOffice && officeShift) {
      // オフィスシフトを削除
      updated = updated.filter(s => s.id !== officeShift.id)
    }

    saveShifts(updated)
    setEditingShiftInfo(null)
    alert('シフト情報を更新しました')
  }

  const cancelEditShiftInfo = () => {
    setEditingShiftInfo(null)
    setEditMember('')
    setEditLocation('')
    setEditIncludeOffice(false)
    setEditIsOther(false)
    setEditOtherActivity('')
  }

  const toggleShiftSelection = (id: number) => {
    if (selectedShiftsForDelete.includes(id)) {
      setSelectedShiftsForDelete(selectedShiftsForDelete.filter(sid => sid !== id))
    } else {
      setSelectedShiftsForDelete([...selectedShiftsForDelete, id])
    }
  }

  const selectAllShiftsInDate = (date: string) => {
    const dateShiftIds = groupedByDate[date].map((s: any) => s.id)
    const allSelected = dateShiftIds.every((id: number) => selectedShiftsForDelete.includes(id))

    if (allSelected) {
      setSelectedShiftsForDelete(selectedShiftsForDelete.filter(id => !dateShiftIds.includes(id)))
    } else {
      setSelectedShiftsForDelete([...new Set([...selectedShiftsForDelete, ...dateShiftIds])])
    }
  }

  const bulkDeleteShifts = () => {
    if (selectedShiftsForDelete.length === 0) {
      alert('削除するシフトを選択してください')
      return
    }

    if (!confirm(`選択した${selectedShiftsForDelete.length}件のシフトを削除しますか？`)) return

    const updated = shifts.filter(s => !selectedShiftsForDelete.includes(s.id))
    saveShifts(updated)
    setSelectedShiftsForDelete([])
    alert(`${selectedShiftsForDelete.length}件のシフトを削除しました`)
  }

  const reregisterFromDate = (date: string) => {
    const dateShifts = groupedByDate[date]
    if (dateShifts.length === 0) return

    // この日付の全メンバーのシフトを取得（オフィス除く）
    const uniqueMembers = Array.from(new Set(
      dateShifts
        .filter((s: any) => s.location_id !== -1)
        .map((s: any) => s.member_id)
    ))

    if (uniqueMembers.length === 0) {
      alert('この日にメンバーのシフトがありません')
      return
    }

    // 複数メンバーがいる場合は選択させる
    if (uniqueMembers.length > 1) {
      const memberNames = uniqueMembers
        .map(id => {
          const m = members.find(m => m.id === id)
          return m ? `${id}: ${m.name}` : String(id)
        })
        .join('\n')

      const selectedId = prompt(`複数のメンバーがいます。再登録するメンバーのIDを入力してください:\n\n${memberNames}`)

      if (!selectedId) return

      const memberId = Number(selectedId)
      if (!uniqueMembers.includes(memberId)) {
        alert('無効なメンバーIDです')
        return
      }

      // 選択されたメンバーのシフトのみ取得
      const memberShifts = dateShifts.filter((s: any) => s.member_id === memberId && s.location_id !== -1)

      if (memberShifts.length === 0) return

      const firstShift = memberShifts[0]
      populateFormFromShift(firstShift, date, memberShifts)
    } else {
      // 1人だけの場合は自動で設定
      const memberId = uniqueMembers[0]
      const memberShifts = dateShifts.filter((s: any) => s.member_id === memberId && s.location_id !== -1)

      if (memberShifts.length === 0) return

      const firstShift = memberShifts[0]
      populateFormFromShift(firstShift, date, memberShifts)
    }
  }

  const populateFormFromShift = (shift: any, date: string, memberShifts: any[]) => {
    setSelectedMember(String(shift.member_id))

    // オフィスシフトの有無をチェック
    const hasOffice = shifts.some(
      s => s.date === date &&
           s.member_id === shift.member_id &&
           s.location_id === -1
    )

    if (shift.is_other) {
      setIsOtherSelected(true)
      setOtherActivity(shift.location_name.replace('その他: ', ''))
      setSelectedLocation('')
      setIncludeOffice(false)
    } else {
      setIsOtherSelected(false)
      setSelectedLocation(String(shift.location_id))
      setOtherActivity('')
      setIncludeOffice(hasOffice)
    }

    setSelectedDates([date])
    setCalendarMonth(date.substring(0, 7))

    // スクロールして入力フォームを表示
    window.scrollTo({ top: 0, behavior: 'smooth' })
    alert('シフト情報を入力欄に反映しました。メンバーを変更して一括再登録できます（時間は勤怠管理から反映されます）。')
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

  // 勤怠データをシフトに反映
  const getShiftWithAttendance = (shift: any) => {
    const attendanceRecord = attendance.find(
      a => a.member_id === shift.member_id && a.date === shift.date
    )

    if (attendanceRecord && attendanceRecord.clock_in && attendanceRecord.clock_out) {
      return {
        ...shift,
        start_time: attendanceRecord.clock_in,
        end_time: attendanceRecord.clock_out,
        from_attendance: true
      }
    }

    return shift
  }

  let filteredShifts = selectedMonth
    ? shifts.filter(s => s.date.startsWith(selectedMonth))
        .map(getShiftWithAttendance)
        .sort((a, b) => a.date.localeCompare(b.date))
    : shifts.map(getShiftWithAttendance).sort((a, b) => a.date.localeCompare(b.date))

  // 個人ページの場合は自動的にフィルタリング
  if (selectedMemberId) {
    filteredShifts = filteredShifts.filter(s => s.member_id === selectedMemberId)
  }

  // メンバーフィルター適用
  if (filterMember) {
    filteredShifts = filteredShifts.filter(s => s.member_id === Number(filterMember))
  }

  // 勤務地（会社）フィルター適用
  if (filterLocation) {
    if (filterLocation === 'office') {
      filteredShifts = filteredShifts.filter(s => s.location_id === -1)
    } else if (filterLocation === 'advisor') {
      filteredShifts = filteredShifts.filter(s => s.location_id === -2)
    } else if (filterLocation === 'other') {
      filteredShifts = filteredShifts.filter(s => s.is_other === true)
    } else {
      filteredShifts = filteredShifts.filter(s => s.location_id === Number(filterLocation))
    }
  }

  // 活動種別フィルター適用（研修・その他活動）
  if (filterActivityType) {
    if (filterActivityType === 'client') {
      // クライアント先のみ（その他、オフィス、アドバイザー以外）
      filteredShifts = filteredShifts.filter(s =>
        !s.is_other && s.location_id !== -1 && s.location_id !== -2
      )
    } else if (filterActivityType === 'training') {
      // 研修のみ（その他活動で「研修」を含むもの）
      filteredShifts = filteredShifts.filter(s =>
        s.is_other === true && s.location_name && s.location_name.includes('研修')
      )
    } else if (filterActivityType === 'other') {
      // その他活動のみ（研修以外）
      filteredShifts = filteredShifts.filter(s =>
        s.is_other === true && (!s.location_name || !s.location_name.includes('研修'))
      )
    } else if (filterActivityType === 'office') {
      // オフィス出勤のみ
      filteredShifts = filteredShifts.filter(s => s.location_id === -1)
    } else if (filterActivityType === 'advisor') {
      // アドバイザーのみ
      filteredShifts = filteredShifts.filter(s => s.location_id === -2)
    }
  }

  // 日付ごとにグループ化
  const groupedByDate = filteredShifts.reduce((acc: any, shift: any) => {
    if (!acc[shift.date]) {
      acc[shift.date] = []
    }
    acc[shift.date].push(shift)
    return acc
  }, {})

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

    // フィルタリング適用
    let calendarFilteredShifts = shifts

    // 個人ページの場合はフィルタリング
    if (selectedMemberId) {
      calendarFilteredShifts = calendarFilteredShifts.filter(s => s.member_id === selectedMemberId)
    }

    // メンバーフィルター適用
    if (filterMember) {
      calendarFilteredShifts = calendarFilteredShifts.filter(s => s.member_id === Number(filterMember))
    }

    // 各日付のシフトデータを集約
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const dayShifts = calendarFilteredShifts.filter(s => s.date === dateStr)

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

  // 個人ページの場合はフィルタリング
  const displayShifts = selectedMemberId
    ? shifts.filter(s => s.member_id === selectedMemberId)
    : shifts

  return (
    <div className="section">
      <h2>📅 シフト管理{selectedMemberId && currentMemberName ? ` - ${currentMemberName}さんの個人ページ` : ''}</h2>
      {selectedMemberId && currentMemberName && (
        <div className="info-text" style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0f8ff', borderRadius: '8px' }}>
          👤 {currentMemberName}さんのシフトのみを表示しています
        </div>
      )}

      <div className="shift-registration-container">
        <div className="registration-step">
          <div className="step-number">1</div>
          <div className="step-content">
            <h3>メンバー選択</h3>
            {!selectedMemberId && (
              <select
                className="select-large"
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
              >
                <option value="">👤 メンバーを選択</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="registration-step">
          <div className="step-number">2</div>
          <div className="step-content">
            <h3>勤務タイプ</h3>
            <div className="type-selector">
              <button
                className={`type-btn ${memberType === 'resident' && !isOtherSelected ? 'active' : ''}`}
                onClick={() => {
                  setMemberType('resident')
                  setIsOtherSelected(false)
                  setSelectedLocations([])
                  setIncludeOffice(false)
                }}
              >
                <div className="type-icon">👥</div>
                <div className="type-label">クライアント先常駐</div>
              </button>
              <button
                className={`type-btn ${memberType === 'advisor' ? 'active' : ''}`}
                onClick={() => {
                  setMemberType('advisor')
                  setIsOtherSelected(false)
                  setSelectedLocations([])
                  setIncludeOffice(false)
                }}
              >
                <div className="type-icon">💼</div>
                <div className="type-label">アドバイザー</div>
              </button>
              <button
                className={`type-btn ${isOtherSelected ? 'active' : ''}`}
                onClick={() => {
                  setIsOtherSelected(true)
                  setMemberType('resident')
                  setSelectedLocations([])
                }}
              >
                <div className="type-icon">📋</div>
                <div className="type-label">その他活動</div>
              </button>
            </div>
          </div>
        </div>

        {(memberType === 'resident' || memberType === 'advisor') && !isOtherSelected && (
          <div className="registration-step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>{memberType === 'advisor' ? '関係している会社選択' : '勤務地選択'}</h3>
              <div className="location-grid">
                {locations.map(l => (
                  <button
                    key={l.id}
                    className={`location-card ${selectedLocations.includes(String(l.id)) ? 'selected' : ''}`}
                    onClick={() => {
                      if (selectedLocations.includes(String(l.id))) {
                        setSelectedLocations(selectedLocations.filter(id => id !== String(l.id)))
                      } else {
                        setSelectedLocations([...selectedLocations, String(l.id)])
                      }
                    }}
                  >
                    <div className="location-name">{l.name}</div>
                    {selectedLocations.includes(String(l.id)) && <div className="check-mark">✓</div>}
                  </button>
                ))}
              </div>
              {memberType === 'resident' && (
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={includeOffice}
                    onChange={(e) => setIncludeOffice(e.target.checked)}
                  />
                  <span>オフィスにも出勤</span>
                </label>
              )}
              {selectedLocations.length > 0 && (
                <div className="selection-count">
                  ✓ {selectedLocations.length}件の{memberType === 'advisor' ? '会社' : '勤務地'}を選択中
                </div>
              )}
            </div>
          </div>
        )}

        {isOtherSelected && (
          <div className="registration-step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>活動内容</h3>
              <input
                type="text"
                className="input-large"
                value={otherActivity}
                onChange={(e) => setOtherActivity(e.target.value)}
                placeholder="例: 新人研修、営業、資料作成、有給休暇"
              />
            </div>
          </div>
        )}
      </div>

      <div className="registration-step">
        <div className="step-number">{memberType === 'resident' && !isOtherSelected ? '4' : isOtherSelected ? '4' : '3'}</div>
        <div className="step-content">
          <h3>日付選択</h3>
          <input
            type="month"
            className="month-selector"
            value={calendarMonth}
            onChange={(e) => setCalendarMonth(e.target.value)}
          />
          <div className="quick-actions">
            <button onClick={selectWeekdays} className="quick-btn">📅 平日</button>
            <button onClick={selectWeekends} className="quick-btn">🎉 週末</button>
            <button onClick={selectAllDates} className="quick-btn">✅ 全選択</button>
            <button onClick={clearDates} className="quick-btn">🗑️ クリア</button>
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
                >
                  {day}
                </div>
              )
            })}
          </div>
          {selectedDates.length > 0 && (
            <div className="dates-summary">
              <strong>{selectedDates.length}日</strong> 選択中
            </div>
          )}
        </div>
      </div>

      <div className="submit-container">
        <button
          className="submit-btn"
          onClick={addBulkShifts}
          disabled={!selectedMember || (!isOtherSelected && selectedLocations.length === 0 && (memberType === 'resident' || memberType === 'advisor')) || (isOtherSelected && !otherActivity) || selectedDates.length === 0}
        >
          ✅ シフトを登録 {selectedDates.length > 0 && `(${selectedDates.length}日分)`}
        </button>
      </div>

      {/* シフト情報編集モーダル */}
      {editingShiftInfo && (
        <div className="modal-overlay" onClick={cancelEditShiftInfo}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>✏️ シフト情報編集</h3>
            <div className="modal-guide">
              <p><strong>元のシフト情報:</strong></p>
              <p>メンバー: {editingShiftInfo.member_name}</p>
              <p>勤務地: {editingShiftInfo.location_name}</p>
              <p>日付: {editingShiftInfo.date}</p>
            </div>

            <div className="time-edit-form">
              <div className="form-group">
                <label>メンバー <span className="required">*必須</span></label>
                <select
                  value={editMember}
                  onChange={(e) => setEditMember(e.target.value)}
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
                  value={editLocation}
                  onChange={(e) => {
                    setEditLocation(e.target.value)
                    if (e.target.value === '0') {
                      setEditIsOther(true)
                    } else {
                      setEditIsOther(false)
                    }
                  }}
                >
                  <option value="">選択してください</option>
                  {locations.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                  <option value="-1">オフィス</option>
                  <option value="0">その他</option>
                </select>
              </div>

              {editIsOther && (
                <div className="form-group">
                  <label>活動内容</label>
                  <input
                    type="text"
                    value={editOtherActivity}
                    onChange={(e) => setEditOtherActivity(e.target.value)}
                    placeholder="例: 新人研修、営業、資料作成"
                  />
                </div>
              )}

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={editIncludeOffice}
                    onChange={(e) => setEditIncludeOffice(e.target.checked)}
                    style={{ width: 'auto', marginRight: '8px' }}
                    disabled={editLocation === '-1' || editIsOther}
                  />
                  オフィスにも出勤
                </label>
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={saveEditShiftInfo} className="submit-btn">💾 保存</button>
              <button onClick={cancelEditShiftInfo} className="cancel-btn">キャンセル</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// シフト一覧表示
function ShiftListView({ selectedMemberId, currentMemberName }: { selectedMemberId: number | null, currentMemberName?: string }) {
  const [shifts, setShifts] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [attendance, setAttendance] = useState<any[]>([])
  const [selectedMonth, setSelectedMonth] = useState('')
  const [filterMember, setFilterMember] = useState('')
  const [filterLocation, setFilterLocation] = useState('')
  const [filterActivityType, setFilterActivityType] = useState('')
  const [selectedShiftsForDelete, setSelectedShiftsForDelete] = useState<number[]>([])
  const [editingShiftInfo, setEditingShiftInfo] = useState<any>(null)
  const [editMember, setEditMember] = useState('')
  const [editLocation, setEditLocation] = useState('')
  const [editIncludeOffice, setEditIncludeOffice] = useState(false)
  const [editIsOther, setEditIsOther] = useState(false)
  const [editOtherActivity, setEditOtherActivity] = useState('')

  useEffect(() => {
    loadShifts()
    loadMembers()
    loadLocations()
    loadAttendance()

    const now = new Date()
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    setSelectedMonth(monthStr)
  }, [])

  const loadShifts = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SHIFTS)
      if (stored) {
        const parsed = JSON.parse(stored)
        setShifts(Array.isArray(parsed) ? parsed : [])
      }
    } catch (error) {
      console.error('Error loading shifts:', error)
      setShifts([])
    }
  }

  const loadMembers = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.MEMBERS)
      if (stored) {
        const parsed = JSON.parse(stored)
        setMembers(Array.isArray(parsed) ? parsed : [])
      }
    } catch (error) {
      console.error('Error loading members:', error)
      setMembers([])
    }
  }

  const loadLocations = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LOCATIONS)
      if (stored) {
        const parsed = JSON.parse(stored)
        setLocations(Array.isArray(parsed) ? parsed : [])
      }
    } catch (error) {
      console.error('Error loading locations:', error)
      setLocations([])
    }
  }

  const loadAttendance = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ATTENDANCE)
      if (stored) {
        const parsed = JSON.parse(stored)
        setAttendance(Array.isArray(parsed) ? parsed : [])
      }
    } catch (error) {
      console.error('Error loading attendance:', error)
      setAttendance([])
    }
  }

  const saveShifts = (data: any[]) => {
    localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(data))
    setShifts(data)
  }

  const deleteShift = (id: number) => {
    if (!confirm('このシフトを削除しますか？')) return
    const updated = shifts.filter(s => s.id !== id)
    saveShifts(updated)
  }

  const toggleShiftSelection = (id: number) => {
    if (selectedShiftsForDelete.includes(id)) {
      setSelectedShiftsForDelete(selectedShiftsForDelete.filter(shiftId => shiftId !== id))
    } else {
      setSelectedShiftsForDelete([...selectedShiftsForDelete, id])
    }
  }

  const selectAllShiftsInDate = (date: string) => {
    const dateShifts = groupedByDate[date] || []
    const dateShiftIds = dateShifts.map((s: any) => s.id)
    const allSelected = dateShiftIds.every((id: number) => selectedShiftsForDelete.includes(id))

    if (allSelected) {
      setSelectedShiftsForDelete(selectedShiftsForDelete.filter(id => !dateShiftIds.includes(id)))
    } else {
      const newSelection = [...selectedShiftsForDelete]
      dateShiftIds.forEach((id: number) => {
        if (!newSelection.includes(id)) {
          newSelection.push(id)
        }
      })
      setSelectedShiftsForDelete(newSelection)
    }
  }

  const bulkDeleteShifts = () => {
    if (!confirm(`選択した${selectedShiftsForDelete.length}件のシフトを削除しますか？`)) return
    const updated = shifts.filter(s => !selectedShiftsForDelete.includes(s.id))
    saveShifts(updated)
    setSelectedShiftsForDelete([])
  }

  const deleteAllShifts = () => {
    if (!confirm('⚠️ 警告: すべてのシフトデータを削除しますか？この操作は取り消せません。')) return
    if (!confirm('本当にすべてのシフトを削除してもよろしいですか？')) return
    saveShifts([])
    setSelectedShiftsForDelete([])
    alert('すべてのシフトを削除しました')
  }

  const reregisterFromDate = (date: string) => {
    const dateShifts = groupedByDate[date] || []
    const uniqueMembers = Array.from(new Set(dateShifts.map((s: any) => s.member_id)))

    if (uniqueMembers.length === 0) return

    let selectedMemberForReregister
    if (uniqueMembers.length === 1) {
      selectedMemberForReregister = uniqueMembers[0]
    } else {
      const memberNames = uniqueMembers.map(memberId => {
        const shift = dateShifts.find((s: any) => s.member_id === memberId)
        return shift?.member_name || ''
      })
      const selected = prompt(`この日には複数のメンバーがいます。再登録するメンバーを選択してください:\n${memberNames.map((name, i) => `${i + 1}. ${name}`).join('\n')}\n\n番号を入力:`)
      if (!selected) return
      const index = parseInt(selected) - 1
      if (index < 0 || index >= uniqueMembers.length) {
        alert('無効な選択です')
        return
      }
      selectedMemberForReregister = uniqueMembers[index]
    }

    // シフト登録画面に移動するメッセージ
    alert(`${dateShifts.find((s: any) => s.member_id === selectedMemberForReregister)?.member_name}さんのシフトを再登録します。シフト登録タブで設定してください。`)
  }

  const openEditShiftInfo = (shift: any) => {
    setEditingShiftInfo(shift)
    setEditMember(String(shift.member_id))
    setEditLocation(String(shift.location_id))
    setEditIsOther(shift.is_other || false)
    setEditOtherActivity(shift.is_other ? shift.location_name.replace('その他: ', '') : '')
    setEditIncludeOffice(false)
  }

  const cancelEditShiftInfo = () => {
    setEditingShiftInfo(null)
    setEditMember('')
    setEditLocation('')
    setEditIncludeOffice(false)
    setEditIsOther(false)
    setEditOtherActivity('')
  }

  const saveEditShiftInfo = () => {
    if (!editMember || !editLocation) {
      alert('メンバーと勤務地を選択してください')
      return
    }

    if (editIsOther && !editOtherActivity) {
      alert('活動内容を入力してください')
      return
    }

    const member = members.find(m => m.id === Number(editMember))
    const location = locations.find(l => l.id === Number(editLocation))

    let locationName = ''
    let locationId = Number(editLocation)

    if (editIsOther) {
      locationName = `その他: ${editOtherActivity}`
      locationId = 0
    } else if (editLocation === '-1') {
      locationName = 'オフィス'
      locationId = -1
    } else {
      locationName = location?.name || ''
    }

    const updatedShift = {
      ...editingShiftInfo,
      member_id: member.id,
      member_name: member.name,
      location_id: locationId,
      location_name: locationName,
      is_other: editIsOther
    }

    let updated = shifts.map(s => s.id === editingShiftInfo.id ? updatedShift : s)

    // オフィス出勤の追加・削除
    const existingOfficeShift = shifts.find(s =>
      s.date === editingShiftInfo.date &&
      s.member_id === member.id &&
      s.location_id === -1
    )

    if (editIncludeOffice && !existingOfficeShift && editLocation !== '-1' && !editIsOther) {
      updated.push({
        id: Date.now(),
        member_id: member.id,
        member_name: member.name,
        location_id: -1,
        location_name: 'オフィス',
        is_other: false,
        date: editingShiftInfo.date,
        start_time: null,
        end_time: null,
        status: '提出済み',
        created_at: new Date().toISOString()
      })
    } else if (!editIncludeOffice && existingOfficeShift) {
      updated = updated.filter(s => s.id !== existingOfficeShift.id)
    }

    saveShifts(updated)
    cancelEditShiftInfo()
    alert('シフト情報を更新しました')
  }

  const exportCSV = () => {
    const filtered = filteredShifts
    if (filtered.length === 0) {
      alert('エクスポートするデータがありません')
      return
    }

    const header = ['メンバー', '勤務地', '日付', '開始時間', '終了時間', 'ステータス']
    const rows = filtered.map(s => [
      s.member_name,
      s.location_name,
      s.date,
      s.start_time || '',
      s.end_time || '',
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

  // 勤怠データをシフトに反映
  const getShiftWithAttendance = (shift: any) => {
    const attendanceRecord = attendance.find(
      a => a.member_id === shift.member_id && a.date === shift.date
    )

    if (attendanceRecord && attendanceRecord.clock_in && attendanceRecord.clock_out) {
      return {
        ...shift,
        start_time: attendanceRecord.clock_in,
        end_time: attendanceRecord.clock_out,
        from_attendance: true
      }
    }

    return shift
  }

  let filteredShifts = selectedMonth
    ? shifts.filter(s => s.date.startsWith(selectedMonth))
        .map(getShiftWithAttendance)
        .sort((a, b) => a.date.localeCompare(b.date))
    : shifts.map(getShiftWithAttendance).sort((a, b) => a.date.localeCompare(b.date))

  // 個人ページの場合は自動的にフィルタリング
  if (selectedMemberId) {
    filteredShifts = filteredShifts.filter(s => s.member_id === selectedMemberId)
  }

  // メンバーフィルター適用
  if (filterMember) {
    filteredShifts = filteredShifts.filter(s => s.member_id === Number(filterMember))
  }

  // 勤務地（会社）フィルター適用
  if (filterLocation) {
    if (filterLocation === 'office') {
      filteredShifts = filteredShifts.filter(s => s.location_id === -1)
    } else if (filterLocation === 'advisor') {
      filteredShifts = filteredShifts.filter(s => s.location_id === -2)
    } else if (filterLocation === 'other') {
      filteredShifts = filteredShifts.filter(s => s.is_other === true)
    } else {
      filteredShifts = filteredShifts.filter(s => s.location_id === Number(filterLocation))
    }
  }

  // 活動種別フィルター適用（研修・その他活動）
  if (filterActivityType) {
    if (filterActivityType === 'client') {
      // クライアント先のみ（その他、オフィス、アドバイザー以外）
      filteredShifts = filteredShifts.filter(s =>
        !s.is_other && s.location_id !== -1 && s.location_id !== -2
      )
    } else if (filterActivityType === 'training') {
      // 研修のみ（その他活動で「研修」を含むもの）
      filteredShifts = filteredShifts.filter(s =>
        s.is_other === true && s.location_name && s.location_name.includes('研修')
      )
    } else if (filterActivityType === 'other') {
      // その他活動のみ（研修以外）
      filteredShifts = filteredShifts.filter(s =>
        s.is_other === true && (!s.location_name || !s.location_name.includes('研修'))
      )
    } else if (filterActivityType === 'office') {
      // オフィス出勤のみ
      filteredShifts = filteredShifts.filter(s => s.location_id === -1)
    } else if (filterActivityType === 'advisor') {
      // アドバイザーのみ
      filteredShifts = filteredShifts.filter(s => s.location_id === -2)
    }
  }

  // 日付ごとにグループ化
  const groupedByDate = filteredShifts.reduce((acc: any, shift: any) => {
    if (!acc[shift.date]) {
      acc[shift.date] = []
    }
    acc[shift.date].push(shift)
    return acc
  }, {})

  // カレンダービュー生成（フィルター適用済み）
  const generateCalendarView = () => {
    if (!selectedMonth) return []

    const [year, month] = selectedMonth.split('-').map(Number)
    const firstDay = new Date(year, month - 1, 1).getDay()
    const daysInMonth = new Date(year, month, 0).getDate()

    const calendarCells = []

    // 空セルを追加
    for (let i = 0; i < firstDay; i++) {
      calendarCells.push({ isEmpty: true, key: `empty-${i}` })
    }

    // 各日のセルを追加
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      // フィルター済みのシフトから該当日のシフトを取得
      const dayShifts = filteredShifts.filter((s: any) => s.date === dateStr)

      calendarCells.push({
        date: dateStr,
        day,
        dayOfWeek: new Date(dateStr).getDay(),
        shifts: dayShifts,
        isEmpty: false,
        key: dateStr
      })
    }

    return calendarCells
  }

  const calendarView = generateCalendarView()

  // 勤務時間編集を開く
  const openEditTime = (shift: any) => {
    openEditShiftInfo(shift)
  }

  return (
    <div className="section">
      <h2>📋 シフト一覧{selectedMemberId && currentMemberName ? ` - ${currentMemberName}さんの個人ページ` : ''}</h2>
      {selectedMemberId && currentMemberName && (
        <div className="info-text" style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0f8ff', borderRadius: '8px' }}>
          👤 {currentMemberName}さんのシフトのみを表示しています
        </div>
      )}

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
          {!selectedMemberId && (
            <div className="form-group">
              <label>メンバーで絞り込み</label>
              <select
                value={filterMember}
                onChange={(e) => setFilterMember(e.target.value)}
              >
                <option value="">全メンバー</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          )}
          <div className="form-group">
            <label>会社で絞り込み</label>
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
            >
              <option value="">全勤務地</option>
              <option value="office">🏢 オフィス</option>
              <option value="advisor">💼 アドバイザー</option>
              <option value="other">📝 その他活動</option>
              {locations.map(l => (
                <option key={l.id} value={l.id}>🏢 {l.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>種別で絞り込み</label>
            <select
              value={filterActivityType}
              onChange={(e) => setFilterActivityType(e.target.value)}
            >
              <option value="">全種別</option>
              <option value="client">🏢 クライアント先</option>
              <option value="training">📚 研修</option>
              <option value="other">📝 その他活動</option>
              <option value="office">🏢 オフィス出勤</option>
              <option value="advisor">💼 アドバイザー</option>
            </select>
          </div>
          <button onClick={exportCSV} className="export-btn">📥 CSV出力</button>
        </div>
        <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={deleteAllShifts}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            🗑️ すべてのシフトを削除
          </button>
        </div>
      </div>

      {/* 一括削除セクション */}
      {selectedShiftsForDelete.length > 0 && (
        <div className="bulk-delete-section" style={{
          backgroundColor: '#fff3cd',
          border: '2px solid #ffc107',
          borderRadius: '8px',
          padding: '15px',
          margin: '20px 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <strong>✓ {selectedShiftsForDelete.length}件のシフトを選択中</strong>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setSelectedShiftsForDelete([])}
              style={{
                padding: '8px 16px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              選択解除
            </button>
            <button
              onClick={bulkDeleteShifts}
              style={{
                padding: '8px 16px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              🗑️ 一括削除
            </button>
          </div>
        </div>
      )}

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

          {calendarView && calendarView.length > 0 && calendarView.map((cell, index) => {
            if (cell.isEmpty) {
              return <div key={cell.key} className="calendar-view-cell empty"></div>
            }

            if (!cell.shifts || !Array.isArray(cell.shifts)) {
              return <div key={cell.key} className="calendar-view-cell"></div>
            }

            const isWeekend = cell.dayOfWeek === 0 || cell.dayOfWeek === 6

            // オフィス以外のシフトのみを表示対象とする
            const mainShifts = cell.shifts.filter((s: any) => s.location_id !== -1)

            // メンバーごとにグループ化
            const memberGroups: { [key: string]: { shifts: any[], hasOffice: boolean } } = {}

            cell.shifts.forEach((shift: any) => {
              const key = shift.member_name
              if (!memberGroups[key]) {
                memberGroups[key] = { shifts: [], hasOffice: false }
              }

              if (shift.location_id === -1) {
                memberGroups[key].hasOffice = true
              } else {
                memberGroups[key].shifts.push(shift)
              }
            })

            // 表示可能なメンバー（メインシフトがあるメンバー）のみフィルター
            const displayableMembers = Object.entries(memberGroups).filter(([_, data]) => data.shifts.length > 0)

            return (
              <div
                key={cell.key}
                className={`calendar-view-cell ${isWeekend ? 'weekend' : ''} ${displayableMembers.length > 0 ? 'has-shifts' : ''}`}
              >
                <div className="cell-date">
                  {cell.day}
                  {displayableMembers.length > 0 && (
                    <span className="shift-count-badge">{displayableMembers.length}</span>
                  )}
                </div>
                <div className="cell-shifts">
                  {displayableMembers.map(([memberName, data]) => {
                    const shift = data.shifts[0]
                    if (!shift) return null

                    // クライアント先ごとに色を決定
                    const colorClass = shift.is_other
                      ? 'shift-other'
                      : shift.location_id === -2
                      ? 'shift-advisor'
                      : `shift-location-${shift.location_id % 10}`

                    return (
                      <div
                        key={`${cell.date}-${memberName}`}
                        className={`mini-shift-card ${colorClass}`}
                        onClick={() => openEditTime(shift)}
                      >
                        <div className="mini-shift-member">
                          {memberName}
                          {data.hasOffice && <span className="office-badge">🏢</span>}
                        </div>
                        <div className="mini-shift-location">{shift.location_name || ''}</div>
                        {shift.start_time && shift.end_time && (
                          <div className="mini-shift-time">
                            {shift.start_time}-{shift.end_time}
                            {shift.from_attendance && <span className="attendance-badge">📊</span>}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
        {calendarView.length === 0 && (
          <p className="no-data">月を選択してください</p>
        )}
      </div>

      {/* シンプルなテーブル形式のリストビュー */}
      <div className="shift-table-view">
        <div className="table-view-header">
          <h4>📋 リスト表示（日付順）</h4>
          {selectedShiftsForDelete.length > 0 && (
            <button className="bulk-delete-btn" onClick={bulkDeleteShifts}>
              🗑️ 選択した{selectedShiftsForDelete.length}件を一括削除
            </button>
          )}
        </div>

        {Object.keys(groupedByDate).length === 0 ? (
          <p className="no-data">シフトが登録されていません</p>
        ) : (
          <div className="simple-shift-table">
            <table className="shifts-list-table">
              <thead>
                <tr>
                  <th className="col-checkbox">選択</th>
                  <th className="col-date">日付</th>
                  <th className="col-member">メンバー</th>
                  <th className="col-location">勤務地</th>
                  <th className="col-actions">操作</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(groupedByDate).sort().map((date) => {
                  const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][new Date(date).getDay()]
                  const dayClass = new Date(date).getDay() === 0 ? 'sunday' : new Date(date).getDay() === 6 ? 'saturday' : 'weekday'

                  // メンバーごとにグループ化
                  const memberGroups: { [key: string]: any[] } = {}
                  groupedByDate[date]
                    .filter((shift: any) => shift.location_id !== -1)
                    .forEach((shift: any) => {
                      if (!memberGroups[shift.member_id]) {
                        memberGroups[shift.member_id] = []
                      }
                      memberGroups[shift.member_id].push(shift)
                    })

                  // メンバーがいない日付はスキップ
                  if (Object.keys(memberGroups).length === 0) {
                    return null
                  }

                  return Object.entries(memberGroups).map(([memberId, memberShifts]: [string, any], idx: number) => {
                    const mainShift = memberShifts[0]
                    const hasOffice = shifts.some(
                      s => s.date === date &&
                           s.member_id === Number(memberId) &&
                           s.location_id === -1
                    )

                    const allLocations = [...memberShifts]
                    if (hasOffice && !mainShift.is_other && mainShift.location_id !== -2) {
                      allLocations.push({ location_name: 'オフィス出勤', location_id: -1 })
                    }

                    return (
                      <tr key={`${date}-${memberId}`} className={dayClass}>
                        <td className="col-checkbox">
                          <input
                            type="checkbox"
                            checked={memberShifts.every((s: any) => selectedShiftsForDelete.includes(s.id))}
                            onChange={() => {
                              memberShifts.forEach((s: any) => toggleShiftSelection(s.id))
                            }}
                          />
                        </td>
                        <td className={`col-date ${dayClass}`}>
                          {idx === 0 && (
                            <>
                              <div className="date-text">{date}</div>
                              <div className={`day-text ${dayClass}`}>({dayOfWeek})</div>
                            </>
                          )}
                        </td>
                        <td className="col-member">
                          <span className="member-name">{mainShift.member_name}</span>
                        </td>
                        <td className="col-location">
                          <div className="location-tags">
                            {allLocations.map((loc: any, i: number) => (
                              <span
                                key={i}
                                className={`location-tag ${
                                  loc.location_id === -1
                                    ? 'tag-office'
                                    : loc.is_other
                                    ? 'tag-other'
                                    : loc.location_id === -2
                                    ? 'tag-advisor'
                                    : `tag-location-${loc.location_id % 10}`
                                }`}
                              >
                                {loc.location_id === -1 ? '🏢' : loc.is_other ? '📝' : loc.location_id === -2 ? '💼' : '🏢'} {loc.location_name}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="col-actions">
                          <div className="action-buttons">
                            <button className="btn-edit" onClick={() => openEditShiftInfo(mainShift)} title="編集">
                              ✏️
                            </button>
                            <button className="btn-delete" onClick={() => {
                              if (confirm(`${mainShift.member_name}さんのこの日のシフトを削除しますか？`)) {
                                memberShifts.forEach((s: any) => deleteShift(s.id))
                              }
                            }} title="削除">
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* シフト情報編集モーダル */}
      {editingShiftInfo && (
        <div className="modal-overlay" onClick={cancelEditShiftInfo}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>✏️ シフト情報編集</h3>
            <div className="modal-guide">
              <p><strong>元のシフト情報:</strong></p>
              <p>メンバー: {editingShiftInfo.member_name}</p>
              <p>勤務地: {editingShiftInfo.location_name}</p>
              <p>日付: {editingShiftInfo.date}</p>
            </div>

            <div className="time-edit-form">
              <div className="form-group">
                <label>メンバー <span className="required">*必須</span></label>
                <select
                  value={editMember}
                  onChange={(e) => setEditMember(e.target.value)}
                >
                  <option value="">選択してください</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={editIsOther}
                    onChange={(e) => {
                      setEditIsOther(e.target.checked)
                      if (e.target.checked) {
                        setEditLocation('')
                        setEditIncludeOffice(false)
                      } else {
                        setEditOtherActivity('')
                      }
                    }}
                    style={{ width: 'auto', marginRight: '8px' }}
                  />
                  その他の活動（研修・営業・資料作成・休暇など）
                </label>
              </div>

              {!editIsOther ? (
                <>
                  <div className="form-group">
                    <label>クライアント先 <span className="required">*必須</span></label>
                    <select
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                    >
                      <option value="">選択してください</option>
                      {locations.map(l => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={editIncludeOffice}
                        onChange={(e) => setEditIncludeOffice(e.target.checked)}
                        style={{ width: 'auto', marginRight: '8px', cursor: 'pointer' }}
                      />
                      オフィスにも出勤する
                    </label>
                  </div>
                </>
              ) : (
                <div className="form-group">
                  <label>活動内容 <span className="required">*必須</span></label>
                  <input
                    type="text"
                    value={editOtherActivity}
                    onChange={(e) => setEditOtherActivity(e.target.value)}
                    placeholder="例: 新人研修、営業、資料作成、有給休暇"
                  />
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button onClick={saveShiftInfo} className="submit-btn">保存</button>
              <button onClick={cancelEditShiftInfo} className="cancel-btn">キャンセル</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// 勤怠管理
function AttendanceManagement({ selectedMemberId, currentMemberName }: { selectedMemberId: number | null, currentMemberName?: string }) {
  const [attendance, setAttendance] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [selectedMember, setSelectedMember] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [clockedIn, setClockedIn] = useState(false)
  const [currentEntry, setCurrentEntry] = useState<any>(null)
  const [selectedMonth, setSelectedMonth] = useState('')
  const [todayEntry, setTodayEntry] = useState<any>(null)

  useEffect(() => {
    loadAttendance()
    loadMembers()
    loadLocations()

    const now = new Date()
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    setSelectedMonth(monthStr)

    // 個人ページの場合は自動的にメンバーを選択
    if (selectedMemberId) {
      setSelectedMember(String(selectedMemberId))
    }
  }, [selectedMemberId])

  useEffect(() => {
    // メンバー選択時に、今日の出勤記録を確認
    if (selectedMember && attendance.length > 0) {
      const today = new Date().toISOString().split('T')[0]
      const entry = attendance.find(
        a => a.member_id === Number(selectedMember) && a.date === today && !a.clock_out
      )
      if (entry) {
        setTodayEntry(entry)
        setCurrentEntry(entry)
        setClockedIn(true)
        setSelectedLocation(String(entry.location_id))
      } else {
        setTodayEntry(null)
        if (!clockedIn) {
          setClockedIn(false)
          setCurrentEntry(null)
        }
      }
    }
  }, [selectedMember, attendance])

  const loadAttendance = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ATTENDANCE)
      if (stored) {
        const parsed = JSON.parse(stored)
        setAttendance(Array.isArray(parsed) ? parsed : [])
      }
    } catch (error) {
      console.error('Error loading attendance:', error)
      setAttendance([])
    }
  }

  const loadMembers = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.MEMBERS)
      if (stored) {
        const parsed = JSON.parse(stored)
        setMembers(Array.isArray(parsed) ? parsed : [])
      }
    } catch (error) {
      console.error('Error loading members:', error)
      setMembers([])
    }
  }

  const loadLocations = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LOCATIONS)
      if (stored) {
        const parsed = JSON.parse(stored)
        setLocations(Array.isArray(parsed) ? parsed : [])
      }
    } catch (error) {
      console.error('Error loading locations:', error)
      setLocations([])
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

  let filteredAttendance = selectedMonth
    ? attendance.filter(a => a.date.startsWith(selectedMonth))
    : attendance

  // 個人ページの場合はフィルタリング
  if (selectedMemberId) {
    filteredAttendance = filteredAttendance.filter(a => a.member_id === selectedMemberId)
  }

  return (
    <div className="section">
      <h2>⏰ 勤怠管理{selectedMemberId && currentMemberName ? ` - ${currentMemberName}さんの個人ページ` : ''}</h2>
      {selectedMemberId && currentMemberName && (
        <div className="info-text" style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0f8ff', borderRadius: '8px' }}>
          👤 {currentMemberName}さんの勤怠のみを表示しています
        </div>
      )}
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
          {!selectedMemberId && (
            <div className="form-group">
              <label>メンバー</label>
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
          )}

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
              <br />
              {todayEntry && <span style={{ color: '#28a745', fontWeight: 'bold' }}>💡 今日の出勤記録が見つかりました。退勤ボタンを押せます。</span>}
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
function SalaryCalculation({ selectedMemberId, currentMemberName }: { selectedMemberId: number | null, currentMemberName?: string }) {
  const [members, setMembers] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [attendance, setAttendance] = useState<any[]>([])
  const [shifts, setShifts] = useState<any[]>([])
  const [selectedMember, setSelectedMember] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [salaryData, setSalaryData] = useState<any>(null)
  const [calculationType, setCalculationType] = useState<'actual' | 'estimated'>('actual')

  useEffect(() => {
    loadMembers()
    loadLocations()
    loadAttendance()
    loadShifts()

    const now = new Date()
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    setSelectedMonth(monthStr)

    // 個人ページの場合は自動的にメンバーを選択
    if (selectedMemberId) {
      setSelectedMember(String(selectedMemberId))
    }
  }, [selectedMemberId])

  // 個人ページで自動計算
  useEffect(() => {
    if (selectedMemberId && selectedMember && selectedMonth && members.length > 0) {
      if ((calculationType === 'actual' && attendance.length > 0) || (calculationType === 'estimated' && shifts.length > 0)) {
        calculateSalary()
      }
    }
  }, [selectedMemberId, selectedMember, selectedMonth, members, attendance, shifts, calculationType])

  const loadMembers = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.MEMBERS)
      if (stored) {
        const parsed = JSON.parse(stored)
        setMembers(Array.isArray(parsed) ? parsed : [])
      }
    } catch (error) {
      console.error('Error loading members:', error)
      setMembers([])
    }
  }

  const loadLocations = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LOCATIONS)
      if (stored) {
        const parsed = JSON.parse(stored)
        setLocations(Array.isArray(parsed) ? parsed : [])
      }
    } catch (error) {
      console.error('Error loading locations:', error)
      setLocations([])
    }
  }

  const loadAttendance = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ATTENDANCE)
      if (stored) {
        const parsed = JSON.parse(stored)
        setAttendance(Array.isArray(parsed) ? parsed : [])
      }
    } catch (error) {
      console.error('Error loading attendance:', error)
      setAttendance([])
    }
  }

  const loadShifts = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SHIFTS)
      if (stored) {
        const parsed = JSON.parse(stored)
        setShifts(Array.isArray(parsed) ? parsed : [])
      }
    } catch (error) {
      console.error('Error loading shifts:', error)
      setShifts([])
    }
  }

  const calculateSalary = () => {
    if (!selectedMember || !selectedMonth) {
      alert('メンバーと月を選択してください')
      return
    }

    const member = members.find(m => m.id === Number(selectedMember))

    if (calculationType === 'actual') {
      // 実績ベース（勤怠記録）
      const records = attendance.filter(a =>
        a.member_id === Number(selectedMember) &&
        a.date.startsWith(selectedMonth) &&
        a.total_hours
      )

      if (records.length === 0) {
        alert('該当する勤怠記録がありません')
        setSalaryData(null)
        return
      }

      const breakdown: any = {}
      let totalHours = 0
      let totalSalary = 0
      let totalTransportFee = 0

      // 日付ごとにグループ化
      const dateGroups: { [key: string]: any[] } = {}
      records.forEach(record => {
        if (!dateGroups[record.date]) {
          dateGroups[record.date] = []
        }
        dateGroups[record.date].push(record)
      })

      // 各日付を処理
      Object.entries(dateGroups).forEach(([date, dayRecords]) => {
        // その日の最大交通費を計算（常駐先+オフィス出勤の場合、高い方を適用）
        let maxTransportFee = 0
        let totalDayHours = 0
        let totalDaySalary = 0
        let mainLocationName = ''

        dayRecords.forEach(record => {
          const location = locations.find(l => l.id === record.location_id)
          const locationName = record.location_name
          const hourlyWage = member.salary_type === 'hourly' ? member.hourly_wage : 0
          const hours = record.total_hours
          const salary = member.salary_type === 'hourly' ? (hours * hourlyWage) : 0

          // 交通費計算
          let transportFee = 0
          if (record.location_id === -1) {
            // オフィス
            transportFee = member.office_transport_fee || 0
          } else if (location?.type === 'client') {
            transportFee = location.member_transport_fees?.[member.id] || 0
            // メインの勤務地として記録（オフィス以外）
            if (!mainLocationName) {
              mainLocationName = locationName
            }
          }

          maxTransportFee = Math.max(maxTransportFee, transportFee)
          totalDayHours += hours
          totalDaySalary += salary
        })

        // メイン勤務地が特定できなければ最初のレコードを使用
        if (!mainLocationName) {
          mainLocationName = dayRecords[0].location_name
        }

        if (!breakdown[mainLocationName]) {
          breakdown[mainLocationName] = {
            days: 0,
            hours: 0,
            hourlyWage: member.salary_type === 'hourly' ? member.hourly_wage : 0,
            salary: 0,
            transportFee: 0,
            total: 0
          }
        }

        // 1日につき1回集計（高い方の交通費を適用）
        breakdown[mainLocationName].days += 1
        breakdown[mainLocationName].hours += totalDayHours
        breakdown[mainLocationName].salary += totalDaySalary
        breakdown[mainLocationName].transportFee += maxTransportFee
        breakdown[mainLocationName].total += totalDaySalary + maxTransportFee

        totalHours += totalDayHours
        totalSalary += totalDaySalary
        totalTransportFee += maxTransportFee
      })

      // 固定給の場合は月額を加算
      if (member.salary_type === 'fixed') {
        totalSalary = member.fixed_salary || 0
      }

      setSalaryData({
        member: member.name,
        month: selectedMonth,
        type: 'actual',
        breakdown,
        totalDays: records.length,
        totalHours,
        totalSalary,
        totalTransportFee,
        grandTotal: totalSalary + totalTransportFee
      })
    } else {
      // 予想ベース（シフト登録）
      const shiftRecords = shifts.filter(s =>
        s.member_id === Number(selectedMember) &&
        s.date.startsWith(selectedMonth)
      )

      if (shiftRecords.length === 0) {
        alert('該当するシフト登録がありません')
        setSalaryData(null)
        return
      }

      const breakdown: any = {}
      let totalDays = 0
      let totalHours = 0
      let totalSalary = 0
      let totalTransportFee = 0

      // 日付ごとに集計（複数勤務地対応）
      const dateGroups: { [key: string]: any[] } = {}
      shiftRecords.forEach(shift => {
        if (!dateGroups[shift.date]) {
          dateGroups[shift.date] = []
        }
        dateGroups[shift.date].push(shift)
      })

      // 各日付を処理
      Object.entries(dateGroups).forEach(([date, dayShifts]) => {
        totalDays += 1

        // その日の最大交通費を計算（常駐先+オフィス出勤の場合、高い方を適用）
        let maxTransportFee = 0
        let transportFeeLocations: { [key: string]: number } = {}

        dayShifts.forEach(shift => {
          const location = locations.find(l => l.id === shift.location_id)
          const locationName = shift.location_name || 'その他'

          // 交通費計算
          let transportFee = 0
          if (shift.location_id === -1) {
            // オフィス
            transportFee = member.office_transport_fee || 0
          } else if (shift.location_id === -2) {
            // アドバイザー（交通費なし）
            transportFee = 0
          } else if (shift.is_other) {
            // その他の活動（交通費なし）
            transportFee = 0
          } else if (location?.type === 'client') {
            transportFee = location.member_transport_fees?.[member.id] || 0
          }

          transportFeeLocations[locationName] = transportFee
          maxTransportFee = Math.max(maxTransportFee, transportFee)
        })

        // メインシフト（オフィス以外）を特定
        const mainShift = dayShifts.find(s => s.location_id !== -1) || dayShifts[0]
        const mainLocation = locations.find(l => l.id === mainShift.location_id)
        const mainLocationName = mainShift.location_name || 'その他'

        // 予想勤務時間（デフォルト8時間）
        const estimatedHours = 8
        const hourlyWage = member.salary_type === 'hourly' ? member.hourly_wage : 0
        const salary = member.salary_type === 'hourly' ? (estimatedHours * hourlyWage) : 0

        if (!breakdown[mainLocationName]) {
          breakdown[mainLocationName] = {
            days: 0,
            hours: 0,
            hourlyWage,
            salary: 0,
            transportFee: 0,
            total: 0
          }
        }

        // 1日につき1回集計（高い方の交通費を適用）
        breakdown[mainLocationName].days += 1
        if (member.salary_type === 'hourly') {
          breakdown[mainLocationName].hours += estimatedHours
          breakdown[mainLocationName].salary += salary
        }
        breakdown[mainLocationName].transportFee += maxTransportFee
        breakdown[mainLocationName].total += salary + maxTransportFee

        if (member.salary_type === 'hourly') {
          totalHours += estimatedHours
          totalSalary += salary
        }
        totalTransportFee += maxTransportFee
      })

      // 固定給の場合は月額を設定
      if (member.salary_type === 'fixed') {
        totalSalary = member.fixed_salary || 0
      }

      setSalaryData({
        member: member.name,
        month: selectedMonth,
        type: 'estimated',
        breakdown,
        totalDays,
        totalHours,
        totalSalary,
        totalTransportFee,
        grandTotal: totalSalary + totalTransportFee
      })
    }
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
      <h2>💰 給与計算{selectedMemberId && currentMemberName ? ` - ${currentMemberName}さんの個人ページ` : ''}</h2>
      {selectedMemberId && currentMemberName && (
        <div className="info-text" style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0f8ff', borderRadius: '8px' }}>
          👤 {currentMemberName}さんの給与のみを表示しています
        </div>
      )}
      <div className="guide-box">
        <h3>✨ 使い方</h3>
        <ol>
          <li><strong>計算タイプを選択:</strong> 実績（勤怠記録から）または 予想（シフト登録から）</li>
          <li><strong>メンバーを選択</strong>してください</li>
          <li><strong>対象月を選択</strong>してください</li>
          <li>「計算実行」ボタンをクリック</li>
          <li>勤務地別の給与・交通費が表示されます</li>
        </ol>
        <p className="note">💡 予想計算は1日8時間で自動計算します（時給制の場合）</p>
      </div>

      <div className="salary-form">
        <div className="form-row">
          <div className="form-group">
            <label>計算タイプ <span className="required">*必須</span></label>
            <div style={{ display: 'flex', gap: '15px', marginTop: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '10px 20px', border: '2px solid', borderColor: calculationType === 'actual' ? '#667eea' : '#ddd', borderRadius: '8px', background: calculationType === 'actual' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white', color: calculationType === 'actual' ? 'white' : '#333', fontWeight: calculationType === 'actual' ? 'bold' : 'normal', transition: 'all 0.3s ease' }}>
                <input
                  type="radio"
                  name="calculationType"
                  value="actual"
                  checked={calculationType === 'actual'}
                  onChange={(e) => {
                    setCalculationType('actual')
                    setSalaryData(null)
                  }}
                  style={{ marginRight: '8px', width: '18px', height: '18px', cursor: 'pointer' }}
                />
                ⏰ 実績ベース（勤怠記録）
              </label>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '10px 20px', border: '2px solid', borderColor: calculationType === 'estimated' ? '#667eea' : '#ddd', borderRadius: '8px', background: calculationType === 'estimated' ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' : 'white', color: calculationType === 'estimated' ? 'white' : '#333', fontWeight: calculationType === 'estimated' ? 'bold' : 'normal', transition: 'all 0.3s ease' }}>
                <input
                  type="radio"
                  name="calculationType"
                  value="estimated"
                  checked={calculationType === 'estimated'}
                  onChange={(e) => {
                    setCalculationType('estimated')
                    setSalaryData(null)
                  }}
                  style={{ marginRight: '8px', width: '18px', height: '18px', cursor: 'pointer' }}
                />
                📅 予想ベース（シフト登録）
              </label>
            </div>
          </div>
        </div>

        <div className="form-row">
          {!selectedMemberId && (
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
          )}

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
          <button onClick={calculateSalary} className="submit-btn">
            🧮 {calculationType === 'actual' ? '実績から計算' : 'シフトから予想計算'}
          </button>
        </div>
      </div>

      {salaryData && (
        <div className="salary-result">
          <div className="result-header">
            <h3>
              {salaryData.type === 'actual' ? '📋 給与明細（実績）' : '📊 予想給与明細（シフト登録ベース）'}
            </h3>
            <div className="export-buttons">
              <button onClick={exportCSV} className="export-btn">📥 CSV出力</button>
            </div>
          </div>

          <div className="result-summary">
            <p><strong>対象:</strong> {salaryData.member}</p>
            <p><strong>対象月:</strong> {salaryData.month}</p>
            <p><strong>計算方法:</strong> {salaryData.type === 'actual' ? '⏰ 実績ベース（打刻済み勤怠）' : '📅 予想ベース（シフト登録、1日8時間）'}</p>
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

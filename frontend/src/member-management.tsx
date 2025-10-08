import { useState, useEffect } from 'react'

const API_BASE = (import.meta as any).env.PROD ? '/api' : 'http://localhost:3001/api'

export function EnhancedMemberManagement() {
  const [members, setMembers] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [officeTransportFee, setOfficeTransportFee] = useState('')
  const [clientTransportFees, setClientTransportFees] = useState<{[key: string]: string}>({})
  const [editingMember, setEditingMember] = useState<any>(null)

  useEffect(() => {
    fetchMembers()
    fetchLocations()
  }, [])

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

  const addMember = async () => {
    if (!name) {
      alert('名前を入力してください')
      return
    }

    try {
      const transportFees: any = {
        office: parseFloat(officeTransportFee || '0')
      }

      // 各常駐先の交通費を設定
      locations.filter(l => l.type === 'client').forEach(location => {
        transportFees[location.name] = parseFloat(clientTransportFees[location.name] || '0')
      })

      const response = await fetch(`${API_BASE}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          transport_fees: transportFees
        })
      })

      if (response.ok) {
        setName('')
        setEmail('')
        setOfficeTransportFee('')
        setClientTransportFees({})
        fetchMembers()
        alert('メンバーを追加しました')
      }
    } catch (error) {
      console.error('Error adding member:', error)
      alert('メンバー追加に失敗しました')
    }
  }

  const updateMember = async () => {
    if (!editingMember) return

    try {
      const transportFees: any = {
        office: parseFloat(officeTransportFee || '0')
      }

      locations.filter(l => l.type === 'client').forEach(location => {
        transportFees[location.name] = parseFloat(clientTransportFees[location.name] || '0')
      })

      const response = await fetch(`${API_BASE}/members?id=${editingMember.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          transport_fees: transportFees
        })
      })

      if (response.ok) {
        setEditingMember(null)
        setName('')
        setEmail('')
        setOfficeTransportFee('')
        setClientTransportFees({})
        fetchMembers()
        alert('メンバー情報を更新しました')
      }
    } catch (error) {
      console.error('Error updating member:', error)
      alert('更新に失敗しました')
    }
  }

  const editMember = (member: any) => {
    setEditingMember(member)
    setName(member.name)
    setEmail(member.email || '')
    setOfficeTransportFee((member.transport_fees?.office || 0).toString())

    const fees: {[key: string]: string} = {}
    locations.filter(l => l.type === 'client').forEach(location => {
      fees[location.name] = (member.transport_fees?.[location.name] || 0).toString()
    })
    setClientTransportFees(fees)
  }

  const cancelEdit = () => {
    setEditingMember(null)
    setName('')
    setEmail('')
    setOfficeTransportFee('')
    setClientTransportFees({})
  }

  const deleteMember = async (id: number) => {
    if (!confirm('このメンバーを削除しますか？')) return

    try {
      const response = await fetch(`${API_BASE}/members?id=${id}`, { method: 'DELETE' })
      if (response.ok) {
        fetchMembers()
        alert('メンバーを削除しました')
      }
    } catch (error) {
      console.error('Error deleting member:', error)
      alert('削除に失敗しました')
    }
  }

  const updateClientTransportFee = (locationName: string, value: string) => {
    setClientTransportFees({
      ...clientTransportFees,
      [locationName]: value
    })
  }

  const clientLocations = locations.filter(l => l.type === 'client')

  return (
    <div className="section">
      <h2>{editingMember ? 'メンバー編集' : 'メンバー登録'}</h2>

      <div className="member-form">
        <div className="form-group">
          <label>名前 *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="山田太郎"
          />
        </div>

        <div className="form-group">
          <label>メールアドレス</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@example.com"
          />
        </div>

        <div className="transport-fees-section">
          <h3>交通費設定</h3>

          <div className="form-group">
            <label>オフィスまでの交通費（円/日）</label>
            <input
              type="number"
              value={officeTransportFee}
              onChange={(e) => setOfficeTransportFee(e.target.value)}
              placeholder="500"
            />
          </div>

          {clientLocations.length > 0 && (
            <>
              <h4>常駐先ごとの交通費（円/日）</h4>
              {clientLocations.map(location => (
                <div key={location.id} className="form-group client-transport">
                  <label>{location.name}</label>
                  <input
                    type="number"
                    value={clientTransportFees[location.name] || ''}
                    onChange={(e) => updateClientTransportFee(location.name, e.target.value)}
                    placeholder="1000"
                  />
                </div>
              ))}
            </>
          )}
        </div>

        <div className="form-actions">
          {editingMember ? (
            <>
              <button onClick={updateMember} className="submit-btn">更新</button>
              <button onClick={cancelEdit} className="cancel-btn">キャンセル</button>
            </>
          ) : (
            <button onClick={addMember} className="submit-btn">メンバー追加</button>
          )}
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
              {clientLocations.map(loc => (
                <th key={loc.id}>{loc.name}<br/>交通費</th>
              ))}
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id}>
                <td><strong>{member.name}</strong></td>
                <td>{member.email || '-'}</td>
                <td>¥{(member.transport_fees?.office || 0).toLocaleString('ja-JP')}</td>
                {clientLocations.map(loc => (
                  <td key={loc.id}>
                    ¥{(member.transport_fees?.[loc.name] || 0).toLocaleString('ja-JP')}
                  </td>
                ))}
                <td>
                  <button className="edit-btn" onClick={() => editMember(member)}>編集</button>
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

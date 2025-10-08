import { useState, useEffect } from 'react'

const API_BASE = (import.meta as any).env.PROD ? '/api' : 'http://localhost:3001/api'

// メンバー管理 - オフィス交通費のみ
export function SimpleMemberManagement() {
  const [members, setMembers] = useState<any[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [officeTransportFee, setOfficeTransportFee] = useState('')
  const [editingMember, setEditingMember] = useState<any>(null)

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      console.log('Fetching members from:', `${API_BASE}/members`)
      const response = await fetch(`${API_BASE}/members`)
      const data = await response.json()
      console.log('Fetched members:', data)
      setMembers(data)
    } catch (error) {
      console.error('Error fetching members:', error)
    }
  }

  const addMember = async () => {
    if (!name) {
      alert('名前を入力してください')
      return
    }

    try {
      console.log('Adding member:', { name, email, office_transport_fee: parseFloat(officeTransportFee || '0') })
      const response = await fetch(`${API_BASE}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          office_transport_fee: parseFloat(officeTransportFee || '0')
        })
      })

      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)

      if (response.ok) {
        setName('')
        setEmail('')
        setOfficeTransportFee('')
        await fetchMembers()
        alert('メンバーを追加しました')
      } else {
        alert(`エラー: ${data.error || '追加に失敗しました'}`)
      }
    } catch (error) {
      console.error('Error adding member:', error)
      alert(`メンバー追加に失敗しました: ${error}`)
    }
  }

  const updateMember = async () => {
    if (!editingMember) return

    try {
      const response = await fetch(`${API_BASE}/members?id=${editingMember.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          office_transport_fee: parseFloat(officeTransportFee || '0')
        })
      })

      if (response.ok) {
        setEditingMember(null)
        setName('')
        setEmail('')
        setOfficeTransportFee('')
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
    setOfficeTransportFee((member.office_transport_fee || 0).toString())
  }

  const cancelEdit = () => {
    setEditingMember(null)
    setName('')
    setEmail('')
    setOfficeTransportFee('')
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

  return (
    <div className="section">
      <h2>{editingMember ? 'メンバー編集' : 'メンバー登録'}</h2>
      <p className="info-text">※ 常駐先への交通費は「常駐先管理」で設定します</p>

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

        <div className="form-group">
          <label>オフィスまでの交通費（円/日）</label>
          <input
            type="number"
            value={officeTransportFee}
            onChange={(e) => setOfficeTransportFee(e.target.value)}
            placeholder="500"
          />
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

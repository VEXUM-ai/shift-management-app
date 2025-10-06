import { useState, useEffect } from 'react'
import { getMembers as getMembersFromStorage, setMembers as setMembersToStorage } from './utils/storage'

// メンバー管理 - LocalStorage使用版
export function SimpleMemberManagement() {
  const [members, setMembersState] = useState<any[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [officeTransportFee, setOfficeTransportFee] = useState('')
  const [editingMember, setEditingMember] = useState<any>(null)

  useEffect(() => {
    loadMembers()
  }, [])

  const loadMembers = () => {
    const data = getMembersFromStorage()
    console.log('Loaded members:', data)
    setMembersState(data)
  }

  const addMember = () => {
    if (!name) {
      alert('名前を入力してください')
      return
    }

    const currentMembers = getMembersFromStorage()
    const newMember = {
      id: Date.now(),
      name,
      email,
      office_transport_fee: parseFloat(officeTransportFee || '0'),
      created_at: new Date().toISOString()
    }

    currentMembers.push(newMember)
    setMembersToStorage(currentMembers)
    console.log('Added member:', newMember)
    console.log('Total members:', currentMembers.length)

    setName('')
    setEmail('')
    setOfficeTransportFee('')
    loadMembers()
    alert('メンバーを追加しました')
  }

  const updateMember = () => {
    if (!editingMember) return

    const currentMembers = getMembersFromStorage()
    const index = currentMembers.findIndex((m: any) => m.id === editingMember.id)

    if (index !== -1) {
      currentMembers[index] = {
        ...currentMembers[index],
        name,
        email,
        office_transport_fee: parseFloat(officeTransportFee || '0'),
        updated_at: new Date().toISOString()
      }
      setMembersToStorage(currentMembers)

      setEditingMember(null)
      setName('')
      setEmail('')
      setOfficeTransportFee('')
      loadMembers()
      alert('メンバー情報を更新しました')
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

  const deleteMember = (id: number) => {
    if (!confirm('このメンバーを削除しますか？')) return

    const currentMembers = getMembersFromStorage()
    const filtered = currentMembers.filter((m: any) => m.id !== id)
    setMembersToStorage(filtered)
    loadMembers()
    alert('メンバーを削除しました')
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

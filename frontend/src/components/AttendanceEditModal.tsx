import React, { useState, useEffect } from 'react';
import '../styles/AttendanceEditModal.css';

interface Meeting {
  id: string;
  clientName: string;
  startTime: string;
  endTime: string;
  purpose?: string;
}

interface AttendanceEditModalProps {
  isOpen: boolean;
  memberName: string;
  date: string;
  initialResidenceStartTime?: string;
  initialResidenceClient?: string;
  initialMeetings?: Meeting[];
  initialMemo?: string;
  onSave: (data: {
    residenceStartTime?: string;
    residenceClient?: string;
    meetings: Meeting[];
    memo?: string;
  }) => void;
  onClose: () => void;
}

const AttendanceEditModal: React.FC<AttendanceEditModalProps> = ({
  isOpen,
  memberName,
  date,
  initialResidenceStartTime,
  initialResidenceClient,
  initialMeetings,
  initialMemo,
  onSave,
  onClose
}) => {
  // 常駐勤務
  const [residenceStartTime, setResidenceStartTime] = useState(initialResidenceStartTime || '');
  const [residenceClient, setResidenceClient] = useState(initialResidenceClient || '');

  // ミーティング
  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings || []);
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [newMeetingClient, setNewMeetingClient] = useState('');
  const [newMeetingStartTime, setNewMeetingStartTime] = useState('');
  const [newMeetingEndTime, setNewMeetingEndTime] = useState('');
  const [newMeetingPurpose, setNewMeetingPurpose] = useState('');

  // メモ
  const [memo, setMemo] = useState(initialMemo || '');

  useEffect(() => {
    if (isOpen) {
      setResidenceStartTime(initialResidenceStartTime || '');
      setResidenceClient(initialResidenceClient || '');
      setMeetings(initialMeetings || []);
      setMemo(initialMemo || '');
    }
  }, [isOpen, initialResidenceStartTime, initialResidenceClient, initialMeetings, initialMemo]);

  /**
   * 常駐勤務の終了時刻を自動計算（開始時刻 + 5時間）
   * @param startTime - 開始時刻（HH:MM形式）
   * @returns 終了時刻（HH:MM形式）
   */
  const calculateEndTime = (startTime: string): string => {
    if (!startTime) return '';
    const [hours, minutes] = startTime.split(':').map(Number);
    const endHours = hours + 5; // 固定5時間
    return `${String(endHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  /**
   * ミーティングを追加
   */
  const handleAddMeeting = () => {
    // バリデーション
    if (!newMeetingClient || !newMeetingStartTime || !newMeetingEndTime) {
      alert('クライアント名、開始時刻、終了時刻は必須です');
      return;
    }

    // 新しいミーティングを作成
    const newMeeting: Meeting = {
      id: Date.now().toString(),
      clientName: newMeetingClient,
      startTime: newMeetingStartTime,
      endTime: newMeetingEndTime,
      purpose: newMeetingPurpose || undefined
    };

    // ミーティングリストに追加してフォームをリセット
    setMeetings([...meetings, newMeeting]);
    setNewMeetingClient('');
    setNewMeetingStartTime('');
    setNewMeetingEndTime('');
    setNewMeetingPurpose('');
    setShowMeetingForm(false);
  };

  /**
   * ミーティングを削除
   * @param meetingId - 削除するミーティングのID
   */
  const handleRemoveMeeting = (meetingId: string) => {
    setMeetings(meetings.filter(m => m.id !== meetingId));
  };

  /**
   * すべての変更を保存
   */
  const handleSave = () => {
    onSave({
      residenceStartTime: residenceStartTime || undefined,
      residenceClient: residenceClient || undefined,
      meetings,
      memo: memo || undefined
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content attendance-edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📅 出勤予定編集</h3>
          <button className="modal-close" onClick={onClose} aria-label="閉じる">
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="edit-info">
            <p><strong>メンバー:</strong> {memberName}</p>
            <p><strong>日付:</strong> {date}</p>
          </div>

          {/* 常駐勤務セクション */}
          <section className="edit-section">
            <h4>🏢 常駐勤務（固定5時間）</h4>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="residenceClient">常駐先クライアント</label>
                <input
                  id="residenceClient"
                  type="text"
                  value={residenceClient}
                  onChange={(e) => setResidenceClient(e.target.value)}
                  placeholder="例: 株式会社ABC"
                />
              </div>

              <div className="form-group">
                <label htmlFor="residenceStartTime">開始時刻</label>
                <input
                  id="residenceStartTime"
                  type="time"
                  value={residenceStartTime}
                  onChange={(e) => setResidenceStartTime(e.target.value)}
                />
              </div>

              {residenceStartTime && (
                <div className="form-group">
                  <label>終了時刻（自動計算）</label>
                  <div className="calculated-time">
                    {calculateEndTime(residenceStartTime)}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ミーティングセクション */}
          <section className="edit-section">
            <div className="section-header">
              <h4>📅 個別ミーティング</h4>
              <button
                className="btn-add-meeting"
                onClick={() => setShowMeetingForm(!showMeetingForm)}
                type="button"
              >
                {showMeetingForm ? '✕ キャンセル' : '+ ミーティング追加'}
              </button>
            </div>

            {/* ミーティング追加フォーム */}
            {showMeetingForm && (
              <div className="meeting-form">
                <div className="form-group">
                  <label htmlFor="meetingClient">クライアント先 <span className="required">*</span></label>
                  <input
                    id="meetingClient"
                    type="text"
                    value={newMeetingClient}
                    onChange={(e) => setNewMeetingClient(e.target.value)}
                    placeholder="例: 株式会社XYZ"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="meetingStartTime">開始時刻 <span className="required">*</span></label>
                    <input
                      id="meetingStartTime"
                      type="time"
                      value={newMeetingStartTime}
                      onChange={(e) => setNewMeetingStartTime(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="meetingEndTime">終了時刻 <span className="required">*</span></label>
                    <input
                      id="meetingEndTime"
                      type="time"
                      value={newMeetingEndTime}
                      onChange={(e) => setNewMeetingEndTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="meetingPurpose">目的・内容</label>
                  <textarea
                    id="meetingPurpose"
                    value={newMeetingPurpose}
                    onChange={(e) => setNewMeetingPurpose(e.target.value)}
                    placeholder="例: 月次報告会議"
                    rows={2}
                  />
                </div>

                <button
                  className="btn-primary"
                  onClick={handleAddMeeting}
                  type="button"
                >
                  ミーティングを追加
                </button>
              </div>
            )}

            {/* ミーティングリスト */}
            {meetings.length > 0 && (
              <div className="meetings-list">
                {meetings.map((meeting) => (
                  <div key={meeting.id} className="meeting-item">
                    <div className="meeting-info">
                      <div className="meeting-client">{meeting.clientName}</div>
                      <div className="meeting-time">
                        {meeting.startTime} - {meeting.endTime}
                      </div>
                      {meeting.purpose && (
                        <div className="meeting-purpose">{meeting.purpose}</div>
                      )}
                    </div>
                    <button
                      className="btn-remove"
                      onClick={() => handleRemoveMeeting(meeting.id)}
                      type="button"
                      aria-label="削除"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* メモセクション */}
          <section className="edit-section">
            <h4>📝 メモ</h4>
            <div className="form-group">
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="補足情報があれば記入してください"
                rows={3}
              />
            </div>
          </section>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose} type="button">
            キャンセル
          </button>
          <button className="btn-primary" onClick={handleSave} type="button">
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceEditModal;

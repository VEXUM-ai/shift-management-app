import React, { useState } from 'react';
import '../styles/AttendanceTable.css';

interface Member {
  id: string;
  name: string;
  department: string;
  avatar?: string;
}

// 個別ミーティング
interface Meeting {
  id: string;
  clientName: string; // クライアント先名
  startTime: string;
  endTime: string;
  purpose?: string; // 目的・内容
}

// 出勤記録
interface AttendanceRecord {
  memberId: string;
  date: string;
  status: 'office' | 'remote' | 'off';

  // 常駐勤務（固定5時間）
  residenceStartTime?: string; // 例: "10:00"
  residenceEndTime?: string;   // 例: "15:00" (自動計算: 開始+5時間)
  residenceClient?: string;     // 常駐先クライアント名

  // 個別ミーティング（複数可）
  meetings?: Meeting[];

  memo?: string;
}

interface AttendanceTableProps {
  members: Member[];
  records: AttendanceRecord[];
  weekDates: string[]; // ['2025-10-13', '2025-10-14', ...]
  onEditAttendance?: (memberId: string, date: string) => void;
  onAddMeeting?: (memberId: string, date: string, meeting: Meeting) => void;
}

const AttendanceTable: React.FC<AttendanceTableProps> = ({
  members,
  records,
  weekDates,
  onEditAttendance
}) => {
  // 表示モード: 日別（スマホ向け）or 週間（PC向け）
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');

  // 選択中の日付（日別表示用）
  const [selectedDate, setSelectedDate] = useState(weekDates[2] || weekDates[0]);

  /**
   * ステータスバッジの情報を取得
   * @param status - 出勤ステータス
   * @returns アイコン、テキスト、CSSクラス
   */
  const getStatusInfo = (status: 'office' | 'remote' | 'off') => {
    const statusMap = {
      office: { text: '出勤', icon: '🏢', className: 'status-badge--office' },
      remote: { text: '在宅', icon: '🏠', className: 'status-badge--remote' },
      off: { text: '休暇', icon: '🌴', className: 'status-badge--off' }
    };
    return statusMap[status];
  };

  /**
   * 日付を読みやすい形式にフォーマット
   * @param dateStr - YYYY-MM-DD形式の日付
   * @returns 月曜日 10/13 の形式
   */
  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const weekday = weekdays[date.getDay()];
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${weekday}曜日 ${month}/${day}`;
  };

  /**
   * 特定のメンバーと日付の出勤記録を取得
   * @param memberId - メンバーID
   * @param date - 日付
   * @returns 出勤記録（なければundefined）
   */
  const getAttendanceRecord = (memberId: string, date: string) => {
    return records.find(r => r.memberId === memberId && r.date === date);
  };

  // 日別表示用：選択された日付のメンバーカード
  const renderDailyView = () => {
    const filteredRecords = records.filter(r => r.date === selectedDate);

    return (
      <div className="daily-view">
        {/* 日付選択 */}
        <div className="date-selector">
          <label htmlFor="dateSelect" className="date-selector__label">
            表示日を選択
          </label>
          <select
            id="dateSelect"
            className="date-selector__select"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          >
            {weekDates.map(date => (
              <option key={date} value={date}>
                {formatDateLabel(date)}
              </option>
            ))}
          </select>
        </div>

        {/* メンバーカード一覧 */}
        <div className="member-cards">
          {members.map(member => {
            const record = getAttendanceRecord(member.id, selectedDate);
            const statusInfo = record ? getStatusInfo(record.status) : null;

            return (
              <div key={member.id} className="member-card">
                {/* カードヘッダー */}
                <div className="member-card__header">
                  <div className="member-card__avatar" aria-hidden="true">
                    {member.avatar || '👤'}
                  </div>
                  <div className="member-card__info">
                    <h3 className="member-card__name">{member.name}</h3>
                    <p className="member-card__dept">{member.department}</p>
                  </div>
                  {statusInfo && (
                    <div className="member-card__status">
                      <span className={`status-badge ${statusInfo.className}`}>
                        <span className="status-badge__icon">{statusInfo.icon}</span>
                        <span className="status-badge__text">{statusInfo.text}</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* カード本体 */}
                {record && (
                  <div className="member-card__body">
                    <dl className="member-card__details">
                      {/* 常駐勤務 */}
                      {record.residenceStartTime && (
                        <>
                          <dt>🏢 常駐勤務</dt>
                          <dd>
                            <strong>{record.residenceClient || '未設定'}</strong>
                            <br />
                            {record.residenceStartTime} - {record.residenceEndTime} (5時間)
                          </dd>
                        </>
                      )}

                      {/* 個別ミーティング */}
                      {record.meetings && record.meetings.length > 0 && (
                        <>
                          <dt>📅 個別MTG ({record.meetings.length}件)</dt>
                          <dd>
                            {record.meetings.map((meeting) => (
                              <div key={meeting.id} style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid #e5e7eb' }}>
                                <strong>{meeting.clientName}</strong>
                                <br />
                                {meeting.startTime} - {meeting.endTime}
                                {meeting.purpose && (
                                  <>
                                    <br />
                                    <span style={{ fontSize: '0.85em', color: '#667085' }}>{meeting.purpose}</span>
                                  </>
                                )}
                              </div>
                            ))}
                          </dd>
                        </>
                      )}

                      {record.memo && (
                        <>
                          <dt>📝 メモ</dt>
                          <dd>{record.memo}</dd>
                        </>
                      )}

                      {!record.residenceStartTime && (!record.meetings || record.meetings.length === 0) && !record.memo && (
                        <>
                          <dt>備考</dt>
                          <dd className="text-muted">予定なし</dd>
                        </>
                      )}
                    </dl>
                  </div>
                )}

                {/* カードフッター */}
                <div className="member-card__footer">
                  <button
                    type="button"
                    className="btn-icon"
                    onClick={() => onEditAttendance?.(member.id, selectedDate)}
                    aria-label={`${member.name}の予定を編集`}
                  >
                    <span className="btn-icon__icon">✏️</span>
                    <span className="btn-icon__text">編集</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // 週間表示用：テーブル形式
  const renderWeeklyView = () => {
    return (
      <div className="weekly-view">
        <div className="table-wrapper">
          <table className="attendance-table" role="table" aria-label="週間出勤表">
            <thead>
              <tr>
                <th scope="col" className="th-member">メンバー</th>
                <th scope="col" className="th-dept">部署</th>
                {weekDates.map(date => (
                  <th key={date} scope="col" className="th-date">
                    {formatDateLabel(date).replace('曜日 ', ' ')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.map(member => (
                <tr key={member.id}>
                  <td data-label="メンバー" className="td-member">
                    <strong>{member.name}</strong>
                  </td>
                  <td data-label="部署" className="td-dept">
                    {member.department}
                  </td>
                  {weekDates.map(date => {
                    const record = getAttendanceRecord(member.id, date);
                    const statusInfo = record ? getStatusInfo(record.status) : null;

                    return (
                      <td key={date} data-label={formatDateLabel(date)} className="td-status">
                        {record ? (
                          <div style={{ fontSize: '0.75rem' }}>
                            {statusInfo && (
                              <span className={`status-tag ${statusInfo.className}`} style={{ marginBottom: '4px', display: 'inline-block' }}>
                                <span className="status-tag__icon">{statusInfo.icon}</span>
                                <span className="status-tag__text">{statusInfo.text}</span>
                              </span>
                            )}
                            {record.residenceStartTime && (
                              <div style={{ marginTop: '2px', color: '#0e9f6e', fontWeight: '600' }}>
                                🏢 {record.residenceStartTime}〜
                              </div>
                            )}
                            {record.meetings && record.meetings.length > 0 && (
                              <div style={{ marginTop: '2px', color: '#0ea5e9', fontWeight: '600' }}>
                                📅 MTG×{record.meetings.length}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="status-tag status-tag--empty">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="attendance-container">
      {/* タイトル */}
      <div className="attendance-header">
        <h2 className="attendance-title">📅 オフィス出勤表</h2>
        <p className="attendance-description">
          スマホでは日別表示、PCでは週間表示がおすすめです
        </p>
      </div>

      {/* 表示切替タブ */}
      <div className="view-toggle" role="tablist" aria-label="表示切替">
        <button
          type="button"
          className={`view-toggle__btn ${viewMode === 'daily' ? 'view-toggle__btn--active' : ''}`}
          role="tab"
          aria-selected={viewMode === 'daily'}
          onClick={() => setViewMode('daily')}
        >
          <span className="view-toggle__icon">📱</span>
          <span className="view-toggle__text">日別表示</span>
        </button>
        <button
          type="button"
          className={`view-toggle__btn ${viewMode === 'weekly' ? 'view-toggle__btn--active' : ''}`}
          role="tab"
          aria-selected={viewMode === 'weekly'}
          onClick={() => setViewMode('weekly')}
        >
          <span className="view-toggle__icon">🖥️</span>
          <span className="view-toggle__text">週間表示</span>
        </button>
      </div>

      {/* コンテンツ表示 */}
      <div className="view-content">
        {viewMode === 'daily' ? renderDailyView() : renderWeeklyView()}
      </div>

      {/* サマリー */}
      <div className="attendance-summary">
        <h3 className="attendance-summary__title">今週の出勤状況サマリー</h3>
        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-card__icon" aria-hidden="true">🏢</div>
            <div className="summary-card__content">
              <div className="summary-card__value">
                {records.filter(r => r.status === 'office').length}
              </div>
              <div className="summary-card__label">出勤</div>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-card__icon" aria-hidden="true">🏠</div>
            <div className="summary-card__content">
              <div className="summary-card__value">
                {records.filter(r => r.status === 'remote').length}
              </div>
              <div className="summary-card__label">在宅勤務</div>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-card__icon" aria-hidden="true">🌴</div>
            <div className="summary-card__content">
              <div className="summary-card__value">
                {records.filter(r => r.status === 'off').length}
              </div>
              <div className="summary-card__label">休暇</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTable;

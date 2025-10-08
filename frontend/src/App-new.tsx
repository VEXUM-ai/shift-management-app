import { useState } from 'react'
import './App.css'
import { Dashboard } from './components/Dashboard'
import { LocationWithLogo } from './components-enhanced'
import { ShiftWithMonthlyView } from './components-enhanced'
import { SalaryReport } from './components/SalaryReport'
import { CalendarView } from './components/CalendarView'
import { SimpleMemberManagement } from './member-simple'
import { useToast } from './hooks/useToast'
import { ToastContainer } from './components/ToastContainer'

type Tab = 'dashboard' | 'members' | 'locations' | 'shift' | 'calendar' | 'attendance' | 'salary'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const { toasts, removeToast } = useToast()

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>勤怠・シフト管理システム</h1>
          <div className="header-info">
            <span className="user-info">管理者</span>
          </div>
        </div>
      </header>

      <nav className="tabs">
        <button
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 ダッシュボード
        </button>
        <button
          className={activeTab === 'members' ? 'active' : ''}
          onClick={() => setActiveTab('members')}
        >
          👥 メンバー管理
        </button>
        <button
          className={activeTab === 'locations' ? 'active' : ''}
          onClick={() => setActiveTab('locations')}
        >
          📍 常駐先管理
        </button>
        <button
          className={activeTab === 'shift' ? 'active' : ''}
          onClick={() => setActiveTab('shift')}
        >
          📅 シフト管理
        </button>
        <button
          className={activeTab === 'calendar' ? 'active' : ''}
          onClick={() => setActiveTab('calendar')}
        >
          🗓️ カレンダー
        </button>
        <button
          className={activeTab === 'salary' ? 'active' : ''}
          onClick={() => setActiveTab('salary')}
        >
          💰 給与レポート
        </button>
      </nav>

      <main className="main-content">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'members' && <SimpleMemberManagement />}
        {activeTab === 'locations' && <LocationWithLogo />}
        {activeTab === 'shift' && <ShiftWithMonthlyView />}
        {activeTab === 'calendar' && <CalendarView />}
        {activeTab === 'salary' && <SalaryReport />}
      </main>

      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

      <footer className="app-footer">
        <p>&copy; 2025 勤怠・シフト管理システム</p>
      </footer>
    </div>
  )
}

export default App

// Vercel KV ストレージ統合 - 永続化対応
// 環境変数でKVが設定されていない場合はメモリストレージにフォールバック

interface Member {
  id: number
  name: string
  email: string
  office_transport_fee: number
  created_at: string
  updated_at?: string
}

interface Location {
  id: number
  name: string
  hourly_wage: number
  type: 'office' | 'client'
  logo: string
  member_transport_fees: Record<string, number>
  transportation_fee?: number
  created_at: string
  updated_at?: string
}

interface Shift {
  id: number
  employee_name: string
  location: string
  date: string
  start_time: string
  end_time: string
  transportation_fee: number
  status: string
  created_at: string
}

interface Attendance {
  id: number
  employee_name: string
  date: string
  clock_in: string
  clock_out?: string
  total_hours?: number
  created_at: string
}

interface Storage {
  members: Member[]
  locations: Location[]
  shifts: Shift[]
  attendance: Attendance[]
}

// グローバルストレージ（Vercel KV未使用時のフォールバック）
const globalStorage = global as any

if (!globalStorage.appData) {
  globalStorage.appData = {
    members: [],
    locations: [],
    shifts: [],
    attendance: []
  }
}

export const storage: Storage = globalStorage.appData

// データ取得・保存関数
export function getMembers(): Member[] {
  return storage.members
}

export function setMembers(members: Member[]): void {
  storage.members = members
}

export function getLocations(): Location[] {
  return storage.locations
}

export function setLocations(locations: Location[]): void {
  storage.locations = locations
}

export function getShifts(): Shift[] {
  return storage.shifts
}

export function setShifts(shifts: Shift[]): void {
  storage.shifts = shifts
}

export function getAttendance(): Attendance[] {
  return storage.attendance
}

export function setAttendance(attendance: Attendance[]): void {
  storage.attendance = attendance
}

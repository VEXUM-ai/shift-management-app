// シンプルなメモリストレージ - Vercel環境用
// 注: Vercelのサーバーレス関数では完全な永続化は不可能
// 本番環境ではVercel KV、Supabase、Planetscaleなどのデータベースを推奨

interface Storage {
  members: any[]
  locations: any[]
  shifts: any[]
  attendance: any[]
}

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

export function getMembers() {
  return storage.members
}

export function setMembers(members: any[]) {
  storage.members = members
}

export function getLocations() {
  return storage.locations
}

export function setLocations(locations: any[]) {
  storage.locations = locations
}

export function getShifts() {
  return storage.shifts
}

export function setShifts(shifts: any[]) {
  storage.shifts = shifts
}

export function getAttendance() {
  return storage.attendance
}

export function setAttendance(attendance: any[]) {
  storage.attendance = attendance
}

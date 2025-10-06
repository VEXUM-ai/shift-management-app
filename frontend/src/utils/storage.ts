// LocalStorage ベースのデータ管理

export const StorageKeys = {
  MEMBERS: 'shift_app_members',
  LOCATIONS: 'shift_app_locations',
  SHIFTS: 'shift_app_shifts',
  ATTENDANCE: 'shift_app_attendance'
}

export function getMembers() {
  try {
    const data = localStorage.getItem(StorageKeys.MEMBERS)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function setMembers(members: any[]) {
  localStorage.setItem(StorageKeys.MEMBERS, JSON.stringify(members))
}

export function getLocations() {
  try {
    const data = localStorage.getItem(StorageKeys.LOCATIONS)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function setLocations(locations: any[]) {
  localStorage.setItem(StorageKeys.LOCATIONS, JSON.stringify(locations))
}

export function getShifts() {
  try {
    const data = localStorage.getItem(StorageKeys.SHIFTS)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function setShifts(shifts: any[]) {
  localStorage.setItem(StorageKeys.SHIFTS, JSON.stringify(shifts))
}

export function getAttendance() {
  try {
    const data = localStorage.getItem(StorageKeys.ATTENDANCE)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function setAttendance(attendance: any[]) {
  localStorage.setItem(StorageKeys.ATTENDANCE, JSON.stringify(attendance))
}

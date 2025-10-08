// 型定義

export interface Member {
  id: number
  name: string
  email: string
  office_transport_fee: number
  created_at?: string
  updated_at?: string
}

export interface Location {
  id: number
  name: string
  hourly_wage: number
  type: 'office' | 'client'
  logo?: string
  transportation_fee?: number
  member_transport_fees?: Record<string, number>
  created_at?: string
  updated_at?: string
}

export interface Shift {
  id: number
  employee_name: string
  member_id?: number
  member_name?: string
  location: string
  location_id?: number
  location_name?: string
  date: string
  start_time: string
  end_time: string
  transportation_fee?: number
  status: string
  is_other?: boolean
  from_attendance?: boolean
  created_at?: string
  updated_at?: string
}

export interface Attendance {
  id: number
  employee_name: string
  member_id?: number
  date: string
  clock_in: string
  clock_out?: string
  total_hours?: number
  created_at?: string
  updated_at?: string
}

export interface BulkShiftRow {
  date: string
  startTime: string
  endTime: string
  member: string
  location: string
  transportationFee: string
}

export type Tab = 'members' | 'locations' | 'shift' | 'shiftlist' | 'attendance' | 'salary'
export type UserRole = 'admin' | 'member'

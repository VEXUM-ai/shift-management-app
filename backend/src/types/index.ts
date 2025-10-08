import { Request } from 'express'

export interface User {
  id: number
  name: string
  email: string
  password: string
  is_admin: boolean
  office_transport_fee: number
  salary_type: 'hourly' | 'fixed'
  hourly_wage: number
  fixed_salary: number
  created_at: string
  last_login?: string
}

export interface UserResponse extends Omit<User, 'password'> {}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthRequest extends Request {
  user?: UserResponse
}

export interface JWTPayload {
  userId: number
  email: string
  is_admin: boolean
}

export interface AuthResponse {
  user: UserResponse
  token: string
  refreshToken?: string
}

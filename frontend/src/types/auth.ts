export type AuthRole = 'SuperAdmin' | 'Admin' | 'Almacenero' | 'Consulta'

export type LoginRequest = {
  email: string
  password: string
}

export type RegisterCompanyRequest = {
  companyName: string
  ruc?: string
  email: string
  phone?: string
  address?: string
  adminFullName: string
  adminEmail: string
  adminPassword: string
  confirmPassword: string
}

export type ForgotPasswordRequest = {
  email: string
}

export type ResetPasswordRequest = {
  email: string
  token: string
  newPassword: string
  confirmPassword: string
}

export type AuthUser = {
  id: string
  email: string
  userName?: string
  fullName?: string
  roles: string[]
}

export type LoginResponse = {
  token: string
  email: string
  fullName: string
  roles: string[]
  expiresAt: string
}

export type MessageResponse = {
  message: string
}

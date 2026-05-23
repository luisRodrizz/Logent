export type AuthRole = 'Admin' | 'Almacenero' | 'Consulta'

export type LoginRequest = {
  email: string
  password: string
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

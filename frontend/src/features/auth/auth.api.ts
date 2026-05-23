import { api } from '../../lib/api'
import type { AuthUser, LoginRequest, LoginResponse } from '../../types/auth'

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/auth/login', payload)

  return response.data
}

export async function getCurrentUser(): Promise<AuthUser> {
  const response = await api.get<AuthUser>('/auth/me')

  return response.data
}

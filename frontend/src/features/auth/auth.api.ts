import { api } from '../../lib/api'
import type { AuthUser, LoginRequest, LoginResponse, MessageResponse, RegisterCompanyRequest } from '../../types/auth'

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/auth/login', payload)

  return response.data
}

export async function registerCompany(payload: RegisterCompanyRequest): Promise<MessageResponse> {
  const response = await api.post<MessageResponse>('/auth/register-company', payload)

  return response.data
}

export async function resendConfirmationEmail(email: string): Promise<MessageResponse> {
  const response = await api.post<MessageResponse>('/auth/resend-confirmation-email', { email })

  return response.data
}

export async function confirmEmail(userId: string, token: string): Promise<MessageResponse> {
  const response = await api.get<MessageResponse>('/auth/confirm-email', {
    params: {
      token,
      userId,
    },
  })

  return response.data
}

export async function getCurrentUser(): Promise<AuthUser> {
  const response = await api.get<AuthUser>('/auth/me')

  return response.data
}

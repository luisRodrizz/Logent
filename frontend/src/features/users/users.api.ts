import { api } from '../../lib/api'
import type {
  CreateUserPayload,
  AcceptTenantUserInvitationPayload,
  CreateTenantUserInvitationPayload,
  MessageResponse,
  ResetPasswordPayload,
  TenantUserInvitation,
  UpdateUserPayload,
  UpdateUserRolePayload,
  UpdateUserStatusPayload,
  User,
  UserFilters,
  UserListResponse,
  ValidateTenantUserInvitationResponse,
} from './users.types'

export async function getUsers(params: UserFilters): Promise<UserListResponse> {
  const response = await api.get<UserListResponse>('/users', { params })

  return response.data
}

export async function getUserById(id: string): Promise<User> {
  const response = await api.get<User>(`/users/${id}`)

  return response.data
}

export async function createUser(payload: CreateUserPayload): Promise<User> {
  const response = await api.post<User>('/users', payload)

  return response.data
}

export async function updateUser(id: string, payload: UpdateUserPayload): Promise<void> {
  await api.put(`/users/${id}`, payload)
}

export async function updateUserRole(id: string, payload: UpdateUserRolePayload): Promise<void> {
  await api.put(`/users/${id}/role`, payload)
}

export async function updateUserStatus(id: string, payload: UpdateUserStatusPayload): Promise<void> {
  await api.put(`/users/${id}/status`, payload)
}

export async function resetUserPassword(id: string, payload: ResetPasswordPayload): Promise<void> {
  await api.post(`/users/${id}/reset-password`, payload)
}

export async function getTenantUserInvitations(): Promise<TenantUserInvitation[]> {
  const response = await api.get<TenantUserInvitation[]>('/users/invitations')

  return response.data
}

export async function createTenantUserInvitation(
  payload: CreateTenantUserInvitationPayload,
): Promise<TenantUserInvitation> {
  const response = await api.post<TenantUserInvitation>('/users/invitations', payload)

  return response.data
}

export async function resendTenantUserInvitation(id: string): Promise<TenantUserInvitation> {
  const response = await api.post<TenantUserInvitation>(`/users/invitations/${id}/resend`)

  return response.data
}

export async function cancelTenantUserInvitation(id: string): Promise<TenantUserInvitation> {
  const response = await api.post<TenantUserInvitation>(`/users/invitations/${id}/cancel`)

  return response.data
}

export async function validateTenantUserInvitation(token: string): Promise<ValidateTenantUserInvitationResponse> {
  const response = await api.get<ValidateTenantUserInvitationResponse>('/users/invitations/validate', {
    params: { token },
  })

  return response.data
}

export async function acceptTenantUserInvitation(
  payload: AcceptTenantUserInvitationPayload,
): Promise<MessageResponse> {
  const response = await api.post<MessageResponse>('/users/invitations/accept', payload)

  return response.data
}

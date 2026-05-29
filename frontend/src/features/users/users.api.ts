import { api } from '../../lib/api'
import type {
  CreateUserPayload,
  ResetPasswordPayload,
  UpdateUserPayload,
  UpdateUserRolePayload,
  UpdateUserStatusPayload,
  User,
  UserFilters,
  UserListResponse,
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

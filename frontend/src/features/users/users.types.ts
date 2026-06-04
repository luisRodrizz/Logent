import type { AuthRole } from '../../types/auth'
import type { PaginatedResponse, PaginationParams } from '../../types/pagination'

export type UserRole = Extract<AuthRole, 'Admin' | 'Almacenero' | 'Consulta'>

export type User = {
  createdAt: string
  email: string
  fullName: string
  id: string
  isActive: boolean
  role: UserRole
}

export type UserFilters = PaginationParams

export type UserListResponse = PaginatedResponse<User>

export type CreateUserPayload = {
  email: string
  fullName: string
  isActive: boolean
  password: string
  role: UserRole
}

export type UpdateUserPayload = {
  email: string
  fullName: string
  isActive: boolean
}

export type UpdateUserRolePayload = {
  role: UserRole
}

export type UpdateUserStatusPayload = {
  isActive: boolean
}

export type ResetPasswordPayload = {
  newPassword: string
}

export type TenantUserInvitationStatus = 'Pending' | 'Accepted' | 'Cancelled' | 'Expired'

export type TenantUserInvitation = {
  acceptedAt?: string | null
  cancelledAt?: string | null
  createdAt: string
  email: string
  expiresAt: string
  firstName: string
  id: string
  lastName: string
  role: UserRole
  status: TenantUserInvitationStatus
}

export type CreateTenantUserInvitationPayload = {
  email: string
  firstName: string
  lastName: string
  role: UserRole
}

export type ValidateTenantUserInvitationResponse = {
  companyName: string
  email: string
  expiresAt: string
  firstName: string
  lastName: string
  role: UserRole
}

export type AcceptTenantUserInvitationPayload = {
  confirmPassword: string
  password: string
  token: string
}

export type MessageResponse = {
  message: string
}

export const userRoles = ['Admin', 'Almacenero', 'Consulta'] as const satisfies readonly UserRole[]

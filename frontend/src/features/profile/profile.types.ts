import type { AuthRole } from '../../types/auth'

export type Profile = {
  companyId?: string | null
  companyName?: string | null
  createdAt: string
  email: string
  firstName: string
  fullName: string
  id: string
  isActive: boolean
  lastName: string
  roles: AuthRole[]
}

export type UpdateProfilePayload = {
  firstName: string
  lastName: string
}

export type ChangePasswordPayload = {
  confirmPassword: string
  currentPassword: string
  newPassword: string
}

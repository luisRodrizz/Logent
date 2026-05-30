import type { AuthRole } from '../../types/auth'

export type Profile = {
  createdAt: string
  email: string
  fullName: string
  id: string
  isActive: boolean
  role: AuthRole
}

export type ChangePasswordPayload = {
  currentPassword: string
  newPassword: string
}

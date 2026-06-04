import { api } from '../../lib/api'
import type { ChangePasswordPayload, Profile, UpdateProfilePayload } from './profile.types'

export async function getProfile(): Promise<Profile> {
  const response = await api.get<Profile>('/profile')

  return response.data
}

export async function changeProfilePassword(payload: ChangePasswordPayload): Promise<void> {
  await api.post('/profile/change-password', payload)
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<Profile> {
  const response = await api.put<Profile>('/profile', payload)

  return response.data
}

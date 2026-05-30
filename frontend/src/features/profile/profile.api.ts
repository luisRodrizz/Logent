import { api } from '../../lib/api'
import type { ChangePasswordPayload, Profile } from './profile.types'

export async function getProfile(): Promise<Profile> {
  const response = await api.get<Profile>('/profile')

  return response.data
}

export async function changeProfilePassword(payload: ChangePasswordPayload): Promise<void> {
  await api.put('/profile/password', payload)
}

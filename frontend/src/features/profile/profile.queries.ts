import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { changeProfilePassword, getProfile, updateProfile } from './profile.api'
import type { ChangePasswordPayload, UpdateProfilePayload } from './profile.types'

export const profileQueryKeys = {
  detail: ['profile'] as const,
}

export function useProfile() {
  return useQuery({
    queryFn: getProfile,
    queryKey: profileQueryKeys.detail,
  })
}

export function useChangeProfilePassword() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => changeProfilePassword(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: profileQueryKeys.detail })
    },
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateProfile(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: profileQueryKeys.detail })
    },
  })
}

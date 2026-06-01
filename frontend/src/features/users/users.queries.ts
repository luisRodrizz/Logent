import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createUser,
  getUserById,
  getUsers,
  resetUserPassword,
  updateUser,
  updateUserRole,
  updateUserStatus,
} from './users.api'
import type {
  CreateUserPayload,
  ResetPasswordPayload,
  UpdateUserPayload,
  UpdateUserRolePayload,
  UpdateUserStatusPayload,
  UserFilters,
} from './users.types'
import { planQueryKeys } from '../plan/plan.queries'

export const usersQueryKeys = {
  all: ['users'] as const,
  detail: (id: string) => ['users', id] as const,
  list: (params: UserFilters) => ['users', params] as const,
}

export function useUsers(params: UserFilters) {
  return useQuery({
    queryFn: () => getUsers(params),
    queryKey: usersQueryKeys.list(params),
  })
}

export function useUser(id?: string) {
  return useQuery({
    enabled: Boolean(id),
    queryFn: () => getUserById(id ?? ''),
    queryKey: id ? usersQueryKeys.detail(id) : ['users', 'detail'],
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateUserPayload) => createUser(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: usersQueryKeys.all })
      await queryClient.invalidateQueries({ queryKey: planQueryKeys.all })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) => updateUser(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: usersQueryKeys.all })
    },
  })
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserRolePayload }) => updateUserRole(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: usersQueryKeys.all })
    },
  })
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserStatusPayload }) => updateUserStatus(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: usersQueryKeys.all })
    },
  })
}

export function useResetUserPassword() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ResetPasswordPayload }) => resetUserPassword(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: usersQueryKeys.all })
    },
  })
}

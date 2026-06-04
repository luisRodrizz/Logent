import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  acceptTenantUserInvitation,
  cancelTenantUserInvitation,
  createTenantUserInvitation,
  createUser,
  getTenantUserInvitations,
  getUserById,
  getUsers,
  resendTenantUserInvitation,
  resetUserPassword,
  updateUser,
  updateUserRole,
  updateUserStatus,
} from './users.api'
import type {
  CreateUserPayload,
  AcceptTenantUserInvitationPayload,
  CreateTenantUserInvitationPayload,
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
  invitations: ['users', 'invitations'] as const,
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

export function useTenantUserInvitations(enabled = true) {
  return useQuery({
    enabled,
    queryFn: getTenantUserInvitations,
    queryKey: usersQueryKeys.invitations,
  })
}

export function useCreateTenantUserInvitation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateTenantUserInvitationPayload) => createTenantUserInvitation(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: usersQueryKeys.invitations })
      await queryClient.invalidateQueries({ queryKey: planQueryKeys.all })
    },
  })
}

export function useResendTenantUserInvitation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => resendTenantUserInvitation(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: usersQueryKeys.invitations })
    },
  })
}

export function useCancelTenantUserInvitation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => cancelTenantUserInvitation(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: usersQueryKeys.invitations })
      await queryClient.invalidateQueries({ queryKey: planQueryKeys.all })
    },
  })
}

export function useAcceptTenantUserInvitation() {
  return useMutation({
    mutationFn: (payload: AcceptTenantUserInvitationPayload) => acceptTenantUserInvitation(payload),
  })
}

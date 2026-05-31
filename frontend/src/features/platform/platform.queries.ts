import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getPlatformCompanies,
  getPlatformCompanyById,
  updatePlatformCompanyPlan,
  updatePlatformCompanyStatus,
} from './platform.api'
import type {
  PlatformCompanyQuery,
  UpdateCompanyPlanRequest,
  UpdateCompanyStatusRequest,
} from './platform.types'

export const platformCompaniesQueryKeys = {
  all: ['platform-companies'] as const,
  detail: (id: string) => ['platform-companies', id] as const,
  list: (params: PlatformCompanyQuery) => ['platform-companies', params] as const,
}

export function usePlatformCompanies(params: PlatformCompanyQuery) {
  return useQuery({
    queryFn: () => getPlatformCompanies(params),
    queryKey: platformCompaniesQueryKeys.list(params),
  })
}

export function usePlatformCompany(id?: string) {
  return useQuery({
    enabled: Boolean(id),
    queryFn: () => getPlatformCompanyById(id ?? ''),
    queryKey: id ? platformCompaniesQueryKeys.detail(id) : ['platform-companies', 'detail'],
  })
}

export function useUpdatePlatformCompanyStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCompanyStatusRequest }) =>
      updatePlatformCompanyStatus(id, payload),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: platformCompaniesQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: platformCompaniesQueryKeys.detail(variables.id) }),
      ])
    },
  })
}

export function useUpdatePlatformCompanyPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCompanyPlanRequest }) =>
      updatePlatformCompanyPlan(id, payload),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: platformCompaniesQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: platformCompaniesQueryKeys.detail(variables.id) }),
      ])
    },
  })
}

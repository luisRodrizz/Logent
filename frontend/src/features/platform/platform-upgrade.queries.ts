import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { platformCompaniesQueryKeys } from './platform.queries'
import {
  approvePlatformPlanUpgradeRequest,
  getPlatformPlanUpgradeRequestById,
  getPlatformPlanUpgradeRequests,
  rejectPlatformPlanUpgradeRequest,
} from './platform-upgrade.api'
import type { PlatformPlanUpgradeRequestQuery, ResolvePlanUpgradeRequestPayload } from './platform-upgrade.types'

export const platformUpgradeRequestsQueryKeys = {
  all: ['platform-plan-upgrade-requests'] as const,
  detail: (id: string) => ['platform-plan-upgrade-requests', id] as const,
  list: (params: PlatformPlanUpgradeRequestQuery) => ['platform-plan-upgrade-requests', params] as const,
}

export function usePlatformPlanUpgradeRequests(params: PlatformPlanUpgradeRequestQuery) {
  return useQuery({
    queryFn: () => getPlatformPlanUpgradeRequests(params),
    queryKey: platformUpgradeRequestsQueryKeys.list(params),
  })
}

export function usePlatformPlanUpgradeRequest(id?: string) {
  return useQuery({
    enabled: Boolean(id),
    queryFn: () => getPlatformPlanUpgradeRequestById(id ?? ''),
    queryKey: id ? platformUpgradeRequestsQueryKeys.detail(id) : ['platform-plan-upgrade-requests', 'detail'],
  })
}

export function useApprovePlatformPlanUpgradeRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ResolvePlanUpgradeRequestPayload }) =>
      approvePlatformPlanUpgradeRequest(id, payload),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: platformUpgradeRequestsQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: platformUpgradeRequestsQueryKeys.detail(variables.id) }),
        queryClient.invalidateQueries({ queryKey: platformCompaniesQueryKeys.all }),
      ])
    },
  })
}

export function useRejectPlatformPlanUpgradeRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ResolvePlanUpgradeRequestPayload }) =>
      rejectPlatformPlanUpgradeRequest(id, payload),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: platformUpgradeRequestsQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: platformUpgradeRequestsQueryKeys.detail(variables.id) }),
      ])
    },
  })
}

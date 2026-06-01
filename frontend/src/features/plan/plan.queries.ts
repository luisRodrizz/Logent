import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createPlanUpgradeRequest, getMyLatestPlanUpgradeRequest, getPlanUsage } from './plan.api'

export const planQueryKeys = {
  all: ['plan'] as const,
  latestUpgradeRequest: ['plan', 'upgrade-requests', 'my-latest'] as const,
  usage: ['plan', 'usage'] as const,
}

export function usePlanUsage() {
  return useQuery({
    queryFn: getPlanUsage,
    queryKey: planQueryKeys.usage,
  })
}

export function useMyLatestPlanUpgradeRequest() {
  return useQuery({
    queryFn: getMyLatestPlanUpgradeRequest,
    queryKey: planQueryKeys.latestUpgradeRequest,
  })
}

export function useCreatePlanUpgradeRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createPlanUpgradeRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: planQueryKeys.latestUpgradeRequest })
    },
  })
}

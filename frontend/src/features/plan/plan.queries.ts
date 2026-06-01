import { useQuery } from '@tanstack/react-query'
import { getPlanUsage } from './plan.api'

export const planQueryKeys = {
  all: ['plan'] as const,
  usage: ['plan', 'usage'] as const,
}

export function usePlanUsage() {
  return useQuery({
    queryFn: getPlanUsage,
    queryKey: planQueryKeys.usage,
  })
}

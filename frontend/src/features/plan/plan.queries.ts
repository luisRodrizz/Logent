import { useQuery } from '@tanstack/react-query'
import { getPlanUsage } from './plan.api'

export function usePlanUsage() {
  return useQuery({
    queryFn: getPlanUsage,
    queryKey: ['plan', 'usage'],
  })
}

import { useQuery } from '@tanstack/react-query'
import { getPlatformDashboardSummary } from './platform-dashboard.api'

export const platformDashboardQueryKeys = {
  summary: ['platform-dashboard', 'summary'] as const,
}

export function usePlatformDashboardSummary() {
  return useQuery({
    queryFn: getPlatformDashboardSummary,
    queryKey: platformDashboardQueryKeys.summary,
  })
}

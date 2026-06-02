import { useQuery } from '@tanstack/react-query'
import { getPlatformAnalyticsSummary } from './platform-analytics.api'

export const platformAnalyticsQueryKeys = {
  summary: ['platform-analytics', 'summary'] as const,
}

export function usePlatformAnalyticsSummary() {
  return useQuery({
    queryFn: getPlatformAnalyticsSummary,
    queryKey: platformAnalyticsQueryKeys.summary,
  })
}

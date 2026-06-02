import { api } from '../../lib/api'
import type { PlatformAnalyticsSummary } from './platform-analytics.types'

export async function getPlatformAnalyticsSummary(): Promise<PlatformAnalyticsSummary> {
  const response = await api.get<PlatformAnalyticsSummary>('/platform/analytics/summary')

  return response.data
}

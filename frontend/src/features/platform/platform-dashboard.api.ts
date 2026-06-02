import { api } from '../../lib/api'
import type { PlatformDashboardSummary } from './platform-dashboard.types'

export async function getPlatformDashboardSummary(): Promise<PlatformDashboardSummary> {
  const response = await api.get<PlatformDashboardSummary>('/platform/dashboard/summary')

  return response.data
}

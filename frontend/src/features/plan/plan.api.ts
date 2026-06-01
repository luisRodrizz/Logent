import { api } from '../../lib/api'
import type { PlanUsageResponse } from './plan.types'

export async function getPlanUsage(): Promise<PlanUsageResponse> {
  const response = await api.get<PlanUsageResponse>('/plan/usage')

  return response.data
}

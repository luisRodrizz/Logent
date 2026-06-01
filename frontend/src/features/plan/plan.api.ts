import { api } from '../../lib/api'
import type { CreatePlanUpgradeRequestPayload, PlanUpgradeRequest, PlanUsageResponse } from './plan.types'

export async function getPlanUsage(): Promise<PlanUsageResponse> {
  const response = await api.get<PlanUsageResponse>('/plan/usage')

  return response.data
}

export async function createPlanUpgradeRequest(
  payload: CreatePlanUpgradeRequestPayload,
): Promise<PlanUpgradeRequest> {
  const response = await api.post<PlanUpgradeRequest>('/plan/upgrade-requests', payload)

  return response.data
}

export async function getMyLatestPlanUpgradeRequest(): Promise<PlanUpgradeRequest | null> {
  const response = await api.get<PlanUpgradeRequest | null>('/plan/upgrade-requests/my-latest')

  return response.data
}

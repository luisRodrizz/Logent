import { api } from '../../lib/api'
import type {
  PlatformPlanUpgradeRequestDetail,
  PlatformPlanUpgradeRequestListResponse,
  PlatformPlanUpgradeRequestQuery,
  ResolvePlanUpgradeRequestPayload,
} from './platform-upgrade.types'

export async function getPlatformPlanUpgradeRequests(
  params: PlatformPlanUpgradeRequestQuery,
): Promise<PlatformPlanUpgradeRequestListResponse> {
  const response = await api.get<PlatformPlanUpgradeRequestListResponse>('/platform/plan-upgrade-requests', { params })

  return response.data
}

export async function getPlatformPlanUpgradeRequestById(id: string): Promise<PlatformPlanUpgradeRequestDetail> {
  const response = await api.get<PlatformPlanUpgradeRequestDetail>(`/platform/plan-upgrade-requests/${id}`)

  return response.data
}

export async function approvePlatformPlanUpgradeRequest(
  id: string,
  payload: ResolvePlanUpgradeRequestPayload,
): Promise<void> {
  await api.patch(`/platform/plan-upgrade-requests/${id}/approve`, payload)
}

export async function rejectPlatformPlanUpgradeRequest(
  id: string,
  payload: ResolvePlanUpgradeRequestPayload,
): Promise<void> {
  await api.patch(`/platform/plan-upgrade-requests/${id}/reject`, payload)
}

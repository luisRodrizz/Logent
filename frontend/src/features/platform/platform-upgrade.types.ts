import type { PaginatedResponse, PaginationParams } from '../../types/pagination'
import type { PlatformPlan } from './platform.types'

export type PlatformUpgradeRequestStatus = 'Pending' | 'Approved' | 'Rejected'

export type PlatformPlanUpgradeRequestListItem = {
  companyId: string
  companyName: string
  createdAt: string
  currentPlan: PlatformPlan
  id: string
  message?: string | null
  requestedByName: string
  requestedPlan: PlatformPlan
  resolvedAt?: string | null
  status: PlatformUpgradeRequestStatus
}

export type PlatformPlanUpgradeRequestDetail = PlatformPlanUpgradeRequestListItem & {
  requestedByUserId: string
  resolutionNote?: string | null
  resolvedByName?: string | null
  resolvedByUserId?: string | null
}

export type PlatformPlanUpgradeRequestQuery = Omit<PaginationParams, 'search'> & {
  companySearch?: string
  requestedPlan?: PlatformPlan
  status?: PlatformUpgradeRequestStatus
}

export type PlatformPlanUpgradeRequestListResponse = PaginatedResponse<PlatformPlanUpgradeRequestListItem>

export type ResolvePlanUpgradeRequestPayload = {
  resolutionNote?: string
}

export const platformUpgradeRequestStatuses = [
  'Pending',
  'Approved',
  'Rejected',
] as const satisfies readonly PlatformUpgradeRequestStatus[]

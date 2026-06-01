export type PlanType = 'Free' | 'Starter' | 'Pro' | 'Enterprise'

export type PlanUpgradeRequestStatus = 'Pending' | 'Approved' | 'Rejected'

export type PlanUsageMetrics = {
  categories: number
  products: number
  suppliers: number
  users: number
  warehouses: number
}

export type PlanUsageResponse = {
  limits: PlanUsageMetrics
  plan: PlanType
  usage: PlanUsageMetrics
}

export type PlanUpgradeRequest = {
  createdAt: string
  currentPlan: PlanType
  id: string
  message?: string | null
  requestedPlan: PlanType
  resolutionNote?: string | null
  resolvedAt?: string | null
  status: PlanUpgradeRequestStatus
}

export type CreatePlanUpgradeRequestPayload = {
  message?: string
  requestedPlan: PlanType
}

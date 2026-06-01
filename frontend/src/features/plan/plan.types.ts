export type PlanType = 'Free' | 'Starter' | 'Pro' | 'Enterprise'

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

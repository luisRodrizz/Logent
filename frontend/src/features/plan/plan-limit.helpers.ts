import { usePlanUsage } from './plan.queries'
import type { PlanUsageResponse } from './plan.types'

export type PlanResource = 'categories' | 'monthlyMovements' | 'products' | 'suppliers' | 'users' | 'warehouses'

export type PlanResourceLimitStatus = {
  current: number
  isAtLimit: boolean
  isNearLimit: boolean
  isUnlimited: boolean
  label: string
  limit: number
  percentage: number
  remaining: number
}

export const enterpriseLimit = 2147483647

export const planUsageResources: PlanResource[] = [
  'users',
  'products',
  'warehouses',
  'monthlyMovements',
  'suppliers',
  'categories',
]

const resourceLabels: Record<PlanResource, string> = {
  categories: 'categorías',
  monthlyMovements: 'movimientos del mes',
  products: 'productos',
  suppliers: 'proveedores',
  users: 'usuarios',
  warehouses: 'almacenes',
}

export function getPlanResourceLimitStatus(
  planUsage: PlanUsageResponse,
  resource: PlanResource,
): PlanResourceLimitStatus {
  const current = planUsage.usage[resource]
  const limit = planUsage.limits[resource]
  const isUnlimited = limit >= enterpriseLimit
  const percentage = isUnlimited ? 0 : Math.min(100, Math.round((current / limit) * 100))
  const isAtLimit = !isUnlimited && current >= limit

  return {
    current,
    isAtLimit,
    isNearLimit: !isAtLimit && !isUnlimited && current / limit >= 0.8,
    isUnlimited,
    label: resourceLabels[resource],
    limit,
    percentage,
    remaining: isUnlimited ? enterpriseLimit : Math.max(0, limit - current),
  }
}

export function usePlanResourceLimit(resource: PlanResource) {
  const planUsageQuery = usePlanUsage()

  return {
    isError: planUsageQuery.isError,
    isLoading: planUsageQuery.isLoading,
    status: planUsageQuery.data ? getPlanResourceLimitStatus(planUsageQuery.data, resource) : null,
  }
}

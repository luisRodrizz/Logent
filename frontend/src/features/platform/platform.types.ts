import type { PaginatedResponse, PaginationParams } from '../../types/pagination'

export type PlatformPlan = 'Free' | 'Starter' | 'Pro' | 'Enterprise'

export type PlatformCompanyListItem = {
  createdAt: string
  email?: string | null
  id: string
  isActive: boolean
  name: string
  phone?: string | null
  plan: PlatformPlan
  productsCount: number
  ruc?: string | null
  slug: string
  usersCount: number
  warehousesCount: number
}

export type PlatformCompanyDetail = PlatformCompanyListItem & {
  activeUsersCount: number
  address?: string | null
  movementsCount: number
  stockItemsCount: number
  updatedAt?: string | null
}

export type PlatformCompanyQuery = PaginationParams & {
  isActive?: boolean
  plan?: PlatformPlan
}

export type PlatformCompanyListResponse = PaginatedResponse<PlatformCompanyListItem>

export type UpdateCompanyStatusRequest = {
  isActive: boolean
  reason?: string
}

export type UpdateCompanyPlanRequest = {
  plan: PlatformPlan
}

export const platformPlans = ['Free', 'Starter', 'Pro', 'Enterprise'] as const satisfies readonly PlatformPlan[]

import type { PlatformPlan } from './platform.types'
import type { PlatformUpgradeRequestStatus } from './platform-upgrade.types'

export type PlatformAnalyticsPlanCount = {
  count: number
  plan: PlatformPlan
}

export type PlatformAnalyticsCompanyStatus = 'Active' | 'Suspended'

export type PlatformAnalyticsStatusCount<TStatus extends string = string> = {
  count: number
  status: TStatus
}

export type MonthlyCompanyGrowth = {
  count: number
  label: string
  month: string
}

export type MonthlyUpgradeRequests = {
  approved: number
  label: string
  month: string
  pending: number
  rejected: number
  total: number
}

export type TopPlatformCompany = {
  companyId: string
  companyName: string
  count: number
  plan: PlatformPlan
}

export type PlatformAnalyticsSummary = {
  activeCompanies: number
  companiesByPlan: PlatformAnalyticsPlanCount[]
  companiesByStatus: PlatformAnalyticsStatusCount<PlatformAnalyticsCompanyStatus>[]
  monthlyCompanyGrowth: MonthlyCompanyGrowth[]
  monthlyUpgradeRequests: MonthlyUpgradeRequests[]
  pendingUpgradeRequests: number
  topCompaniesByProducts: TopPlatformCompany[]
  topCompaniesByUsers: TopPlatformCompany[]
  topCompaniesByWarehouses: TopPlatformCompany[]
  totalCompanies: number
  totalProducts: number
  totalTenantUsers: number
  upgradeRequestsByStatus: PlatformAnalyticsStatusCount<PlatformUpgradeRequestStatus>[]
}

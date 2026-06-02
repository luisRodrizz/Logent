import type { PlatformPlan } from './platform.types'
import type { PlatformUpgradeRequestStatus } from './platform-upgrade.types'

export type RecentPlatformCompany = {
  createdAt: string
  id: string
  isActive: boolean
  name: string
  plan: PlatformPlan
}

export type RecentPlatformUpgradeRequest = {
  companyName: string
  createdAt: string
  currentPlan: PlatformPlan
  id: string
  requestedPlan: PlatformPlan
  status: PlatformUpgradeRequestStatus
}

export type PlatformDashboardSummary = {
  activeCompanies: number
  approvedUpgradeRequests: number
  enterpriseCompanies: number
  freeCompanies: number
  pendingUpgradeRequests: number
  proCompanies: number
  recentCompanies: RecentPlatformCompany[]
  recentUpgradeRequests: RecentPlatformUpgradeRequest[]
  rejectedUpgradeRequests: number
  starterCompanies: number
  suspendedCompanies: number
  totalCompanies: number
  totalProducts: number
  totalTenantUsers: number
  totalWarehouses: number
}

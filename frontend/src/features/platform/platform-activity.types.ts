export const platformActivityActions = [
  'Create',
  'Update',
  'Delete',
  'Login',
  'Logout',
  'StockEntry',
  'StockExit',
  'StockAdjustment',
  'StockTransfer',
  'UserCreated',
  'UserUpdated',
  'UserRoleChanged',
  'UserStatusChanged',
  'UserPasswordReset',
  'ProfilePasswordChanged',
  'PlatformCompanyStatusChanged',
  'PlatformCompanyPlanChanged',
  'PlanUpgradeRequested',
  'PlanUpgradeApproved',
  'PlanUpgradeRejected',
] as const

export type PlatformActivityAction = (typeof platformActivityActions)[number]

export type PlatformActivityItem = {
  action: PlatformActivityAction
  companyId?: string | null
  companyName?: string | null
  createdAt: string
  description: string
  entityId?: string | null
  entityName: string
  id: string
  userEmail?: string | null
  userId?: string | null
}

export type PlatformActivityListResponse = {
  items: PlatformActivityItem[]
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export type PlatformActivityQuery = {
  action?: PlatformActivityAction
  companyId?: string
  dateFrom?: string
  dateTo?: string
  entityName?: string
  page: number
  pageSize: number
  search?: string
}

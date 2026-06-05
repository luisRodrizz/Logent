import type { PaginationParams } from './pagination'

export type AuditAction =
  | 'Create'
  | 'Update'
  | 'Delete'
  | 'Login'
  | 'Logout'
  | 'StockEntry'
  | 'StockExit'
  | 'StockAdjustment'
  | 'StockTransfer'
  | 'UserCreated'
  | 'UserUpdated'
  | 'UserRoleChanged'
  | 'UserStatusChanged'
  | 'UserPasswordReset'
  | 'ProfilePasswordChanged'
  | 'UserProfileUpdated'
  | 'UserPasswordChanged'
  | 'PlatformCompanyStatusChanged'
  | 'PlatformCompanyPlanChanged'
  | 'PlanUpgradeRequested'
  | 'PlanUpgradeApproved'
  | 'PlanUpgradeRejected'
  | 'CompanyProfileUpdated'
  | 'BillingCheckoutCompleted'
  | 'BillingPaymentFailed'
  | 'BillingPaymentSucceeded'
  | 'BillingSubscriptionUpdated'
  | 'BillingSubscriptionCancelled'
  | 'BillingSubscriptionStatusChanged'
  | 'PlanChangedByStripe'

export type AuditLog = {
  action: AuditAction
  createdAt: string
  description?: string | null
  entityId?: string | null
  entityName: string
  id: string
  ipAddress?: string | null
  userId?: string | null
}

export type AuditLogFilters = PaginationParams & {
  action?: AuditAction
  entityId?: string
  entityName?: string
  fromDate?: string
  toDate?: string
  userId?: string
}

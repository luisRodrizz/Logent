export const tenantNotificationTypes = [
  'UpgradeRequestCreated',
  'UpgradeRequestApproved',
  'UpgradeRequestRejected',
  'PlanUpdatedByStripe',
  'BillingPaymentSucceeded',
  'BillingPaymentFailed',
  'BillingSubscriptionCancelled',
  'InvitationAccepted',
  'PasswordChanged',
  'System',
] as const

export const tenantNotificationSeverities = ['Info', 'Success', 'Warning', 'Danger'] as const

export type TenantNotificationType = (typeof tenantNotificationTypes)[number]
export type TenantNotificationSeverity = (typeof tenantNotificationSeverities)[number]

export type TenantNotification = {
  actionUrl?: string | null
  createdAt: string
  id: string
  isRead: boolean
  message: string
  readAt?: string | null
  severity: TenantNotificationSeverity
  title: string
  type: TenantNotificationType
}

export type TenantNotificationUnreadCountResponse = {
  count: number
}

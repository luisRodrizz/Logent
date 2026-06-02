export const platformNotificationTypes = [
  'CompanyRegistered',
  'CompanySuspended',
  'CompanyReactivated',
  'PlanChanged',
  'UpgradeRequestCreated',
  'UpgradeRequestApproved',
  'UpgradeRequestRejected',
  'System',
] as const

export const platformNotificationSeverities = ['Info', 'Success', 'Warning', 'Danger'] as const

export type PlatformNotificationType = (typeof platformNotificationTypes)[number]
export type PlatformNotificationSeverity = (typeof platformNotificationSeverities)[number]

export type PlatformNotificationItem = {
  actionUrl?: string | null
  companyId?: string | null
  companyName?: string | null
  createdAt: string
  id: string
  isRead: boolean
  message: string
  readAt?: string | null
  relatedEntityId?: string | null
  relatedEntityName?: string | null
  severity: PlatformNotificationSeverity
  title: string
  type: PlatformNotificationType
}

export type PlatformNotificationListResponse = {
  attentionItems: number
  items: PlatformNotificationItem[]
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  unreadItems: number
}

export type PlatformNotificationUnreadCountResponse = {
  count: number
}

export type PlatformNotificationQuery = {
  dateFrom?: string
  dateTo?: string
  isRead?: boolean
  page: number
  pageSize: number
  search?: string
  severity?: PlatformNotificationSeverity
  type?: PlatformNotificationType
}

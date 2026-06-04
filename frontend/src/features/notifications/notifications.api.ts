import { api } from '../../lib/api'
import type { TenantNotification, TenantNotificationUnreadCountResponse } from './notifications.types'

export async function getTenantNotifications(): Promise<TenantNotification[]> {
  const response = await api.get<TenantNotification[]>('/notifications')

  return response.data
}

export async function getTenantNotificationUnreadCount(): Promise<TenantNotificationUnreadCountResponse> {
  const response = await api.get<TenantNotificationUnreadCountResponse>('/notifications/unread-count')

  return response.data
}

export async function markTenantNotificationAsRead(id: string): Promise<void> {
  await api.patch(`/notifications/${id}/read`)
}

export async function markAllTenantNotificationsAsRead(): Promise<void> {
  await api.patch('/notifications/read-all')
}

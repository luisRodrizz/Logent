import { api } from '../../lib/api'
import type {
  PlatformNotificationListResponse,
  PlatformNotificationQuery,
  PlatformNotificationUnreadCountResponse,
} from './platform-notifications.types'

export async function getPlatformNotifications(
  params: PlatformNotificationQuery,
): Promise<PlatformNotificationListResponse> {
  const response = await api.get<PlatformNotificationListResponse>('/platform/notifications', { params })

  return response.data
}

export async function getPlatformNotificationUnreadCount(): Promise<PlatformNotificationUnreadCountResponse> {
  const response = await api.get<PlatformNotificationUnreadCountResponse>('/platform/notifications/unread-count')

  return response.data
}

export async function markPlatformNotificationAsRead(id: string): Promise<void> {
  await api.patch(`/platform/notifications/${id}/read`)
}

export async function markAllPlatformNotificationsAsRead(): Promise<void> {
  await api.patch('/platform/notifications/read-all')
}

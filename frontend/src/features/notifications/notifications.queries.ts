import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getTenantNotifications,
  getTenantNotificationUnreadCount,
  markAllTenantNotificationsAsRead,
  markTenantNotificationAsRead,
} from './notifications.api'

export const tenantNotificationsQueryKeys = {
  all: ['tenant-notifications'] as const,
  list: ['tenant-notifications', 'list'] as const,
  unreadCount: ['tenant-notifications', 'unread-count'] as const,
}

export function useTenantNotifications(enabled = true) {
  return useQuery({
    enabled,
    queryFn: getTenantNotifications,
    queryKey: tenantNotificationsQueryKeys.list,
  })
}

export function useTenantNotificationUnreadCount() {
  return useQuery({
    queryFn: getTenantNotificationUnreadCount,
    queryKey: tenantNotificationsQueryKeys.unreadCount,
    refetchInterval: 60_000,
  })
}

export function useMarkTenantNotificationAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markTenantNotificationAsRead,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: tenantNotificationsQueryKeys.all })
    },
  })
}

export function useMarkAllTenantNotificationsAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markAllTenantNotificationsAsRead,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: tenantNotificationsQueryKeys.all })
    },
  })
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getPlatformNotifications,
  getPlatformNotificationUnreadCount,
  markAllPlatformNotificationsAsRead,
  markPlatformNotificationAsRead,
} from './platform-notifications.api'
import type { PlatformNotificationQuery } from './platform-notifications.types'

export const platformNotificationsQueryKeys = {
  all: ['platform-notifications'] as const,
  list: (params: PlatformNotificationQuery) => ['platform-notifications', 'list', params] as const,
  unreadCount: ['platform-notifications', 'unread-count'] as const,
}

export function usePlatformNotifications(params: PlatformNotificationQuery) {
  return useQuery({
    queryFn: () => getPlatformNotifications(params),
    queryKey: platformNotificationsQueryKeys.list(params),
  })
}

export function usePlatformNotificationUnreadCount() {
  return useQuery({
    queryFn: getPlatformNotificationUnreadCount,
    queryKey: platformNotificationsQueryKeys.unreadCount,
    refetchInterval: 60_000,
  })
}

export function useMarkPlatformNotificationAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markPlatformNotificationAsRead,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: platformNotificationsQueryKeys.all })
    },
  })
}

export function useMarkAllPlatformNotificationsAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markAllPlatformNotificationsAsRead,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: platformNotificationsQueryKeys.all })
    },
  })
}

import { useQuery } from '@tanstack/react-query'
import { getPlatformActivity } from './platform-activity.api'
import type { PlatformActivityQuery } from './platform-activity.types'

export const platformActivityQueryKeys = {
  list: (params: PlatformActivityQuery) => ['platform-activity', params] as const,
}

export function usePlatformActivity(params: PlatformActivityQuery) {
  return useQuery({
    queryFn: () => getPlatformActivity(params),
    queryKey: platformActivityQueryKeys.list(params),
  })
}

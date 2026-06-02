import { api } from '../../lib/api'
import type { PlatformActivityListResponse, PlatformActivityQuery } from './platform-activity.types'

export async function getPlatformActivity(params: PlatformActivityQuery): Promise<PlatformActivityListResponse> {
  const response = await api.get<PlatformActivityListResponse>('/platform/activity', { params })

  return response.data
}

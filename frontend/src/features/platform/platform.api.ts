import { api } from '../../lib/api'
import type {
  PlatformCompanyDetail,
  PlatformCompanyListResponse,
  PlatformCompanyQuery,
  UpdateCompanyPlanRequest,
  UpdateCompanyStatusRequest,
} from './platform.types'

export async function getPlatformCompanies(params: PlatformCompanyQuery): Promise<PlatformCompanyListResponse> {
  const response = await api.get<PlatformCompanyListResponse>('/platform/companies', { params })

  return response.data
}

export async function getPlatformCompanyById(id: string): Promise<PlatformCompanyDetail> {
  const response = await api.get<PlatformCompanyDetail>(`/platform/companies/${id}`)

  return response.data
}

export async function updatePlatformCompanyStatus(id: string, payload: UpdateCompanyStatusRequest): Promise<void> {
  await api.patch(`/platform/companies/${id}/status`, payload)
}

export async function updatePlatformCompanyPlan(id: string, payload: UpdateCompanyPlanRequest): Promise<void> {
  await api.patch(`/platform/companies/${id}/plan`, payload)
}

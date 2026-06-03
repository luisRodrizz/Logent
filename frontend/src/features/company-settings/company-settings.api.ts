import { api } from '../../lib/api'
import type { TenantCompanySettings, UpdateTenantCompanySettingsPayload } from './company-settings.types'

export async function getTenantCompanySettings(): Promise<TenantCompanySettings> {
  const response = await api.get<TenantCompanySettings>('/company/settings')

  return response.data
}

export async function updateTenantCompanySettings(
  payload: UpdateTenantCompanySettingsPayload,
): Promise<TenantCompanySettings> {
  const response = await api.put<TenantCompanySettings>('/company/settings', payload)

  return response.data
}

export async function uploadCompanyLogo(file: File): Promise<TenantCompanySettings> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post<TenantCompanySettings>('/company/settings/logo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data
}

export async function deleteCompanyLogo(): Promise<TenantCompanySettings> {
  const response = await api.delete<TenantCompanySettings>('/company/settings/logo')

  return response.data
}

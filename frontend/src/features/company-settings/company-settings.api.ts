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

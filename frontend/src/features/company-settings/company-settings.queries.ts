import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getTenantCompanySettings, updateTenantCompanySettings } from './company-settings.api'
import type { UpdateTenantCompanySettingsPayload } from './company-settings.types'

export const tenantCompanySettingsQueryKeys = {
  current: ['tenant-company-settings'] as const,
}

export function useTenantCompanySettings() {
  return useQuery({
    queryFn: getTenantCompanySettings,
    queryKey: tenantCompanySettingsQueryKeys.current,
  })
}

export function useUpdateTenantCompanySettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateTenantCompanySettingsPayload) => updateTenantCompanySettings(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: tenantCompanySettingsQueryKeys.current })
    },
  })
}

import type { PlanType } from '../plan/plan.types'

export type TenantCompanySettings = {
  address?: string | null
  commercialName?: string | null
  contactEmail?: string | null
  createdAt: string
  id: string
  isActive: boolean
  logoUrl?: string | null
  name: string
  phone?: string | null
  plan: PlanType
  ruc?: string | null
  slug: string
  website?: string | null
}

export type UpdateTenantCompanySettingsPayload = {
  address?: string | null
  commercialName?: string | null
  contactEmail?: string | null
  logoUrl?: string | null
  phone?: string | null
  website?: string | null
}

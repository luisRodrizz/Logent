import { api } from '../../lib/api'
import type {
  BillingConfigResponse,
  BillingSessionResponse,
  BillingStatusResponse,
  CreateCheckoutSessionPayload,
} from './billing.types'

export async function getBillingConfig(): Promise<BillingConfigResponse> {
  const response = await api.get<BillingConfigResponse>('/billing/config')

  return response.data
}

export async function getBillingStatus(): Promise<BillingStatusResponse> {
  const response = await api.get<BillingStatusResponse>('/billing/status')

  return response.data
}

export async function createCheckoutSession(payload: CreateCheckoutSessionPayload): Promise<BillingSessionResponse> {
  const response = await api.post<BillingSessionResponse>('/billing/checkout-session', payload)

  return response.data
}

export async function createBillingPortalSession(): Promise<BillingSessionResponse> {
  const response = await api.post<BillingSessionResponse>('/billing/portal-session')

  return response.data
}

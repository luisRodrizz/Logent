import { useMutation, useQuery } from '@tanstack/react-query'
import {
  createBillingPortalSession,
  createCheckoutSession,
  getBillingConfig,
  getBillingStatus,
} from './billing.api'

export const billingQueryKeys = {
  all: ['billing'] as const,
  config: ['billing', 'config'] as const,
  status: ['billing', 'status'] as const,
}

export function useBillingConfig(enabled = true) {
  return useQuery({
    enabled,
    queryFn: getBillingConfig,
    queryKey: billingQueryKeys.config,
  })
}

export function useBillingStatus(enabled = true, refetchInterval?: number | false) {
  return useQuery({
    enabled,
    queryFn: getBillingStatus,
    queryKey: billingQueryKeys.status,
    refetchInterval,
  })
}

export function useCreateCheckoutSession() {
  return useMutation({
    mutationFn: createCheckoutSession,
  })
}

export function useCreateBillingPortalSession() {
  return useMutation({
    mutationFn: createBillingPortalSession,
  })
}

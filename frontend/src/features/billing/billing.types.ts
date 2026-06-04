import type { PlanType } from '../plan/plan.types'

export type BillingConfigResponse = {
  publishableKey: string
}

export type BillingStatusResponse = {
  canManageBilling: boolean
  currentPeriodEnd?: string | null
  hasActiveSubscription: boolean
  hasStripeCustomer: boolean
  plan: PlanType
  subscriptionStatus?: string | null
}

export type CreateCheckoutSessionPayload = {
  requestedPlan: PlanType
}

export type BillingSessionResponse = {
  sessionUrl: string
}

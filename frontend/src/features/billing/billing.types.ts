import type { PlanType } from '../plan/plan.types'

export type SubscriptionAccessLevel = 'ActiveAccess' | 'BlockedAccess' | 'GracePeriod' | 'LimitedAccess'

export type BillingConfigResponse = {
  publishableKey: string
}

export type BillingStatusResponse = {
  accessDetail: string
  accessLevel: SubscriptionAccessLevel
  accessMessage: string
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

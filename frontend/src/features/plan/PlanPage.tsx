import { Check, CircleAlert, CreditCard, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { PageHeader } from '../../components/common/PageHeader'
import { SectionError } from '../../components/common/SectionError'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { getApiErrorMessage } from '../../lib/api-error'
import { formatDateTime, formatNumber } from '../../lib/format'
import { useAuth } from '../auth/useAuth'
import {
  useBillingStatus,
  useCreateBillingPortalSession,
  useCreateCheckoutSession,
} from '../billing/billing.queries'
import { getHigherPlans, planDefinitions, planResourceLabels, planResources } from './plan.constants'
import { useCreatePlanUpgradeRequest, useMyLatestPlanUpgradeRequest, usePlanUsage } from './plan.queries'
import { PlanUpgradeRequestModal } from './PlanUpgradeRequestModal'
import { PlanUsageAlert } from './PlanUsageAlert'
import { PlanUsageCard } from './PlanUsageCard'
import type { CreatePlanUpgradeRequestPayload, PlanType, PlanUpgradeRequestStatus } from './plan.types'

const planBadgeVariants: Record<PlanType, 'default' | 'muted' | 'success' | 'warning'> = {
  Enterprise: 'warning',
  Free: 'muted',
  Pro: 'success',
  Starter: 'default',
}

const requestStatusBadgeVariants: Record<PlanUpgradeRequestStatus, 'success' | 'warning' | 'danger'> = {
  Approved: 'success',
  Pending: 'warning',
  Rejected: 'danger',
}

const requestStatusLabels: Record<PlanUpgradeRequestStatus, string> = {
  Approved: 'Aprobada',
  Pending: 'Pendiente',
  Rejected: 'Rechazada',
}

const planRequestLabels: Record<PlanType, string> = {
  Enterprise: 'Consultar Enterprise',
  Free: 'Plan actual',
  Pro: 'Solicitar Pro',
  Starter: 'Solicitar Starter',
}

const subscriptionStatusLabels: Record<string, string> = {
  active: 'Activa',
  canceled: 'Cancelada',
  cancelled: 'Cancelada',
  incomplete: 'Incompleta',
  incomplete_expired: 'Expirada',
  past_due: 'Pago pendiente',
  paused: 'Pausada',
  trialing: 'En prueba',
  unpaid: 'Impaga',
}

type BillingStatusPresentation = {
  badgeVariant: 'default' | 'success' | 'warning' | 'danger' | 'muted'
  description: string
  panelClassName: string
  title: string
}

const billingStatusPresentations: Record<string, BillingStatusPresentation> = {
  active: {
    badgeVariant: 'success',
    description: 'La suscripción está activa y el plan contratado se encuentra disponible.',
    panelClassName: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    title: 'Suscripción activa',
  },
  cancelled: {
    badgeVariant: 'danger',
    description: 'La suscripción fue cancelada. Puedes contratar nuevamente Starter o Pro cuando lo necesites.',
    panelClassName: 'border-red-200 bg-red-50 text-red-700',
    title: 'Suscripción cancelada',
  },
  past_due: {
    badgeVariant: 'warning',
    description: 'Stripe no pudo completar el último cobro. Gestiona la facturación para regularizar el pago.',
    panelClassName: 'border-amber-200 bg-amber-50 text-amber-700',
    title: 'Pago pendiente',
  },
  trialing: {
    badgeVariant: 'default',
    description: 'La suscripción se encuentra en periodo de prueba y mantiene el plan contratado.',
    panelClassName: 'border-blue-200 bg-blue-50 text-blue-700',
    title: 'Periodo de prueba activo',
  },
  unpaid: {
    badgeVariant: 'danger',
    description: 'La suscripción registra pagos pendientes. Revisa el método de pago desde Stripe.',
    panelClassName: 'border-red-200 bg-red-50 text-red-700',
    title: 'Suscripción impaga',
  },
}

billingStatusPresentations.canceled = billingStatusPresentations.cancelled

const noSubscriptionPresentation: BillingStatusPresentation = {
  badgeVariant: 'muted',
  description: 'La empresa no tiene una suscripción Stripe activa. Puedes contratar Starter o Pro.',
  panelClassName: 'border-slate-200 bg-slate-50 text-slate-600',
  title: 'Sin suscripción',
}

function getBillingStatusPresentation(status?: string | null) {
  if (!status) {
    return noSubscriptionPresentation
  }

  return billingStatusPresentations[status] ?? {
    badgeVariant: 'muted' as const,
    description: 'Consulta el estado actual y gestiona la suscripción desde el portal de Stripe.',
    panelClassName: 'border-slate-200 bg-slate-50 text-slate-600',
    title: subscriptionStatusLabels[status] ?? status,
  }
}

export function PlanPage() {
  const [selectedRequestedPlan, setSelectedRequestedPlan] = useState<PlanType | null>(null)
  const { user } = useAuth()
  const billingStatusQuery = useBillingStatus()
  const checkoutSessionMutation = useCreateCheckoutSession()
  const portalSessionMutation = useCreateBillingPortalSession()
  const createUpgradeRequestMutation = useCreatePlanUpgradeRequest()
  const latestUpgradeRequestQuery = useMyLatestPlanUpgradeRequest()
  const planUsageQuery = usePlanUsage()
  const currentPlan = planUsageQuery.data?.plan
  const higherPlans = currentPlan ? getHigherPlans(currentPlan) : []
  const manualUpgradePlans = higherPlans.filter((plan) => plan === 'Enterprise')
  const latestUpgradeRequest = latestUpgradeRequestQuery.data
  const hasPendingUpgradeRequest = latestUpgradeRequest?.status === 'Pending'
  const canManageBilling = user?.roles.includes('Admin') ?? false
  const billingPresentation = getBillingStatusPresentation(billingStatusQuery.data?.subscriptionStatus)
  const isCancelledSubscription = ['canceled', 'cancelled'].includes(
    billingStatusQuery.data?.subscriptionStatus ?? '',
  )
  const hasPaymentIssue = ['past_due', 'unpaid'].includes(billingStatusQuery.data?.subscriptionStatus ?? '')
  const availablePlanDefinitions = currentPlan
    ? planDefinitions.filter((definition) => definition.plan === currentPlan || higherPlans.includes(definition.plan))
    : []

  function openUpgradeRequestModal(requestedPlan?: PlanType) {
    if (hasPendingUpgradeRequest) {
      toast.info('Tu empresa ya tiene una solicitud pendiente de revisión.')
      return
    }

    if (higherPlans.length === 0) {
      toast.info('Tu empresa ya cuenta con el plan Enterprise.')
      return
    }

    setSelectedRequestedPlan(requestedPlan ?? higherPlans[0])
  }

  async function handleCreateUpgradeRequest(payload: CreatePlanUpgradeRequestPayload) {
    try {
      await createUpgradeRequestMutation.mutateAsync(payload)
      setSelectedRequestedPlan(null)
      toast.success('Solicitud de actualización enviada correctamente.')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudo enviar la solicitud de actualización.'))
    }
  }

  async function handleStripeCheckout(requestedPlan: PlanType) {
    if (!canManageBilling) {
      toast.info('Solo un Admin de la empresa puede gestionar pagos y suscripciones.')
      return
    }

    if (billingStatusQuery.data?.hasActiveSubscription) {
      await handleOpenBillingPortal()
      return
    }

    try {
      const session = await checkoutSessionMutation.mutateAsync({ requestedPlan })
      window.location.assign(session.sessionUrl)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudo iniciar el pago con Stripe.'))
    }
  }

  async function handleOpenBillingPortal() {
    if (!canManageBilling) {
      toast.info('Solo un Admin de la empresa puede gestionar la suscripción.')
      return
    }

    try {
      const session = await portalSessionMutation.mutateAsync()
      window.location.assign(session.sessionUrl)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudo abrir el portal de facturación.'))
    }
  }

  function handlePlanAction(requestedPlan: PlanType) {
    if (hasPendingUpgradeRequest) {
      toast.info('Tu empresa ya tiene una solicitud pendiente de revisión.')
      return
    }

    if (requestedPlan === 'Enterprise') {
      openUpgradeRequestModal(requestedPlan)
      return
    }

    void handleStripeCheckout(requestedPlan)
  }

  function scrollToPlanComparison() {
    document.getElementById('plan-comparison')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        description="Administra la capacidad incluida en el plan actual de tu empresa."
        eyebrow="Cuenta"
        title="Plan y uso"
      />

      <PlanUsageAlert />

      <PlanUsageCard
        isUpgradeDisabled={higherPlans.length === 0}
        onRequestUpgrade={scrollToPlanComparison}
        upgradeLabel={
          higherPlans.length === 0
            ? 'Plan Enterprise activo'
            : 'Ver opciones de plan'
        }
      />

      {billingStatusQuery.isError ? (
        <SectionError
          text={getApiErrorMessage(billingStatusQuery.error, 'No se pudo cargar el estado de facturación.')}
        />
      ) : billingStatusQuery.data ? (
        <Card className="border-slate-200">
          <CardHeader className="gap-4 sm:flex sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-primary">
                <CreditCard className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <CardTitle>Facturación Stripe</CardTitle>
                <CardDescription>
                  La activación y los cambios de plan se confirman mediante webhooks verificados.
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              {canManageBilling && isCancelledSubscription && billingStatusQuery.data.plan === 'Free' ? (
                <Button onClick={scrollToPlanComparison} size="sm">
                  Contratar nuevamente
                </Button>
              ) : null}
              {canManageBilling && billingStatusQuery.data.canManageBilling ? (
                <Button
                  disabled={portalSessionMutation.isPending}
                  onClick={() => void handleOpenBillingPortal()}
                  size="sm"
                  variant="secondary"
                >
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  {portalSessionMutation.isPending
                    ? 'Abriendo...'
                    : hasPaymentIssue
                      ? 'Gestionar facturación'
                      : 'Gestionar suscripción'}
                </Button>
              ) : null}
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={`mb-5 flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${billingPresentation.panelClassName}`}
            >
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <div>
                <p className="font-semibold">{billingPresentation.title}</p>
                <p className="mt-1 leading-6">{billingPresentation.description}</p>
              </div>
            </div>
            <dl className="grid gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Plan registrado</dt>
                <dd className="mt-1 text-sm font-semibold text-foreground">{billingStatusQuery.data.plan}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Estado Stripe</dt>
                <dd className="mt-1">
                  <Badge variant={billingPresentation.badgeVariant}>
                    {billingStatusQuery.data.subscriptionStatus
                      ? subscriptionStatusLabels[billingStatusQuery.data.subscriptionStatus] ??
                        billingStatusQuery.data.subscriptionStatus
                      : 'Sin suscripción'}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Periodo actual</dt>
                <dd className="mt-1 text-sm font-semibold text-foreground">
                  {formatDateTime(billingStatusQuery.data.currentPeriodEnd, 'No disponible')}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      ) : null}

      {latestUpgradeRequestQuery.isError ? (
        <SectionError
          text={getApiErrorMessage(
            latestUpgradeRequestQuery.error,
            'No se pudo cargar el estado de la solicitud de actualización.',
          )}
        />
      ) : null}

      {latestUpgradeRequest ? (
        <Card
          className={
            latestUpgradeRequest.status === 'Pending'
              ? 'border-amber-200'
              : latestUpgradeRequest.status === 'Rejected'
                ? 'border-red-200'
                : 'border-emerald-200'
          }
        >
          <CardHeader className="gap-3 sm:flex sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
            <div>
              <CardTitle>Solicitud de actualización</CardTitle>
              <CardDescription>Consulta el estado de la solicitud más reciente enviada por tu empresa.</CardDescription>
            </div>
            <Badge variant={requestStatusBadgeVariants[latestUpgradeRequest.status]}>
              {requestStatusLabels[latestUpgradeRequest.status]}
            </Badge>
          </CardHeader>
          <CardContent>
            <p
              className={
                latestUpgradeRequest.status === 'Pending'
                  ? 'mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-700'
                  : latestUpgradeRequest.status === 'Rejected'
                    ? 'mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700'
                    : 'mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-700'
              }
            >
              {latestUpgradeRequest.status === 'Pending'
                ? 'La solicitud está en revisión. No podrás enviar otra hasta recibir una respuesta.'
                : latestUpgradeRequest.status === 'Rejected'
                  ? 'La solicitud fue rechazada. Puedes revisar la nota de resolución y enviar una nueva solicitud.'
                  : 'La solicitud fue aprobada. El uso y los límites superiores corresponden al plan activo de tu empresa.'}
            </p>
            <dl className="grid gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Cambio solicitado</dt>
                <dd className="mt-1 text-sm font-semibold text-foreground">
                  {latestUpgradeRequest.currentPlan} → {latestUpgradeRequest.requestedPlan}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Fecha</dt>
                <dd className="mt-1 text-sm font-medium text-foreground">
                  {formatDateTime(latestUpgradeRequest.createdAt)}
                </dd>
              </div>
              <div className="sm:col-span-3">
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Mensaje</dt>
                <dd className="mt-1 text-sm leading-6 text-foreground">
                  {latestUpgradeRequest.message || 'Sin mensaje adicional.'}
                </dd>
              </div>
              {latestUpgradeRequest.resolutionNote ? (
                <div className="sm:col-span-3">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Nota de resolución</dt>
                  <dd className="mt-1 text-sm leading-6 text-foreground">{latestUpgradeRequest.resolutionNote}</dd>
                </div>
              ) : null}
            </dl>
            {latestUpgradeRequest.status === 'Rejected' && higherPlans.includes(latestUpgradeRequest.requestedPlan) ? (
              <div className="mt-5 border-t border-border pt-5">
                <Button onClick={() => openUpgradeRequestModal(latestUpgradeRequest.requestedPlan)} size="sm">
                  Solicitar nuevamente
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <section className="scroll-mt-24 space-y-4" id="plan-comparison">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Comparación de planes</h2>
            <p className="mt-1 text-sm leading-6 text-muted">
              Compara tu plan actual con las opciones superiores disponibles para tu empresa.
            </p>
          </div>
          <Link
            className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            to="/pricing"
          >
            Comparar planes públicos
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {availablePlanDefinitions.map((definition) => {
            const isCurrentPlan = definition.plan === planUsageQuery.data?.plan
            const isHigherPlan = higherPlans.includes(definition.plan)
            const isStripePlan = definition.plan === 'Starter' || definition.plan === 'Pro'
            const requiresBillingAdmin = isStripePlan && !canManageBilling
            const redirectsToPortal = isStripePlan && billingStatusQuery.data?.hasActiveSubscription
            const isActionPending = checkoutSessionMutation.isPending || portalSessionMutation.isPending

            return (
              <Card
                className={
                  isCurrentPlan
                    ? 'flex h-full flex-col border-[#14B8A6] ring-1 ring-[#14B8A6]/20'
                    : 'flex h-full flex-col'
                }
                key={definition.plan}
              >
                <CardHeader className="min-h-[132px]">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle>{definition.plan}</CardTitle>
                    <Badge variant={isCurrentPlan ? planBadgeVariants[definition.plan] : 'muted'}>
                      {isCurrentPlan ? 'Plan actual' : 'Disponible'}
                    </Badge>
                  </div>
                  <CardDescription>{definition.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col">
                  <ul className="space-y-3">
                    {planResources.map((resource) => {
                      const limit = definition.limits[resource]

                      return (
                        <li className="flex items-center justify-between gap-3 text-sm" key={resource}>
                          <span className="flex min-w-0 items-center gap-2 text-muted">
                            <Check className="h-4 w-4 shrink-0 text-[#147A08]" />
                            {planResourceLabels[resource]}
                          </span>
                          <span className="shrink-0 font-semibold text-foreground">
                            {limit === null ? 'Sin límite práctico' : formatNumber(limit)}
                          </span>
                        </li>
                      )
                    })}
                  </ul>

                  <div className="mt-auto pt-6">
                    <Button
                      className="w-full"
                      disabled={
                        isCurrentPlan ||
                        !isHigherPlan ||
                        hasPendingUpgradeRequest ||
                        requiresBillingAdmin ||
                        isActionPending
                      }
                      onClick={() => handlePlanAction(definition.plan)}
                      variant={isCurrentPlan ? 'secondary' : 'primary'}
                    >
                      {isCurrentPlan
                        ? 'Plan actual'
                        : hasPendingUpgradeRequest
                          ? 'Solicitud pendiente'
                          : requiresBillingAdmin
                            ? 'Requiere Admin'
                            : isActionPending && isStripePlan
                              ? 'Conectando con Stripe...'
                              : redirectsToPortal
                                ? 'Gestionar en Stripe'
                                : isStripePlan
                                  ? `Pagar ${definition.plan} con Stripe`
                                  : planRequestLabels[definition.plan]}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {selectedRequestedPlan ? (
        <PlanUpgradeRequestModal
          availablePlans={manualUpgradePlans}
          initialPlan={selectedRequestedPlan}
          isSubmitting={createUpgradeRequestMutation.isPending}
          onClose={() => setSelectedRequestedPlan(null)}
          onSubmit={handleCreateUpgradeRequest}
        />
      ) : null}
    </div>
  )
}

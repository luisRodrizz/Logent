import { Check, CircleAlert } from 'lucide-react'
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
import { getPlanResourceLimitStatus } from './plan-limit.helpers'
import { getHigherPlans, planDefinitions, planResourceLabels, planResources } from './plan.constants'
import { useCreatePlanUpgradeRequest, useMyLatestPlanUpgradeRequest, usePlanUsage } from './plan.queries'
import { PlanUpgradeRequestModal } from './PlanUpgradeRequestModal'
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

export function PlanPage() {
  const [selectedRequestedPlan, setSelectedRequestedPlan] = useState<PlanType | null>(null)
  const createUpgradeRequestMutation = useCreatePlanUpgradeRequest()
  const latestUpgradeRequestQuery = useMyLatestPlanUpgradeRequest()
  const planUsageQuery = usePlanUsage()
  const currentPlan = planUsageQuery.data?.plan
  const higherPlans = currentPlan ? getHigherPlans(currentPlan) : []
  const latestUpgradeRequest = latestUpgradeRequestQuery.data
  const hasPendingUpgradeRequest = latestUpgradeRequest?.status === 'Pending'
  const resourceStatuses = planUsageQuery.data
    ? planResources.map((resource) => getPlanResourceLimitStatus(planUsageQuery.data, resource))
    : []
  const hasReachedLimit = resourceStatuses.some((status) => status.isAtLimit)
  const isNearLimit = !hasReachedLimit && resourceStatuses.some((status) => status.isNearLimit)

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

  return (
    <div className="space-y-6">
      <PageHeader
        description="Administra la capacidad incluida en el plan actual de tu empresa."
        eyebrow="Cuenta"
        title="Plan y uso"
      />

      {hasReachedLimit ? (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="font-medium">Tu empresa alcanzó uno o más límites del plan actual.</p>
        </div>
      ) : isNearLimit ? (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="font-medium">Tu empresa está cerca de alcanzar algunos límites del plan.</p>
        </div>
      ) : null}

      <PlanUsageCard onRequestUpgrade={() => openUpgradeRequestModal()} />

      {latestUpgradeRequestQuery.isError ? (
        <SectionError
          text={getApiErrorMessage(
            latestUpgradeRequestQuery.error,
            'No se pudo cargar el estado de la solicitud de actualización.',
          )}
        />
      ) : null}

      {latestUpgradeRequest ? (
        <Card className={hasPendingUpgradeRequest ? 'border-amber-200' : undefined}>
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
          </CardContent>
        </Card>
      ) : null}

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Comparación de planes</h2>
            <p className="mt-1 text-sm leading-6 text-muted">
              Revisa la capacidad disponible para cada etapa de tu operación.
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
          {planDefinitions.map((definition) => {
            const isCurrentPlan = definition.plan === planUsageQuery.data?.plan
            const isHigherPlan = higherPlans.includes(definition.plan)

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
                      disabled={isCurrentPlan || !isHigherPlan || hasPendingUpgradeRequest}
                      onClick={() => openUpgradeRequestModal(definition.plan)}
                      variant={isCurrentPlan ? 'secondary' : 'primary'}
                    >
                      {isCurrentPlan
                        ? 'Plan actual'
                        : !isHigherPlan
                          ? 'No disponible'
                          : hasPendingUpgradeRequest
                            ? 'Solicitud pendiente'
                            : 'Solicitar actualización'}
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
          availablePlans={higherPlans}
          initialPlan={selectedRequestedPlan}
          isSubmitting={createUpgradeRequestMutation.isPending}
          onClose={() => setSelectedRequestedPlan(null)}
          onSubmit={handleCreateUpgradeRequest}
        />
      ) : null}
    </div>
  )
}

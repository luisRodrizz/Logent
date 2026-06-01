import { Check, CircleAlert } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '../../components/common/PageHeader'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { formatNumber } from '../../lib/format'
import { getPlanResourceLimitStatus } from './plan-limit.helpers'
import { planDefinitions, planResourceLabels, planResources } from './plan.constants'
import { usePlanUsage } from './plan.queries'
import { PlanUsageCard } from './PlanUsageCard'
import type { PlanType } from './plan.types'

const planBadgeVariants: Record<PlanType, 'default' | 'muted' | 'success' | 'warning'> = {
  Enterprise: 'warning',
  Free: 'muted',
  Pro: 'success',
  Starter: 'default',
}

function handleRequestUpgrade() {
  toast.info('La actualización de plan se gestiona con el administrador de LOGENT.')
}

export function PlanPage() {
  const planUsageQuery = usePlanUsage()
  const resourceStatuses = planUsageQuery.data
    ? planResources.map((resource) => getPlanResourceLimitStatus(planUsageQuery.data, resource))
    : []
  const hasReachedLimit = resourceStatuses.some((status) => status.isAtLimit)
  const isNearLimit = !hasReachedLimit && resourceStatuses.some((status) => status.isNearLimit)

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

      <PlanUsageCard />

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Comparación de planes</h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            Revisa la capacidad disponible para cada etapa de tu operación.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {planDefinitions.map((definition) => {
            const isCurrentPlan = definition.plan === planUsageQuery.data?.plan

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
                      disabled={isCurrentPlan}
                      onClick={handleRequestUpgrade}
                      variant={isCurrentPlan ? 'secondary' : 'primary'}
                    >
                      {isCurrentPlan ? 'Plan actual' : 'Solicitar actualización'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>
    </div>
  )
}

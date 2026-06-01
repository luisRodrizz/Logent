import { Boxes, Tags, Truck, UsersRound, Warehouse } from 'lucide-react'
import { toast } from 'sonner'
import { LoadingState } from '../../components/common/LoadingState'
import { SectionError } from '../../components/common/SectionError'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { getApiErrorMessage } from '../../lib/api-error'
import { formatNumber } from '../../lib/format'
import { usePlanUsage } from './plan.queries'
import type { PlanType, PlanUsageMetrics } from './plan.types'

const enterpriseLimit = 2147483647

const metrics: Array<{
  icon: React.ComponentType<{ className?: string }>
  key: keyof PlanUsageMetrics
  label: string
}> = [
  { icon: UsersRound, key: 'users', label: 'Usuarios' },
  { icon: Boxes, key: 'products', label: 'Productos' },
  { icon: Warehouse, key: 'warehouses', label: 'Almacenes' },
  { icon: Truck, key: 'suppliers', label: 'Proveedores' },
  { icon: Tags, key: 'categories', label: 'Categorías' },
]

const planBadgeVariants: Record<PlanType, 'default' | 'success' | 'warning' | 'muted'> = {
  Enterprise: 'warning',
  Free: 'muted',
  Pro: 'success',
  Starter: 'default',
}

function getMetricStatus(used: number, limit: number) {
  if (limit >= enterpriseLimit) {
    return { barClassName: 'bg-[#14B8A6]', label: 'Sin límite práctico', textClassName: 'text-muted' }
  }

  if (used >= limit) {
    return { barClassName: 'bg-red-500', label: 'Límite alcanzado', textClassName: 'text-red-700' }
  }

  if (used / limit >= 0.8) {
    return { barClassName: 'bg-amber-500', label: 'Cerca del límite', textClassName: 'text-amber-700' }
  }

  return { barClassName: 'bg-[#1017D8]', label: 'Disponible', textClassName: 'text-muted' }
}

function getProgress(used: number, limit: number) {
  if (limit >= enterpriseLimit) {
    return 0
  }

  return Math.min(100, Math.round((used / limit) * 100))
}

export function PlanUsageCard() {
  const planUsageQuery = usePlanUsage()

  return (
    <Card className="overflow-hidden border-t-2 border-t-[#14B8A6]">
      <CardHeader className="gap-4 sm:flex sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle>Uso del plan</CardTitle>
            {planUsageQuery.data ? (
              <Badge variant={planBadgeVariants[planUsageQuery.data.plan]}>{planUsageQuery.data.plan}</Badge>
            ) : null}
          </div>
          <CardDescription>Controla el consumo de recursos incluidos en tu plan actual.</CardDescription>
        </div>
        <Button
          className="shrink-0"
          onClick={() => toast.info('La actualización de plan se gestiona con el administrador de LOGENT.')}
          size="sm"
          variant="secondary"
        >
          Solicitar actualización
        </Button>
      </CardHeader>
      <CardContent>
        {planUsageQuery.isLoading ? (
          <LoadingState text="Cargando uso del plan..." />
        ) : planUsageQuery.isError ? (
          <SectionError text={getApiErrorMessage(planUsageQuery.error, 'No se pudo cargar el uso del plan.')} />
        ) : planUsageQuery.data ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {metrics.map(({ icon: Icon, key, label }) => {
              const used = planUsageQuery.data.usage[key]
              const limit = planUsageQuery.data.limits[key]
              const status = getMetricStatus(used, limit)

              return (
                <div className="rounded-lg border border-border bg-slate-50/70 p-4" key={key}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground">{label}</p>
                    <Icon className="h-4 w-4 text-[#14B8A6]" />
                  </div>
                  <p className="mt-3 text-lg font-semibold text-foreground">
                    {formatNumber(used)}
                    <span className="ml-1 text-sm font-medium text-muted">
                      / {limit >= enterpriseLimit ? '∞' : formatNumber(limit)}
                    </span>
                  </p>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`h-full rounded-full ${status.barClassName}`}
                      style={{ width: `${getProgress(used, limit)}%` }}
                    />
                  </div>
                  <p className={`mt-2 text-xs font-medium ${status.textClassName}`}>{status.label}</p>
                </div>
              )
            })}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

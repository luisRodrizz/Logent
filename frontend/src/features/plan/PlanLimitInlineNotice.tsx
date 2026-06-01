import { CircleGauge, CircleAlert } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { formatNumber } from '../../lib/format'
import { usePlanResourceLimit, type PlanResource } from './plan-limit.helpers'

export function PlanLimitInlineNotice({ resource }: { resource: PlanResource }) {
  const { isError, isLoading, status } = usePlanResourceLimit(resource)

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-border bg-white px-4 py-3 text-sm text-muted">
        <span className="h-2 w-2 animate-pulse rounded-full bg-[#14B8A6]" />
        Cargando uso del plan...
      </div>
    )
  }

  if (isError || !status) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-border bg-white px-4 py-3 text-sm text-muted">
        <CircleAlert className="h-4 w-4 shrink-0 text-amber-600" />
        No se pudo cargar el uso del plan. El servidor validará el límite al crear.
      </div>
    )
  }

  const badgeVariant = status.isAtLimit ? 'danger' : status.isNearLimit ? 'warning' : status.isUnlimited ? 'success' : 'muted'
  const stateLabel = status.isAtLimit
    ? 'Límite alcanzado'
    : status.isNearLimit
      ? 'Cerca del límite'
      : status.isUnlimited
        ? 'Sin límite práctico'
        : 'Disponible'

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <CircleGauge className="mt-0.5 h-4 w-4 shrink-0 text-[#14B8A6]" />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold capitalize text-foreground">{status.label}</p>
            <Badge variant={badgeVariant}>{stateLabel}</Badge>
            <span className="text-xs font-medium text-muted">
              {formatNumber(status.current)} / {status.isUnlimited ? '∞' : formatNumber(status.limit)}
            </span>
          </div>
          <p className="mt-1 text-xs leading-5 text-muted">
            {status.isUnlimited
              ? `Tu plan dispone de capacidad práctica ilimitada para ${status.label}.`
              : status.isAtLimit
                ? `Has alcanzado el límite de ${status.label} de tu plan. Actualiza tu plan para crear más recursos.`
                : `Tu plan actual permite hasta ${formatNumber(status.limit)} ${status.label}.`}
          </p>
        </div>
      </div>

      {status.isAtLimit ? (
        <Button
          className="shrink-0"
          onClick={() => toast.info('La actualización de plan se gestiona con el administrador de LOGENT.')}
          size="sm"
          variant="secondary"
        >
          Solicitar actualización
        </Button>
      ) : null}
    </div>
  )
}

import { X } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { formatCurrency, formatDateTime } from '../../lib/format'
import type { Movement, MovementType } from '../../types/movement'

type MovementDetailsModalProps = {
  movement: Movement | null
  onClose: () => void
}

const movementLabels: Record<MovementType, string> = {
  Entry: 'Entrada',
  Exit: 'Salida',
  Transfer: 'Transferencia',
}

const movementBadgeVariants: Record<MovementType, 'default' | 'success' | 'warning' | 'danger' | 'muted'> = {
  Entry: 'success',
  Exit: 'warning',
  Transfer: 'default',
}

export function MovementDetailsModal({ movement, onClose }: MovementDetailsModalProps) {
  if (!movement) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/50 px-4 py-6 sm:items-center">
      <Card aria-modal="true" className="max-h-[92vh] w-full max-w-4xl overflow-y-auto" role="dialog">
        <CardHeader className="relative pr-14">
          <div className="mb-3">
            <Badge variant={movementBadgeVariants[movement.type]}>{movementLabels[movement.type]}</Badge>
          </div>
          <CardTitle>Detalle de movimiento</CardTitle>
          <CardDescription>{formatDateTime(movement.date)}</CardDescription>
          <Button
            aria-label="Cerrar detalle"
            className="absolute right-4 top-4 h-9 w-9 p-0"
            onClick={onClose}
            variant="ghost"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-border bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase text-muted">Origen</p>
              <p className="mt-2 text-sm font-semibold text-foreground">
                {movement.warehouseOriginName || 'No aplica'}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase text-muted">Destino</p>
              <p className="mt-2 text-sm font-semibold text-foreground">
                {movement.warehouseDestinationName || 'No aplica'}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase text-muted">Usuario</p>
              <p className="mt-2 truncate text-sm font-semibold text-foreground">{movement.createdByUserId}</p>
            </div>
          </div>

          {movement.observation ? (
            <div className="rounded-lg border border-border bg-white p-4">
              <p className="text-xs font-semibold uppercase text-muted">Observacion</p>
              <p className="mt-2 text-sm leading-6 text-foreground">{movement.observation}</p>
            </div>
          ) : null}

          <div className="overflow-hidden rounded-lg border border-border">
            <div className="grid grid-cols-[1.2fr_0.5fr_0.6fr] gap-3 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase text-muted">
              <span>Producto</span>
              <span className="text-right">Cantidad</span>
              <span className="text-right">Costo unit.</span>
            </div>
            <div className="divide-y divide-border">
              {movement.details.map((detail) => (
                <div className="grid grid-cols-[1.2fr_0.5fr_0.6fr] items-center gap-3 px-4 py-3" key={detail.id}>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{detail.productName}</p>
                    <p className="mt-1 text-xs text-muted">{detail.productCode}</p>
                  </div>
                  <p className="text-right text-sm font-semibold text-foreground">{detail.quantity}</p>
                  <p className="text-right text-sm font-medium text-muted">{formatCurrency(detail.unitCost)}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

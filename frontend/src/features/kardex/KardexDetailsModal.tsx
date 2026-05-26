import { X } from 'lucide-react'
import { ModalOverlay } from '../../components/common/ModalOverlay'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { formatCurrency, formatDateTime } from '../../lib/format'
import type { KardexEntry, KardexMovementType } from '../../types/kardex'

type KardexDetailsModalProps = {
  entry: KardexEntry | null
  onClose: () => void
}

const movementLabels: Record<KardexMovementType, string> = {
  Adjustment: 'Ajuste',
  Entry: 'Entrada',
  Exit: 'Salida',
  Transfer: 'Transferencia',
}

const movementBadgeVariants: Record<KardexMovementType, 'default' | 'success' | 'warning' | 'danger' | 'muted'> = {
  Adjustment: 'muted',
  Entry: 'success',
  Exit: 'warning',
  Transfer: 'default',
}

function getQuantityIn(entry: KardexEntry): number {
  return entry.stockAfter > entry.stockBefore ? entry.quantity : 0
}

function getQuantityOut(entry: KardexEntry): number {
  return entry.stockAfter < entry.stockBefore ? entry.quantity : 0
}

export function KardexDetailsModal({ entry, onClose }: KardexDetailsModalProps) {
  if (!entry) {
    return null
  }

  const quantityIn = getQuantityIn(entry)
  const quantityOut = getQuantityOut(entry)
  const totalCost = entry.quantity * entry.unitCost

  return (
    <ModalOverlay>
      <Card aria-modal="true" className="max-h-[calc(100vh-48px)] w-full max-w-4xl overflow-y-auto" role="dialog">
        <CardHeader className="relative pr-14">
          <div className="mb-3">
            <Badge variant={movementBadgeVariants[entry.movementType]}>{movementLabels[entry.movementType]}</Badge>
          </div>
          <CardTitle>Detalle Kardex</CardTitle>
          <CardDescription>{formatDateTime(entry.date)}</CardDescription>
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
              <p className="text-xs font-semibold uppercase text-muted">Producto</p>
              <p className="mt-2 text-sm font-semibold text-foreground">{entry.productName}</p>
              <p className="mt-1 text-xs text-muted">{entry.productCode}</p>
            </div>
            <div className="rounded-lg border border-border bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase text-muted">Almacen</p>
              <p className="mt-2 text-sm font-semibold text-foreground">{entry.warehouseName}</p>
            </div>
            <div className="rounded-lg border border-border bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase text-muted">Movimiento</p>
              <p className="mt-2 truncate text-sm font-semibold text-foreground">{entry.movementId ?? 'Sin referencia'}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-border bg-white p-4">
              <p className="text-xs font-semibold uppercase text-muted">Entrada</p>
              <p className="mt-2 text-xl font-semibold text-emerald-700">{quantityIn}</p>
            </div>
            <div className="rounded-lg border border-border bg-white p-4">
              <p className="text-xs font-semibold uppercase text-muted">Salida</p>
              <p className="mt-2 text-xl font-semibold text-amber-700">{quantityOut}</p>
            </div>
            <div className="rounded-lg border border-border bg-white p-4">
              <p className="text-xs font-semibold uppercase text-muted">Saldo antes</p>
              <p className="mt-2 text-xl font-semibold text-foreground">{entry.stockBefore}</p>
            </div>
            <div className="rounded-lg border border-border bg-white p-4">
              <p className="text-xs font-semibold uppercase text-muted">Saldo despues</p>
              <p className="mt-2 text-xl font-semibold text-foreground">{entry.stockAfter}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-border bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase text-muted">Costo unitario</p>
              <p className="mt-2 text-sm font-semibold text-foreground">{formatCurrency(entry.unitCost)}</p>
            </div>
            <div className="rounded-lg border border-border bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase text-muted">Costo total</p>
              <p className="mt-2 text-sm font-semibold text-foreground">{formatCurrency(totalCost)}</p>
            </div>
            <div className="rounded-lg border border-border bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase text-muted">Usuario</p>
              <p className="mt-2 truncate text-sm font-semibold text-foreground">{entry.createdByUserId}</p>
            </div>
          </div>

          {entry.observation ? (
            <div className="rounded-lg border border-border bg-white p-4">
              <p className="text-xs font-semibold uppercase text-muted">Observacion</p>
              <p className="mt-2 text-sm leading-6 text-foreground">{entry.observation}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </ModalOverlay>
  )
}

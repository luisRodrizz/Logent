import { X } from 'lucide-react'
import { LoadingState } from '../../components/common/LoadingState'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { getApiErrorMessage } from '../../lib/api-error'
import { formatDateTime } from '../../lib/format'
import type { AuditAction } from '../../types/audit-log'
import { useAuditLog } from './audit-logs.queries'

type AuditLogDetailsModalProps = {
  logId: string | null
  onClose: () => void
}

const actionLabels: Record<AuditAction, string> = {
  Create: 'Creacion',
  Delete: 'Eliminacion',
  Login: 'Login',
  Logout: 'Logout',
  StockAdjustment: 'Ajuste stock',
  StockEntry: 'Entrada stock',
  StockExit: 'Salida stock',
  StockTransfer: 'Transferencia stock',
  Update: 'Actualizacion',
}

const actionBadgeVariants: Record<AuditAction, 'default' | 'success' | 'warning' | 'danger' | 'muted'> = {
  Create: 'success',
  Delete: 'danger',
  Login: 'default',
  Logout: 'muted',
  StockAdjustment: 'warning',
  StockEntry: 'success',
  StockExit: 'danger',
  StockTransfer: 'default',
  Update: 'warning',
}

function formatValue(value?: string | null): string {
  return value && value.trim().length > 0 ? value : 'No registrado'
}

function formatDescription(value?: string | null): string {
  if (!value) {
    return 'No hay descripcion registrada para este evento.'
  }

  try {
    return JSON.stringify(JSON.parse(value), null, 2)
  } catch {
    return value
  }
}

export function AuditLogDetailsModal({ logId, onClose }: AuditLogDetailsModalProps) {
  const logQuery = useAuditLog(logId)

  if (!logId) {
    return null
  }

  const auditLog = logQuery.data

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/50 px-4 py-6 sm:items-center">
      <Card aria-modal="true" className="max-h-[92vh] w-full max-w-4xl overflow-y-auto" role="dialog">
        <CardHeader className="relative pr-14">
          {auditLog ? (
            <div className="mb-3">
              <Badge variant={actionBadgeVariants[auditLog.action]}>{actionLabels[auditLog.action]}</Badge>
            </div>
          ) : null}
          <CardTitle>Detalle de auditoria</CardTitle>
          <CardDescription>
            {auditLog ? formatDateTime(auditLog.createdAt) : 'Cargando evento auditado'}
          </CardDescription>
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
          {logQuery.isLoading ? (
            <LoadingState text="Cargando detalle de auditoria..." />
          ) : logQuery.isError ? (
            <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {getApiErrorMessage(logQuery.error, 'No se pudo cargar la informacion de auditoria.')}
            </div>
          ) : auditLog ? (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-border bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase text-muted">Accion</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">{actionLabels[auditLog.action]}</p>
                </div>
                <div className="rounded-lg border border-border bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase text-muted">Entidad</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">{auditLog.entityName}</p>
                </div>
                <div className="rounded-lg border border-border bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase text-muted">Entity ID</p>
                  <p className="mt-2 break-all text-sm font-semibold text-foreground">
                    {formatValue(auditLog.entityId)}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-border bg-white p-4 md:col-span-2">
                  <p className="text-xs font-semibold uppercase text-muted">Usuario</p>
                  <p className="mt-2 break-all text-sm font-semibold text-foreground">
                    {formatValue(auditLog.userId)}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-white p-4">
                  <p className="text-xs font-semibold uppercase text-muted">Fecha</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">{formatDateTime(auditLog.createdAt)}</p>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-slate-950 p-4">
                <p className="text-xs font-semibold uppercase text-slate-300">Descripcion</p>
                <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-words text-xs leading-6 text-slate-100">
                  {formatDescription(auditLog.description)}
                </pre>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}

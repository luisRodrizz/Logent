import { X } from 'lucide-react'
import { LoadingState } from '../../components/common/LoadingState'
import { ModalOverlay } from '../../components/common/ModalOverlay'
import { SectionError } from '../../components/common/SectionError'
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
  BillingCheckoutCompleted: 'Checkout completado',
  BillingPaymentFailed: 'Pago fallido',
  BillingPaymentSucceeded: 'Pago exitoso',
  BillingSubscriptionCancelled: 'Suscripción cancelada',
  BillingSubscriptionStatusChanged: 'Estado de suscripción',
  BillingSubscriptionUpdated: 'Suscripción actualizada',
  CompanyProfileUpdated: 'Empresa actualizada',
  Create: 'Creación',
  Delete: 'Eliminación',
  Login: 'Inicio de sesión',
  Logout: 'Cierre de sesión',
  PlanChangedByStripe: 'Plan actualizado por Stripe',
  PlanUpgradeApproved: 'Upgrade aprobado',
  PlanUpgradeRejected: 'Upgrade rechazado',
  PlanUpgradeRequested: 'Upgrade solicitado',
  PlatformCompanyPlanChanged: 'Plan de empresa',
  PlatformCompanyStatusChanged: 'Estado de empresa',
  ProfilePasswordChanged: 'Contraseña de perfil',
  StockAdjustment: 'Ajuste stock',
  StockEntry: 'Entrada stock',
  StockExit: 'Salida stock',
  StockTransfer: 'Transferencia stock',
  Update: 'Actualización',
  UserCreated: 'Usuario creado',
  UserPasswordChanged: 'Contraseña propia',
  UserPasswordReset: 'Contraseña restablecida',
  UserProfileUpdated: 'Perfil actualizado',
  UserRoleChanged: 'Rol actualizado',
  UserStatusChanged: 'Estado de usuario',
  UserUpdated: 'Usuario actualizado',
}

const actionBadgeVariants: Record<AuditAction, 'default' | 'success' | 'warning' | 'danger' | 'muted'> = {
  BillingCheckoutCompleted: 'success',
  BillingPaymentFailed: 'danger',
  BillingPaymentSucceeded: 'success',
  BillingSubscriptionCancelled: 'danger',
  BillingSubscriptionStatusChanged: 'warning',
  BillingSubscriptionUpdated: 'default',
  CompanyProfileUpdated: 'default',
  Create: 'success',
  Delete: 'danger',
  Login: 'default',
  Logout: 'muted',
  PlanChangedByStripe: 'default',
  PlanUpgradeApproved: 'success',
  PlanUpgradeRejected: 'danger',
  PlanUpgradeRequested: 'warning',
  PlatformCompanyPlanChanged: 'default',
  PlatformCompanyStatusChanged: 'warning',
  ProfilePasswordChanged: 'warning',
  StockAdjustment: 'warning',
  StockEntry: 'success',
  StockExit: 'danger',
  StockTransfer: 'default',
  Update: 'warning',
  UserCreated: 'success',
  UserPasswordChanged: 'warning',
  UserPasswordReset: 'warning',
  UserProfileUpdated: 'default',
  UserRoleChanged: 'warning',
  UserStatusChanged: 'warning',
  UserUpdated: 'default',
}

function formatValue(value?: string | null): string {
  return value && value.trim().length > 0 ? value : 'No registrado'
}

function formatDescription(value?: string | null): string {
  if (!value) {
    return 'No hay descripción registrada para este evento.'
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
    <ModalOverlay>
      <Card aria-modal="true" className="max-h-[calc(100vh-48px)] w-full max-w-4xl overflow-y-auto" role="dialog">
        <CardHeader className="relative pr-14">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              {auditLog ? (
                <div className="mb-3">
                  <Badge variant={actionBadgeVariants[auditLog.action]}>{actionLabels[auditLog.action]}</Badge>
                </div>
              ) : null}
              <CardTitle>Detalle de auditoría</CardTitle>
              <CardDescription>
                {auditLog ? formatDateTime(auditLog.createdAt) : 'Cargando evento auditado'}
              </CardDescription>
            </div>
          </div>
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
            <LoadingState text="Cargando detalle de auditoría..." />
          ) : logQuery.isError ? (
            <SectionError text={getApiErrorMessage(logQuery.error, 'No se pudo cargar la información de auditoría.')} />
          ) : auditLog ? (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-border bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase text-muted">Acción</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">{actionLabels[auditLog.action]}</p>
                </div>
                <div className="rounded-lg border border-border bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase text-muted">Entidad</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">{auditLog.entityName}</p>
                </div>
                <div className="rounded-lg border border-border bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase text-muted">Fecha</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">{formatDateTime(auditLog.createdAt)}</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-border bg-white p-4">
                  <p className="text-xs font-semibold uppercase text-muted">ID de entidad</p>
                  <p className="mt-2 break-all font-mono text-xs font-semibold leading-5 text-foreground">
                    {formatValue(auditLog.entityId)}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-white p-4">
                  <p className="text-xs font-semibold uppercase text-muted">ID de usuario</p>
                  <p className="mt-2 break-all font-mono text-xs font-semibold leading-5 text-foreground">
                    {formatValue(auditLog.userId)}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-white p-4">
                  <p className="text-xs font-semibold uppercase text-muted">IP</p>
                  <p className="mt-2 break-all font-mono text-xs font-semibold leading-5 text-foreground">
                    {formatValue(auditLog.ipAddress)}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase text-muted">Descripción</p>
                <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-md bg-white p-3 text-xs leading-6 text-foreground">
                  {formatDescription(auditLog.description)}
                </pre>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>
    </ModalOverlay>
  )
}

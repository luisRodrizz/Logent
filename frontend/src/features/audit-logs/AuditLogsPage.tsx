import {
  CalendarDays,
  Database,
  Download,
  Eye,
  FilterX,
  Search,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { EmptyState } from '../../components/common/EmptyState'
import { LoadingState } from '../../components/common/LoadingState'
import { PageHeader } from '../../components/common/PageHeader'
import { SectionError } from '../../components/common/SectionError'
import { TableContainer } from '../../components/common/TableContainer'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { getApiErrorMessage } from '../../lib/api-error'
import { formatDateTime, formatNumber } from '../../lib/format'
import type { AuditAction, AuditLog, AuditLogFilters } from '../../types/audit-log'
import { AuditLogDetailsModal } from './AuditLogDetailsModal'
import { useAuditLogs, useExportAuditLogsCsv } from './audit-logs.queries'

const auditActions: AuditAction[] = [
  'Create',
  'Update',
  'Delete',
  'Login',
  'Logout',
  'StockEntry',
  'StockExit',
  'StockAdjustment',
  'StockTransfer',
  'UserCreated',
  'UserUpdated',
  'UserRoleChanged',
  'UserStatusChanged',
  'UserPasswordReset',
  'ProfilePasswordChanged',
  'UserProfileUpdated',
  'UserPasswordChanged',
  'PlanUpgradeRequested',
  'PlanUpgradeApproved',
  'PlanUpgradeRejected',
  'CompanyProfileUpdated',
  'BillingCheckoutCompleted',
  'BillingPaymentFailed',
  'BillingPaymentSucceeded',
  'BillingSubscriptionUpdated',
  'BillingSubscriptionCancelled',
  'BillingSubscriptionStatusChanged',
  'PlanChangedByStripe',
]

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
  UserPasswordChanged: 'Contraseña cambiada',
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

const pageSizeOptions = [10, 20, 50, 100]

function formatValue(value?: string | null, fallback = 'No registrado') {
  return value && value.trim().length > 0 ? value : fallback
}

function SummaryCard({
  description,
  icon,
  title,
  value,
}: {
  description: string
  icon: ReactNode
  title: string
  value: string
}) {
  return (
    <div className="rounded-lg border border-border bg-white px-4 py-3 shadow-[0_1px_2px_rgb(15_23_42/0.03)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted">{title}</p>
          <p className="mt-2 text-lg font-semibold tracking-tight text-foreground">{value}</p>
          <p className="mt-1 text-xs leading-5 text-muted">{description}</p>
        </div>
        <div className="rounded-lg border border-[#28E000]/20 bg-[#28E000]/5 p-2 text-[#147A08]">{icon}</div>
      </div>
    </div>
  )
}

function AuditLogsErrorState({ error }: { error: unknown }) {
  return (
    <Card>
      <CardContent className="px-6 py-10">
        <SectionError text={getApiErrorMessage(error, 'No se pudo cargar la información de auditoría.')} />
      </CardContent>
    </Card>
  )
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

export function AuditLogsPage() {
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState<AuditAction | ''>('')
  const [userIdFilter, setUserIdFilter] = useState('')
  const [entityNameFilter, setEntityNameFilter] = useState('')
  const [entityIdFilter, setEntityIdFilter] = useState('')
  const [fromDateFilter, setFromDateFilter] = useState('')
  const [toDateFilter, setToDateFilter] = useState('')
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearch(searchInput.trim())
      setPageNumber(1)
    }, 350)

    return () => window.clearTimeout(timeoutId)
  }, [searchInput])

  const filters = useMemo<AuditLogFilters>(
    () => ({
      action: actionFilter || undefined,
      entityId: entityIdFilter.trim() || undefined,
      entityName: entityNameFilter.trim() || undefined,
      fromDate: fromDateFilter || undefined,
      pageNumber,
      pageSize,
      search: search || undefined,
      toDate: toDateFilter || undefined,
      userId: userIdFilter.trim() || undefined,
    }),
    [
      actionFilter,
      entityIdFilter,
      entityNameFilter,
      fromDateFilter,
      pageNumber,
      pageSize,
      search,
      toDateFilter,
      userIdFilter,
    ],
  )

  const auditLogsQuery = useAuditLogs(filters)
  const exportCsvMutation = useExportAuditLogsCsv()
  const auditLogs = useMemo(() => auditLogsQuery.data?.items ?? [], [auditLogsQuery.data?.items])

  const hasFilters = Boolean(
    search
      || actionFilter
      || userIdFilter.trim()
      || entityNameFilter.trim()
      || entityIdFilter.trim()
      || fromDateFilter
      || toDateFilter,
  )

  const summary = useMemo(() => {
    const entities = new Set(auditLogs.map((log) => log.entityName)).size
    const users = new Set(auditLogs.map((log) => log.userId).filter(Boolean)).size
    const actions = new Set(auditLogs.map((log) => log.action)).size

    return { actions, entities, users }
  }, [auditLogs])

  function handleFilterChange(update: () => void) {
    update()
    setPageNumber(1)
  }

  function handlePageSizeChange(value: string) {
    setPageSize(Number(value))
    setPageNumber(1)
  }

  function clearFilters() {
    setActionFilter('')
    setEntityIdFilter('')
    setEntityNameFilter('')
    setFromDateFilter('')
    setSearchInput('')
    setSearch('')
    setToDateFilter('')
    setUserIdFilter('')
    setPageNumber(1)
  }

  async function handleExportCsv() {
    try {
      const blob = await exportCsvMutation.mutateAsync(filters)
      downloadBlob(blob, `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`)
      toast.success('Archivo CSV generado correctamente.')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudo exportar la auditoría.'))
    }
  }

  const emptyTitle = hasFilters ? 'Sin resultados' : 'Sin logs de auditoría'
  const emptyDescription = hasFilters
    ? 'No se encontraron logs para los filtros seleccionados.'
    : 'Aún no hay operaciones auditadas para mostrar.'

  return (
    <div className="space-y-6">
      <PageHeader
        action={
          <Button disabled={exportCsvMutation.isPending} onClick={handleExportCsv} variant="secondary">
            <Download className="h-4 w-4" />
            {exportCsvMutation.isPending ? 'Exportando...' : 'Exportar CSV'}
          </Button>
        }
        description="Trazabilidad filtrable de operaciones, accesos y cambios registrados para tu empresa."
        eyebrow="Administración"
        title="Auditoría"
      />

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-col gap-3 border-b border-border pb-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Centro de auditoría tenant</p>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">
                Filtra eventos por acción, usuario, entidad, fechas o texto libre. La exportación respeta los mismos
                filtros y no incluye valores sensibles.
              </p>
            </div>
            <Badge variant="muted">Solo lectura</Badge>
          </div>

          <div className="grid gap-3 xl:grid-cols-[1.4fr_0.8fr_0.9fr_0.9fr]">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground" htmlFor="audit-search">
                Búsqueda general
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  className="h-10 w-full rounded-lg border border-border bg-white pl-10 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-blue-100"
                  id="audit-search"
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Usuario, entidad, ID o descripción"
                  type="search"
                  value={searchInput}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground" htmlFor="audit-action">
                Acción
              </label>
              <select
                className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-blue-100"
                id="audit-action"
                onChange={(event) => handleFilterChange(() => setActionFilter(event.target.value as AuditAction | ''))}
                value={actionFilter}
              >
                <option value="">Todas</option>
                {auditActions.map((action) => (
                  <option key={action} value={action}>
                    {actionLabels[action]}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground" htmlFor="audit-user">
                Usuario
              </label>
              <input
                className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-blue-100"
                id="audit-user"
                onChange={(event) => handleFilterChange(() => setUserIdFilter(event.target.value))}
                placeholder="ID de usuario"
                value={userIdFilter}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground" htmlFor="audit-entity">
                Entidad / módulo
              </label>
              <input
                className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-blue-100"
                id="audit-entity"
                onChange={(event) => handleFilterChange(() => setEntityNameFilter(event.target.value))}
                placeholder="Ej. Product, Billing"
                value={entityNameFilter}
              />
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1fr_0.8fr_0.8fr_auto] lg:items-end">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground" htmlFor="audit-entity-id">
                ID de entidad
              </label>
              <input
                className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-blue-100"
                id="audit-entity-id"
                onChange={(event) => handleFilterChange(() => setEntityIdFilter(event.target.value))}
                placeholder="ID exacto o parcial"
                value={entityIdFilter}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground" htmlFor="audit-from-date">
                Desde
              </label>
              <input
                className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-blue-100"
                id="audit-from-date"
                onChange={(event) => handleFilterChange(() => setFromDateFilter(event.target.value))}
                type="date"
                value={fromDateFilter}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground" htmlFor="audit-to-date">
                Hasta
              </label>
              <input
                className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-blue-100"
                id="audit-to-date"
                onChange={(event) => handleFilterChange(() => setToDateFilter(event.target.value))}
                type="date"
                value={toDateFilter}
              />
            </div>

            <Button className="w-full lg:w-auto" disabled={!hasFilters} onClick={clearFilters} variant="secondary">
              <FilterX className="h-4 w-4" />
              Limpiar filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          description="Según filtros aplicados"
          icon={<ShieldCheck className="h-4 w-4" />}
          title="Registros encontrados"
          value={formatNumber(auditLogsQuery.data?.totalCount ?? 0)}
        />
        <SummaryCard
          description="En la página actual"
          icon={<UserRound className="h-4 w-4" />}
          title="Usuarios visibles"
          value={formatNumber(summary.users)}
        />
        <SummaryCard
          description="Módulos afectados"
          icon={<Database className="h-4 w-4" />}
          title="Entidades visibles"
          value={formatNumber(summary.entities)}
        />
        <SummaryCard
          description="Tipos de eventos"
          icon={<CalendarDays className="h-4 w-4" />}
          title="Acciones visibles"
          value={formatNumber(summary.actions)}
        />
      </div>

      {auditLogsQuery.isLoading ? (
        <Card>
          <CardContent>
            <LoadingState text="Cargando logs de auditoría..." />
          </CardContent>
        </Card>
      ) : auditLogsQuery.isError ? (
        <AuditLogsErrorState error={auditLogsQuery.error} />
      ) : auditLogs.length === 0 ? (
        <EmptyState description={emptyDescription} icon={<ShieldCheck className="h-6 w-6" />} title={emptyTitle} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Registro de auditoría</CardTitle>
            <CardDescription>
              {formatNumber(auditLogsQuery.data?.totalCount ?? auditLogs.length)} registros encontrados.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <TableContainer>
              <table className="w-full min-w-[1180px] table-fixed divide-y divide-border">
                <colgroup>
                  <col className="w-[14%]" />
                  <col className="w-[17%]" />
                  <col className="w-[14%]" />
                  <col className="w-[18%]" />
                  <col className="w-[23%]" />
                  <col className="w-[8%]" />
                  <col className="w-[6%]" />
                </colgroup>
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Fecha</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Usuario</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Acción</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Entidad</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Descripción</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">IP</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-muted">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-white">
                  {auditLogs.map((log: AuditLog) => (
                    <tr className="transition-colors hover:bg-slate-50/80" key={log.id}>
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-muted">
                        {formatDateTime(log.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex min-w-0 items-center gap-2">
                          <UserRound className="h-4 w-4 shrink-0 text-muted" />
                          <span className="block truncate font-mono text-xs text-muted">
                            {formatValue(log.userId)}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant={actionBadgeVariants[log.action]}>{actionLabels[log.action]}</Badge>
                      </td>
                      <td className="px-5 py-4">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">{log.entityName}</p>
                          <p className="mt-1 truncate font-mono text-xs text-muted">{formatValue(log.entityId)}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="line-clamp-2 text-sm leading-5 text-muted">
                          {formatValue(log.description, 'Sin descripción')}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-sm text-muted">{formatValue(log.ipAddress)}</td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end">
                          <Button
                            aria-label="Ver detalle de auditoría"
                            className="h-9 w-9 p-0"
                            onClick={() => setSelectedLogId(log.id)}
                            title="Ver detalle"
                            variant="secondary"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableContainer>

            <div className="flex flex-col gap-3 border-t border-border px-5 py-4 md:flex-row md:items-center md:justify-between">
              <label className="flex items-center gap-2 text-sm text-muted">
                Filas
                <select
                  className="h-10 rounded-lg border border-border bg-white px-3 text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-blue-100"
                  onChange={(event) => handlePageSizeChange(event.target.value)}
                  value={pageSize}
                >
                  {pageSizeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <p className="text-sm text-muted">
                  Página {auditLogsQuery.data?.pageNumber ?? pageNumber} de {auditLogsQuery.data?.totalPages ?? 1} ·{' '}
                  {formatNumber(auditLogsQuery.data?.totalCount ?? 0)} registros
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    disabled={!auditLogsQuery.data?.hasPreviousPage}
                    onClick={() => setPageNumber((current) => Math.max(current - 1, 1))}
                    variant="secondary"
                  >
                    Anterior
                  </Button>
                  <Button
                    disabled={!auditLogsQuery.data?.hasNextPage}
                    onClick={() => setPageNumber((current) => current + 1)}
                    variant="secondary"
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <AuditLogDetailsModal logId={selectedLogId} onClose={() => setSelectedLogId(null)} />
    </div>
  )
}

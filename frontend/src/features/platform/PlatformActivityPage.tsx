import { Activity, ChevronLeft, ChevronRight, ExternalLink, RotateCcw, Search } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState } from '../../components/common/EmptyState'
import { LoadingState } from '../../components/common/LoadingState'
import { PageHeader } from '../../components/common/PageHeader'
import { SectionError } from '../../components/common/SectionError'
import { TableContainer } from '../../components/common/TableContainer'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardContent } from '../../components/ui/Card'
import { getApiErrorMessage } from '../../lib/api-error'
import { formatDateTime, formatNumber } from '../../lib/format'
import { usePlatformActivity } from './platform-activity.queries'
import {
  platformActivityActions,
  type PlatformActivityAction,
  type PlatformActivityItem,
} from './platform-activity.types'

const PAGE_SIZE = 20

const actionLabels: Record<PlatformActivityAction, string> = {
  Create: 'Creación',
  Delete: 'Eliminación',
  Login: 'Inicio de sesión',
  Logout: 'Cierre de sesión',
  PlanUpgradeApproved: 'Solicitud aprobada',
  PlanUpgradeRejected: 'Solicitud rechazada',
  PlanUpgradeRequested: 'Solicitud de plan',
  PlatformCompanyPlanChanged: 'Plan actualizado',
  PlatformCompanyStatusChanged: 'Estado de empresa',
  ProfilePasswordChanged: 'Contraseña propia',
  StockAdjustment: 'Ajuste de stock',
  StockEntry: 'Entrada de stock',
  StockExit: 'Salida de stock',
  StockTransfer: 'Transferencia',
  Update: 'Actualización',
  UserCreated: 'Usuario creado',
  UserPasswordReset: 'Contraseña reiniciada',
  UserRoleChanged: 'Rol actualizado',
  UserStatusChanged: 'Estado de usuario',
  UserUpdated: 'Usuario actualizado',
}

function getActionBadgeVariant(action: PlatformActivityAction) {
  if (action === 'Delete' || action === 'PlanUpgradeRejected') {
    return 'danger' as const
  }

  if (
    action === 'Create'
    || action === 'PlanUpgradeApproved'
    || action === 'StockEntry'
    || action === 'UserCreated'
  ) {
    return 'success' as const
  }

  if (action === 'PlanUpgradeRequested' || action === 'StockAdjustment') {
    return 'warning' as const
  }

  return 'default' as const
}

function getUserLabel(activity: PlatformActivityItem) {
  return activity.userEmail || activity.userId || 'Sistema'
}

export function PlatformActivityPage() {
  const [action, setAction] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const activityQuery = usePlatformActivity({
    action: (action || undefined) as PlatformActivityAction | undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    page,
    pageSize: PAGE_SIZE,
    search: search.trim() || undefined,
  })
  const activities = activityQuery.data?.items ?? []
  const hasFilters = Boolean(action || dateFrom || dateTo || search)

  function clearFilters() {
    setAction('')
    setDateFrom('')
    setDateTo('')
    setPage(1)
    setSearch('')
  }

  function resetPagination() {
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        description="Registro global de acciones relevantes en LOGENT."
        eyebrow="Plataforma"
        title="Actividad de plataforma"
      />

      <Card>
        <CardContent className="space-y-5">
          <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_220px_170px_170px_auto]">
            <label className="relative block">
              <span className="sr-only">Buscar actividad</span>
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" aria-hidden="true" />
              <input
                className="h-10 w-full rounded-lg border border-border bg-white pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-slate-400 focus:border-[#1017D8]/50 focus:ring-2 focus:ring-[#1017D8]/10"
                onChange={(event) => {
                  setSearch(event.target.value)
                  resetPagination()
                }}
                placeholder="Buscar empresa, usuario, entidad o descripción"
                type="search"
                value={search}
              />
            </label>

            <label>
              <span className="sr-only">Filtrar por acción</span>
              <select
                className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none focus:border-[#1017D8]/50 focus:ring-2 focus:ring-[#1017D8]/10"
                onChange={(event) => {
                  setAction(event.target.value)
                  resetPagination()
                }}
                value={action}
              >
                <option value="">Todas las acciones</option>
                {platformActivityActions.map((activityAction) => (
                  <option key={activityAction} value={activityAction}>
                    {actionLabels[activityAction]}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="sr-only">Fecha inicial</span>
              <input
                className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none focus:border-[#1017D8]/50 focus:ring-2 focus:ring-[#1017D8]/10"
                onChange={(event) => {
                  setDateFrom(event.target.value)
                  resetPagination()
                }}
                title="Fecha inicial"
                type="date"
                value={dateFrom}
              />
            </label>

            <label>
              <span className="sr-only">Fecha final</span>
              <input
                className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none focus:border-[#1017D8]/50 focus:ring-2 focus:ring-[#1017D8]/10"
                onChange={(event) => {
                  setDateTo(event.target.value)
                  resetPagination()
                }}
                title="Fecha final"
                type="date"
                value={dateTo}
              />
            </label>

            <Button disabled={!hasFilters} onClick={clearFilters} size="sm" variant="secondary">
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Limpiar
            </Button>
          </div>

          {activityQuery.isLoading ? <LoadingState text="Cargando actividad global..." /> : null}

          {activityQuery.isError ? (
            <SectionError
              text={getApiErrorMessage(activityQuery.error, 'No se pudo cargar la actividad de plataforma.')}
            />
          ) : null}

          {!activityQuery.isLoading && !activityQuery.isError && activities.length === 0 ? (
            <EmptyState
              description="No encontramos registros que coincidan con los filtros actuales."
              icon={<Activity className="h-6 w-6" />}
              title="Sin actividad disponible"
            />
          ) : null}

          {!activityQuery.isLoading && !activityQuery.isError && activities.length > 0 ? (
            <>
              <TableContainer>
                <table className="min-w-[1240px] table-fixed w-full text-left text-sm">
                  <colgroup>
                    <col className="w-[14%]" />
                    <col className="w-[16%]" />
                    <col className="w-[17%]" />
                    <col className="w-[15%]" />
                    <col className="w-[14%]" />
                    <col className="w-[19%]" />
                    <col className="w-[5%]" />
                  </colgroup>
                  <thead className="border-b border-border bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Fecha</th>
                      <th className="px-4 py-3 font-semibold">Empresa</th>
                      <th className="px-4 py-3 font-semibold">Usuario</th>
                      <th className="px-4 py-3 font-semibold">Acción</th>
                      <th className="px-4 py-3 font-semibold">Entidad</th>
                      <th className="px-4 py-3 font-semibold">Descripción</th>
                      <th className="px-4 py-3 text-right font-semibold">Detalle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {activities.map((activity) => (
                      <tr className="bg-white transition-colors hover:bg-slate-50/80" key={activity.id}>
                        <td className="whitespace-nowrap px-4 py-4 text-slate-600">{formatDateTime(activity.createdAt)}</td>
                        <td className="px-4 py-4">
                          <p className="truncate font-medium text-foreground">{activity.companyName || 'Sin empresa'}</p>
                          <p className="mt-1 truncate text-xs text-muted">{activity.companyId || 'Actividad global'}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="truncate text-slate-700">{getUserLabel(activity)}</p>
                          {activity.userEmail && activity.userId ? (
                            <p className="mt-1 truncate font-mono text-[11px] text-muted">ID: {activity.userId}</p>
                          ) : null}
                        </td>
                        <td className="px-4 py-4">
                          <Badge variant={getActionBadgeVariant(activity.action)}>{actionLabels[activity.action]}</Badge>
                        </td>
                        <td className="px-4 py-4">
                          <p className="truncate font-medium text-slate-700">{activity.entityName}</p>
                          <p className="mt-1 truncate font-mono text-[11px] text-muted">{activity.entityId || 'Sin ID'}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="line-clamp-2 text-slate-600">{activity.description || 'Sin descripción'}</p>
                        </td>
                        <td className="px-4 py-4 text-right">
                          {activity.companyId ? (
                            <Link
                              aria-label={`Ver detalle de ${activity.companyName || 'empresa'}`}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-primary transition-colors hover:border-[#1017D8]/30 hover:bg-[#1017D8]/5"
                              title="Ver empresa"
                              to={`/platform/companies/${activity.companyId}`}
                            >
                              <ExternalLink className="h-4 w-4" aria-hidden="true" />
                            </Link>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableContainer>

              <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted">
                  {formatNumber(activityQuery.data?.totalItems)} registros · Página {activityQuery.data?.page ?? 1} de{' '}
                  {Math.max(activityQuery.data?.totalPages ?? 0, 1)}
                </p>
                <div className="flex gap-2">
                  <Button
                    disabled={(activityQuery.data?.page ?? 1) <= 1}
                    onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                    size="sm"
                    variant="secondary"
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    Anterior
                  </Button>
                  <Button
                    disabled={(activityQuery.data?.page ?? 1) >= (activityQuery.data?.totalPages ?? 0)}
                    onClick={() => setPage((currentPage) => currentPage + 1)}
                    size="sm"
                    variant="secondary"
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}

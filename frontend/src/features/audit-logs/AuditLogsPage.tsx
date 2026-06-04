import { Eye, FilterX, PencilLine, PlusCircle, Search, ShieldCheck, Trash2, UserRound } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
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
import type { AuditAction, AuditLog, AuditLogSpecificFilter } from '../../types/audit-log'
import { AuditLogDetailsModal } from './AuditLogDetailsModal'
import {
  useAuditLogs,
  useAuditLogsByAction,
  useAuditLogsByEntity,
  useAuditLogsByUser,
} from './audit-logs.queries'

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
  'UserProfileUpdated',
  'UserPasswordChanged',
]

const actionLabels: Record<AuditAction, string> = {
  Create: 'Creación',
  Delete: 'Eliminación',
  Login: 'Inicio de sesión',
  Logout: 'Cierre de sesión',
  StockAdjustment: 'Ajuste stock',
  StockEntry: 'Entrada stock',
  StockExit: 'Salida stock',
  StockTransfer: 'Transferencia stock',
  Update: 'Actualización',
  UserPasswordChanged: 'Contraseña propia',
  UserProfileUpdated: 'Perfil actualizado',
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
  UserPasswordChanged: 'warning',
  UserProfileUpdated: 'default',
}

const pageSizeOptions = [10, 20, 50]

function AuditLogsErrorState({ error }: { error: unknown }) {
  return (
    <Card>
      <CardContent className="px-6 py-10">
        <SectionError text={getApiErrorMessage(error, 'No se pudo cargar la información de auditoría.')} />
      </CardContent>
    </Card>
  )
}

function SummaryCard({
  description,
  icon,
  title,
  value,
}: {
  description: string
  icon: React.ReactNode
  title: string
  value: string
}) {
  return (
    <div className="rounded-lg border border-border bg-slate-50 px-4 py-3">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted">{title}</p>
          <p className="mt-2 text-lg font-semibold tracking-tight text-foreground">{value}</p>
          <p className="mt-1 text-xs leading-5 text-muted">{description}</p>
        </div>
        <div className="text-slate-400">{icon}</div>
      </div>
    </div>
  )
}

export function AuditLogsPage() {
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<AuditLogSpecificFilter | ''>('')
  const [filterValue, setFilterValue] = useState('')
  const [actionFilter, setActionFilter] = useState<AuditAction | ''>('')
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearch(searchInput.trim())
    }, 350)

    return () => window.clearTimeout(timeoutId)
  }, [searchInput])

  const specificFilterValue = filterType === 'action' ? actionFilter : filterValue.trim()
  const hasSpecificFilter = Boolean(filterType && specificFilterValue)

  const filters = useMemo(
    () => ({
      pageNumber,
      pageSize,
      search: search || undefined,
    }),
    [pageNumber, pageSize, search],
  )

  const generalQuery = useAuditLogs(filters, !hasSpecificFilter)
  const byUserQuery = useAuditLogsByUser(specificFilterValue, filterType === 'user' && hasSpecificFilter)
  const byEntityQuery = useAuditLogsByEntity(specificFilterValue, filterType === 'entity' && hasSpecificFilter)
  const byActionQuery = useAuditLogsByAction(actionFilter, filterType === 'action' && hasSpecificFilter)

  const activeQuery = filterType === 'user'
    ? byUserQuery
    : filterType === 'entity'
      ? byEntityQuery
      : filterType === 'action'
        ? byActionQuery
        : generalQuery

  const auditLogs: AuditLog[] = useMemo(() => {
    if (filterType === 'user') {
      return byUserQuery.data ?? []
    }

    if (filterType === 'entity') {
      return byEntityQuery.data ?? []
    }

    if (filterType === 'action') {
      return byActionQuery.data ?? []
    }

    return generalQuery.data?.items ?? []
  }, [byActionQuery.data, byEntityQuery.data, byUserQuery.data, filterType, generalQuery.data?.items])

  const summary = useMemo(() => {
    const entities = new Set(auditLogs.map((log) => log.entityName)).size

    return {
      creates: auditLogs.filter((log) => log.action === 'Create').length,
      deletes: auditLogs.filter((log) => log.action === 'Delete').length,
      entities,
      updates: auditLogs.filter((log) => log.action === 'Update').length,
    }
  }, [auditLogs])

  function handleSearchChange(value: string) {
    setSearchInput(value)
    setPageNumber(1)
  }

  function handlePageSizeChange(value: string) {
    setPageSize(Number(value))
    setPageNumber(1)
  }

  function handleFilterTypeChange(value: string) {
    setFilterType(value as AuditLogSpecificFilter | '')
    setFilterValue('')
    setActionFilter('')
    setPageNumber(1)
  }

  function clearFilters() {
    setFilterType('')
    setFilterValue('')
    setActionFilter('')
    setSearchInput('')
    setSearch('')
    setPageNumber(1)
  }

  const emptyTitle = hasSpecificFilter || search ? 'Sin resultados' : 'Sin logs de auditoría'
  const emptyDescription =
    hasSpecificFilter || search
      ? 'No se encontraron logs para la búsqueda o filtro seleccionado.'
      : 'Aún no hay operaciones auditadas para mostrar.'

  return (
    <div className="space-y-6">
      <PageHeader
        description="Trazabilidad administrativa de operaciones, accesos y cambios registrados por el sistema."
        eyebrow="Administración"
        title="Auditoría"
      />

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-col gap-3 border-b border-border pb-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Consulta de auditoría</p>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">
                Los logs se generan automáticamente desde backend y se mantienen como evidencia de solo lectura.
              </p>
            </div>
            <Badge variant="muted">Solo Admin</Badge>
          </div>

          <div className="grid gap-3 xl:grid-cols-[1.2fr_0.75fr_1fr_auto] xl:items-end">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground" htmlFor="audit-search">
                Búsqueda general
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  className="h-10 w-full rounded-lg border border-border bg-white pl-10 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                  disabled={Boolean(filterType)}
                  id="audit-search"
                  onChange={(event) => handleSearchChange(event.target.value)}
                  placeholder="Usuario, entidad, ID o descripción"
                  type="search"
                  value={searchInput}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground" htmlFor="audit-filter-type">
                Filtro específico
              </label>
              <select
                className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-blue-100"
                id="audit-filter-type"
                onChange={(event) => handleFilterTypeChange(event.target.value)}
                value={filterType}
              >
                <option value="">Sin filtro</option>
                <option value="entity">Entidad</option>
                <option value="action">Acción</option>
                <option value="user">ID de usuario</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground" htmlFor="audit-filter-value">
                Valor
              </label>
              {filterType === 'action' ? (
                <select
                  className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-blue-100"
                  id="audit-filter-value"
                  onChange={(event) => setActionFilter(event.target.value as AuditAction | '')}
                  value={actionFilter}
                >
                  <option value="">Seleccionar acción</option>
                  {auditActions.map((action) => (
                    <option key={action} value={action}>
                      {actionLabels[action]}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                  disabled={!filterType}
                  id="audit-filter-value"
                  onChange={(event) => setFilterValue(event.target.value)}
                  placeholder={
                    filterType === 'entity'
                      ? 'Ej. Product'
                      : filterType === 'user'
                        ? 'ID de usuario exacto'
                        : 'Selecciona un filtro'
                  }
                  value={filterValue}
                />
              )}
            </div>

            <Button
              className="w-full xl:w-auto"
              disabled={!filterType && !searchInput}
              onClick={clearFilters}
              variant="secondary"
            >
              <FilterX className="h-4 w-4" />
              Limpiar filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          description="Resultado mostrado"
          icon={<ShieldCheck className="h-4 w-4" />}
          title="Logs visibles"
          value={formatNumber(auditLogs.length)}
        />
        <SummaryCard
          description="Operaciones de creación"
          icon={<PlusCircle className="h-4 w-4" />}
          title="Creaciones"
          value={formatNumber(summary.creates)}
        />
        <SummaryCard
          description="Operaciones de actualización"
          icon={<PencilLine className="h-4 w-4" />}
          title="Actualizaciones"
          value={formatNumber(summary.updates)}
        />
        <SummaryCard
          description="Operaciones de eliminación"
          icon={<Trash2 className="h-4 w-4" />}
          title="Eliminaciones"
          value={formatNumber(summary.deletes)}
        />
      </div>

      {activeQuery.isLoading ? (
        <Card>
          <CardContent>
            <LoadingState text="Cargando logs de auditoría..." />
          </CardContent>
        </Card>
      ) : activeQuery.isError ? (
        <AuditLogsErrorState error={activeQuery.error} />
      ) : auditLogs.length === 0 ? (
        <EmptyState description={emptyDescription} icon={<ShieldCheck className="h-6 w-6" />} title={emptyTitle} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Registro de auditoría</CardTitle>
            <CardDescription>
              {hasSpecificFilter
                ? `${formatNumber(auditLogs.length)} registros del filtro específico.`
                : `${formatNumber(generalQuery.data?.totalCount ?? auditLogs.length)} registros encontrados.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <TableContainer>
              <table className="w-full min-w-[1120px] table-fixed divide-y divide-border">
                <colgroup>
                  <col className="w-[13%]" />
                  <col className="w-[12%]" />
                  <col className="w-[24%]" />
                  <col className="w-[19%]" />
                  <col className="w-[22%]" />
                  <col className="w-[10%]" />
                </colgroup>
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Fecha</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Acción</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Entidad</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">ID de entidad</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Usuario</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-muted">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-white">
                  {auditLogs.map((log) => (
                    <tr className="transition-colors hover:bg-slate-50/80" key={log.id}>
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-muted">
                        {formatDateTime(log.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant={actionBadgeVariants[log.action]}>{actionLabels[log.action]}</Badge>
                      </td>
                      <td className="px-5 py-4">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">{log.entityName}</p>
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">
                            {log.description ?? 'Sin descripción'}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-muted">
                        <span className="block truncate font-mono text-xs">{log.entityId ?? 'No registrado'}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex min-w-0 items-center gap-2">
                          <UserRound className="h-4 w-4 shrink-0 text-muted" />
                          <span className="block truncate font-mono text-xs text-muted">
                            {log.userId ?? 'No registrado'}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end">
                          <Button
                            aria-label="Ver detalle de auditoría"
                            className="h-9 w-9 p-0"
                            onClick={() => setSelectedLogId(log.id)}
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

            {!hasSpecificFilter ? (
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
                    Página {generalQuery.data?.pageNumber ?? pageNumber} de {generalQuery.data?.totalPages ?? 1} ·{' '}
                    {formatNumber(generalQuery.data?.totalCount ?? 0)} registros
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      disabled={!generalQuery.data?.hasPreviousPage}
                      onClick={() => setPageNumber((current) => Math.max(current - 1, 1))}
                      variant="secondary"
                    >
                      Anterior
                    </Button>
                    <Button
                      disabled={!generalQuery.data?.hasNextPage}
                      onClick={() => setPageNumber((current) => current + 1)}
                      variant="secondary"
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border-t border-border px-5 py-4 text-sm text-muted">
                Los filtros específicos usan endpoints de consulta sin paginación.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <AuditLogDetailsModal logId={selectedLogId} onClose={() => setSelectedLogId(null)} />
    </div>
  )
}

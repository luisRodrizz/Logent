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
]

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

const pageSizeOptions = [10, 20, 50]

function AuditLogsErrorState({ error }: { error: unknown }) {
  return (
    <Card>
      <CardContent className="px-6 py-10">
        <SectionError text={getApiErrorMessage(error, 'No se pudo cargar la informacion de auditoria.')} />
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
    <Card>
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted">{title}</p>
          <p className="mt-2 text-2xl font-semibold tracking-normal text-foreground">{value}</p>
          <p className="mt-1 text-xs leading-5 text-muted">{description}</p>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-primary">
          {icon}
        </div>
      </CardContent>
    </Card>
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

  const emptyTitle = hasSpecificFilter || search ? 'Sin resultados' : 'Sin logs de auditoria'
  const emptyDescription =
    hasSpecificFilter || search
      ? 'No se encontraron logs para la busqueda o filtro seleccionado.'
      : 'Aun no hay operaciones auditadas para mostrar.'

  return (
    <div className="space-y-6">
      <PageHeader description="Consulta el historial de operaciones registradas en el sistema." title="Auditoria" />

      <Card>
        <CardContent className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Trazabilidad del sistema</p>
            <p className="mt-1 text-sm leading-6 text-muted">
              Los logs se generan automaticamente desde backend y son de solo lectura.
            </p>
          </div>
          <Badge variant="muted">Solo Admin</Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Filtros de auditoria</CardTitle>
          <CardDescription>Usa busqueda general o un filtro especifico segun el endpoint disponible.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 xl:grid-cols-[1.2fr_0.75fr_1fr_auto] xl:items-end">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground" htmlFor="audit-search">
                Busqueda general
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  className="h-10 w-full rounded-lg border border-border bg-white pl-10 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                  disabled={Boolean(filterType)}
                  id="audit-search"
                  onChange={(event) => handleSearchChange(event.target.value)}
                  placeholder="Usuario, entidad, ID o descripcion"
                  type="search"
                  value={searchInput}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground" htmlFor="audit-filter-type">
                Filtro especifico
              </label>
              <select
                className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-blue-100"
                id="audit-filter-type"
                onChange={(event) => handleFilterTypeChange(event.target.value)}
                value={filterType}
              >
                <option value="">Sin filtro</option>
                <option value="entity">Entidad</option>
                <option value="action">Accion</option>
                <option value="user">Usuario ID</option>
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
                  <option value="">Seleccionar accion</option>
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
                        ? 'User ID exacto'
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
          description="Resumen del resultado mostrado"
          icon={<ShieldCheck className="h-5 w-5" />}
          title="Logs visibles"
          value={formatNumber(auditLogs.length)}
        />
        <SummaryCard
          description="Operaciones de creacion"
          icon={<PlusCircle className="h-5 w-5" />}
          title="Creates"
          value={formatNumber(summary.creates)}
        />
        <SummaryCard
          description="Operaciones de actualizacion"
          icon={<PencilLine className="h-5 w-5" />}
          title="Updates"
          value={formatNumber(summary.updates)}
        />
        <SummaryCard
          description={`${formatNumber(summary.entities)} entidades afectadas`}
          icon={<Trash2 className="h-5 w-5" />}
          title="Deletes"
          value={formatNumber(summary.deletes)}
        />
      </div>

      {activeQuery.isLoading ? (
        <Card>
          <CardContent>
            <LoadingState text="Cargando logs de auditoria..." />
          </CardContent>
        </Card>
      ) : activeQuery.isError ? (
        <AuditLogsErrorState error={activeQuery.error} />
      ) : auditLogs.length === 0 ? (
        <EmptyState
          description={emptyDescription}
          icon={<ShieldCheck className="h-6 w-6" />}
          title={emptyTitle}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Registro de auditoria</CardTitle>
            <CardDescription>
              {hasSpecificFilter
                ? `${formatNumber(auditLogs.length)} registros del filtro especifico.`
                : `${formatNumber(generalQuery.data?.totalCount ?? auditLogs.length)} registros encontrados.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <TableContainer>
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted">Accion</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted">Entidad</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted">Entity ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted">Usuario</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-muted">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-white">
                  {auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-muted">
                        {formatDateTime(log.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={actionBadgeVariants[log.action]}>{actionLabels[log.action]}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-foreground">{log.entityName}</p>
                        <p className="mt-1 max-w-sm truncate text-xs text-muted">
                          {log.description ?? 'Sin descripcion'}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted">
                        <span className="block max-w-48 truncate">{log.entityId ?? 'No registrado'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex min-w-0 items-center gap-2">
                          <UserRound className="h-4 w-4 shrink-0 text-muted" />
                          <span className="block max-w-48 truncate text-sm text-muted">
                            {log.userId ?? 'No registrado'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button onClick={() => setSelectedLogId(log.id)} size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                          Ver
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableContainer>

            {!hasSpecificFilter ? (
              <div className="flex flex-col gap-3 border-t border-border pt-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2 text-sm text-muted">
                  <span>Mostrar</span>
                  <select
                    className="h-9 rounded-lg border border-border bg-white px-2 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-blue-100"
                    onChange={(event) => handlePageSizeChange(event.target.value)}
                    value={pageSize}
                  >
                    {pageSizeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <span>por pagina</span>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <p className="text-sm text-muted">
                    Pagina {generalQuery.data?.pageNumber ?? pageNumber} de {generalQuery.data?.totalPages ?? 1} ·{' '}
                    {formatNumber(generalQuery.data?.totalCount ?? 0)} registros
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      disabled={!generalQuery.data?.hasPreviousPage}
                      onClick={() => setPageNumber((current) => Math.max(current - 1, 1))}
                      size="sm"
                      variant="secondary"
                    >
                      Anterior
                    </Button>
                    <Button
                      disabled={!generalQuery.data?.hasNextPage}
                      onClick={() => setPageNumber((current) => current + 1)}
                      size="sm"
                      variant="secondary"
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border-t border-border pt-4 text-sm text-muted">
                Los filtros especificos usan endpoints de consulta sin paginacion.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <AuditLogDetailsModal logId={selectedLogId} onClose={() => setSelectedLogId(null)} />
    </div>
  )
}

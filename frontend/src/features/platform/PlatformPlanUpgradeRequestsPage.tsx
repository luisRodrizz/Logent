import { ArrowUpCircle, ChevronLeft, ChevronRight, Eye, Search } from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { EmptyState } from '../../components/common/EmptyState'
import { LoadingState } from '../../components/common/LoadingState'
import { PageHeader } from '../../components/common/PageHeader'
import { SectionError } from '../../components/common/SectionError'
import { TableContainer } from '../../components/common/TableContainer'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardContent } from '../../components/ui/Card'
import { getApiErrorMessage } from '../../lib/api-error'
import { formatDateTime } from '../../lib/format'
import { platformPlans, type PlatformPlan } from './platform.types'
import { usePlatformPlanUpgradeRequests } from './platform-upgrade.queries'
import {
  platformUpgradeRequestStatuses,
  type PlatformUpgradeRequestStatus,
} from './platform-upgrade.types'

const PAGE_SIZE = 10

const statusLabels: Record<PlatformUpgradeRequestStatus, string> = {
  Approved: 'Aprobada',
  Pending: 'Pendiente',
  Rejected: 'Rechazada',
}

const statusBadgeVariants: Record<PlatformUpgradeRequestStatus, 'success' | 'warning' | 'danger'> = {
  Approved: 'success',
  Pending: 'warning',
  Rejected: 'danger',
}

export function PlatformPlanUpgradeRequestsPage() {
  const [searchParams] = useSearchParams()
  const [companySearch, setCompanySearch] = useState('')
  const [pageNumber, setPageNumber] = useState(1)
  const [requestedPlan, setRequestedPlan] = useState('')
  const [status, setStatus] = useState(() => {
    const initialStatus = searchParams.get('status')

    return initialStatus && platformUpgradeRequestStatuses.some((requestStatus) => requestStatus === initialStatus)
      ? initialStatus
      : ''
  })
  const requestsQuery = usePlatformPlanUpgradeRequests({
    companySearch: companySearch.trim() || undefined,
    pageNumber,
    pageSize: PAGE_SIZE,
    requestedPlan: (requestedPlan || undefined) as PlatformPlan | undefined,
    status: (status || undefined) as PlatformUpgradeRequestStatus | undefined,
  })
  const requests = requestsQuery.data?.items ?? []

  function resetPagination() {
    setPageNumber(1)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        description="Revisa las solicitudes tenant y resuelve cambios de capacidad desde la plataforma."
        eyebrow="Plataforma"
        title="Solicitudes de plan"
      />

      <Card>
        <CardContent className="space-y-5">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_190px_190px]">
            <label className="relative block">
              <span className="sr-only">Buscar empresa</span>
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" aria-hidden="true" />
              <input
                className="h-10 w-full rounded-lg border border-border bg-white pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-slate-400 focus:border-[#1017D8]/50 focus:ring-2 focus:ring-[#1017D8]/10"
                onChange={(event) => {
                  setCompanySearch(event.target.value)
                  resetPagination()
                }}
                placeholder="Buscar empresa"
                type="search"
                value={companySearch}
              />
            </label>

            <label>
              <span className="sr-only">Filtrar por estado</span>
              <select
                className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none focus:border-[#1017D8]/50 focus:ring-2 focus:ring-[#1017D8]/10"
                onChange={(event) => {
                  setStatus(event.target.value)
                  resetPagination()
                }}
                value={status}
              >
                <option value="">Todos los estados</option>
                {platformUpgradeRequestStatuses.map((requestStatus) => (
                  <option key={requestStatus} value={requestStatus}>
                    {statusLabels[requestStatus]}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="sr-only">Filtrar por plan solicitado</span>
              <select
                className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none focus:border-[#1017D8]/50 focus:ring-2 focus:ring-[#1017D8]/10"
                onChange={(event) => {
                  setRequestedPlan(event.target.value)
                  resetPagination()
                }}
                value={requestedPlan}
              >
                <option value="">Todos los planes</option>
                {platformPlans.map((plan) => (
                  <option key={plan} value={plan}>
                    {plan}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {requestsQuery.isLoading ? <LoadingState text="Cargando solicitudes..." /> : null}

          {requestsQuery.isError ? (
            <SectionError text={getApiErrorMessage(requestsQuery.error, 'No se pudo cargar el listado de solicitudes.')} />
          ) : null}

          {!requestsQuery.isLoading && !requestsQuery.isError && requests.length === 0 ? (
            <EmptyState
              description="No encontramos solicitudes que coincidan con los filtros actuales."
              icon={<ArrowUpCircle className="h-6 w-6" />}
              title="Sin solicitudes disponibles"
            />
          ) : null}

          {!requestsQuery.isLoading && !requestsQuery.isError && requests.length > 0 ? (
            <>
              <TableContainer>
                <table className="w-full min-w-[1040px] table-fixed text-left text-sm">
                  <colgroup>
                    <col className="w-[22%]" />
                    <col className="w-[11%]" />
                    <col className="w-[12%]" />
                    <col className="w-[12%]" />
                    <col className="w-[18%]" />
                    <col className="w-[17%]" />
                    <col className="w-[8%]" />
                  </colgroup>
                  <thead className="border-b border-border bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Empresa</th>
                      <th className="px-4 py-3 font-semibold">Plan actual</th>
                      <th className="px-4 py-3 font-semibold">Solicitado</th>
                      <th className="px-4 py-3 font-semibold">Estado</th>
                      <th className="px-4 py-3 font-semibold">Solicitante</th>
                      <th className="px-4 py-3 font-semibold">Fecha</th>
                      <th className="px-4 py-3 text-right font-semibold">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {requests.map((request) => (
                      <tr className="bg-white transition-colors hover:bg-slate-50/80" key={request.id}>
                        <td className="px-4 py-4">
                          <p className="truncate font-semibold text-foreground">{request.companyName}</p>
                        </td>
                        <td className="px-4 py-4 text-slate-600">{request.currentPlan}</td>
                        <td className="px-4 py-4 font-semibold text-foreground">{request.requestedPlan}</td>
                        <td className="px-4 py-4">
                          <Badge variant={statusBadgeVariants[request.status]}>{statusLabels[request.status]}</Badge>
                        </td>
                        <td className="px-4 py-4">
                          <p className="truncate text-slate-600">{request.requestedByName}</p>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-slate-600">{formatDateTime(request.createdAt)}</td>
                        <td className="px-4 py-4 text-right">
                          <Link
                            aria-label={`Ver solicitud de ${request.companyName}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-primary transition-colors hover:border-[#1017D8]/30 hover:bg-[#1017D8]/5"
                            title="Ver detalle"
                            to={`/platform/upgrade-requests/${request.id}`}
                          >
                            <Eye className="h-4 w-4" aria-hidden="true" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableContainer>

              <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted">
                  Página {requestsQuery.data?.pageNumber ?? 1} de {Math.max(requestsQuery.data?.totalPages ?? 0, 1)}
                </p>
                <div className="flex gap-2">
                  <Button
                    disabled={!requestsQuery.data?.hasPreviousPage}
                    onClick={() => setPageNumber((currentPage) => Math.max(1, currentPage - 1))}
                    size="sm"
                    variant="secondary"
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    Anterior
                  </Button>
                  <Button
                    disabled={!requestsQuery.data?.hasNextPage}
                    onClick={() => setPageNumber((currentPage) => currentPage + 1)}
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

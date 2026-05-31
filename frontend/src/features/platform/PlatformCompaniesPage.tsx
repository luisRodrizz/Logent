import { Building2, ChevronLeft, ChevronRight, Eye, Package, Search, Users, Warehouse } from 'lucide-react'
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
import { formatDate, formatNumber } from '../../lib/format'
import { usePlatformCompanies } from './platform.queries'
import { platformPlans, type PlatformPlan } from './platform.types'

const PAGE_SIZE = 10

function getPlanBadgeVariant(plan: PlatformPlan) {
  if (plan === 'Enterprise' || plan === 'Pro') {
    return 'default' as const
  }

  return plan === 'Starter' ? ('success' as const) : ('muted' as const)
}

export function PlatformCompaniesPage() {
  const [isActive, setIsActive] = useState('')
  const [pageNumber, setPageNumber] = useState(1)
  const [plan, setPlan] = useState('')
  const [search, setSearch] = useState('')
  const normalizedSearch = search.trim() || undefined
  const companiesQuery = usePlatformCompanies({
    isActive: isActive === '' ? undefined : isActive === 'true',
    pageNumber,
    pageSize: PAGE_SIZE,
    plan: (plan || undefined) as PlatformPlan | undefined,
    search: normalizedSearch,
  })
  const companies = companiesQuery.data?.items ?? []
  const summary = {
    active: companies.filter((company) => company.isActive).length,
    products: companies.reduce((total, company) => total + company.productsCount, 0),
    suspended: companies.filter((company) => !company.isActive).length,
    total: companiesQuery.data?.totalCount ?? 0,
  }

  function resetPagination() {
    setPageNumber(1)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        description="Supervisa las empresas registradas, su estado operativo y el plan asignado dentro de LOGENT."
        eyebrow="Plataforma"
        title="Empresas"
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Resumen de empresas">
        {[
          { icon: Building2, label: 'Total empresas', value: summary.total },
          { icon: Users, label: 'Activas en esta página', value: summary.active },
          { icon: Warehouse, label: 'Suspendidas en esta página', value: summary.suspended },
          { icon: Package, label: 'Productos en esta página', value: summary.products },
        ].map((metric) => {
          const Icon = metric.icon

          return (
            <Card key={metric.label}>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#28E000]/20 bg-[#28E000]/10 text-emerald-700">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm text-muted">{metric.label}</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{formatNumber(metric.value)}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </section>

      <Card>
        <CardContent className="space-y-5">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px]">
            <label className="relative block">
              <span className="sr-only">Buscar empresa</span>
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" aria-hidden="true" />
              <input
                className="h-10 w-full rounded-lg border border-border bg-white pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-slate-400 focus:border-[#1017D8]/50 focus:ring-2 focus:ring-[#1017D8]/10"
                onChange={(event) => {
                  setSearch(event.target.value)
                  resetPagination()
                }}
                placeholder="Buscar por nombre, slug, RUC o email"
                type="search"
                value={search}
              />
            </label>

            <label>
              <span className="sr-only">Filtrar por estado</span>
              <select
                className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none focus:border-[#1017D8]/50 focus:ring-2 focus:ring-[#1017D8]/10"
                onChange={(event) => {
                  setIsActive(event.target.value)
                  resetPagination()
                }}
                value={isActive}
              >
                <option value="">Todos los estados</option>
                <option value="true">Activas</option>
                <option value="false">Suspendidas</option>
              </select>
            </label>

            <label>
              <span className="sr-only">Filtrar por plan</span>
              <select
                className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none focus:border-[#1017D8]/50 focus:ring-2 focus:ring-[#1017D8]/10"
                onChange={(event) => {
                  setPlan(event.target.value)
                  resetPagination()
                }}
                value={plan}
              >
                <option value="">Todos los planes</option>
                {platformPlans.map((platformPlan) => (
                  <option key={platformPlan} value={platformPlan}>
                    {platformPlan}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {companiesQuery.isLoading ? <LoadingState text="Cargando empresas..." /> : null}

          {companiesQuery.isError ? (
            <SectionError text={getApiErrorMessage(companiesQuery.error, 'No se pudo cargar el listado de empresas.')} />
          ) : null}

          {!companiesQuery.isLoading && !companiesQuery.isError && companies.length === 0 ? (
            <EmptyState
              description="No encontramos empresas que coincidan con los filtros actuales."
              icon={<Building2 className="h-6 w-6" />}
              title="Sin empresas disponibles"
            />
          ) : null}

          {!companiesQuery.isLoading && !companiesQuery.isError && companies.length > 0 ? (
            <>
              <TableContainer>
                <table className="min-w-[1260px] table-fixed w-full text-left text-sm">
                  <colgroup>
                    <col className="w-[19%]" />
                    <col className="w-[11%]" />
                    <col className="w-[17%]" />
                    <col className="w-[9%]" />
                    <col className="w-[9%]" />
                    <col className="w-[7%]" />
                    <col className="w-[7%]" />
                    <col className="w-[7%]" />
                    <col className="w-[8%]" />
                    <col className="w-[7%]" />
                  </colgroup>
                  <thead className="border-b border-border bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Empresa</th>
                      <th className="px-4 py-3 font-semibold">RUC</th>
                      <th className="px-4 py-3 font-semibold">Email</th>
                      <th className="px-4 py-3 font-semibold">Plan</th>
                      <th className="px-4 py-3 font-semibold">Estado</th>
                      <th className="px-4 py-3 text-right font-semibold">Usuarios</th>
                      <th className="px-4 py-3 text-right font-semibold">Productos</th>
                      <th className="px-4 py-3 text-right font-semibold">Almacenes</th>
                      <th className="px-4 py-3 font-semibold">Creada</th>
                      <th className="px-4 py-3 text-right font-semibold">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {companies.map((company) => (
                      <tr className="bg-white transition-colors hover:bg-slate-50/80" key={company.id}>
                        <td className="px-4 py-4">
                          <p className="truncate font-semibold text-foreground">{company.name}</p>
                          <p className="mt-1 truncate text-xs text-muted">{company.slug}</p>
                        </td>
                        <td className="px-4 py-4 text-slate-600">{company.ruc || 'Sin RUC'}</td>
                        <td className="px-4 py-4">
                          <p className="truncate text-slate-600">{company.email || 'Sin email'}</p>
                        </td>
                        <td className="px-4 py-4">
                          <Badge variant={getPlanBadgeVariant(company.plan)}>{company.plan}</Badge>
                        </td>
                        <td className="px-4 py-4">
                          <Badge variant={company.isActive ? 'success' : 'danger'}>
                            {company.isActive ? 'Activa' : 'Suspendida'}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-right font-medium text-slate-700">{company.usersCount}</td>
                        <td className="px-4 py-4 text-right font-medium text-slate-700">{company.productsCount}</td>
                        <td className="px-4 py-4 text-right font-medium text-slate-700">{company.warehousesCount}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-slate-600">{formatDate(company.createdAt)}</td>
                        <td className="px-4 py-4 text-right">
                          <Link
                            aria-label={`Ver detalle de ${company.name}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-primary transition-colors hover:border-[#1017D8]/30 hover:bg-[#1017D8]/5"
                            title="Ver detalle"
                            to={`/platform/companies/${company.id}`}
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
                  Página {companiesQuery.data?.pageNumber ?? 1} de {Math.max(companiesQuery.data?.totalPages ?? 0, 1)}
                </p>
                <div className="flex gap-2">
                  <Button
                    disabled={!companiesQuery.data?.hasPreviousPage}
                    onClick={() => setPageNumber((currentPage) => Math.max(1, currentPage - 1))}
                    size="sm"
                    variant="secondary"
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    Anterior
                  </Button>
                  <Button
                    disabled={!companiesQuery.data?.hasNextPage}
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

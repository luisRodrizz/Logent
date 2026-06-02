import {
  ArrowRight,
  ArrowUpCircle,
  Building2,
  CheckCircle2,
  Clock3,
  Package,
  ShieldAlert,
  Users,
  Warehouse,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { LoadingState } from '../../components/common/LoadingState'
import { PageHeader } from '../../components/common/PageHeader'
import { SectionError } from '../../components/common/SectionError'
import { Badge } from '../../components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { getApiErrorMessage } from '../../lib/api-error'
import { formatDateTime, formatNumber } from '../../lib/format'
import { usePlatformDashboardSummary } from './platform-dashboard.queries'
import type { PlatformPlan } from './platform.types'
import type { PlatformUpgradeRequestStatus } from './platform-upgrade.types'

const planLabels: Record<PlatformPlan, string> = {
  Enterprise: 'Enterprise',
  Free: 'Free',
  Pro: 'Pro',
  Starter: 'Starter',
}

const statusLabels: Record<PlatformUpgradeRequestStatus, string> = {
  Approved: 'Aprobada',
  Pending: 'Pendiente',
  Rejected: 'Rechazada',
}

const statusVariants: Record<PlatformUpgradeRequestStatus, 'success' | 'warning' | 'danger'> = {
  Approved: 'success',
  Pending: 'warning',
  Rejected: 'danger',
}

function getPlanBadgeVariant(plan: PlatformPlan) {
  if (plan === 'Enterprise' || plan === 'Pro') {
    return 'default' as const
  }

  return plan === 'Starter' ? ('success' as const) : ('muted' as const)
}

export function PlatformDashboardPage() {
  const summaryQuery = usePlatformDashboardSummary()

  if (summaryQuery.isLoading) {
    return (
      <Card>
        <CardContent>
          <LoadingState text="Cargando resumen global..." />
        </CardContent>
      </Card>
    )
  }

  if (summaryQuery.isError || !summaryQuery.data) {
    return (
      <SectionError
        text={getApiErrorMessage(summaryQuery.error, 'No se pudo cargar el resumen global de la plataforma.')}
      />
    )
  }

  const summary = summaryQuery.data
  const metrics = [
    { icon: Building2, label: 'Total empresas', value: summary.totalCompanies },
    { icon: CheckCircle2, label: 'Empresas activas', value: summary.activeCompanies },
    { icon: ShieldAlert, label: 'Empresas suspendidas', value: summary.suspendedCompanies },
    { icon: Clock3, label: 'Solicitudes pendientes', value: summary.pendingUpgradeRequests },
    { icon: Users, label: 'Usuarios tenant', value: summary.totalTenantUsers },
    { icon: Package, label: 'Productos globales', value: summary.totalProducts },
  ]
  const plans = [
    { label: planLabels.Free, value: summary.freeCompanies },
    { label: planLabels.Starter, value: summary.starterCompanies },
    { label: planLabels.Pro, value: summary.proCompanies },
    { label: planLabels.Enterprise, value: summary.enterpriseCompanies },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        description="Supervisa la operación multiempresa, la distribución de planes y las solicitudes recientes desde una vista global."
        eyebrow="Plataforma"
        title="Dashboard"
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Métricas globales">
        {metrics.map((metric) => {
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

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]" aria-label="Planes y accesos rápidos">
        <Card>
          <CardHeader>
            <CardTitle>Distribución de planes</CardTitle>
            <p className="text-sm text-muted">Empresas registradas por nivel de servicio.</p>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {plans.map((plan) => (
              <div className="rounded-lg border border-border bg-slate-50/60 px-4 py-4" key={plan.label}>
                <p className="text-sm font-medium text-slate-600">{plan.label}</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{formatNumber(plan.value)}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Accesos rápidos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link
              className="flex items-center justify-between rounded-lg border border-border px-3 py-3 text-sm font-semibold text-foreground transition-colors hover:border-[#1017D8]/25 hover:bg-[#1017D8]/5"
              to="/platform/companies"
            >
              <span className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" aria-hidden="true" />
                Empresas
              </span>
              <ArrowRight className="h-4 w-4 text-slate-400" aria-hidden="true" />
            </Link>
            <Link
              className="flex items-center justify-between rounded-lg border border-border px-3 py-3 text-sm font-semibold text-foreground transition-colors hover:border-[#1017D8]/25 hover:bg-[#1017D8]/5"
              to="/platform/upgrade-requests?status=Pending"
            >
              <span className="flex items-center gap-2">
                <ArrowUpCircle className="h-4 w-4 text-primary" aria-hidden="true" />
                Solicitudes pendientes
              </span>
              <ArrowRight className="h-4 w-4 text-slate-400" aria-hidden="true" />
            </Link>
            <div className="flex items-center gap-2 px-1 pt-2 text-xs text-muted">
              <Warehouse className="h-4 w-4" aria-hidden="true" />
              {formatNumber(summary.totalWarehouses)} almacenes globales
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2" aria-label="Actividad reciente">
        <Card>
          <CardHeader>
            <CardTitle>Empresas recientes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {summary.recentCompanies.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted">Aún no hay empresas registradas.</p>
            ) : (
              summary.recentCompanies.map((company) => (
                <Link
                  className="flex items-center justify-between gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-slate-50"
                  key={company.id}
                  to={`/platform/companies/${company.id}`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{company.name}</p>
                    <p className="mt-1 text-xs text-muted">{formatDateTime(company.createdAt)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant={getPlanBadgeVariant(company.plan)}>{company.plan}</Badge>
                    <Badge variant={company.isActive ? 'success' : 'danger'}>
                      {company.isActive ? 'Activa' : 'Suspendida'}
                    </Badge>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Solicitudes recientes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {summary.recentUpgradeRequests.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted">Aún no hay solicitudes de cambio de plan.</p>
            ) : (
              summary.recentUpgradeRequests.map((request) => (
                <Link
                  className="flex items-center justify-between gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-slate-50"
                  key={request.id}
                  to={`/platform/upgrade-requests/${request.id}`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{request.companyName}</p>
                    <p className="mt-1 text-xs text-muted">
                      {request.currentPlan} → {request.requestedPlan} · {formatDateTime(request.createdAt)}
                    </p>
                  </div>
                  <Badge className="shrink-0" variant={statusVariants[request.status]}>
                    {statusLabels[request.status]}
                  </Badge>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

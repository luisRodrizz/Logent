import {
  ArrowRight,
  ArrowUpCircle,
  BarChart3,
  Building2,
  CheckCircle2,
  Clock3,
  ExternalLink,
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
  Approved: 'Aprobadas',
  Pending: 'Pendientes',
  Rejected: 'Rechazadas',
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

function getPercentage(value: number, total: number) {
  return total > 0 ? Math.round((value / total) * 100) : 0
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
    {
      icon: Building2,
      iconClassName: 'border-[#1017D8]/15 bg-[#1017D8]/5 text-primary',
      label: 'Total empresas',
      value: summary.totalCompanies,
    },
    {
      icon: CheckCircle2,
      iconClassName: 'border-[#28E000]/20 bg-[#28E000]/10 text-emerald-700',
      label: 'Empresas activas',
      value: summary.activeCompanies,
    },
    {
      icon: ShieldAlert,
      iconClassName: 'border-red-100 bg-red-50 text-red-600',
      label: 'Empresas suspendidas',
      value: summary.suspendedCompanies,
    },
    {
      badge: summary.pendingUpgradeRequests > 0 ? 'Revisar' : undefined,
      icon: Clock3,
      iconClassName: 'border-amber-100 bg-amber-50 text-amber-700',
      label: 'Solicitudes pendientes',
      value: summary.pendingUpgradeRequests,
    },
    {
      icon: Users,
      iconClassName: 'border-cyan-100 bg-cyan-50 text-cyan-700',
      label: 'Usuarios tenant',
      value: summary.totalTenantUsers,
    },
    {
      icon: Package,
      iconClassName: 'border-slate-200 bg-slate-100 text-slate-700',
      label: 'Productos globales',
      value: summary.totalProducts,
    },
  ]
  const plans = [
    { barClassName: 'bg-slate-400', label: planLabels.Free, value: summary.freeCompanies },
    { barClassName: 'bg-blue-500', label: planLabels.Starter, value: summary.starterCompanies },
    { barClassName: 'bg-teal-500', label: planLabels.Pro, value: summary.proCompanies },
    { barClassName: 'bg-emerald-500', label: planLabels.Enterprise, value: summary.enterpriseCompanies },
  ]
  const requests = [
    {
      detail: 'Requieren revisión',
      label: statusLabels.Pending,
      value: summary.pendingUpgradeRequests,
      variant: 'warning' as const,
    },
    {
      detail: 'Cambios autorizados',
      label: statusLabels.Approved,
      value: summary.approvedUpgradeRequests,
      variant: 'success' as const,
    },
    {
      detail: 'Solicitudes descartadas',
      label: statusLabels.Rejected,
      value: summary.rejectedUpgradeRequests,
      variant: 'danger' as const,
    },
  ]
  const totalRequests = requests.reduce((total, request) => total + request.value, 0)

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
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${metric.iconClassName}`}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm text-muted">{metric.label}</p>
                    {metric.badge ? <Badge variant="warning">{metric.badge}</Badge> : null}
                  </div>
                  <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{formatNumber(metric.value)}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]" aria-label="Resumen ejecutivo">
        <Card>
          <CardHeader>
            <CardTitle>Distribución de planes</CardTitle>
            <p className="text-sm text-muted">Proporción de empresas por nivel de servicio.</p>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {plans.map((plan) => {
              const percentage = getPercentage(plan.value, summary.totalCompanies)

              return (
                <div className="rounded-lg border border-border bg-slate-50/60 px-4 py-4" key={plan.label}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-700">{plan.label}</p>
                    <p className="text-xs font-medium text-muted">{percentage}%</p>
                  </div>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{formatNumber(plan.value)}</p>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200/70">
                    <div className={`h-full rounded-full ${plan.barClassName}`} style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Solicitudes de plan</CardTitle>
            <p className="text-sm text-muted">Estado actual de las solicitudes registradas.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-1">
              {requests.map((request) => (
                <div
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-slate-50/60 px-3 py-3"
                  key={request.label}
                >
                  <div className="min-w-0">
                    <Badge variant={request.variant}>{request.label}</Badge>
                    <p className="mt-2 truncate text-xs text-muted">{request.detail}</p>
                  </div>
                  <p className="text-xl font-semibold tracking-tight text-foreground">{formatNumber(request.value)}</p>
                </div>
              ))}
            </div>
            <p className="border-t border-border pt-3 text-xs text-muted">
              {formatNumber(totalRequests)} solicitudes registradas en total.
            </p>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Accesos rápidos</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_220px]">
          <Link
            className="flex items-center justify-between rounded-lg border border-border px-3 py-3 text-sm font-semibold text-foreground transition-colors hover:border-[#1017D8]/25 hover:bg-[#1017D8]/5"
            to="/platform/companies"
          >
            <span className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" aria-hidden="true" />
              Ver empresas
            </span>
            <ArrowRight className="h-4 w-4 text-slate-400" aria-hidden="true" />
          </Link>
          <Link
            className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-3 text-sm font-semibold text-foreground transition-colors hover:border-[#1017D8]/25 hover:bg-[#1017D8]/5"
            to="/platform/upgrade-requests?status=Pending"
          >
            <span className="flex min-w-0 items-center gap-2">
              <ArrowUpCircle className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <span className="truncate">Ver solicitudes pendientes</span>
            </span>
            <Badge className="shrink-0" variant="warning">
              {formatNumber(summary.pendingUpgradeRequests)}
            </Badge>
          </Link>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-slate-50 px-3 py-3 text-sm text-muted">
            <Warehouse className="h-4 w-4 text-slate-500" aria-hidden="true" />
            <span>
              <strong className="text-foreground">{formatNumber(summary.totalWarehouses)}</strong> almacenes globales
            </span>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 xl:grid-cols-2" aria-label="Actividad reciente">
        <Card>
          <CardHeader>
            <CardTitle>Empresas recientes</CardTitle>
            <p className="text-sm text-muted">Últimas empresas registradas en LOGENT.</p>
          </CardHeader>
          <CardContent className="space-y-1">
            {summary.recentCompanies.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted">Aún no hay empresas registradas.</p>
            ) : (
              summary.recentCompanies.map((company) => (
                <div
                  className="flex items-center justify-between gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-slate-50"
                  key={company.id}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{company.name}</p>
                    <p className="mt-1 text-xs text-muted">{formatDateTime(company.createdAt)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge className="hidden sm:inline-flex" variant={getPlanBadgeVariant(company.plan)}>
                      {company.plan}
                    </Badge>
                    <Badge className="hidden md:inline-flex" variant={company.isActive ? 'success' : 'danger'}>
                      {company.isActive ? 'Activa' : 'Suspendida'}
                    </Badge>
                    <Link
                      aria-label={`Ver detalle de ${company.name}`}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-white px-2.5 text-xs font-semibold text-primary transition-colors hover:border-[#1017D8]/30 hover:bg-[#1017D8]/5"
                      to={`/platform/companies/${company.id}`}
                    >
                      Ver
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Solicitudes recientes</CardTitle>
            <p className="text-sm text-muted">Cambios de plan recibidos desde empresas tenant.</p>
          </CardHeader>
          <CardContent className="space-y-1">
            {summary.recentUpgradeRequests.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted">Aún no hay solicitudes de cambio de plan.</p>
            ) : (
              summary.recentUpgradeRequests.map((request) => (
                <div
                  className="flex items-center justify-between gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-slate-50"
                  key={request.id}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{request.companyName}</p>
                    <p className="mt-1 truncate text-xs text-muted">
                      {request.currentPlan} → {request.requestedPlan} · {formatDateTime(request.createdAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge className="hidden sm:inline-flex" variant={statusVariants[request.status]}>
                      {statusLabels[request.status]}
                    </Badge>
                    <Link
                      aria-label={`Ver solicitud de ${request.companyName}`}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-white px-2.5 text-xs font-semibold text-primary transition-colors hover:border-[#1017D8]/30 hover:bg-[#1017D8]/5"
                      to={`/platform/upgrade-requests/${request.id}`}
                    >
                      Ver
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      <div className="flex flex-col gap-3 rounded-lg border border-dashed border-slate-300 bg-white px-4 py-4 sm:flex-row sm:items-center">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
          <BarChart3 className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-foreground">Analítica avanzada</p>
            <Badge variant="muted">Próximamente</Badge>
          </div>
          <p className="mt-1 text-sm leading-6 text-muted">
            Los reportes visuales avanzados estarán disponibles en el módulo de analítica de plataforma.
          </p>
        </div>
      </div>
    </div>
  )
}

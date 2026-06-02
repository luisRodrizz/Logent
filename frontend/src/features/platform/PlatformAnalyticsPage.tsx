import { Building2, CheckCircle2, Clock3, Package, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { LoadingState } from '../../components/common/LoadingState'
import { PageHeader } from '../../components/common/PageHeader'
import { SectionError } from '../../components/common/SectionError'
import { Badge } from '../../components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { getApiErrorMessage } from '../../lib/api-error'
import { formatNumber } from '../../lib/format'
import { usePlatformAnalyticsSummary } from './platform-analytics.queries'
import type { TopPlatformCompany } from './platform-analytics.types'
import type { PlatformPlan } from './platform.types'

const planColors: Record<PlatformPlan, string> = {
  Enterprise: '#28E000',
  Free: '#94A3B8',
  Pro: '#14B8A6',
  Starter: '#2563EB',
}

function getPlanBadgeVariant(plan: PlatformPlan) {
  if (plan === 'Enterprise' || plan === 'Pro') {
    return 'default' as const
  }

  return plan === 'Starter' ? ('success' as const) : ('muted' as const)
}

function TopCompaniesList({
  companies,
  emptyText,
  label,
  suffix,
}: {
  companies: TopPlatformCompany[]
  emptyText: string
  label: string
  suffix: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {companies.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">{emptyText}</p>
        ) : (
          companies.map((company, index) => (
            <Link
              className="flex items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-slate-50"
              key={company.companyId}
              to={`/platform/companies/${company.companyId}`}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-semibold text-slate-600">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{company.companyName}</p>
                <Badge className="mt-1" variant={getPlanBadgeVariant(company.plan)}>
                  {company.plan}
                </Badge>
              </div>
              <p className="shrink-0 text-right text-sm font-semibold text-foreground">
                {formatNumber(company.count)}
                <span className="ml-1 block text-xs font-normal text-muted sm:inline">{suffix}</span>
              </p>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  )
}

export function PlatformAnalyticsPage() {
  const analyticsQuery = usePlatformAnalyticsSummary()

  if (analyticsQuery.isLoading) {
    return (
      <Card>
        <CardContent>
          <LoadingState text="Cargando analítica de plataforma..." />
        </CardContent>
      </Card>
    )
  }

  if (analyticsQuery.isError || !analyticsQuery.data) {
    return (
      <SectionError
        text={getApiErrorMessage(analyticsQuery.error, 'No se pudo cargar la analítica global de la plataforma.')}
      />
    )
  }

  const summary = analyticsQuery.data
  const totalPlanCompanies = summary.companiesByPlan.reduce((total, item) => total + item.count, 0)
  const hasCompanyGrowth = summary.monthlyCompanyGrowth.some((item) => item.count > 0)
  const hasMonthlyRequests = summary.monthlyUpgradeRequests.some((item) => item.total > 0)
  const hasPlans = totalPlanCompanies > 0
  const metrics = [
    { icon: Building2, label: 'Total empresas', value: summary.totalCompanies },
    { icon: CheckCircle2, label: 'Empresas activas', value: summary.activeCompanies },
    { icon: Clock3, label: 'Solicitudes pendientes', value: summary.pendingUpgradeRequests },
    { icon: Users, label: 'Usuarios tenant', value: summary.totalTenantUsers },
    { icon: Package, label: 'Productos globales', value: summary.totalProducts },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        description="Tendencias, uso global y distribución de empresas en LOGENT."
        eyebrow="Plataforma"
        title="Analítica de plataforma"
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5" aria-label="Métricas analíticas">
        {metrics.map((metric) => {
          const Icon = metric.icon

          return (
            <Card key={metric.label}>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#1017D8]/10 bg-[#1017D8]/5 text-primary">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs text-muted">{metric.label}</p>
                  <p className="mt-1 text-xl font-semibold tracking-tight text-foreground">{formatNumber(metric.value)}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-2" aria-label="Tendencias mensuales">
        <Card>
          <CardHeader>
            <CardTitle>Crecimiento de empresas</CardTitle>
            <p className="text-sm text-muted">Nuevas empresas registradas durante los últimos 12 meses.</p>
          </CardHeader>
          <CardContent>
            {hasCompanyGrowth ? (
              <div className="h-72 w-full">
                <ResponsiveContainer height="100%" width="100%">
                  <AreaChart data={summary.monthlyCompanyGrowth} margin={{ left: -18, right: 8, top: 8 }}>
                    <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false} />
                    <XAxis axisLine={false} dataKey="label" fontSize={11} tickLine={false} />
                    <YAxis allowDecimals={false} axisLine={false} fontSize={11} tickLine={false} />
                    <Tooltip />
                    <Area dataKey="count" fill="#1017D8" fillOpacity={0.08} stroke="#1017D8" strokeWidth={2} type="monotone" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="py-24 text-center text-sm text-muted">Aún no hay registros mensuales de empresas.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Solicitudes por mes</CardTitle>
            <p className="text-sm text-muted">Evolución de solicitudes de plan por estado.</p>
          </CardHeader>
          <CardContent>
            {hasMonthlyRequests ? (
              <div className="h-72 w-full">
                <ResponsiveContainer height="100%" width="100%">
                  <BarChart data={summary.monthlyUpgradeRequests} margin={{ left: -18, right: 8, top: 8 }}>
                    <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false} />
                    <XAxis axisLine={false} dataKey="label" fontSize={11} tickLine={false} />
                    <YAxis allowDecimals={false} axisLine={false} fontSize={11} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="pending" fill="#F59E0B" name="Pendientes" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="approved" fill="#10B981" name="Aprobadas" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="rejected" fill="#EF4444" name="Rechazadas" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="py-24 text-center text-sm text-muted">Aún no hay solicitudes mensuales registradas.</p>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]" aria-label="Distribución y uso">
        <Card>
          <CardHeader>
            <CardTitle>Empresas por plan</CardTitle>
            <p className="text-sm text-muted">Distribución actual de suscripciones.</p>
          </CardHeader>
          <CardContent>
            {hasPlans ? (
              <>
                <div className="relative mx-auto h-52 w-52">
                  <ResponsiveContainer height="100%" width="100%">
                    <PieChart>
                      <Pie
                        data={summary.companiesByPlan}
                        dataKey="count"
                        innerRadius={62}
                        nameKey="plan"
                        outerRadius={88}
                        paddingAngle={2}
                        stroke="transparent"
                      >
                        {summary.companiesByPlan.map((item) => (
                          <Cell fill={planColors[item.plan]} key={item.plan} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-semibold text-foreground">{formatNumber(totalPlanCompanies)}</span>
                    <span className="text-xs text-muted">empresas</span>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {summary.companiesByPlan.map((item) => (
                    <div className="flex items-center gap-2 text-xs text-muted" key={item.plan}>
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: planColors[item.plan] }} />
                      <span className="min-w-0 truncate">{item.plan}</span>
                      <strong className="ml-auto text-foreground">{formatNumber(item.count)}</strong>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="py-24 text-center text-sm text-muted">Aún no hay empresas para distribuir por plan.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Empresas con más productos</CardTitle>
            <p className="text-sm text-muted">Top 5 empresas según catálogo registrado.</p>
          </CardHeader>
          <CardContent>
            {summary.topCompaniesByProducts.length === 0 ? (
              <p className="py-24 text-center text-sm text-muted">Aún no hay productos registrados.</p>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer height="100%" width="100%">
                  <BarChart data={summary.topCompaniesByProducts} layout="vertical" margin={{ left: 12, right: 24 }}>
                    <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" horizontal={false} />
                    <XAxis allowDecimals={false} axisLine={false} fontSize={11} tickLine={false} type="number" />
                    <YAxis
                      axisLine={false}
                      dataKey="companyName"
                      fontSize={11}
                      tickLine={false}
                      type="category"
                      width={110}
                    />
                    <Tooltip />
                    <Bar dataKey="count" fill="#1017D8" name="Productos" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-3" aria-label="Rankings de empresas">
        <TopCompaniesList
          companies={summary.topCompaniesByProducts}
          emptyText="Aún no hay productos registrados."
          label="Top por productos"
          suffix="productos"
        />
        <TopCompaniesList
          companies={summary.topCompaniesByUsers}
          emptyText="Aún no hay usuarios tenant registrados."
          label="Top por usuarios"
          suffix="usuarios"
        />
        <TopCompaniesList
          companies={summary.topCompaniesByWarehouses}
          emptyText="Aún no hay almacenes registrados."
          label="Top por almacenes"
          suffix="almacenes"
        />
      </section>
    </div>
  )
}

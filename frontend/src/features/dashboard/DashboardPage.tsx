import {
  Activity,
  AlertTriangle,
  ArrowDownCircle,
  ArrowLeftRight,
  ArrowRight,
  ArrowUpCircle,
  Boxes,
  ClipboardList,
  DollarSign,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { EmptyState } from '../../components/common/EmptyState'
import { LoadingState } from '../../components/common/LoadingState'
import { PageHeader } from '../../components/common/PageHeader'
import { SectionError } from '../../components/common/SectionError'
import { TableContainer } from '../../components/common/TableContainer'
import { Badge } from '../../components/ui/Badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { formatCurrency, formatDateTime, formatNumber } from '../../lib/format'
import type { MovementType } from '../../types/dashboard'
import {
  useDashboardSummary,
  useLowStockAlerts,
  useRecentMovements,
  useStockOverview,
} from './dashboard.queries'
import { TenantOnboardingCard } from './TenantOnboardingCard'

const movementLabels: Record<MovementType, string> = {
  Adjustment: 'Ajuste',
  Entry: 'Entrada',
  Exit: 'Salida',
  Transfer: 'Transferencia',
}

const movementBadgeVariants: Record<MovementType, 'default' | 'success' | 'warning' | 'danger' | 'muted'> = {
  Adjustment: 'muted',
  Entry: 'success',
  Exit: 'danger',
  Transfer: 'default',
}

function CompactMetric({
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
    <div className="rounded-lg border border-border bg-white px-4 py-3 shadow-[0_1px_2px_rgb(15_23_42/0.03)]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-muted">{title}</p>
        <div className="text-[#14B8A6]">{icon}</div>
      </div>
      <p className="mt-3 text-xl font-semibold tracking-tight text-foreground">{value}</p>
      <p className="mt-1 text-xs leading-5 text-muted">{description}</p>
    </div>
  )
}

function DashboardEmptyAction({ href, label }: { href: string; label: string }) {
  return (
    <Link
      className="inline-flex items-center gap-2 text-sm font-semibold text-[#1017D8] transition-colors hover:text-[#0E16B8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1017D8] focus-visible:ring-offset-2"
      to={href}
    >
      {label}
      <ArrowRight className="h-4 w-4" />
    </Link>
  )
}

export function DashboardPage() {
  const summaryQuery = useDashboardSummary()
  const stockOverviewQuery = useStockOverview()
  const recentMovementsQuery = useRecentMovements()
  const lowStockAlertsQuery = useLowStockAlerts()

  const stockOverview = stockOverviewQuery.data ?? []
  const recentMovements = recentMovementsQuery.data ?? []
  const lowStockAlerts = lowStockAlertsQuery.data ?? []
  const chartData = stockOverview.slice(0, 8).map((item) => ({
    name: item.productCode || item.productName,
    quantity: item.totalQuantity,
  }))
  const isEmptyTenant =
    summaryQuery.data?.totalProducts === 0 &&
    summaryQuery.data.totalCategories === 0 &&
    summaryQuery.data.totalSuppliers === 0 &&
    summaryQuery.data.totalWarehouses === 0 &&
    summaryQuery.data.totalMovements === 0

  return (
    <div className="space-y-5">
      <PageHeader
        description="Vista ejecutiva para revisar valor, cobertura, alertas y actividad reciente del inventario."
        eyebrow="Resumen operativo"
        title="Dashboard"
      />

      {summaryQuery.isLoading ? (
        <Card>
          <CardContent>
            <LoadingState text="Cargando métricas del inventario..." />
          </CardContent>
        </Card>
      ) : summaryQuery.isError ? (
        <SectionError text="No se pudieron cargar las métricas principales del dashboard." />
      ) : summaryQuery.data ? (
        <Card className="overflow-hidden border-t-2 border-t-[#28E000]">
          <CardContent className="grid gap-0 p-0 lg:grid-cols-[1fr_1.8fr]">
            <div className="border-b border-border bg-white p-6 lg:border-b-0 lg:border-r">
              <p className="text-sm font-medium text-muted">Valor estimado actual</p>
              <p className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {formatCurrency(summaryQuery.data.totalInventoryValue)}
              </p>
              <p className="mt-3 max-w-sm text-sm leading-6 text-muted">
                Resumen financiero calculado desde el stock y costos registrados.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-[#14B8A6]/20 bg-[#14B8A6]/5 p-3">
                  <p className="text-xs text-muted">Productos</p>
                  <p className="mt-2 text-lg font-semibold text-foreground">
                    {formatNumber(summaryQuery.data.totalProducts)}
                  </p>
                </div>
                <div className="rounded-lg border border-[#1017D8]/15 bg-[#1017D8]/5 p-3">
                  <p className="text-xs text-muted">Almacenes</p>
                  <p className="mt-2 text-lg font-semibold text-foreground">
                    {formatNumber(summaryQuery.data.totalWarehouses)}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 bg-slate-50 p-4 sm:grid-cols-2 xl:grid-cols-3">
              <CompactMetric
                description="Registros con existencia"
                icon={<Boxes className="h-4 w-4" />}
                title="Existencias"
                value={formatNumber(summaryQuery.data.totalStockItems)}
              />
              <CompactMetric
                description="Bajo mínimo configurado"
                icon={<AlertTriangle className="h-4 w-4" />}
                title="Stock bajo"
                value={formatNumber(summaryQuery.data.lowStockItems)}
              />
              <CompactMetric
                description="Actividad registrada"
                icon={<ArrowLeftRight className="h-4 w-4" />}
                title="Movimientos"
                value={formatNumber(summaryQuery.data.totalMovements)}
              />
              <CompactMetric
                description="Clasificación activa"
                icon={<ClipboardList className="h-4 w-4" />}
                title="Categorías"
                value={formatNumber(summaryQuery.data.totalCategories)}
              />
              <CompactMetric
                description="Proveedores maestros"
                icon={<Activity className="h-4 w-4" />}
                title="Proveedores"
                value={formatNumber(summaryQuery.data.totalSuppliers)}
              />
              <CompactMetric
                description="Valor operativo"
                icon={<DollarSign className="h-4 w-4" />}
                title="Inventario"
                value={formatCurrency(summaryQuery.data.totalInventoryValue)}
              />
            </div>
          </CardContent>
        </Card>
      ) : null}

      {isEmptyTenant ? <TenantOnboardingCard /> : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)] xl:items-start">
        <Card>
          <CardHeader>
            <CardTitle>Resumen de stock</CardTitle>
            <CardDescription>Productos con mayor presencia y valor estimado dentro del inventario.</CardDescription>
          </CardHeader>
          <CardContent>
            {stockOverviewQuery.isLoading ? (
              <LoadingState text="Cargando resumen de stock..." />
            ) : stockOverviewQuery.isError ? (
              <SectionError text="No se pudo cargar el resumen de stock." />
            ) : stockOverview.length === 0 ? (
              <EmptyState
                action={<DashboardEmptyAction href="/products" label="Ir a productos" />}
                description="Aún no tienes stock registrado. Crea productos y registra una entrada para comenzar."
                icon={<Boxes className="h-6 w-6" />}
                title="Sin stock registrado"
              />
            ) : (
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(260px,0.85fr)]">
                {chartData.length > 0 ? (
                  <div className="h-72 rounded-lg border border-border bg-white px-3 py-4">
                    <ResponsiveContainer height="100%" width="100%">
                      <BarChart data={chartData}>
                        <XAxis axisLine={false} dataKey="name" fontSize={11} tickLine={false} />
                        <YAxis allowDecimals={false} axisLine={false} fontSize={11} tickLine={false} />
                        <Tooltip
                          cursor={{ fill: 'rgb(226 232 240 / 0.45)' }}
                          formatter={(value) => [formatNumber(Number(value)), 'Cantidad']}
                        />
                        <Bar dataKey="quantity" fill="#1017D8" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : null}

                <div className="divide-y divide-border rounded-lg border border-border bg-white">
                  {stockOverview.slice(0, 6).map((item) => (
                    <div className="grid grid-cols-[1fr_auto] gap-4 px-4 py-3" key={item.productId}>
                      <div className="min-w-0">
                        <div className="flex min-w-0 items-center gap-2">
                          <p className="truncate text-sm font-semibold text-foreground">{item.productName}</p>
                          {item.isLowStock ? <Badge variant="warning">Bajo</Badge> : null}
                        </div>
                        <p className="mt-1 text-xs text-muted">{item.productCode}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-foreground">{formatNumber(item.totalQuantity)}</p>
                        <p className="mt-1 text-xs text-muted">{formatCurrency(item.estimatedValue)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alertas operativas</CardTitle>
            <CardDescription>Productos por debajo del mínimo configurado.</CardDescription>
          </CardHeader>
          <CardContent className="xl:max-h-[440px] xl:overflow-y-auto">
            {lowStockAlertsQuery.isLoading ? (
              <LoadingState text="Cargando alertas..." />
            ) : lowStockAlertsQuery.isError ? (
              <SectionError text="No se pudieron cargar las alertas de stock bajo." />
            ) : lowStockAlerts.length === 0 ? (
              <EmptyState
                description="Sin alertas por ahora. Cuando configures productos con stock mínimo, LOGENT te avisará aquí."
                icon={<AlertTriangle className="h-6 w-6" />}
                title="Sin alertas"
              />
            ) : (
              <div className="space-y-3 pr-1">
                {lowStockAlerts.map((item) => (
                  <div className="rounded-lg border border-border bg-white p-4" key={`${item.productId}-${item.warehouseId}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">{item.productName}</p>
                        <p className="mt-1 text-xs text-muted">
                          {item.productCode} · {item.warehouseName}
                        </p>
                      </div>
                      <Badge variant={item.missingQuantity > 0 ? 'danger' : 'warning'}>Stock bajo</Badge>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-lg bg-slate-50 px-2 py-2">
                        <p className="text-xs text-muted">Actual</p>
                        <p className="text-sm font-semibold text-foreground">{formatNumber(item.quantity)}</p>
                      </div>
                      <div className="rounded-lg bg-slate-50 px-2 py-2">
                        <p className="text-xs text-muted">Mínimo</p>
                        <p className="text-sm font-semibold text-foreground">{formatNumber(item.minimumStock)}</p>
                      </div>
                      <div className="rounded-lg bg-red-50 px-2 py-2">
                        <p className="text-xs text-red-600">Faltan</p>
                        <p className="text-sm font-semibold text-red-700">{formatNumber(item.missingQuantity)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Movimientos recientes</CardTitle>
          <CardDescription>Últimas entradas, salidas, ajustes y transferencias registradas.</CardDescription>
        </CardHeader>
        <CardContent>
          {recentMovementsQuery.isLoading ? (
            <LoadingState text="Cargando movimientos recientes..." />
          ) : recentMovementsQuery.isError ? (
            <SectionError text="No se pudieron cargar los movimientos recientes." />
          ) : recentMovements.length === 0 ? (
            <EmptyState
              action={<DashboardEmptyAction href="/movements" label="Registrar una entrada" />}
              description="Aún no hay movimientos. Registra una entrada para iniciar el Kardex."
              icon={<ArrowLeftRight className="h-6 w-6" />}
              title="Sin movimientos recientes"
            />
          ) : (
            <TableContainer>
              <div className="w-full min-w-[760px]">
                <div className="grid grid-cols-[0.8fr_1fr_1.4fr_0.6fr] gap-3 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase text-muted">
                  <span>Tipo</span>
                  <span>Fecha</span>
                  <span>Almacenes</span>
                  <span className="text-right">Cantidad</span>
                </div>
                <div className="divide-y divide-border bg-white">
                  {recentMovements.map((movement) => {
                    const origin = movement.warehouseOriginName ?? 'Origen no registrado'
                    const destination = movement.warehouseDestinationName
                    const warehouseLabel =
                      movement.type === 'Transfer' && destination ? `${origin} a ${destination}` : origin
                    const MovementIcon =
                      movement.type === 'Entry'
                        ? ArrowUpCircle
                        : movement.type === 'Exit'
                          ? ArrowDownCircle
                          : ArrowLeftRight

                    return (
                      <div
                        className="grid grid-cols-[0.8fr_1fr_1.4fr_0.6fr] items-center gap-3 px-4 py-3.5"
                        key={movement.id}
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <MovementIcon className="h-4 w-4 shrink-0 text-muted" />
                          <Badge variant={movementBadgeVariants[movement.type]}>{movementLabels[movement.type]}</Badge>
                        </div>
                        <p className="text-sm text-muted">{formatDateTime(movement.date)}</p>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{warehouseLabel}</p>
                          <p className="mt-1 text-xs text-muted">{formatNumber(movement.totalItems)} detalles</p>
                        </div>
                        <p className="text-right text-sm font-semibold text-foreground">
                          {formatNumber(movement.totalQuantity)}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

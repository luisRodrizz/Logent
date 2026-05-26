import {
  Activity,
  AlertTriangle,
  ArrowDownCircle,
  ArrowLeftRight,
  ArrowUpCircle,
  Boxes,
  ClipboardList,
  DollarSign,
} from 'lucide-react'
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
    <div className="rounded-lg border border-border bg-white px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-muted">{title}</p>
        <div className="text-slate-400">{icon}</div>
      </div>
      <p className="mt-3 text-xl font-semibold tracking-tight text-foreground">{value}</p>
      <p className="mt-1 text-xs leading-5 text-muted">{description}</p>
    </div>
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

  return (
    <div className="space-y-6">
      <PageHeader
        description="Vista ejecutiva para revisar valor, cobertura, alertas y actividad reciente del inventario."
        eyebrow="Operations overview"
        title="Dashboard"
      />

      {summaryQuery.isLoading ? (
        <Card>
          <CardContent>
            <LoadingState text="Cargando metricas del inventario..." />
          </CardContent>
        </Card>
      ) : summaryQuery.isError ? (
        <SectionError text="No se pudieron cargar las metricas principales del dashboard." />
      ) : summaryQuery.data ? (
        <Card className="overflow-hidden">
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
                <div className="rounded-lg border border-border bg-slate-50 p-3">
                  <p className="text-xs text-muted">Productos</p>
                  <p className="mt-2 text-lg font-semibold text-foreground">
                    {formatNumber(summaryQuery.data.totalProducts)}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-slate-50 p-3">
                  <p className="text-xs text-muted">Almacenes</p>
                  <p className="mt-2 text-lg font-semibold text-foreground">
                    {formatNumber(summaryQuery.data.totalWarehouses)}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 bg-slate-50 p-4 sm:grid-cols-2 xl:grid-cols-3">
              <CompactMetric
                description="Items con existencia"
                icon={<Boxes className="h-4 w-4" />}
                title="Stock items"
                value={formatNumber(summaryQuery.data.totalStockItems)}
              />
              <CompactMetric
                description="Bajo minimo configurado"
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
                description="Clasificacion activa"
                icon={<ClipboardList className="h-4 w-4" />}
                title="Categorias"
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

      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.75fr]">
        <Card>
          <CardHeader>
            <CardTitle>Stock overview</CardTitle>
            <CardDescription>Productos con mayor presencia y valor estimado dentro del inventario.</CardDescription>
          </CardHeader>
          <CardContent>
            {stockOverviewQuery.isLoading ? (
              <LoadingState text="Cargando stock overview..." />
            ) : stockOverviewQuery.isError ? (
              <SectionError text="No se pudo cargar el resumen de stock." />
            ) : stockOverview.length === 0 ? (
              <EmptyState
                description="Aun no hay datos de stock para mostrar en el dashboard."
                icon={<Boxes className="h-6 w-6" />}
                title="Sin stock registrado"
              />
            ) : (
              <div className="grid gap-5 2xl:grid-cols-[1.2fr_0.8fr]">
                {chartData.length > 0 ? (
                  <div className="h-80 rounded-lg border border-border bg-white px-3 py-4">
                    <ResponsiveContainer height="100%" width="100%">
                      <BarChart data={chartData}>
                        <XAxis axisLine={false} dataKey="name" fontSize={11} tickLine={false} />
                        <YAxis allowDecimals={false} axisLine={false} fontSize={11} tickLine={false} />
                        <Tooltip
                          cursor={{ fill: 'rgb(226 232 240 / 0.45)' }}
                          formatter={(value) => [formatNumber(Number(value)), 'Cantidad']}
                        />
                        <Bar dataKey="quantity" fill="#2563EB" radius={[4, 4, 0, 0]} />
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
            <CardDescription>Productos por debajo del minimo configurado.</CardDescription>
          </CardHeader>
          <CardContent>
            {lowStockAlertsQuery.isLoading ? (
              <LoadingState text="Cargando alertas..." />
            ) : lowStockAlertsQuery.isError ? (
              <SectionError text="No se pudieron cargar las alertas de stock bajo." />
            ) : lowStockAlerts.length === 0 ? (
              <EmptyState
                description="No hay productos por debajo del stock minimo."
                icon={<AlertTriangle className="h-6 w-6" />}
                title="Sin alertas"
              />
            ) : (
              <div className="space-y-3">
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
                        <p className="text-xs text-muted">Minimo</p>
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
          <CardDescription>Ultimas entradas, salidas, ajustes y transferencias registradas.</CardDescription>
        </CardHeader>
        <CardContent>
          {recentMovementsQuery.isLoading ? (
            <LoadingState text="Cargando movimientos recientes..." />
          ) : recentMovementsQuery.isError ? (
            <SectionError text="No se pudieron cargar los movimientos recientes." />
          ) : recentMovements.length === 0 ? (
            <EmptyState
              description="Aun no hay movimientos para mostrar en el dashboard."
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
                          <p className="mt-1 text-xs text-muted">{formatNumber(movement.totalItems)} items</p>
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

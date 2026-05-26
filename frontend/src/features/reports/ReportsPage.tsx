import {
  AlertTriangle,
  ArrowDownCircle,
  ArrowLeftRight,
  ArrowUpCircle,
  BarChart3,
  ClipboardList,
  DollarSign,
  Package,
  Warehouse,
} from 'lucide-react'
import { useMemo, type ReactNode } from 'react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { EmptyState } from '../../components/common/EmptyState'
import { LoadingState } from '../../components/common/LoadingState'
import { PageHeader } from '../../components/common/PageHeader'
import { SectionError } from '../../components/common/SectionError'
import { TableContainer } from '../../components/common/TableContainer'
import { Badge } from '../../components/ui/Badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { formatCurrency, formatDateTime, formatNumber } from '../../lib/format'
import type { LowStockReportItem, StockSummaryReport } from '../../types/report'
import {
  useKardexSummaryReport,
  useLowStockReport,
  useMovementsSummaryReport,
  useStockSummaryReport,
} from './reports.queries'

const emptyStockSummary: StockSummaryReport[] = []
const emptyLowStock: LowStockReportItem[] = []

function ReportMetric({
  description,
  icon,
  title,
  value,
}: {
  description: string
  icon: ReactNode
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

function getStockBadge(item: StockSummaryReport) {
  if (item.quantity === 0) {
    return <Badge variant="danger">Sin stock</Badge>
  }

  if (item.isLowStock) {
    return <Badge variant="warning">Stock bajo</Badge>
  }

  return <Badge variant="success">Normal</Badge>
}

function getLowStockBadge(item: LowStockReportItem) {
  if (item.quantity === 0) {
    return <Badge variant="danger">Critico</Badge>
  }

  return <Badge variant="warning">Bajo minimo</Badge>
}

export function ReportsPage() {
  const stockSummaryQuery = useStockSummaryReport()
  const lowStockQuery = useLowStockReport()
  const movementsSummaryQuery = useMovementsSummaryReport()
  const kardexSummaryQuery = useKardexSummaryReport()

  const stockSummary = stockSummaryQuery.data ?? emptyStockSummary
  const lowStock = lowStockQuery.data ?? emptyLowStock
  const movementsSummary = movementsSummaryQuery.data
  const kardexSummary = kardexSummaryQuery.data

  const stockTotals = useMemo(() => {
    const totalQuantity = stockSummary.reduce((total, item) => total + item.quantity, 0)
    const totalValue = stockSummary.reduce((total, item) => total + item.estimatedStockValue, 0)
    const lowStockCount = stockSummary.filter((item) => item.isLowStock).length
    const warehouses = new Set(stockSummary.map((item) => item.warehouseId)).size

    return {
      lowStockCount,
      totalQuantity,
      totalValue,
      warehouses,
    }
  }, [stockSummary])

  const stockChartData = useMemo(
    () =>
      [...stockSummary]
        .sort((left, right) => right.estimatedStockValue - left.estimatedStockValue)
        .slice(0, 8)
        .map((item) => ({
          name: item.productCode || item.productName,
          value: item.estimatedStockValue,
        })),
    [stockSummary],
  )

  const lowStockByWarehouse = useMemo(() => {
    const totals = lowStock.reduce<Record<string, { missing: number; warehouse: string }>>((accumulator, item) => {
      const key = item.warehouseId
      const current = accumulator[key] ?? { missing: 0, warehouse: item.warehouseName }
      accumulator[key] = {
        missing: current.missing + item.missingQuantity,
        warehouse: current.warehouse,
      }

      return accumulator
    }, {})

    return Object.values(totals)
      .sort((left, right) => right.missing - left.missing)
      .slice(0, 6)
  }, [lowStock])

  const movementChartData = movementsSummary
    ? [
        { name: 'Entradas', value: movementsSummary.totalEntries },
        { name: 'Salidas', value: movementsSummary.totalExits },
        { name: 'Transferencias', value: movementsSummary.totalTransfers },
      ]
    : []

  const hasMovementData = Boolean(
    movementsSummary &&
      (movementsSummary.totalMovements > 0 ||
        movementsSummary.totalMovementDetails > 0 ||
        movementsSummary.totalUnitsMoved > 0),
  )
  const hasKardexData = Boolean(
    kardexSummary &&
      (kardexSummary.totalEntries > 0 ||
        kardexSummary.totalEntryUnits > 0 ||
        kardexSummary.totalExitUnits > 0 ||
        kardexSummary.totalInventoryValue > 0),
  )

  return (
    <div className="space-y-6">
      <PageHeader
        description="Lectura analitica del inventario, alertas operativas, movimientos y Kardex consolidado."
        eyebrow="Analytics"
        title="Reportes"
      />

      <Card>
        <CardContent className="grid gap-4 p-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-semibold text-foreground">Modulo de consulta</p>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">
              Los reportes son de solo lectura y se calculan desde los datos operativos registrados por el backend.
            </p>
          </div>
          <Badge variant="muted">Solo lectura</Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Stock summary</CardTitle>
          <CardDescription>Existencias, valor estimado y estado por producto y almacen.</CardDescription>
        </CardHeader>
        <CardContent>
          {stockSummaryQuery.isLoading ? (
            <LoadingState text="Cargando reporte de stock..." />
          ) : stockSummaryQuery.isError ? (
            <SectionError text="No se pudo cargar el reporte de stock." />
          ) : stockSummary.length === 0 ? (
            <EmptyState
              description="Aun no hay existencias consolidadas para analizar."
              icon={<Package className="h-6 w-6" />}
              title="Sin datos de stock"
            />
          ) : (
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <ReportMetric
                  description="Registros producto-almacen"
                  icon={<ClipboardList className="h-4 w-4" />}
                  title="Items"
                  value={formatNumber(stockSummary.length)}
                />
                <ReportMetric
                  description="Unidades disponibles"
                  icon={<Package className="h-4 w-4" />}
                  title="Cantidad total"
                  value={formatNumber(stockTotals.totalQuantity)}
                />
                <ReportMetric
                  description="Valor de inventario calculado"
                  icon={<DollarSign className="h-4 w-4" />}
                  title="Valor estimado"
                  value={formatCurrency(stockTotals.totalValue)}
                />
                <ReportMetric
                  description={`${formatNumber(stockTotals.warehouses)} almacenes con stock`}
                  icon={<AlertTriangle className="h-4 w-4" />}
                  title="Stock bajo"
                  value={formatNumber(stockTotals.lowStockCount)}
                />
              </div>

              {stockChartData.length > 0 ? (
                <div className="h-64 rounded-lg border border-border bg-white px-3 py-4">
                  <ResponsiveContainer height="100%" width="100%">
                    <BarChart data={stockChartData}>
                      <XAxis axisLine={false} dataKey="name" fontSize={11} tickLine={false} />
                      <YAxis
                        axisLine={false}
                        fontSize={11}
                        tickFormatter={(value) => formatNumber(Number(value))}
                        tickLine={false}
                      />
                      <Tooltip
                        cursor={{ fill: 'rgb(226 232 240 / 0.45)' }}
                        formatter={(value) => [formatCurrency(Number(value)), 'Valor estimado']}
                      />
                      <Bar dataKey="value" fill="#2563EB" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : null}

              <TableContainer>
                <table className="w-full min-w-[980px] table-fixed divide-y divide-border">
                  <colgroup>
                    <col className="w-[28%]" />
                    <col className="w-[20%]" />
                    <col className="w-[12%]" />
                    <col className="w-[12%]" />
                    <col className="w-[12%]" />
                    <col className="w-[16%]" />
                  </colgroup>
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted">Producto</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted">Almacen</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-muted">Cantidad</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-muted">Minimo</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted">Estado</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-muted">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-white">
                    {stockSummary.slice(0, 10).map((item) => (
                      <tr className="transition-colors hover:bg-slate-50/80" key={`${item.productId}-${item.warehouseId}`}>
                        <td className="px-4 py-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground">{item.productName}</p>
                            <p className="mt-1 font-mono text-xs text-muted">{item.productCode}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted">
                          <p className="truncate">{item.warehouseName}</p>
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-semibold text-foreground">
                          {formatNumber(item.quantity)}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-muted">{formatNumber(item.minimumStock)}</td>
                        <td className="px-4 py-3">{getStockBadge(item)}</td>
                        <td className="px-4 py-3 text-right text-sm font-medium text-muted">
                          {formatCurrency(item.estimatedStockValue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Low stock</CardTitle>
            <CardDescription>Productos por debajo del minimo operativo configurado.</CardDescription>
          </CardHeader>
          <CardContent>
            {lowStockQuery.isLoading ? (
              <LoadingState text="Cargando reporte de stock bajo..." />
            ) : lowStockQuery.isError ? (
              <SectionError text="No se pudo cargar el reporte de stock bajo." />
            ) : lowStock.length === 0 ? (
              <EmptyState
                description="No hay productos por debajo del stock minimo."
                icon={<AlertTriangle className="h-6 w-6" />}
                title="Sin alertas de stock bajo"
              />
            ) : (
              <div className="space-y-5">
                {lowStockByWarehouse.length > 0 ? (
                  <div className="h-56 rounded-lg border border-border bg-white px-3 py-4">
                    <ResponsiveContainer height="100%" width="100%">
                      <BarChart data={lowStockByWarehouse}>
                        <XAxis axisLine={false} dataKey="warehouse" fontSize={11} tickLine={false} />
                        <YAxis allowDecimals={false} axisLine={false} fontSize={11} tickLine={false} />
                        <Tooltip
                          cursor={{ fill: 'rgb(226 232 240 / 0.45)' }}
                          formatter={(value) => [formatNumber(Number(value)), 'Faltante']}
                        />
                        <Bar dataKey="missing" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : null}

                <TableContainer>
                  <table className="w-full min-w-[920px] table-fixed divide-y divide-border">
                    <colgroup>
                      <col className="w-[28%]" />
                      <col className="w-[22%]" />
                      <col className="w-[12%]" />
                      <col className="w-[12%]" />
                      <col className="w-[12%]" />
                      <col className="w-[14%]" />
                    </colgroup>
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted">Producto</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted">Almacen</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-muted">Actual</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-muted">Minimo</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-muted">Faltante</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-white">
                      {lowStock.slice(0, 10).map((item) => (
                        <tr className="transition-colors hover:bg-slate-50/80" key={`${item.productId}-${item.warehouseId}`}>
                          <td className="px-4 py-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-foreground">{item.productName}</p>
                              <p className="mt-1 font-mono text-xs text-muted">{item.productCode}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted">
                            <p className="truncate">{item.warehouseName}</p>
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-semibold text-foreground">
                            {formatNumber(item.quantity)}
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-muted">{formatNumber(item.minimumStock)}</td>
                          <td className="px-4 py-3 text-right text-sm font-medium text-muted">
                            {formatNumber(item.missingQuantity)}
                          </td>
                          <td className="px-4 py-3">{getLowStockBadge(item)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </TableContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Movements summary</CardTitle>
            <CardDescription>Consolidado de entradas, salidas y transferencias registradas.</CardDescription>
          </CardHeader>
          <CardContent>
            {movementsSummaryQuery.isLoading ? (
              <LoadingState text="Cargando resumen de movimientos..." />
            ) : movementsSummaryQuery.isError ? (
              <SectionError text="No se pudo cargar el resumen de movimientos." />
            ) : !hasMovementData || !movementsSummary ? (
              <EmptyState
                description="Aun no hay movimientos registrados para analizar."
                icon={<ArrowLeftRight className="h-6 w-6" />}
                title="Sin movimientos"
              />
            ) : (
              <div className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  <ReportMetric
                    description="Movimientos creados"
                    icon={<ArrowLeftRight className="h-4 w-4" />}
                    title="Total"
                    value={formatNumber(movementsSummary.totalMovements)}
                  />
                  <ReportMetric
                    description="Lineas operativas"
                    icon={<ClipboardList className="h-4 w-4" />}
                    title="Detalles"
                    value={formatNumber(movementsSummary.totalMovementDetails)}
                  />
                  <ReportMetric
                    description="Unidades procesadas"
                    icon={<Package className="h-4 w-4" />}
                    title="Unidades"
                    value={formatNumber(movementsSummary.totalUnitsMoved)}
                  />
                  <ReportMetric
                    description="Transferencias internas"
                    icon={<Warehouse className="h-4 w-4" />}
                    title="Transferencias"
                    value={formatNumber(movementsSummary.totalTransfers)}
                  />
                </div>

                <div className="h-56 rounded-lg border border-border bg-white px-3 py-4">
                  <ResponsiveContainer height="100%" width="100%">
                    <BarChart data={movementChartData}>
                      <XAxis axisLine={false} dataKey="name" fontSize={11} tickLine={false} />
                      <YAxis allowDecimals={false} axisLine={false} fontSize={11} tickLine={false} />
                      <Tooltip
                        cursor={{ fill: 'rgb(226 232 240 / 0.45)' }}
                        formatter={(value) => [formatNumber(Number(value)), 'Movimientos']}
                      />
                      <Bar dataKey="value" fill="#14B8A6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border border-border bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-foreground">Entradas</p>
                    <p className="mt-2 text-lg font-semibold text-foreground">
                      {formatNumber(movementsSummary.totalEntries)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-foreground">Salidas</p>
                    <p className="mt-2 text-lg font-semibold text-foreground">
                      {formatNumber(movementsSummary.totalExits)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-foreground">Transferencias</p>
                    <p className="mt-2 text-lg font-semibold text-foreground">
                      {formatNumber(movementsSummary.totalTransfers)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kardex summary</CardTitle>
          <CardDescription>Resumen historico de entradas, salidas, saldos y valor del inventario.</CardDescription>
        </CardHeader>
        <CardContent>
          {kardexSummaryQuery.isLoading ? (
            <LoadingState text="Cargando resumen de Kardex..." />
          ) : kardexSummaryQuery.isError ? (
            <SectionError text="No se pudo cargar el resumen de Kardex." />
          ) : !hasKardexData || !kardexSummary ? (
            <EmptyState
              description="El Kardex se alimentara automaticamente cuando existan movimientos."
              icon={<BarChart3 className="h-6 w-6" />}
              title="Sin informacion de Kardex"
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <ReportMetric
                description="Registros historicos"
                icon={<ClipboardList className="h-4 w-4" />}
                title="Entradas Kardex"
                value={formatNumber(kardexSummary.totalEntries)}
              />
              <ReportMetric
                description="Unidades ingresadas"
                icon={<ArrowUpCircle className="h-4 w-4" />}
                title="Entrada"
                value={formatNumber(kardexSummary.totalEntryUnits)}
              />
              <ReportMetric
                description="Unidades retiradas"
                icon={<ArrowDownCircle className="h-4 w-4" />}
                title="Salida"
                value={formatNumber(kardexSummary.totalExitUnits)}
              />
              <ReportMetric
                description="Valor actual calculado"
                icon={<DollarSign className="h-4 w-4" />}
                title="Valor inventario"
                value={formatCurrency(kardexSummary.totalInventoryValue)}
              />
              <ReportMetric
                description="Ultima fecha registrada"
                icon={<BarChart3 className="h-4 w-4" />}
                title="Ultimo movimiento"
                value={formatDateTime(kardexSummary.lastMovementDate)}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

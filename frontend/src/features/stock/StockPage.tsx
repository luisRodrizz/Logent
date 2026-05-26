import { AlertTriangle, Boxes, FilterX, Package, Warehouse } from 'lucide-react'
import { useMemo, useState } from 'react'
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
import type { Product } from '../../types/product'
import type { StockItem } from '../../types/stock'
import {
  useStockItemByProductAndWarehouse,
  useStockItems,
  useStockItemsByProduct,
  useStockItemsByWarehouse,
  useStockProductOptions,
  useStockWarehouseOptions,
} from './stock.queries'

const emptyProducts: Product[] = []

type StockStatus = 'normal' | 'low' | 'empty' | 'unknown'

function getMinimumStock(product?: Product): number | null {
  return typeof product?.minimumStock === 'number' ? product.minimumStock : null
}

function getStockStatus(quantity: number, minimumStock: number | null): StockStatus {
  if (quantity === 0) {
    return 'empty'
  }

  if (minimumStock === null) {
    return 'unknown'
  }

  return quantity <= minimumStock ? 'low' : 'normal'
}

function getStatusLabel(status: StockStatus): string {
  const labels: Record<StockStatus, string> = {
    empty: 'Sin stock',
    low: 'Stock bajo',
    normal: 'Normal',
    unknown: 'Sin minimo',
  }

  return labels[status]
}

function getStatusVariant(status: StockStatus): 'success' | 'warning' | 'danger' | 'muted' {
  const variants: Record<StockStatus, 'success' | 'warning' | 'danger' | 'muted'> = {
    empty: 'danger',
    low: 'warning',
    normal: 'success',
    unknown: 'muted',
  }

  return variants[status]
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
        <div className="text-slate-400">
          {icon}
        </div>
      </div>
    </div>
  )
}

function StockErrorState({ error }: { error: unknown }) {
  return (
    <Card>
      <CardContent className="px-6 py-10">
        <SectionError text={getApiErrorMessage(error, 'No se pudo cargar la informacion de stock.')} />
      </CardContent>
    </Card>
  )
}

export function StockPage() {
  const [productId, setProductId] = useState('')
  const [warehouseId, setWarehouseId] = useState('')

  const hasProductFilter = Boolean(productId)
  const hasWarehouseFilter = Boolean(warehouseId)
  const hasFilters = hasProductFilter || hasWarehouseFilter

  const allStockQuery = useStockItems(!hasFilters)
  const stockByProductQuery = useStockItemsByProduct(productId, hasProductFilter && !hasWarehouseFilter)
  const stockByWarehouseQuery = useStockItemsByWarehouse(warehouseId, !hasProductFilter && hasWarehouseFilter)
  const stockByProductWarehouseQuery = useStockItemByProductAndWarehouse(
    productId,
    warehouseId,
    hasProductFilter && hasWarehouseFilter,
  )
  const productsQuery = useStockProductOptions()
  const warehousesQuery = useStockWarehouseOptions()

  const products = productsQuery.data?.items ?? emptyProducts
  const warehouses = warehousesQuery.data?.items ?? []

  const productsById = useMemo(() => new Map(products.map((product) => [product.id, product])), [products])

  const activeQuery = hasProductFilter
    ? hasWarehouseFilter
      ? stockByProductWarehouseQuery
      : stockByProductQuery
    : hasWarehouseFilter
      ? stockByWarehouseQuery
      : allStockQuery

  const stockItems: StockItem[] = useMemo(() => {
    if (hasProductFilter && hasWarehouseFilter) {
      return stockByProductWarehouseQuery.data ? [stockByProductWarehouseQuery.data] : []
    }

    if (hasProductFilter) {
      return stockByProductQuery.data ?? []
    }

    if (hasWarehouseFilter) {
      return stockByWarehouseQuery.data ?? []
    }

    return allStockQuery.data ?? []
  }, [
    allStockQuery.data,
    hasProductFilter,
    hasWarehouseFilter,
    stockByProductQuery.data,
    stockByProductWarehouseQuery.data,
    stockByWarehouseQuery.data,
  ])

  const summary = useMemo(() => {
    const totalQuantity = stockItems.reduce((total, item) => total + item.quantity, 0)
    const lowStockItems = stockItems.filter((item) => {
      const minimumStock = getMinimumStock(productsById.get(item.productId))
      return getStockStatus(item.quantity, minimumStock) === 'low'
    }).length
    const emptyStockItems = stockItems.filter((item) => item.quantity === 0).length
    const productCount = new Set(stockItems.map((item) => item.productId)).size
    const warehouseCount = new Set(stockItems.map((item) => item.warehouseId)).size

    return {
      emptyStockItems,
      lowStockItems,
      productCount,
      totalQuantity,
      warehouseCount,
    }
  }, [productsById, stockItems])

  function clearFilters() {
    setProductId('')
    setWarehouseId('')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        description="Consulta operativa de existencias por producto y almacen. Vista solo lectura."
        eyebrow="Operations"
        title="Stock"
      />

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_1fr_auto] xl:items-end">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground" htmlFor="stock-product-filter">
                Producto
              </label>
              <select
                className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-blue-100"
                disabled={productsQuery.isLoading}
                id="stock-product-filter"
                onChange={(event) => setProductId(event.target.value)}
                value={productId}
              >
                <option value="">Todos los productos</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.code} - {product.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground" htmlFor="stock-warehouse-filter">
                Almacen
              </label>
              <select
                className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-blue-100"
                disabled={warehousesQuery.isLoading}
                id="stock-warehouse-filter"
                onChange={(event) => setWarehouseId(event.target.value)}
                value={warehouseId}
              >
                <option value="">Todos los almacenes</option>
                {warehouses.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </option>
                ))}
              </select>
            </div>

            <Button disabled={!hasFilters} onClick={clearFilters} variant="secondary">
              <FilterX className="h-4 w-4" />
              Limpiar filtros
            </Button>
          </div>

          {productsQuery.isError || warehousesQuery.isError ? (
            <p className="mt-3 text-sm font-medium text-red-600">
              No se pudieron cargar todas las opciones de filtro. La consulta de stock sigue disponible.
            </p>
          ) : null}

          <p className="border-t border-border pt-3 text-xs leading-5 text-muted">
            El stock no se edita manualmente. Las existencias cambian unicamente mediante movimientos.
          </p>
        </CardContent>
      </Card>

      {activeQuery.isLoading ? (
        <Card>
          <CardContent>
            <LoadingState text="Cargando existencias..." />
          </CardContent>
        </Card>
      ) : activeQuery.isError ? (
        <StockErrorState error={activeQuery.error} />
      ) : stockItems.length === 0 ? (
        <EmptyState
          description={
            hasFilters
              ? 'No se encontraron existencias para los filtros seleccionados.'
              : 'Aun no hay existencias registradas para mostrar.'
          }
          icon={<Boxes className="h-6 w-6" />}
          title={hasFilters ? 'Sin resultados de stock' : 'Sin stock registrado'}
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              description="Suma de existencias visibles"
              icon={<Boxes className="h-4 w-4" />}
              title="Cantidad total"
              value={formatNumber(summary.totalQuantity)}
            />
            <SummaryCard
              description="Productos en la consulta"
              icon={<Package className="h-4 w-4" />}
              title="Productos"
              value={formatNumber(summary.productCount)}
            />
            <SummaryCard
              description="Almacenes en la consulta"
              icon={<Warehouse className="h-4 w-4" />}
              title="Almacenes"
              value={formatNumber(summary.warehouseCount)}
            />
            <SummaryCard
              description={`${summary.emptyStockItems} sin stock`}
              icon={<AlertTriangle className="h-4 w-4" />}
              title="Stock bajo"
              value={formatNumber(summary.lowStockItems)}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Existencias actuales</CardTitle>
              <CardDescription>Vista solo lectura por producto y almacen.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <TableContainer>
                <table className="w-full min-w-[980px] table-fixed divide-y divide-border">
                  <colgroup>
                    <col className="w-[32%]" />
                    <col className="w-[24%]" />
                    <col className="w-[11%]" />
                    <col className="w-[13%]" />
                    <col className="w-[10%]" />
                    <col className="w-[10%]" />
                  </colgroup>
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Producto</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Almacen</th>
                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-muted">Cantidad</th>
                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-muted">Stock minimo</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Estado</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Actualizacion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-white">
                    {stockItems.map((item) => {
                      const product = productsById.get(item.productId)
                      const minimumStock = getMinimumStock(product)
                      const status = getStockStatus(item.quantity, minimumStock)

                      return (
                        <tr className="transition-colors hover:bg-slate-50/80" key={item.id}>
                          <td className="px-5 py-4">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-foreground">{item.productName}</p>
                              <p className="mt-1 font-mono text-xs text-muted">{item.productCode}</p>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm text-foreground">
                            <p className="truncate">{item.warehouseName}</p>
                          </td>
                          <td className="px-5 py-4 text-right text-sm font-semibold text-foreground">
                            {formatNumber(item.quantity)}
                          </td>
                          <td className="px-5 py-4 text-right text-sm text-muted">
                            {minimumStock === null ? 'Sin dato' : formatNumber(minimumStock)}
                          </td>
                          <td className="px-5 py-4">
                            <Badge variant={getStatusVariant(status)}>{getStatusLabel(status)}</Badge>
                          </td>
                          <td className="whitespace-nowrap px-5 py-4 text-sm text-muted">
                            {formatDateTime(item.updatedAt)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </TableContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

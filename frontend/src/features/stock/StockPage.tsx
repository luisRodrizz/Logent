import { AlertTriangle, Boxes, FilterX, Package, Warehouse } from 'lucide-react'
import { useMemo, useState } from 'react'
import { EmptyState } from '../../components/common/EmptyState'
import { LoadingState } from '../../components/common/LoadingState'
import { PageHeader } from '../../components/common/PageHeader'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { getApiErrorMessage } from '../../lib/api-error'
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

const dateFormatter = new Intl.DateTimeFormat('es-PE', {
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  month: 'short',
  year: 'numeric',
})

const emptyProducts: Product[] = []

type StockStatus = 'normal' | 'low' | 'empty' | 'unknown'

function formatDate(value?: string | null): string {
  if (!value) {
    return 'Sin fecha'
  }

  return dateFormatter.format(new Date(value))
}

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
    <Card>
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div>
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

function StockErrorState({ error }: { error: unknown }) {
  return (
    <Card>
      <CardContent className="px-6 py-10">
        <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {getApiErrorMessage(error, 'No se pudo cargar la informacion de stock.')}
        </div>
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
      <PageHeader description="Consulta las existencias actuales por producto y almacen." title="Stock" />

      <Card>
        <CardHeader>
          <CardTitle>Filtros de consulta</CardTitle>
          <CardDescription>El stock se actualiza unicamente mediante movimientos de inventario.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
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
              icon={<Boxes className="h-5 w-5" />}
              title="Cantidad total"
              value={summary.totalQuantity.toString()}
            />
            <SummaryCard
              description="Productos en la consulta"
              icon={<Package className="h-5 w-5" />}
              title="Productos"
              value={summary.productCount.toString()}
            />
            <SummaryCard
              description="Almacenes en la consulta"
              icon={<Warehouse className="h-5 w-5" />}
              title="Almacenes"
              value={summary.warehouseCount.toString()}
            />
            <SummaryCard
              description={`${summary.emptyStockItems} sin stock`}
              icon={<AlertTriangle className="h-5 w-5" />}
              title="Stock bajo"
              value={summary.lowStockItems.toString()}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Existencias actuales</CardTitle>
              <CardDescription>Vista solo lectura por producto y almacen.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
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
                        <tr className="transition-colors hover:bg-slate-50" key={item.id}>
                          <td className="px-5 py-4">
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-primary">
                                <Package className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-foreground">{item.productName}</p>
                                <p className="mt-1 text-xs text-muted">{item.productCode}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <p className="flex items-center gap-2 text-sm text-foreground">
                              <Warehouse className="h-3.5 w-3.5 text-muted" />
                              {item.warehouseName}
                            </p>
                          </td>
                          <td className="px-5 py-4 text-right text-sm font-semibold text-foreground">
                            {item.quantity}
                          </td>
                          <td className="px-5 py-4 text-right text-sm text-muted">
                            {minimumStock === null ? 'Sin dato' : minimumStock}
                          </td>
                          <td className="px-5 py-4">
                            <Badge variant={getStatusVariant(status)}>{getStatusLabel(status)}</Badge>
                          </td>
                          <td className="px-5 py-4 text-sm text-muted">{formatDate(item.updatedAt)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

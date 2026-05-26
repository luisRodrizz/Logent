import { ArrowDownCircle, ArrowLeftRight, ArrowUpCircle, ClipboardList, Eye, FilterX, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { EmptyState } from '../../components/common/EmptyState'
import { LoadingState } from '../../components/common/LoadingState'
import { PageHeader } from '../../components/common/PageHeader'
import { SectionError } from '../../components/common/SectionError'
import { TableContainer } from '../../components/common/TableContainer'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { getApiErrorMessage } from '../../lib/api-error'
import { formatCurrency, formatDateTime, formatNumber } from '../../lib/format'
import type { KardexEntry, KardexMovementType } from '../../types/kardex'
import { KardexDetailsModal } from './KardexDetailsModal'
import {
  useKardexByProduct,
  useKardexByProductAndWarehouse,
  useKardexByWarehouse,
  useKardexEntries,
  useKardexProductOptions,
  useKardexWarehouseOptions,
} from './kardex.queries'

const movementLabels: Record<KardexMovementType, string> = {
  Adjustment: 'Ajuste',
  Entry: 'Entrada',
  Exit: 'Salida',
  Transfer: 'Transferencia',
}

const movementBadgeVariants: Record<KardexMovementType, 'default' | 'success' | 'warning' | 'danger' | 'muted'> = {
  Adjustment: 'muted',
  Entry: 'success',
  Exit: 'warning',
  Transfer: 'default',
}

const pageSizeOptions = [10, 20, 50]

function getMovementIcon(type: KardexMovementType) {
  if (type === 'Entry') {
    return ArrowUpCircle
  }

  if (type === 'Exit') {
    return ArrowDownCircle
  }

  return ArrowLeftRight
}

function getQuantityIn(entry: KardexEntry): number {
  return entry.stockAfter > entry.stockBefore ? entry.quantity : 0
}

function getQuantityOut(entry: KardexEntry): number {
  return entry.stockAfter < entry.stockBefore ? entry.quantity : 0
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

function KardexErrorState({ error }: { error: unknown }) {
  return (
    <Card>
      <CardContent className="px-6 py-10">
        <SectionError text={getApiErrorMessage(error, 'No se pudo cargar la informacion del Kardex.')} />
      </CardContent>
    </Card>
  )
}

export function KardexPage() {
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [productId, setProductId] = useState('')
  const [warehouseId, setWarehouseId] = useState('')
  const [selectedEntry, setSelectedEntry] = useState<KardexEntry | null>(null)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearch(searchInput.trim())
    }, 350)

    return () => window.clearTimeout(timeoutId)
  }, [searchInput])

  const hasProductFilter = Boolean(productId)
  const hasWarehouseFilter = Boolean(warehouseId)
  const hasFilters = hasProductFilter || hasWarehouseFilter

  const filters = useMemo(
    () => ({
      pageNumber,
      pageSize,
      search: search || undefined,
    }),
    [pageNumber, pageSize, search],
  )

  const generalQuery = useKardexEntries(filters, !hasFilters)
  const byProductQuery = useKardexByProduct(productId, hasProductFilter && !hasWarehouseFilter)
  const byWarehouseQuery = useKardexByWarehouse(warehouseId, !hasProductFilter && hasWarehouseFilter)
  const byProductWarehouseQuery = useKardexByProductAndWarehouse(
    productId,
    warehouseId,
    hasProductFilter && hasWarehouseFilter,
  )
  const productsQuery = useKardexProductOptions()
  const warehousesQuery = useKardexWarehouseOptions()

  const products = productsQuery.data?.items ?? []
  const warehouses = warehousesQuery.data?.items ?? []
  const activeQuery = hasProductFilter
    ? hasWarehouseFilter
      ? byProductWarehouseQuery
      : byProductQuery
    : hasWarehouseFilter
      ? byWarehouseQuery
      : generalQuery

  const entries: KardexEntry[] = useMemo(() => {
    if (hasProductFilter && hasWarehouseFilter) {
      return byProductWarehouseQuery.data ?? []
    }

    if (hasProductFilter) {
      return byProductQuery.data ?? []
    }

    if (hasWarehouseFilter) {
      return byWarehouseQuery.data ?? []
    }

    return generalQuery.data?.items ?? []
  }, [
    byProductQuery.data,
    byProductWarehouseQuery.data,
    byWarehouseQuery.data,
    generalQuery.data?.items,
    hasProductFilter,
    hasWarehouseFilter,
  ])

  const summary = useMemo(() => {
    const totalIn = entries.reduce((total, entry) => total + getQuantityIn(entry), 0)
    const totalOut = entries.reduce((total, entry) => total + getQuantityOut(entry), 0)
    const currentBalance = entries[0]?.stockAfter ?? 0
    const totalCost = entries.reduce((total, entry) => total + entry.quantity * entry.unitCost, 0)

    return {
      currentBalance,
      totalCost,
      totalIn,
      totalOut,
    }
  }, [entries])

  function clearFilters() {
    setProductId('')
    setWarehouseId('')
    setPageNumber(1)
  }

  function handleSearchChange(value: string) {
    setSearchInput(value)
    setPageNumber(1)
  }

  function handlePageSizeChange(value: string) {
    setPageSize(Number(value))
    setPageNumber(1)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        description="Historial operativo de movimientos, saldos y costos generado automaticamente."
        eyebrow="Operations history"
        title="Kardex"
      />

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="grid gap-3 xl:grid-cols-[1fr_1fr_1fr_auto] xl:items-end">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground" htmlFor="kardex-search">
                Busqueda general
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  className="h-10 w-full rounded-lg border border-border bg-white pl-10 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                  disabled={hasFilters}
                  id="kardex-search"
                  onChange={(event) => handleSearchChange(event.target.value)}
                  placeholder="Producto, almacen u observacion"
                  type="search"
                  value={searchInput}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground" htmlFor="kardex-product-filter">
                Producto
              </label>
              <select
                className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-blue-100"
                disabled={productsQuery.isLoading}
                id="kardex-product-filter"
                onChange={(event) => {
                  setProductId(event.target.value)
                  setPageNumber(1)
                }}
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
              <label className="text-sm font-semibold text-foreground" htmlFor="kardex-warehouse-filter">
                Almacen
              </label>
              <select
                className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-blue-100"
                disabled={warehousesQuery.isLoading}
                id="kardex-warehouse-filter"
                onChange={(event) => {
                  setWarehouseId(event.target.value)
                  setPageNumber(1)
                }}
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

          {hasFilters ? (
            <p className="mt-3 text-xs leading-5 text-muted">
              La busqueda general se aplica al listado paginado. Los filtros por producto/almacen consultan endpoints
              historicos especificos.
            </p>
          ) : null}

          <p className="border-t border-border pt-3 text-xs leading-5 text-muted">
            Kardex es una vista solo lectura. Los registros se generan desde los movimientos del backend.
          </p>
        </CardContent>
      </Card>

      {activeQuery.isLoading ? (
        <Card>
          <CardContent>
            <LoadingState text="Cargando Kardex..." />
          </CardContent>
        </Card>
      ) : activeQuery.isError ? (
        <KardexErrorState error={activeQuery.error} />
      ) : entries.length === 0 ? (
        <EmptyState
          description={
            hasFilters || search
              ? 'No se encontraron entradas Kardex para la consulta actual.'
              : 'Aun no hay entradas Kardex generadas por movimientos.'
          }
          icon={<ClipboardList className="h-6 w-6" />}
          title={hasFilters || search ? 'Sin resultados' : 'Sin Kardex registrado'}
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              description="Resultado mostrado"
              icon={<ArrowUpCircle className="h-4 w-4" />}
              title="Entradas"
              value={formatNumber(summary.totalIn)}
            />
            <SummaryCard
              description="Resultado mostrado"
              icon={<ArrowDownCircle className="h-4 w-4" />}
              title="Salidas"
              value={formatNumber(summary.totalOut)}
            />
            <SummaryCard
              description="Ultimo saldo del resultado"
              icon={<ClipboardList className="h-4 w-4" />}
              title="Saldo"
              value={formatNumber(summary.currentBalance)}
            />
            <SummaryCard
              description="Cantidad x costo unitario"
              icon={<ArrowLeftRight className="h-4 w-4" />}
              title="Costo movido"
              value={formatCurrency(summary.totalCost)}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Historial Kardex</CardTitle>
              <CardDescription>Vista historica solo lectura de movimientos y saldos.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <TableContainer>
                <table className="w-full min-w-[1180px] table-fixed divide-y divide-border">
                  <colgroup>
                    <col className="w-[13%]" />
                    <col className="w-[22%]" />
                    <col className="w-[15%]" />
                    <col className="w-[12%]" />
                    <col className="w-[8%]" />
                    <col className="w-[8%]" />
                    <col className="w-[8%]" />
                    <col className="w-[7%]" />
                    <col className="w-[7%]" />
                  </colgroup>
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Fecha</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Producto</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Almacen</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Tipo</th>
                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-muted">Entrada</th>
                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-muted">Salida</th>
                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-muted">Saldo</th>
                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-muted">Costo unit.</th>
                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-muted">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-white">
                    {entries.map((entry) => {
                      const Icon = getMovementIcon(entry.movementType)
                      const quantityIn = getQuantityIn(entry)
                      const quantityOut = getQuantityOut(entry)

                      return (
                        <tr className="transition-colors hover:bg-slate-50/80" key={entry.id}>
                          <td className="whitespace-nowrap px-5 py-4 text-sm text-muted">
                            {formatDateTime(entry.date)}
                          </td>
                          <td className="px-5 py-4">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-foreground">{entry.productName}</p>
                              <p className="mt-1 font-mono text-xs text-muted">{entry.productCode}</p>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm text-foreground">
                            <p className="truncate">{entry.warehouseName}</p>
                          </td>
                          <td className="w-20 px-5 py-4">
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4 text-muted" />
                              <Badge variant={movementBadgeVariants[entry.movementType]}>
                                {movementLabels[entry.movementType]}
                              </Badge>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-right text-sm font-semibold text-emerald-700">
                            {formatNumber(quantityIn)}
                          </td>
                          <td className="px-5 py-4 text-right text-sm font-semibold text-amber-700">
                            {formatNumber(quantityOut)}
                          </td>
                          <td className="px-5 py-4 text-right text-sm font-semibold text-foreground">
                            {formatNumber(entry.stockAfter)}
                          </td>
                          <td className="px-5 py-4 text-right text-sm text-muted">
                            {formatCurrency(entry.unitCost)}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex justify-end">
                              <Button
                                aria-label="Ver detalle"
                                className="h-9 w-9 p-0"
                                onClick={() => setSelectedEntry(entry)}
                                variant="secondary"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </TableContainer>

              {!hasFilters ? (
                <div className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted">
                    Pagina {generalQuery.data?.pageNumber ?? pageNumber} de {generalQuery.data?.totalPages ?? 1} ·{' '}
                    {formatNumber(generalQuery.data?.totalCount ?? 0)} registros
                  </p>
                  <div className="flex items-center gap-2">
                    <select
                      className="h-10 rounded-lg border border-border bg-white px-3 text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-blue-100"
                      onChange={(event) => handlePageSizeChange(event.target.value)}
                      value={pageSize}
                    >
                      {pageSizeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option} filas
                        </option>
                      ))}
                    </select>
                    <Button
                      disabled={!generalQuery.data?.hasPreviousPage}
                      onClick={() => setPageNumber((currentPage) => Math.max(1, currentPage - 1))}
                      variant="secondary"
                    >
                      Anterior
                    </Button>
                    <Button
                      disabled={!generalQuery.data?.hasNextPage}
                      onClick={() => setPageNumber((currentPage) => currentPage + 1)}
                      variant="secondary"
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-t border-border px-5 py-4">
                  <p className="text-sm text-muted">{formatNumber(entries.length)} registros en la consulta filtrada.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <KardexDetailsModal entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
    </div>
  )
}

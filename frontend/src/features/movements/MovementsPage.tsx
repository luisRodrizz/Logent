import { ArrowDownCircle, ArrowLeftRight, ArrowUpCircle, Eye, Plus, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
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
import type { CreateMovementRequest, Movement, MovementType } from '../../types/movement'
import { MovementDetailsModal } from './MovementDetailsModal'
import { MovementModal } from './MovementModal'
import {
  useCreateMovement,
  useMovementProductOptions,
  useMovements,
  useMovementStockAvailability,
  useMovementWarehouseOptions,
} from './movements.queries'

const movementLabels: Record<MovementType, string> = {
  Entry: 'Entrada',
  Exit: 'Salida',
  Transfer: 'Transferencia',
}

const movementBadgeVariants: Record<MovementType, 'default' | 'success' | 'warning' | 'danger' | 'muted'> = {
  Entry: 'success',
  Exit: 'warning',
  Transfer: 'default',
}

const pageSizeOptions = [10, 20, 50]

function getMovementIcon(type: MovementType) {
  if (type === 'Entry') {
    return ArrowUpCircle
  }

  if (type === 'Exit') {
    return ArrowDownCircle
  }

  return ArrowLeftRight
}

function MovementsErrorState({ error }: { error: unknown }) {
  return (
    <Card>
      <CardContent className="px-6 py-10">
        <SectionError text={getApiErrorMessage(error, 'No se pudo cargar el listado de movimientos.')} />
      </CardContent>
    </Card>
  )
}

export function MovementsPage() {
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedMovement, setSelectedMovement] = useState<Movement | null>(null)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearch(searchInput.trim())
    }, 350)

    return () => window.clearTimeout(timeoutId)
  }, [searchInput])

  const filters = useMemo(
    () => ({
      pageNumber,
      pageSize,
      search: search || undefined,
    }),
    [pageNumber, pageSize, search],
  )

  const movementsQuery = useMovements(filters)
  const productsQuery = useMovementProductOptions()
  const warehousesQuery = useMovementWarehouseOptions()
  const stockAvailabilityQuery = useMovementStockAvailability()
  const createMovementMutation = useCreateMovement()

  const movements = movementsQuery.data?.items ?? []
  const products = productsQuery.data?.items ?? []
  const warehouses = warehousesQuery.data?.items ?? []
  const stockItems = stockAvailabilityQuery.data ?? []
  const isLoadingOptions = productsQuery.isLoading || warehousesQuery.isLoading || stockAvailabilityQuery.isLoading
  const isSearching = Boolean(search)
  const visibleDetailsCount = movements.reduce((total, movement) => total + movement.details.length, 0)
  const visibleQuantity = movements.reduce(
    (total, movement) => total + movement.details.reduce((innerTotal, detail) => innerTotal + detail.quantity, 0),
    0,
  )

  async function handleCreateMovement(payload: CreateMovementRequest) {
    try {
      await createMovementMutation.mutateAsync(payload)
      toast.success('Movimiento registrado correctamente.')
      setIsCreateOpen(false)
      setPageNumber(1)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudo registrar el movimiento.'))
    }
  }

  function handleOpenCreate() {
    if (productsQuery.isError || warehousesQuery.isError) {
      toast.error('No se pudieron cargar productos o almacenes para crear el movimiento.')
      return
    }

    setIsCreateOpen(true)
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
        action={
          <Button onClick={handleOpenCreate}>
            <Plus className="h-4 w-4" />
            Nuevo movimiento
          </Button>
        }
        description="Registra y consulta entradas, salidas y transferencias que actualizan stock y Kardex."
        eyebrow="Operación"
        title="Movimientos"
      />

      <Card>
        <CardContent className="grid gap-4 p-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-slate-50 px-4 py-3">
              <p className="text-xs font-medium text-muted">Movimientos visibles</p>
              <p className="mt-2 text-lg font-semibold text-foreground">{formatNumber(movements.length)}</p>
            </div>
            <div className="rounded-lg border border-border bg-slate-50 px-4 py-3">
              <p className="text-xs font-medium text-muted">Detalles visibles</p>
              <p className="mt-2 text-lg font-semibold text-foreground">{formatNumber(visibleDetailsCount)}</p>
            </div>
            <div className="rounded-lg border border-border bg-slate-50 px-4 py-3">
              <p className="text-xs font-medium text-muted">Cantidad movida</p>
              <p className="mt-2 text-lg font-semibold text-foreground">{formatNumber(visibleQuantity)}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <div className="relative w-full sm:min-w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                className="h-10 w-full rounded-lg border border-border bg-white pl-10 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-blue-100"
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder="Buscar por observación o almacén"
                type="search"
                value={searchInput}
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-muted">
              Filas
              <select
                className="h-10 rounded-lg border border-border bg-white px-3 text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-blue-100"
                onChange={(event) => handlePageSizeChange(event.target.value)}
                value={pageSize}
              >
                {pageSizeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </CardContent>
      </Card>

      {movementsQuery.isLoading ? (
        <Card>
          <CardContent>
            <LoadingState text="Cargando movimientos..." />
          </CardContent>
        </Card>
      ) : movementsQuery.isError ? (
        <MovementsErrorState error={movementsQuery.error} />
      ) : movements.length === 0 ? (
        <EmptyState
          action={
            isSearching ? null : (
              <Button onClick={handleOpenCreate}>
                <Plus className="h-4 w-4" />
                Registrar primer movimiento
              </Button>
            )
          }
          description={
            isSearching
              ? 'No se encontraron movimientos que coincidan con la búsqueda actual.'
              : 'Registra entradas, salidas o transferencias para actualizar stock desde el backend.'
          }
          icon={<ArrowLeftRight className="h-6 w-6" />}
          title={isSearching ? 'Sin resultados' : 'Sin movimientos registrados'}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Operaciones de inventario</CardTitle>
            <CardDescription>Listado solo lectura de movimientos registrados.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <TableContainer>
              <table className="w-full min-w-[1080px] table-fixed divide-y divide-border">
                <colgroup>
                  <col className="w-[13%]" />
                  <col className="w-[17%]" />
                  <col className="w-[17%]" />
                  <col className="w-[13%]" />
                  <col className="w-[12%]" />
                  <col className="w-[20%]" />
                  <col className="w-[8%]" />
                </colgroup>
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Tipo</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Origen</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Destino</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Fecha</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-muted">Detalles</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Observación</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-muted">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-white">
                  {movements.map((movement) => {
                    const Icon = getMovementIcon(movement.type)
                    const totalQuantity = movement.details.reduce((total, detail) => total + detail.quantity, 0)

                    return (
                      <tr className="transition-colors hover:bg-slate-50/80" key={movement.id}>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-muted" />
                            <Badge variant={movementBadgeVariants[movement.type]}>{movementLabels[movement.type]}</Badge>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-muted">
                          <p className="truncate">{movement.warehouseOriginName || 'No aplica'}</p>
                        </td>
                        <td className="px-5 py-4 text-sm text-muted">
                          <p className="truncate">{movement.warehouseDestinationName || 'No aplica'}</p>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-sm text-muted">
                          {formatDateTime(movement.date)}
                        </td>
                        <td className="px-5 py-4 text-right text-sm font-semibold text-foreground">
                          {formatNumber(movement.details.length)} items · {formatNumber(totalQuantity)}
                        </td>
                        <td className="max-w-sm px-5 py-4">
                          <p className="line-clamp-2 text-sm leading-6 text-muted">
                            {movement.observation || 'Sin observación'}
                          </p>
                        </td>
                        <td className="w-20 px-5 py-4">
                          <div className="flex justify-end">
                            <Button
                              aria-label="Ver detalle"
                              className="h-9 w-9 p-0"
                              onClick={() => setSelectedMovement(movement)}
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

            <div className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted">
                Página {movementsQuery.data?.pageNumber ?? pageNumber} de {movementsQuery.data?.totalPages ?? 1} ·{' '}
                {formatNumber(movementsQuery.data?.totalCount ?? 0)} registros
              </p>
              <div className="flex items-center gap-2">
                <Button
                  disabled={!movementsQuery.data?.hasPreviousPage}
                  onClick={() => setPageNumber((currentPage) => Math.max(1, currentPage - 1))}
                  variant="secondary"
                >
                  Anterior
                </Button>
                <Button
                  disabled={!movementsQuery.data?.hasNextPage}
                  onClick={() => setPageNumber((currentPage) => currentPage + 1)}
                  variant="secondary"
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <MovementModal
        isLoadingOptions={isLoadingOptions}
        isOpen={isCreateOpen}
        isSubmitting={createMovementMutation.isPending}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateMovement}
        products={products}
        stockItems={stockItems}
        warehouses={warehouses}
      />

      <MovementDetailsModal movement={selectedMovement} onClose={() => setSelectedMovement(null)} />
    </div>
  )
}

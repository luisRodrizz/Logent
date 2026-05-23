import { ArrowDownCircle, ArrowLeftRight, ArrowUpCircle, Eye, Plus, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { EmptyState } from '../../components/common/EmptyState'
import { LoadingState } from '../../components/common/LoadingState'
import { PageHeader } from '../../components/common/PageHeader'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { getApiErrorMessage } from '../../lib/api-error'
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

const dateFormatter = new Intl.DateTimeFormat('es-PE', {
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  month: 'short',
  year: 'numeric',
})

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
        <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {getApiErrorMessage(error, 'No se pudo cargar el listado de movimientos.')}
        </div>
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
        description="Registra y consulta entradas, salidas y transferencias de inventario."
        title="Movimientos"
      />

      <Card>
        <CardHeader>
          <CardTitle>Operaciones de inventario</CardTitle>
          <CardDescription>Los movimientos actualizan stock y generan Kardex desde el backend.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                className="h-10 w-full rounded-lg border border-border bg-white pl-10 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-blue-100"
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder="Buscar por observacion o almacen"
                type="search"
                value={searchInput}
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted">Filas</span>
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
            </div>
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
              ? 'No se encontraron movimientos que coincidan con la busqueda actual.'
              : 'Registra entradas, salidas o transferencias para actualizar stock desde el backend.'
          }
          icon={<ArrowLeftRight className="h-6 w-6" />}
          title={isSearching ? 'Sin resultados' : 'Sin movimientos registrados'}
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Tipo</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Origen</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Destino</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Fecha</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-muted">Detalles</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Observacion</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-muted">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-white">
                  {movements.map((movement) => {
                    const Icon = getMovementIcon(movement.type)
                    const totalQuantity = movement.details.reduce((total, detail) => total + detail.quantity, 0)

                    return (
                      <tr className="transition-colors hover:bg-slate-50" key={movement.id}>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-muted" />
                            <Badge variant={movementBadgeVariants[movement.type]}>{movementLabels[movement.type]}</Badge>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-muted">{movement.warehouseOriginName || 'No aplica'}</td>
                        <td className="px-5 py-4 text-sm text-muted">
                          {movement.warehouseDestinationName || 'No aplica'}
                        </td>
                        <td className="px-5 py-4 text-sm text-muted">
                          {dateFormatter.format(new Date(movement.date))}
                        </td>
                        <td className="px-5 py-4 text-right text-sm font-semibold text-foreground">
                          {movement.details.length} items · {totalQuantity}
                        </td>
                        <td className="max-w-sm px-5 py-4">
                          <p className="line-clamp-2 text-sm leading-6 text-muted">
                            {movement.observation || 'Sin observacion'}
                          </p>
                        </td>
                        <td className="px-5 py-4">
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
            </div>

            <div className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted">
                Pagina {movementsQuery.data?.pageNumber ?? pageNumber} de {movementsQuery.data?.totalPages ?? 1} ·{' '}
                {movementsQuery.data?.totalCount ?? 0} registros
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

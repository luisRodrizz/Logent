import { Edit3, Plus, Search, Trash2, Warehouse } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { EmptyState } from '../../components/common/EmptyState'
import { LoadingState } from '../../components/common/LoadingState'
import { PageHeader } from '../../components/common/PageHeader'
import { SectionError } from '../../components/common/SectionError'
import { TableContainer } from '../../components/common/TableContainer'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { getApiErrorMessage } from '../../lib/api-error'
import { formatDate, formatNumber } from '../../lib/format'
import type { CreateWarehouseRequest, Warehouse as WarehouseType } from '../../types/warehouse'
import { PlanLimitInlineNotice } from '../plan/PlanLimitInlineNotice'
import { usePlanResourceLimit } from '../plan/plan-limit.helpers'
import { WarehouseModal } from './WarehouseModal'
import { useCreateWarehouse, useDeleteWarehouse, useUpdateWarehouse, useWarehouses } from './warehouses.queries'

const pageSizeOptions = [10, 20, 50]

type ModalState =
  | {
      mode: 'create' | 'edit'
      warehouse?: WarehouseType
    }
  | null

function WarehousesErrorState() {
  return (
    <Card>
      <CardContent className="px-6 py-10">
        <SectionError text="No se pudo cargar la gestion de almacenes." />
      </CardContent>
    </Card>
  )
}

export function WarehousesPage() {
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [modalState, setModalState] = useState<ModalState>(null)
  const [warehouseToDelete, setWarehouseToDelete] = useState<WarehouseType | null>(null)

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

  const warehousesQuery = useWarehouses(filters)
  const createWarehouseMutation = useCreateWarehouse()
  const updateWarehouseMutation = useUpdateWarehouse()
  const deleteWarehouseMutation = useDeleteWarehouse()
  const warehouseLimit = usePlanResourceLimit('warehouses')

  const warehouses = warehousesQuery.data?.items ?? []
  const isWarehouseCreationBlocked = warehouseLimit.status?.isAtLimit ?? false
  const isFormSubmitting = createWarehouseMutation.isPending || updateWarehouseMutation.isPending
  const isSearching = Boolean(search)
  const visibleActiveWarehouses = warehouses.filter((warehouse) => warehouse.isActive).length

  async function handleSubmitWarehouse(payload: CreateWarehouseRequest) {
    try {
      if (modalState?.mode === 'edit' && modalState.warehouse) {
        await updateWarehouseMutation.mutateAsync({ id: modalState.warehouse.id, payload })
        toast.success('Almacen actualizado correctamente.')
      } else {
        await createWarehouseMutation.mutateAsync(payload)
        toast.success('Almacen creado correctamente.')
        setPageNumber(1)
      }

      setModalState(null)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  async function handleDeleteWarehouse() {
    if (!warehouseToDelete) {
      return
    }

    try {
      await deleteWarehouseMutation.mutateAsync(warehouseToDelete.id)
      toast.success('Almacen eliminado correctamente.')

      if (warehouses.length === 1 && pageNumber > 1) {
        setPageNumber((currentPage) => currentPage - 1)
      }

      setWarehouseToDelete(null)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  function handleSearchChange(value: string) {
    setSearchInput(value)
    setPageNumber(1)
  }

  function handleOpenCreateModal() {
    if (isWarehouseCreationBlocked) {
      toast.error('Has alcanzado el límite de tu plan.')
      return
    }

    setModalState({ mode: 'create' })
  }

  function handlePageSizeChange(value: string) {
    setPageSize(Number(value))
    setPageNumber(1)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        action={
          <Button
            disabled={isWarehouseCreationBlocked}
            onClick={handleOpenCreateModal}
            title={isWarehouseCreationBlocked ? 'Has alcanzado el límite de tu plan.' : undefined}
          >
            <Plus className="h-4 w-4" />
            Nuevo almacen
          </Button>
        }
        description="Ubicaciones operativas para control de existencias y movimientos."
        eyebrow="Datos maestros"
        title="Almacenes"
      />

      <PlanLimitInlineNotice resource="warehouses" />

      <Card>
        <CardContent className="grid gap-4 p-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-slate-50 px-4 py-3">
              <p className="text-xs font-medium text-muted">Total almacenes</p>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {formatNumber(warehousesQuery.data?.totalCount ?? warehouses.length)}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-slate-50 px-4 py-3">
              <p className="text-xs font-medium text-muted">Activos en vista</p>
              <p className="mt-2 text-lg font-semibold text-foreground">{formatNumber(visibleActiveWarehouses)}</p>
            </div>
            <div className="rounded-lg border border-border bg-slate-50 px-4 py-3">
              <p className="text-xs font-medium text-muted">Pagina actual</p>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {formatNumber(warehousesQuery.data?.pageNumber ?? pageNumber)}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <div className="relative w-full sm:min-w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                className="h-10 w-full rounded-lg border border-border bg-white pl-10 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-blue-100"
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder="Buscar por nombre, ubicacion o descripcion"
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

      {warehousesQuery.isLoading ? (
        <Card>
          <CardContent>
            <LoadingState text="Cargando almacenes..." />
          </CardContent>
        </Card>
      ) : warehousesQuery.isError ? (
        <WarehousesErrorState />
      ) : warehouses.length === 0 ? (
        <EmptyState
          action={
            isSearching ? null : (
              <Button
                disabled={isWarehouseCreationBlocked}
                onClick={handleOpenCreateModal}
                title={isWarehouseCreationBlocked ? 'Has alcanzado el límite de tu plan.' : undefined}
              >
                <Plus className="h-4 w-4" />
                Crear primer almacen
              </Button>
            )
          }
          description={
            isSearching
              ? 'No se encontraron almacenes que coincidan con la busqueda actual.'
              : 'Registra almacenes para organizar las ubicaciones operativas del inventario.'
          }
          icon={<Warehouse className="h-6 w-6" />}
          title={isSearching ? 'Sin resultados' : 'Sin almacenes registrados'}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Gestion de almacenes</CardTitle>
            <CardDescription>Ubicaciones listas para consulta y mantenimiento administrativo.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <TableContainer>
              <table className="w-full min-w-[960px] table-fixed divide-y divide-border">
                <colgroup>
                  <col className="w-[24%]" />
                  <col className="w-[18%]" />
                  <col className="w-[28%]" />
                  <col className="w-[10%]" />
                  <col className="w-[10%]" />
                  <col className="w-[10%]" />
                </colgroup>
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Almacen</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Ubicacion</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Descripcion</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Estado</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Creación</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-muted">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-white">
                  {warehouses.map((warehouse) => (
                    <tr className="transition-colors hover:bg-slate-50/80" key={warehouse.id}>
                      <td className="px-5 py-4">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">{warehouse.name}</p>
                          <p className="mt-1 font-mono text-xs text-muted">ID {warehouse.id.slice(0, 8)}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-foreground">
                        <p className="truncate">{warehouse.location || 'Sin ubicacion'}</p>
                      </td>
                      <td className="max-w-md px-5 py-4">
                        <p className="line-clamp-2 text-sm leading-6 text-muted">
                          {warehouse.description || 'Sin descripcion'}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant={warehouse.isActive ? 'success' : 'muted'}>
                          {warehouse.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-muted">
                        {formatDate(warehouse.createdAt)}
                      </td>
                      <td className="w-24 px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            aria-label={`Editar ${warehouse.name}`}
                            className="h-9 w-9 p-0"
                            onClick={() => setModalState({ mode: 'edit', warehouse })}
                            variant="secondary"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            aria-label={`Eliminar ${warehouse.name}`}
                            className="h-9 w-9 p-0"
                            onClick={() => setWarehouseToDelete(warehouse)}
                            variant="ghost"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableContainer>

            <div className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted">
                Pagina {warehousesQuery.data?.pageNumber ?? pageNumber} de {warehousesQuery.data?.totalPages ?? 1} ·{' '}
                {formatNumber(warehousesQuery.data?.totalCount ?? 0)} registros
              </p>
              <div className="flex items-center gap-2">
                <Button
                  disabled={!warehousesQuery.data?.hasPreviousPage}
                  onClick={() => setPageNumber((currentPage) => Math.max(1, currentPage - 1))}
                  variant="secondary"
                >
                  Anterior
                </Button>
                <Button
                  disabled={!warehousesQuery.data?.hasNextPage}
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

      <WarehouseModal
        isOpen={Boolean(modalState)}
        isSubmitting={isFormSubmitting}
        mode={modalState?.mode ?? 'create'}
        onClose={() => setModalState(null)}
        onSubmit={handleSubmitWarehouse}
        warehouse={modalState?.warehouse}
      />

      <ConfirmDialog
        description={
          warehouseToDelete
            ? `Se desactivara "${warehouseToDelete.name}" y dejara de aparecer en el catalogo activo.`
            : 'Se desactivara este almacen.'
        }
        isConfirming={deleteWarehouseMutation.isPending}
        isOpen={Boolean(warehouseToDelete)}
        onCancel={() => setWarehouseToDelete(null)}
        onConfirm={handleDeleteWarehouse}
        title="Eliminar almacen"
      />
    </div>
  )
}

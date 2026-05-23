import { Building2, Edit3, Mail, Phone, Plus, Search, Trash2, Truck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { EmptyState } from '../../components/common/EmptyState'
import { LoadingState } from '../../components/common/LoadingState'
import { PageHeader } from '../../components/common/PageHeader'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { getApiErrorMessage } from '../../lib/api-error'
import type { CreateSupplierRequest, Supplier } from '../../types/supplier'
import { SupplierModal } from './SupplierModal'
import { useCreateSupplier, useDeleteSupplier, useSuppliers, useUpdateSupplier } from './suppliers.queries'

const dateFormatter = new Intl.DateTimeFormat('es-PE', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const pageSizeOptions = [10, 20, 50]

type ModalState =
  | {
      mode: 'create' | 'edit'
      supplier?: Supplier
    }
  | null

function formatDate(value?: string | null): string {
  if (!value) {
    return 'Sin fecha'
  }

  return dateFormatter.format(new Date(value))
}

function SuppliersErrorState() {
  return (
    <Card>
      <CardContent className="px-6 py-10">
        <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          No se pudo cargar el directorio de proveedores.
        </div>
      </CardContent>
    </Card>
  )
}

export function SuppliersPage() {
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [modalState, setModalState] = useState<ModalState>(null)
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null)

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

  const suppliersQuery = useSuppliers(filters)
  const createSupplierMutation = useCreateSupplier()
  const updateSupplierMutation = useUpdateSupplier()
  const deleteSupplierMutation = useDeleteSupplier()

  const suppliers = suppliersQuery.data?.items ?? []
  const isFormSubmitting = createSupplierMutation.isPending || updateSupplierMutation.isPending
  const isSearching = Boolean(search)

  async function handleSubmitSupplier(payload: CreateSupplierRequest) {
    try {
      if (modalState?.mode === 'edit' && modalState.supplier) {
        await updateSupplierMutation.mutateAsync({ id: modalState.supplier.id, payload })
        toast.success('Proveedor actualizado correctamente.')
      } else {
        await createSupplierMutation.mutateAsync(payload)
        toast.success('Proveedor creado correctamente.')
        setPageNumber(1)
      }

      setModalState(null)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  async function handleDeleteSupplier() {
    if (!supplierToDelete) {
      return
    }

    try {
      await deleteSupplierMutation.mutateAsync(supplierToDelete.id)
      toast.success('Proveedor eliminado correctamente.')

      if (suppliers.length === 1 && pageNumber > 1) {
        setPageNumber((currentPage) => currentPage - 1)
      }

      setSupplierToDelete(null)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
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
          <Button onClick={() => setModalState({ mode: 'create' })}>
            <Plus className="h-4 w-4" />
            Nuevo proveedor
          </Button>
        }
        description="Gestiona los proveedores asociados al inventario."
        title="Proveedores"
      />

      <Card>
        <CardHeader>
          <CardTitle>Directorio de proveedores</CardTitle>
          <CardDescription>Listado administrativo con busqueda, paginacion y mantenimiento basico.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                className="h-10 w-full rounded-lg border border-border bg-white pl-10 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-blue-100"
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder="Buscar por razon social, RUC, email o telefono"
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

      {suppliersQuery.isLoading ? (
        <Card>
          <CardContent>
            <LoadingState text="Cargando proveedores..." />
          </CardContent>
        </Card>
      ) : suppliersQuery.isError ? (
        <SuppliersErrorState />
      ) : suppliers.length === 0 ? (
        <EmptyState
          action={
            isSearching ? null : (
              <Button onClick={() => setModalState({ mode: 'create' })}>
                <Plus className="h-4 w-4" />
                Crear primer proveedor
              </Button>
            )
          }
          description={
            isSearching
              ? 'No se encontraron proveedores que coincidan con la busqueda actual.'
              : 'Registra proveedores para mantener organizado el abastecimiento del inventario.'
          }
          icon={<Truck className="h-6 w-6" />}
          title={isSearching ? 'Sin resultados' : 'Sin proveedores registrados'}
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Proveedor</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Contacto</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Direccion</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Estado</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Creacion</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-muted">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-white">
                  {suppliers.map((supplier) => (
                    <tr className="transition-colors hover:bg-slate-50" key={supplier.id}>
                      <td className="px-5 py-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-primary">
                            <Building2 className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground">{supplier.businessName}</p>
                            <p className="mt-1 text-xs text-muted">{supplier.ruc ? `RUC ${supplier.ruc}` : 'Sin RUC'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <p className="flex items-center gap-2 text-sm text-foreground">
                            <Mail className="h-3.5 w-3.5 text-muted" />
                            {supplier.email || 'Sin email'}
                          </p>
                          <p className="flex items-center gap-2 text-sm text-muted">
                            <Phone className="h-3.5 w-3.5 text-muted" />
                            {supplier.phone || 'Sin telefono'}
                          </p>
                        </div>
                      </td>
                      <td className="max-w-sm px-5 py-4">
                        <p className="line-clamp-2 text-sm leading-6 text-muted">
                          {supplier.address || 'Sin direccion'}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant={supplier.isActive ? 'success' : 'muted'}>
                          {supplier.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-sm text-muted">{formatDate(supplier.createdAt)}</td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            aria-label={`Editar ${supplier.businessName}`}
                            className="h-9 w-9 p-0"
                            onClick={() => setModalState({ mode: 'edit', supplier })}
                            variant="secondary"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            aria-label={`Eliminar ${supplier.businessName}`}
                            className="h-9 w-9 p-0"
                            onClick={() => setSupplierToDelete(supplier)}
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
            </div>

            <div className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted">
                Pagina {suppliersQuery.data?.pageNumber ?? pageNumber} de {suppliersQuery.data?.totalPages ?? 1} ·{' '}
                {suppliersQuery.data?.totalCount ?? 0} registros
              </p>
              <div className="flex items-center gap-2">
                <Button
                  disabled={!suppliersQuery.data?.hasPreviousPage}
                  onClick={() => setPageNumber((currentPage) => Math.max(1, currentPage - 1))}
                  variant="secondary"
                >
                  Anterior
                </Button>
                <Button
                  disabled={!suppliersQuery.data?.hasNextPage}
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

      <SupplierModal
        isOpen={Boolean(modalState)}
        isSubmitting={isFormSubmitting}
        mode={modalState?.mode ?? 'create'}
        onClose={() => setModalState(null)}
        onSubmit={handleSubmitSupplier}
        supplier={modalState?.supplier}
      />

      <ConfirmDialog
        description={
          supplierToDelete
            ? `Se desactivara "${supplierToDelete.businessName}" y dejara de aparecer en el directorio activo.`
            : 'Se desactivara este proveedor.'
        }
        isConfirming={deleteSupplierMutation.isPending}
        isOpen={Boolean(supplierToDelete)}
        onCancel={() => setSupplierToDelete(null)}
        onConfirm={handleDeleteSupplier}
        title="Eliminar proveedor"
      />
    </div>
  )
}

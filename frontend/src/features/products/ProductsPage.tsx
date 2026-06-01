import { Edit3, Package, Plus, Search, Trash2 } from 'lucide-react'
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
import { formatCurrency, formatDate, formatNumber } from '../../lib/format'
import type { CreateProductRequest, Product } from '../../types/product'
import { PlanLimitInlineNotice } from '../plan/PlanLimitInlineNotice'
import { usePlanResourceLimit } from '../plan/plan-limit.helpers'
import { ProductModal } from './ProductModal'
import {
  useCreateProduct,
  useDeleteProduct,
  useProductCategoryOptions,
  useProducts,
  useProductSupplierOptions,
  useUpdateProduct,
} from './products.queries'

const pageSizeOptions = [10, 20, 50]

type ModalState =
  | {
      mode: 'create' | 'edit'
      product?: Product
    }
  | null

function ProductsErrorState() {
  return (
    <Card>
      <CardContent className="px-6 py-10">
        <SectionError text="No se pudo cargar el catalogo de productos." />
      </CardContent>
    </Card>
  )
}

export function ProductsPage() {
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [modalState, setModalState] = useState<ModalState>(null)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)

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

  const productsQuery = useProducts(filters)
  const categoriesQuery = useProductCategoryOptions()
  const suppliersQuery = useProductSupplierOptions()
  const createProductMutation = useCreateProduct()
  const updateProductMutation = useUpdateProduct()
  const deleteProductMutation = useDeleteProduct()
  const productLimit = usePlanResourceLimit('products')

  const products = productsQuery.data?.items ?? []
  const categories = categoriesQuery.data?.items ?? []
  const suppliers = suppliersQuery.data?.items ?? []
  const isProductCreationBlocked = productLimit.status?.isAtLimit ?? false
  const isFormSubmitting = createProductMutation.isPending || updateProductMutation.isPending
  const isLoadingOptions = categoriesQuery.isLoading || suppliersQuery.isLoading
  const isSearching = Boolean(search)
  const visibleActiveProducts = products.filter((product) => product.isActive).length

  async function handleSubmitProduct(payload: CreateProductRequest) {
    try {
      if (modalState?.mode === 'edit' && modalState.product) {
        await updateProductMutation.mutateAsync({ id: modalState.product.id, payload })
        toast.success('Producto actualizado correctamente.')
      } else {
        await createProductMutation.mutateAsync(payload)
        toast.success('Producto creado correctamente.')
        setPageNumber(1)
      }

      setModalState(null)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  async function handleDeleteProduct() {
    if (!productToDelete) {
      return
    }

    try {
      await deleteProductMutation.mutateAsync(productToDelete.id)
      toast.success('Producto eliminado correctamente.')

      if (products.length === 1 && pageNumber > 1) {
        setPageNumber((currentPage) => currentPage - 1)
      }

      setProductToDelete(null)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  function handleOpenCreateModal() {
    if (isProductCreationBlocked) {
      toast.error('Has alcanzado el límite de tu plan.')
      return
    }

    if (categoriesQuery.isError || suppliersQuery.isError) {
      toast.error('No se pudieron cargar las categorias o proveedores para el formulario.')
      return
    }

    setModalState({ mode: 'create' })
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
          <Button
            disabled={isProductCreationBlocked}
            onClick={handleOpenCreateModal}
            title={isProductCreationBlocked ? 'Has alcanzado el límite de tu plan.' : undefined}
          >
            <Plus className="h-4 w-4" />
            Nuevo producto
          </Button>
        }
        description="Catalogo maestro para productos, precios, proveedores y niveles minimos de stock."
        eyebrow="Datos maestros"
        title="Productos"
      />

      <PlanLimitInlineNotice resource="products" />

      <Card>
        <CardContent className="grid gap-4 p-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-slate-50 px-4 py-3">
              <p className="text-xs font-medium text-muted">Total catalogo</p>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {formatNumber(productsQuery.data?.totalCount ?? products.length)}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-slate-50 px-4 py-3">
              <p className="text-xs font-medium text-muted">Activos en vista</p>
              <p className="mt-2 text-lg font-semibold text-foreground">{formatNumber(visibleActiveProducts)}</p>
            </div>
            <div className="rounded-lg border border-border bg-slate-50 px-4 py-3">
              <p className="text-xs font-medium text-muted">Pagina actual</p>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {formatNumber(productsQuery.data?.pageNumber ?? pageNumber)}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <div className="relative w-full sm:min-w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                className="h-10 w-full rounded-lg border border-border bg-white pl-10 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-blue-100"
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder="Buscar producto, codigo o proveedor"
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

      {productsQuery.isLoading ? (
        <Card>
          <CardContent>
            <LoadingState text="Cargando productos..." />
          </CardContent>
        </Card>
      ) : productsQuery.isError ? (
        <ProductsErrorState />
      ) : products.length === 0 ? (
        <EmptyState
          action={
            isSearching ? null : (
              <Button
                disabled={isProductCreationBlocked}
                onClick={handleOpenCreateModal}
                title={isProductCreationBlocked ? 'Has alcanzado el límite de tu plan.' : undefined}
              >
                <Plus className="h-4 w-4" />
                Crear primer producto
              </Button>
            )
          }
          description={
            isSearching
              ? 'No se encontraron productos que coincidan con la busqueda actual.'
              : 'Registra productos para construir el catalogo maestro del inventario.'
          }
          icon={<Package className="h-6 w-6" />}
          title={isSearching ? 'Sin resultados' : 'Sin productos registrados'}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Catalogo maestro</CardTitle>
            <CardDescription>Productos listos para consulta y mantenimiento administrativo.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <TableContainer>
              <table className="w-full min-w-[1080px] table-fixed divide-y divide-border">
                <colgroup>
                  <col className="w-[23%]" />
                  <col className="w-[13%]" />
                  <col className="w-[13%]" />
                  <col className="w-[9%]" />
                  <col className="w-[9%]" />
                  <col className="w-[8%]" />
                  <col className="w-[9%]" />
                  <col className="w-[7%]" />
                  <col className="w-[9%]" />
                </colgroup>
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Producto</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Categoria</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Proveedor</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-muted">Compra</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-muted">Venta</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-muted">Stock min.</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Estado</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Creación</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-muted">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-white">
                  {products.map((product) => (
                    <tr className="transition-colors hover:bg-slate-50/80" key={product.id}>
                      <td className="px-5 py-4">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">{product.name}</p>
                          <p className="mt-1 font-mono text-xs text-muted">{product.code}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-foreground">
                        <p className="truncate">{product.categoryName || 'Sin categoria'}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-muted">
                        <p className="truncate">{product.supplierName || 'Sin proveedor'}</p>
                      </td>
                      <td className="px-5 py-4 text-right text-sm font-medium text-muted">
                        {formatCurrency(product.purchasePrice)}
                      </td>
                      <td className="px-5 py-4 text-right text-sm font-semibold text-foreground">
                        {formatCurrency(product.salePrice)}
                      </td>
                      <td className="px-5 py-4 text-right text-sm font-semibold text-foreground">
                        {formatNumber(product.minimumStock)}
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant={product.isActive ? 'success' : 'muted'}>
                          {product.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-muted">{formatDate(product.createdAt)}</td>
                      <td className="w-24 px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            aria-label={`Editar ${product.name}`}
                            className="h-9 w-9 p-0"
                            onClick={() => setModalState({ mode: 'edit', product })}
                            variant="secondary"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            aria-label={`Eliminar ${product.name}`}
                            className="h-9 w-9 p-0"
                            onClick={() => setProductToDelete(product)}
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
                Pagina {productsQuery.data?.pageNumber ?? pageNumber} de {productsQuery.data?.totalPages ?? 1} ·{' '}
                {formatNumber(productsQuery.data?.totalCount ?? 0)} registros
              </p>
              <div className="flex items-center gap-2">
                <Button
                  disabled={!productsQuery.data?.hasPreviousPage}
                  onClick={() => setPageNumber((currentPage) => Math.max(1, currentPage - 1))}
                  variant="secondary"
                >
                  Anterior
                </Button>
                <Button
                  disabled={!productsQuery.data?.hasNextPage}
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

      <ProductModal
        categories={categories}
        isLoadingOptions={isLoadingOptions}
        isOpen={Boolean(modalState)}
        isSubmitting={isFormSubmitting}
        mode={modalState?.mode ?? 'create'}
        onClose={() => setModalState(null)}
        onSubmit={handleSubmitProduct}
        product={modalState?.product}
        suppliers={suppliers}
      />

      <ConfirmDialog
        description={
          productToDelete
            ? `Se desactivara "${productToDelete.code} - ${productToDelete.name}" y dejara de aparecer en el catalogo activo.`
            : 'Se desactivara este producto.'
        }
        isConfirming={deleteProductMutation.isPending}
        isOpen={Boolean(productToDelete)}
        onCancel={() => setProductToDelete(null)}
        onConfirm={handleDeleteProduct}
        title="Eliminar producto"
      />
    </div>
  )
}

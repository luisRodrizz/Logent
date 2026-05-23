import { Edit3, Plus, Search, Tags, Trash2 } from 'lucide-react'
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
import type { Category, CreateCategoryRequest } from '../../types/category'
import { CategoryModal } from './CategoryModal'
import { useCategories, useCreateCategory, useDeleteCategory, useUpdateCategory } from './categories.queries'

const dateFormatter = new Intl.DateTimeFormat('es-PE', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const pageSizeOptions = [10, 20, 50]

type ModalState =
  | {
      category?: Category
      mode: 'create' | 'edit'
    }
  | null

function formatDate(value?: string | null): string {
  if (!value) {
    return 'Sin fecha'
  }

  return dateFormatter.format(new Date(value))
}

function CategoriesErrorState() {
  return (
    <Card>
      <CardContent className="px-6 py-10">
        <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          No se pudo cargar el catalogo de categorias.
        </div>
      </CardContent>
    </Card>
  )
}

export function CategoriesPage() {
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [modalState, setModalState] = useState<ModalState>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)

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

  const categoriesQuery = useCategories(filters)
  const createCategoryMutation = useCreateCategory()
  const updateCategoryMutation = useUpdateCategory()
  const deleteCategoryMutation = useDeleteCategory()

  const categories = categoriesQuery.data?.items ?? []
  const isFormSubmitting = createCategoryMutation.isPending || updateCategoryMutation.isPending
  const isSearching = Boolean(search)

  async function handleSubmitCategory(payload: CreateCategoryRequest) {
    try {
      if (modalState?.mode === 'edit' && modalState.category) {
        await updateCategoryMutation.mutateAsync({ id: modalState.category.id, payload })
        toast.success('Categoria actualizada correctamente.')
      } else {
        await createCategoryMutation.mutateAsync(payload)
        toast.success('Categoria creada correctamente.')
        setPageNumber(1)
      }

      setModalState(null)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  async function handleDeleteCategory() {
    if (!categoryToDelete) {
      return
    }

    try {
      await deleteCategoryMutation.mutateAsync(categoryToDelete.id)
      toast.success('Categoria eliminada correctamente.')

      if (categories.length === 1 && pageNumber > 1) {
        setPageNumber((currentPage) => currentPage - 1)
      }

      setCategoryToDelete(null)
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
            Nueva categoria
          </Button>
        }
        description="Gestiona las categorias usadas para organizar productos."
        title="Categorias"
      />

      <Card>
        <CardHeader>
          <CardTitle>Catalogo de categorias</CardTitle>
          <CardDescription>Listado administrativo con busqueda, paginacion y mantenimiento basico.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                className="h-10 w-full rounded-lg border border-border bg-white pl-10 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-blue-100"
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder="Buscar por nombre o descripcion"
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

      {categoriesQuery.isLoading ? (
        <Card>
          <CardContent>
            <LoadingState text="Cargando categorias..." />
          </CardContent>
        </Card>
      ) : categoriesQuery.isError ? (
        <CategoriesErrorState />
      ) : categories.length === 0 ? (
        <EmptyState
          action={
            isSearching ? null : (
              <Button onClick={() => setModalState({ mode: 'create' })}>
                <Plus className="h-4 w-4" />
                Crear primera categoria
              </Button>
            )
          }
          description={
            isSearching
              ? 'No se encontraron categorias que coincidan con la busqueda actual.'
              : 'Crea categorias para clasificar productos dentro del inventario.'
          }
          icon={<Tags className="h-6 w-6" />}
          title={isSearching ? 'Sin resultados' : 'Sin categorias registradas'}
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Nombre</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Descripcion</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Estado</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Creacion</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-muted">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-white">
                  {categories.map((category) => (
                    <tr className="transition-colors hover:bg-slate-50" key={category.id}>
                      <td className="px-5 py-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-primary">
                            <Tags className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground">{category.name}</p>
                            <p className="mt-1 text-xs text-muted">ID {category.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="max-w-md px-5 py-4">
                        <p className="line-clamp-2 text-sm leading-6 text-muted">
                          {category.description || 'Sin descripcion'}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant={category.isActive ? 'success' : 'muted'}>
                          {category.isActive ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-sm text-muted">{formatDate(category.createdAt)}</td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            aria-label={`Editar ${category.name}`}
                            className="h-9 w-9 p-0"
                            onClick={() => setModalState({ category, mode: 'edit' })}
                            variant="secondary"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            aria-label={`Eliminar ${category.name}`}
                            className="h-9 w-9 p-0"
                            onClick={() => setCategoryToDelete(category)}
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
                Pagina {categoriesQuery.data?.pageNumber ?? pageNumber} de {categoriesQuery.data?.totalPages ?? 1} ·{' '}
                {categoriesQuery.data?.totalCount ?? 0} registros
              </p>
              <div className="flex items-center gap-2">
                <Button
                  disabled={!categoriesQuery.data?.hasPreviousPage}
                  onClick={() => setPageNumber((currentPage) => Math.max(1, currentPage - 1))}
                  variant="secondary"
                >
                  Anterior
                </Button>
                <Button
                  disabled={!categoriesQuery.data?.hasNextPage}
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

      <CategoryModal
        category={modalState?.category}
        isOpen={Boolean(modalState)}
        isSubmitting={isFormSubmitting}
        mode={modalState?.mode ?? 'create'}
        onClose={() => setModalState(null)}
        onSubmit={handleSubmitCategory}
      />

      <ConfirmDialog
        description={
          categoryToDelete
            ? `Se desactivara "${categoryToDelete.name}" y dejara de aparecer en el catalogo activo.`
            : 'Se desactivara esta categoria.'
        }
        isConfirming={deleteCategoryMutation.isPending}
        isOpen={Boolean(categoryToDelete)}
        onCancel={() => setCategoryToDelete(null)}
        onConfirm={handleDeleteCategory}
        title="Eliminar categoria"
      />
    </div>
  )
}

import { X } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import type { Category, CreateCategoryRequest } from '../../types/category'
import { CategoryForm } from './CategoryForm'

type CategoryModalProps = {
  category?: Category | null
  isOpen: boolean
  isSubmitting?: boolean
  mode: 'create' | 'edit'
  onClose: () => void
  onSubmit: (payload: CreateCategoryRequest) => Promise<void> | void
}

export function CategoryModal({ category, isOpen, isSubmitting = false, mode, onClose, onSubmit }: CategoryModalProps) {
  if (!isOpen) {
    return null
  }

  const title = mode === 'create' ? 'Nueva categoria' : 'Editar categoria'
  const description =
    mode === 'create'
      ? 'Registra una categoria para organizar el catalogo de productos.'
      : 'Actualiza los datos administrativos de la categoria.'

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/50 px-4 py-6 sm:items-center">
      <Card aria-modal="true" className="max-h-[92vh] w-full max-w-xl overflow-y-auto" role="dialog">
        <CardHeader className="relative pr-14">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
          <Button
            aria-label="Cerrar modal"
            className="absolute right-4 top-4 h-9 w-9 p-0"
            onClick={onClose}
            variant="ghost"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <CategoryForm
            defaultValues={{
              description: category?.description ?? '',
              name: category?.name ?? '',
            }}
            isSubmitting={isSubmitting}
            onCancel={onClose}
            onSubmit={onSubmit}
            submitLabel={mode === 'create' ? 'Crear categoria' : 'Guardar cambios'}
          />
        </CardContent>
      </Card>
    </div>
  )
}

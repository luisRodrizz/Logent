import { X } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import type { Category } from '../../types/category'
import type { CreateProductRequest, Product } from '../../types/product'
import type { Supplier } from '../../types/supplier'
import { ProductForm } from './ProductForm'

type ProductModalProps = {
  categories: Category[]
  isLoadingOptions?: boolean
  isOpen: boolean
  isSubmitting?: boolean
  mode: 'create' | 'edit'
  onClose: () => void
  onSubmit: (payload: CreateProductRequest) => Promise<void> | void
  product?: Product | null
  suppliers: Supplier[]
}

export function ProductModal({
  categories,
  isLoadingOptions = false,
  isOpen,
  isSubmitting = false,
  mode,
  onClose,
  onSubmit,
  product,
  suppliers,
}: ProductModalProps) {
  if (!isOpen) {
    return null
  }

  const title = mode === 'create' ? 'Nuevo producto' : 'Editar producto'
  const description =
    mode === 'create'
      ? 'Registra un producto dentro del catalogo maestro.'
      : 'Actualiza los datos del catalogo maestro del producto.'

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/50 px-4 py-6 sm:items-center">
      <Card aria-modal="true" className="max-h-[92vh] w-full max-w-3xl overflow-y-auto" role="dialog">
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
          <ProductForm
            categories={categories}
            defaultValues={{
              categoryId: product?.categoryId ?? '',
              code: product?.code ?? '',
              description: product?.description ?? '',
              minimumStock: product?.minimumStock ?? 0,
              name: product?.name ?? '',
              purchasePrice: product?.purchasePrice ?? 0,
              salePrice: product?.salePrice ?? 0,
              supplierId: product?.supplierId ?? '',
            }}
            isLoadingOptions={isLoadingOptions}
            isSubmitting={isSubmitting}
            onCancel={onClose}
            onSubmit={onSubmit}
            submitLabel={mode === 'create' ? 'Crear producto' : 'Guardar cambios'}
            suppliers={suppliers}
          />
        </CardContent>
      </Card>
    </div>
  )
}

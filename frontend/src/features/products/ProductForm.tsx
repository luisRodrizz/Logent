import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { LoadingState } from '../../components/common/LoadingState'
import { Button } from '../../components/ui/Button'
import type { Category } from '../../types/category'
import type { CreateProductRequest } from '../../types/product'
import type { Supplier } from '../../types/supplier'
import { productSchema, type ProductFormValues, toProductPayload } from './product.schema'

type ProductFormProps = {
  categories: Category[]
  defaultValues?: ProductFormValues
  isLoadingOptions?: boolean
  isSubmitting?: boolean
  onCancel: () => void
  onSubmit: (payload: CreateProductRequest) => Promise<void> | void
  submitLabel: string
  suppliers: Supplier[]
}

const emptyValues: ProductFormValues = {
  categoryId: '',
  code: '',
  description: '',
  minimumStock: 0,
  name: '',
  purchasePrice: 0,
  salePrice: 0,
  supplierId: '',
}

export function ProductForm({
  categories,
  defaultValues = emptyValues,
  isLoadingOptions = false,
  isSubmitting = false,
  onCancel,
  onSubmit,
  submitLabel,
  suppliers,
}: ProductFormProps) {
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<ProductFormValues>({
    defaultValues,
    resolver: zodResolver(productSchema),
  })

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  async function handleValidSubmit(values: ProductFormValues) {
    await onSubmit(toProductPayload(values))
  }

  if (isLoadingOptions) {
    return <LoadingState text="Cargando categorias y proveedores..." />
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(handleValidSubmit)}>
      <div className="grid gap-4 md:grid-cols-[0.75fr_1.25fr]">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground" htmlFor="product-code">
            Codigo
          </label>
          <input
            autoComplete="off"
            className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-blue-100"
            id="product-code"
            placeholder="SKU-001"
            {...register('code')}
          />
          {errors.code ? <p className="text-sm font-medium text-red-600">{errors.code.message}</p> : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground" htmlFor="product-name">
            Nombre
          </label>
          <input
            autoComplete="off"
            className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-blue-100"
            id="product-name"
            placeholder="Ej. Monitor industrial"
            {...register('name')}
          />
          {errors.name ? <p className="text-sm font-medium text-red-600">{errors.name.message}</p> : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground" htmlFor="product-category">
            Categoria
          </label>
          <select
            className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-blue-100"
            id="product-category"
            {...register('categoryId')}
          >
            <option value="">Seleccionar categoria</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId ? <p className="text-sm font-medium text-red-600">{errors.categoryId.message}</p> : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground" htmlFor="product-supplier">
            Proveedor
          </label>
          <select
            className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-blue-100"
            id="product-supplier"
            {...register('supplierId')}
          >
            <option value="">Sin proveedor asignado</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.businessName}
              </option>
            ))}
          </select>
          {errors.supplierId ? <p className="text-sm font-medium text-red-600">{errors.supplierId.message}</p> : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground" htmlFor="product-purchase-price">
            Precio compra
          </label>
          <input
            className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-blue-100"
            id="product-purchase-price"
            min="0"
            step="0.01"
            type="number"
            {...register('purchasePrice', { valueAsNumber: true })}
          />
          {errors.purchasePrice ? (
            <p className="text-sm font-medium text-red-600">{errors.purchasePrice.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground" htmlFor="product-sale-price">
            Precio venta
          </label>
          <input
            className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-blue-100"
            id="product-sale-price"
            min="0"
            step="0.01"
            type="number"
            {...register('salePrice', { valueAsNumber: true })}
          />
          {errors.salePrice ? <p className="text-sm font-medium text-red-600">{errors.salePrice.message}</p> : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground" htmlFor="product-minimum-stock">
            Stock minimo
          </label>
          <input
            className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-blue-100"
            id="product-minimum-stock"
            min="0"
            step="1"
            type="number"
            {...register('minimumStock', { valueAsNumber: true })}
          />
          {errors.minimumStock ? (
            <p className="text-sm font-medium text-red-600">{errors.minimumStock.message}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground" htmlFor="product-description">
          Descripcion
        </label>
        <textarea
          className="min-h-28 w-full resize-none rounded-lg border border-border bg-white px-3 py-2 text-sm leading-6 text-foreground outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-blue-100"
          id="product-description"
          placeholder="Detalle comercial o tecnico del producto."
          {...register('description')}
        />
        {errors.description ? (
          <p className="text-sm font-medium text-red-600">{errors.description.message}</p>
        ) : (
          <p className="text-xs text-muted">Opcional. Maximo 500 caracteres.</p>
        )}
      </div>

      <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-800">
        El stock actual no se edita desde productos. Las existencias se gestionan unicamente mediante movimientos.
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button disabled={isSubmitting} onClick={onCancel} variant="secondary">
          Cancelar
        </Button>
        <Button disabled={isSubmitting || categories.length === 0} type="submit">
          {isSubmitting ? 'Guardando...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}

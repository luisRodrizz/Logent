import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { LoadingState } from '../../components/common/LoadingState'
import { Button } from '../../components/ui/Button'
import type { CreateMovementRequest, MovementType } from '../../types/movement'
import type { Product } from '../../types/product'
import type { StockItem } from '../../types/stock'
import type { Warehouse } from '../../types/warehouse'
import { movementSchema, toMovementPayload, type MovementFormValues } from './movement.schema'

type MovementFormProps = {
  isLoadingOptions?: boolean
  isSubmitting?: boolean
  onCancel: () => void
  onSubmit: (payload: CreateMovementRequest) => Promise<void> | void
  products: Product[]
  stockItems: StockItem[]
  warehouses: Warehouse[]
}

const defaultValues: MovementFormValues = {
  details: [
    {
      productId: '',
      quantity: 1,
      unitCost: 0,
    },
  ],
  observation: '',
  type: 'Entry',
  warehouseDestinationId: '',
  warehouseOriginId: '',
}

const typeLabels: Record<MovementType, string> = {
  Entry: 'Entrada',
  Exit: 'Salida',
  Transfer: 'Transferencia',
}

function getAvailableStock(stockItems: StockItem[], productId?: string, warehouseId?: string): number | null {
  if (!productId || !warehouseId) {
    return null
  }

  const item = stockItems.find((stockItem) => stockItem.productId === productId && stockItem.warehouseId === warehouseId)

  return item?.quantity ?? 0
}

export function MovementForm({
  isLoadingOptions = false,
  isSubmitting = false,
  onCancel,
  onSubmit,
  products,
  stockItems,
  warehouses,
}: MovementFormProps) {
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    setValue,
  } = useForm<MovementFormValues>({
    defaultValues,
    resolver: zodResolver(movementSchema),
  })

  const { append, fields, remove } = useFieldArray({
    control,
    name: 'details',
  })

  const selectedType = useWatch({ control, name: 'type' })
  const selectedOriginWarehouseId = useWatch({ control, name: 'warehouseOriginId' })
  const details = useWatch({ control, name: 'details' })
  const requiresOrigin = selectedType === 'Exit' || selectedType === 'Transfer'
  const requiresDestination = selectedType === 'Entry' || selectedType === 'Transfer'
  const totalQuantity = useMemo(
    () => details.reduce((total, detail) => total + (Number.isFinite(detail.quantity) ? detail.quantity : 0), 0),
    [details],
  )

  useEffect(() => {
    if (selectedType === 'Entry') {
      setValue('warehouseOriginId', '')
    }

    if (selectedType === 'Exit') {
      setValue('warehouseDestinationId', '')
    }
  }, [selectedType, setValue])

  async function handleValidSubmit(values: MovementFormValues) {
    await onSubmit(toMovementPayload(values))
  }

  if (isLoadingOptions) {
    return <LoadingState text="Cargando productos, almacenes y disponibilidad..." />
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit(handleValidSubmit)}>
      <section className="rounded-lg border border-border bg-white p-4">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-foreground">Tipo y almacenes</h3>
          <p className="mt-1 text-xs leading-5 text-muted">Define la operacion y las ubicaciones involucradas.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground" htmlFor="movement-type">
            Tipo
          </label>
          <select
            className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-blue-100"
            id="movement-type"
            {...register('type')}
          >
            <option value="Entry">Entrada</option>
            <option value="Exit">Salida</option>
            <option value="Transfer">Transferencia</option>
          </select>
          {errors.type ? <p className="text-sm font-medium text-red-600">{errors.type.message}</p> : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground" htmlFor="movement-origin">
            Almacen origen
          </label>
          <select
            className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
            disabled={!requiresOrigin}
            id="movement-origin"
            {...register('warehouseOriginId')}
          >
            <option value="">Seleccionar origen</option>
            {warehouses.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.name}
              </option>
            ))}
          </select>
          {errors.warehouseOriginId ? (
            <p className="text-sm font-medium text-red-600">{errors.warehouseOriginId.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground" htmlFor="movement-destination">
            Almacen destino
          </label>
          <select
            className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
            disabled={!requiresDestination}
            id="movement-destination"
            {...register('warehouseDestinationId')}
          >
            <option value="">Seleccionar destino</option>
            {warehouses.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.name}
              </option>
            ))}
          </select>
          {errors.warehouseDestinationId ? (
            <p className="text-sm font-medium text-red-600">{errors.warehouseDestinationId.message}</p>
          ) : null}
        </div>
      </div>
      </section>

      <div className="rounded-lg border border-border">
        <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Productos del movimiento</h3>
            <p className="text-xs leading-5 text-muted">Cantidad total: {totalQuantity}</p>
          </div>
          <Button
            onClick={() => append({ productId: '', quantity: 1, unitCost: 0 })}
            size="sm"
            type="button"
            variant="secondary"
          >
            <Plus className="h-4 w-4" />
            Agregar producto
          </Button>
        </div>

        <div className="space-y-4 p-4">
          {fields.map((field, index) => {
            const detail = details[index]
            const availableStock = getAvailableStock(stockItems, detail?.productId, selectedOriginWarehouseId)
            const showAvailability = selectedType === 'Exit' || selectedType === 'Transfer'

            return (
              <div className="rounded-lg border border-border bg-white p-4" key={field.id}>
                <div className="grid gap-4 lg:grid-cols-[1fr_0.5fr_0.5fr_auto] lg:items-start">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground" htmlFor={`movement-product-${field.id}`}>
                      Producto
                    </label>
                    <select
                      className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-blue-100"
                      id={`movement-product-${field.id}`}
                      {...register(`details.${index}.productId`)}
                    >
                      <option value="">Seleccionar producto</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.code} - {product.name}
                        </option>
                      ))}
                    </select>
                    {errors.details?.[index]?.productId ? (
                      <p className="text-sm font-medium text-red-600">{errors.details[index]?.productId?.message}</p>
                    ) : null}
                    {showAvailability ? (
                      <p className="rounded-md bg-slate-50 px-2 py-1 text-xs text-muted">
                        Disponible origen:{' '}
                        <span className="font-semibold text-foreground">
                          {availableStock === null ? 'Selecciona producto y origen' : availableStock}
                        </span>
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground" htmlFor={`movement-quantity-${field.id}`}>
                      Cantidad
                    </label>
                    <input
                      className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-blue-100"
                      id={`movement-quantity-${field.id}`}
                      min="1"
                      step="1"
                      type="number"
                      {...register(`details.${index}.quantity`, { valueAsNumber: true })}
                    />
                    {errors.details?.[index]?.quantity ? (
                      <p className="text-sm font-medium text-red-600">{errors.details[index]?.quantity?.message}</p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground" htmlFor={`movement-unit-cost-${field.id}`}>
                      Costo unit.
                    </label>
                    <input
                      className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-blue-100"
                      id={`movement-unit-cost-${field.id}`}
                      min="0"
                      step="0.01"
                      type="number"
                      {...register(`details.${index}.unitCost`, { valueAsNumber: true })}
                    />
                    {errors.details?.[index]?.unitCost ? (
                      <p className="text-sm font-medium text-red-600">{errors.details[index]?.unitCost?.message}</p>
                    ) : null}
                  </div>

                  <div className="flex lg:justify-end lg:pt-8">
                    <Button
                      aria-label="Eliminar detalle"
                      className="h-10 w-10 p-0"
                      disabled={fields.length === 1}
                      onClick={() => remove(index)}
                      type="button"
                      variant="ghost"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <section className="rounded-lg border border-border bg-white p-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground" htmlFor="movement-observation">
            Observacion
          </label>
          <textarea
            className="min-h-24 w-full resize-none rounded-lg border border-border bg-white px-3 py-2 text-sm leading-6 text-foreground outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-blue-100"
            id="movement-observation"
            placeholder="Referencia operativa, guia, documento o nota interna."
            {...register('observation')}
          />
          {errors.observation ? <p className="text-sm font-medium text-red-600">{errors.observation.message}</p> : null}
        </div>
      </section>

      <div className="rounded-lg border border-[#14B8A6]/25 bg-[#14B8A6]/10 px-4 py-3 text-sm leading-6 text-slate-700">
        Este movimiento {typeLabels[selectedType].toLowerCase()} actualizara stock y Kardex desde el backend. No hay
        edicion manual de StockItems en esta pantalla.
      </div>

      {errors.details?.root ? <p className="text-sm font-medium text-red-600">{errors.details.root.message}</p> : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button disabled={isSubmitting} onClick={onCancel} type="button" variant="secondary">
          Cancelar
        </Button>
        <Button disabled={isSubmitting || products.length === 0 || warehouses.length === 0} type="submit">
          {isSubmitting ? 'Registrando...' : 'Registrar movimiento'}
        </Button>
      </div>
    </form>
  )
}

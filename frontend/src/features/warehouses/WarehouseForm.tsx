import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '../../components/ui/Button'
import type { CreateWarehouseRequest } from '../../types/warehouse'
import { type WarehouseFormValues, toWarehousePayload, warehouseSchema } from './warehouse.schema'

type WarehouseFormProps = {
  defaultValues?: WarehouseFormValues
  isSubmitting?: boolean
  onCancel: () => void
  onSubmit: (payload: CreateWarehouseRequest) => Promise<void> | void
  submitLabel: string
}

const emptyValues: WarehouseFormValues = {
  description: '',
  location: '',
  name: '',
}

export function WarehouseForm({
  defaultValues = emptyValues,
  isSubmitting = false,
  onCancel,
  onSubmit,
  submitLabel,
}: WarehouseFormProps) {
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<WarehouseFormValues>({
    defaultValues,
    resolver: zodResolver(warehouseSchema),
  })

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  async function handleValidSubmit(values: WarehouseFormValues) {
    await onSubmit(toWarehousePayload(values))
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(handleValidSubmit)}>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground" htmlFor="warehouse-name">
          Nombre
        </label>
        <input
          autoComplete="off"
          className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-blue-100"
          id="warehouse-name"
          placeholder="Ej. Almacen principal"
          {...register('name')}
        />
        {errors.name ? <p className="text-sm font-medium text-red-600">{errors.name.message}</p> : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground" htmlFor="warehouse-location">
          Ubicacion
        </label>
        <input
          autoComplete="street-address"
          className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-blue-100"
          id="warehouse-location"
          placeholder="Ej. Lima - Sede Norte"
          {...register('location')}
        />
        {errors.location ? (
          <p className="text-sm font-medium text-red-600">{errors.location.message}</p>
        ) : (
          <p className="text-xs text-muted">Opcional. Maximo 200 caracteres.</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground" htmlFor="warehouse-description">
          Descripcion
        </label>
        <textarea
          className="min-h-28 w-full resize-none rounded-lg border border-border bg-white px-3 py-2 text-sm leading-6 text-foreground outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-blue-100"
          id="warehouse-description"
          placeholder="Detalle operativo, referencia interna o alcance del almacen."
          {...register('description')}
        />
        {errors.description ? (
          <p className="text-sm font-medium text-red-600">{errors.description.message}</p>
        ) : (
          <p className="text-xs text-muted">Opcional. Maximo 300 caracteres.</p>
        )}
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button disabled={isSubmitting} onClick={onCancel} variant="secondary">
          Cancelar
        </Button>
        <Button disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Guardando...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}

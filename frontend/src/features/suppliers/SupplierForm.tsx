import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '../../components/ui/Button'
import type { CreateSupplierRequest } from '../../types/supplier'
import { supplierSchema, type SupplierFormValues, toSupplierPayload } from './supplier.schema'

type SupplierFormProps = {
  defaultValues?: SupplierFormValues
  isSubmitting?: boolean
  onCancel: () => void
  onSubmit: (payload: CreateSupplierRequest) => Promise<void> | void
  submitLabel: string
}

const emptyValues: SupplierFormValues = {
  address: '',
  businessName: '',
  email: '',
  phone: '',
  ruc: '',
}

export function SupplierForm({
  defaultValues = emptyValues,
  isSubmitting = false,
  onCancel,
  onSubmit,
  submitLabel,
}: SupplierFormProps) {
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<SupplierFormValues>({
    defaultValues,
    resolver: zodResolver(supplierSchema),
  })

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  async function handleValidSubmit(values: SupplierFormValues) {
    await onSubmit(toSupplierPayload(values))
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(handleValidSubmit)}>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground" htmlFor="supplier-business-name">
          Razon social
        </label>
        <input
          autoComplete="organization"
          className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-blue-100"
          id="supplier-business-name"
          placeholder="Ej. Distribuidora Central SAC"
          {...register('businessName')}
        />
        {errors.businessName ? <p className="text-sm font-medium text-red-600">{errors.businessName.message}</p> : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground" htmlFor="supplier-ruc">
            RUC
          </label>
          <input
            autoComplete="off"
            className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-blue-100"
            id="supplier-ruc"
            placeholder="20123456789"
            {...register('ruc')}
          />
          {errors.ruc ? <p className="text-sm font-medium text-red-600">{errors.ruc.message}</p> : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground" htmlFor="supplier-phone">
            Telefono
          </label>
          <input
            autoComplete="tel"
            className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-blue-100"
            id="supplier-phone"
            placeholder="+51 999 999 999"
            {...register('phone')}
          />
          {errors.phone ? <p className="text-sm font-medium text-red-600">{errors.phone.message}</p> : null}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground" htmlFor="supplier-email">
          Email
        </label>
        <input
          autoComplete="email"
          className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-blue-100"
          id="supplier-email"
          placeholder="contacto@proveedor.com"
          type="email"
          {...register('email')}
        />
        {errors.email ? <p className="text-sm font-medium text-red-600">{errors.email.message}</p> : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground" htmlFor="supplier-address">
          Direccion
        </label>
        <textarea
          className="min-h-24 w-full resize-none rounded-lg border border-border bg-white px-3 py-2 text-sm leading-6 text-foreground outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-blue-100"
          id="supplier-address"
          placeholder="Direccion comercial o referencia de despacho."
          {...register('address')}
        />
        {errors.address ? (
          <p className="text-sm font-medium text-red-600">{errors.address.message}</p>
        ) : (
          <p className="text-xs text-muted">Opcional. Maximo 250 caracteres.</p>
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

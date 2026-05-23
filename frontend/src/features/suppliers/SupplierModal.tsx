import { X } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import type { CreateSupplierRequest, Supplier } from '../../types/supplier'
import { SupplierForm } from './SupplierForm'

type SupplierModalProps = {
  isOpen: boolean
  isSubmitting?: boolean
  mode: 'create' | 'edit'
  onClose: () => void
  onSubmit: (payload: CreateSupplierRequest) => Promise<void> | void
  supplier?: Supplier | null
}

export function SupplierModal({ isOpen, isSubmitting = false, mode, onClose, onSubmit, supplier }: SupplierModalProps) {
  if (!isOpen) {
    return null
  }

  const title = mode === 'create' ? 'Nuevo proveedor' : 'Editar proveedor'
  const description =
    mode === 'create'
      ? 'Registra un proveedor asociado al inventario.'
      : 'Actualiza los datos administrativos del proveedor.'

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/50 px-4 py-6 sm:items-center">
      <Card aria-modal="true" className="max-h-[92vh] w-full max-w-2xl overflow-y-auto" role="dialog">
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
          <SupplierForm
            defaultValues={{
              address: supplier?.address ?? '',
              businessName: supplier?.businessName ?? '',
              email: supplier?.email ?? '',
              phone: supplier?.phone ?? '',
              ruc: supplier?.ruc ?? '',
            }}
            isSubmitting={isSubmitting}
            onCancel={onClose}
            onSubmit={onSubmit}
            submitLabel={mode === 'create' ? 'Crear proveedor' : 'Guardar cambios'}
          />
        </CardContent>
      </Card>
    </div>
  )
}

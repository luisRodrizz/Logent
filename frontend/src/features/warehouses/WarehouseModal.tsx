import { X } from 'lucide-react'
import { ModalOverlay } from '../../components/common/ModalOverlay'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import type { CreateWarehouseRequest, Warehouse } from '../../types/warehouse'
import { WarehouseForm } from './WarehouseForm'

type WarehouseModalProps = {
  isOpen: boolean
  isSubmitting?: boolean
  mode: 'create' | 'edit'
  onClose: () => void
  onSubmit: (payload: CreateWarehouseRequest) => Promise<void> | void
  warehouse?: Warehouse | null
}

export function WarehouseModal({
  isOpen,
  isSubmitting = false,
  mode,
  onClose,
  onSubmit,
  warehouse,
}: WarehouseModalProps) {
  if (!isOpen) {
    return null
  }

  const title = mode === 'create' ? 'Nuevo almacen' : 'Editar almacen'
  const description =
    mode === 'create'
      ? 'Registra una ubicacion operativa para controlar inventario.'
      : 'Actualiza los datos administrativos del almacen.'

  return (
    <ModalOverlay>
      <Card aria-modal="true" className="max-h-[calc(100vh-48px)] w-full max-w-xl overflow-y-auto" role="dialog">
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
          <WarehouseForm
            defaultValues={{
              description: warehouse?.description ?? '',
              location: warehouse?.location ?? '',
              name: warehouse?.name ?? '',
            }}
            isSubmitting={isSubmitting}
            onCancel={onClose}
            onSubmit={onSubmit}
            submitLabel={mode === 'create' ? 'Crear almacen' : 'Guardar cambios'}
          />
        </CardContent>
      </Card>
    </ModalOverlay>
  )
}

import { X } from 'lucide-react'
import { ModalOverlay } from '../../components/common/ModalOverlay'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import type { CreateMovementRequest } from '../../types/movement'
import type { Product } from '../../types/product'
import type { StockItem } from '../../types/stock'
import type { Warehouse } from '../../types/warehouse'
import { MovementForm } from './MovementForm'

type MovementModalProps = {
  isLoadingOptions?: boolean
  isOpen: boolean
  isSubmitting?: boolean
  onClose: () => void
  onSubmit: (payload: CreateMovementRequest) => Promise<void> | void
  products: Product[]
  stockItems: StockItem[]
  warehouses: Warehouse[]
}

export function MovementModal({
  isLoadingOptions = false,
  isOpen,
  isSubmitting = false,
  onClose,
  onSubmit,
  products,
  stockItems,
  warehouses,
}: MovementModalProps) {
  if (!isOpen) {
    return null
  }

  return (
    <ModalOverlay>
      <Card aria-modal="true" className="max-h-[calc(100vh-48px)] w-full max-w-5xl overflow-y-auto" role="dialog">
        <CardHeader className="relative pr-14">
          <CardTitle>Nuevo movimiento</CardTitle>
          <CardDescription>Registra una entrada, salida o transferencia de inventario.</CardDescription>
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
          <MovementForm
            isLoadingOptions={isLoadingOptions}
            isSubmitting={isSubmitting}
            onCancel={onClose}
            onSubmit={onSubmit}
            products={products}
            stockItems={stockItems}
            warehouses={warehouses}
          />
        </CardContent>
      </Card>
    </ModalOverlay>
  )
}

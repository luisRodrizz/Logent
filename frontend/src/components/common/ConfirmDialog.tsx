import { AlertTriangle } from 'lucide-react'
import { ModalOverlay } from './ModalOverlay'
import { Button } from '../ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card'

type ConfirmDialogProps = {
  cancelLabel?: string
  confirmLabel?: string
  description: string
  isConfirming?: boolean
  isOpen: boolean
  onCancel: () => void
  onConfirm: () => void
  title: string
}

export function ConfirmDialog({
  cancelLabel = 'Cancelar',
  confirmLabel = 'Eliminar',
  description,
  isConfirming = false,
  isOpen,
  onCancel,
  onConfirm,
  title,
}: ConfirmDialogProps) {
  if (!isOpen) {
    return null
  }

  return (
    <ModalOverlay>
      <Card aria-modal="true" className="w-full max-w-md" role="dialog">
        <CardHeader>
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-red-50 text-red-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button disabled={isConfirming} onClick={onCancel} variant="secondary">
              {cancelLabel}
            </Button>
            <Button disabled={isConfirming} onClick={onConfirm} variant="danger">
              {isConfirming ? 'Eliminando...' : confirmLabel}
            </Button>
          </div>
        </CardContent>
      </Card>
    </ModalOverlay>
  )
}

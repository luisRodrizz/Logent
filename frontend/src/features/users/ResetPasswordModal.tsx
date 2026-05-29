import { zodResolver } from '@hookform/resolvers/zod'
import { KeyRound, X } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { ModalOverlay } from '../../components/common/ModalOverlay'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import type { ResetPasswordPayload, User } from './users.types'

const resetPasswordSchema = z
  .object({
    confirmPassword: z.string().min(8, 'La confirmacion debe tener al menos 8 caracteres.'),
    newPassword: z.string().min(8, 'La contraseña temporal debe tener al menos 8 caracteres.'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'],
  })

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

type ResetPasswordModalProps = {
  isOpen: boolean
  isSubmitting?: boolean
  onClose: () => void
  onSubmit: (payload: ResetPasswordPayload) => Promise<void> | void
  user?: User | null
}

const emptyValues: ResetPasswordFormValues = {
  confirmPassword: '',
  newPassword: '',
}

export function ResetPasswordModal({
  isOpen,
  isSubmitting = false,
  onClose,
  onSubmit,
  user,
}: ResetPasswordModalProps) {
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<ResetPasswordFormValues>({
    defaultValues: emptyValues,
    resolver: zodResolver(resetPasswordSchema),
  })

  useEffect(() => {
    if (isOpen) {
      reset(emptyValues)
    }
  }, [isOpen, reset])

  if (!isOpen || !user) {
    return null
  }

  async function handleValidSubmit(values: ResetPasswordFormValues) {
    await onSubmit({ newPassword: values.newPassword })
  }

  return (
    <ModalOverlay>
      <Card aria-modal="true" className="w-full max-w-lg" role="dialog">
        <CardHeader className="relative pr-14">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-700 ring-1 ring-amber-200">
            <KeyRound className="h-5 w-5" />
          </div>
          <CardTitle>Resetear contraseña</CardTitle>
          <CardDescription>Define una contraseña temporal para el usuario seleccionado.</CardDescription>
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
          <form className="space-y-5" onSubmit={handleSubmit(handleValidSubmit)}>
            <div className="rounded-lg border border-border bg-slate-50 px-4 py-3">
              <p className="text-sm font-semibold text-foreground">{user.fullName || user.email}</p>
              <p className="mt-1 text-sm text-muted">{user.email}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground" htmlFor="new-password">
                Nueva contraseña temporal
              </label>
              <input
                autoComplete="new-password"
                className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-blue-100"
                id="new-password"
                placeholder="NuevaDemo123*"
                type="password"
                {...register('newPassword')}
              />
              {errors.newPassword ? (
                <p className="text-sm font-medium text-red-600">{errors.newPassword.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground" htmlFor="confirm-password">
                Confirmar contraseña
              </label>
              <input
                autoComplete="new-password"
                className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-blue-100"
                id="confirm-password"
                placeholder="Repite la contraseña temporal"
                type="password"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword ? (
                <p className="text-sm font-medium text-red-600">{errors.confirmPassword.message}</p>
              ) : null}
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button disabled={isSubmitting} onClick={onClose} variant="secondary">
                Cancelar
              </Button>
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting ? 'Actualizando...' : 'Resetear contraseña'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </ModalOverlay>
  )
}

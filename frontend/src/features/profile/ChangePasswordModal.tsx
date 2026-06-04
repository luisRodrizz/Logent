import { zodResolver } from '@hookform/resolvers/zod'
import { KeyRound, X } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { ModalOverlay } from '../../components/common/ModalOverlay'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import type { ChangePasswordPayload } from './profile.types'

const changePasswordSchema = z
  .object({
    confirmPassword: z.string().min(1, 'Confirma la nueva contraseña.'),
    currentPassword: z.string().min(1, 'Ingresa tu contraseña actual.'),
    newPassword: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres.'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'],
  })

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>

type ChangePasswordModalProps = {
  isOpen: boolean
  isSubmitting?: boolean
  onClose: () => void
  onSubmit: (payload: ChangePasswordPayload) => Promise<void> | void
}

const emptyValues: ChangePasswordFormValues = {
  confirmPassword: '',
  currentPassword: '',
  newPassword: '',
}

export function ChangePasswordModal({
  isOpen,
  isSubmitting = false,
  onClose,
  onSubmit,
}: ChangePasswordModalProps) {
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<ChangePasswordFormValues>({
    defaultValues: emptyValues,
    resolver: zodResolver(changePasswordSchema),
  })

  useEffect(() => {
    if (isOpen) {
      reset(emptyValues)
    }
  }, [isOpen, reset])

  if (!isOpen) {
    return null
  }

  async function handleValidSubmit(values: ChangePasswordFormValues) {
    await onSubmit({
      confirmPassword: values.confirmPassword,
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    })
  }

  return (
    <ModalOverlay>
      <Card aria-modal="true" className="max-h-[calc(100vh-48px)] w-full max-w-lg overflow-y-auto" role="dialog">
        <CardHeader className="relative pr-14">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-[#1017D8]/5 text-primary ring-1 ring-[#1017D8]/15">
            <KeyRound className="h-5 w-5" />
          </div>
          <CardTitle>Cambiar contraseña</CardTitle>
          <CardDescription>Actualiza tu contraseña de acceso a LOGENT.</CardDescription>
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
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground" htmlFor="current-password">
                Contraseña actual
              </label>
              <input
                autoComplete="current-password"
                className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-blue-100"
                id="current-password"
                type="password"
                {...register('currentPassword')}
              />
              {errors.currentPassword ? (
                <p className="text-sm font-medium text-red-600">{errors.currentPassword.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground" htmlFor="new-profile-password">
                Nueva contraseña
              </label>
              <input
                autoComplete="new-password"
                className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-blue-100"
                id="new-profile-password"
                type="password"
                {...register('newPassword')}
              />
              {errors.newPassword ? (
                <p className="text-sm font-medium text-red-600">{errors.newPassword.message}</p>
              ) : (
                <p className="text-xs text-muted">Usa una contraseña segura y diferente a la temporal recibida.</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground" htmlFor="confirm-profile-password">
                Confirmar nueva contraseña
              </label>
              <input
                autoComplete="new-password"
                className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-blue-100"
                id="confirm-profile-password"
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
                {isSubmitting ? 'Actualizando...' : 'Cambiar contraseña'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </ModalOverlay>
  )
}

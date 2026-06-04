import { zodResolver } from '@hookform/resolvers/zod'
import { MailPlus, X } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { ModalOverlay } from '../../components/common/ModalOverlay'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import type { CreateTenantUserInvitationPayload } from './users.types'
import { userRoles } from './users.types'

const invitationSchema = z.object({
  email: z.string().trim().min(1, 'Ingresa el email.').email('Ingresa un email válido.'),
  firstName: z.string().trim().min(1, 'Ingresa el nombre.').max(80, 'Máximo 80 caracteres.'),
  lastName: z.string().trim().min(1, 'Ingresa el apellido.').max(80, 'Máximo 80 caracteres.'),
  role: z.enum(userRoles),
})

type InvitationFormValues = z.infer<typeof invitationSchema>

type InvitationModalProps = {
  isOpen: boolean
  isSubmitting?: boolean
  onClose: () => void
  onSubmit: (payload: CreateTenantUserInvitationPayload) => Promise<void> | void
}

const defaultValues: InvitationFormValues = {
  email: '',
  firstName: '',
  lastName: '',
  role: 'Consulta',
}

export function InvitationModal({ isOpen, isSubmitting = false, onClose, onSubmit }: InvitationModalProps) {
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<InvitationFormValues>({
    defaultValues,
    resolver: zodResolver(invitationSchema),
  })

  useEffect(() => {
    if (isOpen) {
      reset(defaultValues)
    }
  }, [isOpen, reset])

  if (!isOpen) {
    return null
  }

  async function handleValidSubmit(values: InvitationFormValues) {
    await onSubmit({
      email: values.email.trim(),
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      role: values.role,
    })
  }

  return (
    <ModalOverlay>
      <Card aria-modal="true" className="max-h-[calc(100vh-48px)] w-full max-w-xl overflow-y-auto" role="dialog">
        <CardHeader className="relative pr-14">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1017D8]/5 text-primary">
              <MailPlus className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Invitar usuario</CardTitle>
              <CardDescription>
                Enviaremos un enlace seguro para que el usuario configure su contraseña y se una a la empresa.
              </CardDescription>
            </div>
          </div>
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
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground" htmlFor="invitation-first-name">
                  Nombre
                </label>
                <input
                  autoComplete="given-name"
                  className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-blue-100"
                  id="invitation-first-name"
                  {...register('firstName')}
                />
                {errors.firstName ? <p className="text-sm font-medium text-red-600">{errors.firstName.message}</p> : null}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground" htmlFor="invitation-last-name">
                  Apellido
                </label>
                <input
                  autoComplete="family-name"
                  className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-blue-100"
                  id="invitation-last-name"
                  {...register('lastName')}
                />
                {errors.lastName ? <p className="text-sm font-medium text-red-600">{errors.lastName.message}</p> : null}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground" htmlFor="invitation-email">
                Email
              </label>
              <input
                autoComplete="email"
                className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-blue-100"
                id="invitation-email"
                placeholder="usuario@empresa.com"
                type="email"
                {...register('email')}
              />
              {errors.email ? <p className="text-sm font-medium text-red-600">{errors.email.message}</p> : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground" htmlFor="invitation-role">
                Rol
              </label>
              <select
                className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-blue-100"
                id="invitation-role"
                {...register('role')}
              >
                {userRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button disabled={isSubmitting} onClick={onClose} variant="secondary">
                Cancelar
              </Button>
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting ? 'Enviando...' : 'Enviar invitación'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </ModalOverlay>
  )
}

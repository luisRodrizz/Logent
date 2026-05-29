import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { ModalOverlay } from '../../components/common/ModalOverlay'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import type { CreateUserPayload, UpdateUserPayload, User, UserRole } from './users.types'
import { userRoles } from './users.types'

const userFormSchema = z.object({
  email: z.string().trim().min(1, 'Ingresa el email.').email('Ingresa un email valido.'),
  fullName: z.string().trim().min(1, 'Ingresa el nombre completo.').max(160, 'Maximo 160 caracteres.'),
  isActive: z.boolean(),
  password: z.string().optional(),
  role: z.enum(userRoles),
})

type UserFormValues = z.infer<typeof userFormSchema>

type UserModalProps = {
  isOpen: boolean
  isSubmitting?: boolean
  mode: 'create' | 'edit'
  onClose: () => void
  onSubmit: (payload: CreateUserPayload | UpdateUserPayload) => Promise<void> | void
  user?: User | null
}

function buildDefaultValues(user?: User | null): UserFormValues {
  return {
    email: user?.email ?? '',
    fullName: user?.fullName ?? '',
    isActive: user?.isActive ?? true,
    password: '',
    role: user?.role ?? 'Consulta',
  }
}

export function UserModal({ isOpen, isSubmitting = false, mode, onClose, onSubmit, user }: UserModalProps) {
  const isCreateMode = mode === 'create'
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<UserFormValues>({
    defaultValues: buildDefaultValues(user),
    resolver: zodResolver(userFormSchema.superRefine((values, context) => {
      if (isCreateMode && !values.password?.trim()) {
        context.addIssue({
          code: 'custom',
          message: 'Ingresa una contraseña temporal.',
          path: ['password'],
        })
      }
    })),
  })

  useEffect(() => {
    reset(buildDefaultValues(user))
  }, [reset, user])

  if (!isOpen) {
    return null
  }

  async function handleValidSubmit(values: UserFormValues) {
    const basePayload = {
      email: values.email.trim(),
      fullName: values.fullName.trim(),
      isActive: values.isActive,
    }

    if (isCreateMode) {
      await onSubmit({
        ...basePayload,
        password: values.password?.trim() ?? '',
        role: values.role as UserRole,
      })

      return
    }

    await onSubmit(basePayload)
  }

  return (
    <ModalOverlay>
      <Card aria-modal="true" className="max-h-[calc(100vh-48px)] w-full max-w-xl overflow-y-auto" role="dialog">
        <CardHeader className="relative pr-14">
          <CardTitle>{isCreateMode ? 'Nuevo usuario' : 'Editar usuario'}</CardTitle>
          <CardDescription>
            {isCreateMode
              ? 'Crea una cuenta interna con rol y acceso controlado.'
              : 'Actualiza los datos basicos y estado de acceso del usuario.'}
          </CardDescription>
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
              <label className="text-sm font-semibold text-foreground" htmlFor="user-full-name">
                Nombre completo
              </label>
              <input
                autoComplete="name"
                className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-blue-100"
                id="user-full-name"
                placeholder="Ej. Maria Torres"
                {...register('fullName')}
              />
              {errors.fullName ? <p className="text-sm font-medium text-red-600">{errors.fullName.message}</p> : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground" htmlFor="user-email">
                Email
              </label>
              <input
                autoComplete="email"
                className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-blue-100"
                id="user-email"
                placeholder="usuario@empresa.com"
                type="email"
                {...register('email')}
              />
              {errors.email ? <p className="text-sm font-medium text-red-600">{errors.email.message}</p> : null}
            </div>

            {isCreateMode ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground" htmlFor="user-password">
                    Contraseña temporal
                  </label>
                  <input
                    autoComplete="new-password"
                    className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-blue-100"
                    id="user-password"
                    placeholder="NuevaDemo123*"
                    type="password"
                    {...register('password')}
                  />
                  {errors.password ? (
                    <p className="text-sm font-medium text-red-600">{errors.password.message}</p>
                  ) : (
                    <p className="text-xs text-muted">Usa una clave temporal segura para el primer acceso.</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground" htmlFor="user-role">
                    Rol
                  </label>
                  <select
                    className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-blue-100"
                    id="user-role"
                    {...register('role')}
                  >
                    {userRoles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            ) : null}

            <label className="flex items-center gap-3 rounded-lg border border-border bg-slate-50 px-3 py-3 text-sm font-medium text-foreground">
              <input
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                type="checkbox"
                {...register('isActive')}
              />
              Usuario activo
            </label>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button disabled={isSubmitting} onClick={onClose} variant="secondary">
                Cancelar
              </Button>
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting ? 'Guardando...' : isCreateMode ? 'Crear usuario' : 'Guardar cambios'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </ModalOverlay>
  )
}

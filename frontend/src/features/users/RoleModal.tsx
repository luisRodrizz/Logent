import { zodResolver } from '@hookform/resolvers/zod'
import { ShieldCheck, X } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { ModalOverlay } from '../../components/common/ModalOverlay'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import type { UpdateUserRolePayload, User, UserRole } from './users.types'
import { userRoles } from './users.types'

const roleSchema = z.object({
  role: z.enum(userRoles),
})

type RoleFormValues = z.infer<typeof roleSchema>

type RoleModalProps = {
  isOpen: boolean
  isSubmitting?: boolean
  onClose: () => void
  onSubmit: (payload: UpdateUserRolePayload) => Promise<void> | void
  user?: User | null
}

const roleBadgeVariants: Record<UserRole, 'default' | 'success' | 'muted'> = {
  Admin: 'default',
  Almacenero: 'success',
  Consulta: 'muted',
}

export function RoleModal({ isOpen, isSubmitting = false, onClose, onSubmit, user }: RoleModalProps) {
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<RoleFormValues>({
    defaultValues: {
      role: user?.role ?? 'Consulta',
    },
    resolver: zodResolver(roleSchema),
  })

  useEffect(() => {
    reset({ role: user?.role ?? 'Consulta' })
  }, [reset, user])

  if (!isOpen || !user) {
    return null
  }

  async function handleValidSubmit(values: RoleFormValues) {
    await onSubmit({ role: values.role })
  }

  return (
    <ModalOverlay>
      <Card aria-modal="true" className="w-full max-w-lg" role="dialog">
        <CardHeader className="relative pr-14">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-[#1017D8]/5 text-primary ring-1 ring-[#1017D8]/15">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <CardTitle>Cambiar rol</CardTitle>
          <CardDescription>Actualiza el nivel de acceso interno de este usuario.</CardDescription>
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
              <div className="mt-3">
                <Badge variant={roleBadgeVariants[user.role]}>{user.role}</Badge>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground" htmlFor="role-select">
                Nuevo rol
              </label>
              <select
                className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-blue-100"
                id="role-select"
                {...register('role')}
              >
                {userRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              {errors.role ? <p className="text-sm font-medium text-red-600">{errors.role.message}</p> : null}
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button disabled={isSubmitting} onClick={onClose} variant="secondary">
                Cancelar
              </Button>
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting ? 'Guardando...' : 'Guardar rol'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </ModalOverlay>
  )
}

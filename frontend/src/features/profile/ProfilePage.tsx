import { KeyRound, Mail, ShieldCheck, UserRound } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { LoadingState } from '../../components/common/LoadingState'
import { PageHeader } from '../../components/common/PageHeader'
import { SectionError } from '../../components/common/SectionError'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { getApiErrorMessage } from '../../lib/api-error'
import { formatDate } from '../../lib/format'
import type { AuthRole } from '../../types/auth'
import { ChangePasswordModal } from './ChangePasswordModal'
import { useChangeProfilePassword, useProfile } from './profile.queries'
import type { ChangePasswordPayload, Profile } from './profile.types'

const roleBadgeVariants: Record<AuthRole, 'default' | 'success' | 'muted'> = {
  SuperAdmin: 'default',
  Admin: 'default',
  Almacenero: 'success',
  Consulta: 'muted',
}

function getDisplayName(profile: Profile) {
  return profile.fullName.trim() || profile.email
}

export function ProfilePage() {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const profileQuery = useProfile()
  const changePasswordMutation = useChangeProfilePassword()

  async function handleChangePassword(payload: ChangePasswordPayload) {
    try {
      await changePasswordMutation.mutateAsync(payload)
      toast.success('Contraseña actualizada correctamente.')
      setIsPasswordModalOpen(false)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  if (profileQuery.isLoading) {
    return (
      <Card>
        <CardContent>
          <LoadingState text="Cargando perfil..." />
        </CardContent>
      </Card>
    )
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <Card>
        <CardContent className="px-6 py-10">
          <SectionError text="No se pudo cargar la informacion del perfil." />
        </CardContent>
      </Card>
    )
  }

  const profile = profileQuery.data

  return (
    <div className="space-y-6">
      <PageHeader
        description="Consulta la informacion de tu cuenta autenticada y administra tu contraseña."
        eyebrow="Cuenta"
        title="Mi perfil"
      />

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Mi perfil</CardTitle>
            <CardDescription>Informacion de la cuenta autenticada.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[#1017D8]/5 text-primary ring-1 ring-[#1017D8]/15">
                <UserRound className="h-7 w-7" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h2 className="truncate text-xl font-semibold text-foreground">{getDisplayName(profile)}</h2>
                    <p className="mt-1 truncate text-sm text-muted">{profile.email}</p>
                    <p className="mt-2 font-mono text-[11px] uppercase tracking-wide text-slate-400">
                      ID: {profile.id.slice(0, 8)}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant={roleBadgeVariants[profile.role]}>{profile.role}</Badge>
                    <Badge variant={profile.isActive ? 'success' : 'danger'}>
                      {profile.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-border bg-slate-50 px-4 py-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted">
                      <UserRound className="h-4 w-4" />
                      Nombre
                    </div>
                    <p className="mt-2 truncate text-sm font-semibold text-foreground">{getDisplayName(profile)}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-slate-50 px-4 py-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted">
                      <Mail className="h-4 w-4" />
                      Email
                    </div>
                    <p className="mt-2 truncate text-sm font-semibold text-foreground">{profile.email}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-slate-50 px-4 py-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted">
                      <ShieldCheck className="h-4 w-4" />
                      Rol
                    </div>
                    <p className="mt-2 text-sm font-semibold text-foreground">{profile.role}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-slate-50 px-4 py-3">
                    <p className="text-xs font-medium text-muted">Creado</p>
                    <p className="mt-2 text-sm font-semibold text-foreground">{formatDate(profile.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-[#28E000]/10 text-emerald-700 ring-1 ring-[#28E000]/20">
              <KeyRound className="h-5 w-5" />
            </div>
            <CardTitle>Seguridad</CardTitle>
            <CardDescription>Actualiza tu contraseña de acceso al sistema.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border bg-slate-50 px-4 py-3">
              <p className="text-sm font-medium text-foreground">La administracion del nombre y email se realiza desde Usuarios.</p>
              <p className="mt-1 text-sm leading-6 text-muted">
                Desde este perfil solo puedes cambiar tu propia contraseña.
              </p>
            </div>

            <Button className="mt-5 w-full" onClick={() => setIsPasswordModalOpen(true)}>
              <KeyRound className="h-4 w-4" />
              Cambiar contraseña
            </Button>
          </CardContent>
        </Card>
      </div>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        isSubmitting={changePasswordMutation.isPending}
        onClose={() => setIsPasswordModalOpen(false)}
        onSubmit={handleChangePassword}
      />
    </div>
  )
}

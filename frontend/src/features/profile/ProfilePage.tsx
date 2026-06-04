import { Building2, KeyRound, Mail, ShieldCheck, UserRound } from 'lucide-react'
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
import { useAuth } from '../auth/useAuth'
import { ChangePasswordModal } from './ChangePasswordModal'
import { ProfileEditForm } from './ProfileEditForm'
import { useChangeProfilePassword, useProfile, useUpdateProfile } from './profile.queries'
import type { ChangePasswordPayload, Profile, UpdateProfilePayload } from './profile.types'

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
  const { refreshUser } = useAuth()
  const profileQuery = useProfile()
  const changePasswordMutation = useChangeProfilePassword()
  const updateProfileMutation = useUpdateProfile()

  async function handleUpdateProfile(payload: UpdateProfilePayload) {
    try {
      await updateProfileMutation.mutateAsync(payload)
      await refreshUser()
      toast.success('Perfil actualizado correctamente.')
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

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
                    {profile.roles.map((role) => (
                      <Badge key={role} variant={roleBadgeVariants[role]}>
                        {role}
                      </Badge>
                    ))}
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
                      Roles
                    </div>
                    <p className="mt-2 text-sm font-semibold text-foreground">
                      {profile.roles.length > 0 ? profile.roles.join(', ') : 'Sin rol asignado'}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-slate-50 px-4 py-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted">
                      <Building2 className="h-4 w-4" />
                      Empresa
                    </div>
                    <p className="mt-2 truncate text-sm font-semibold text-foreground">
                      {profile.companyName || 'Cuenta de plataforma'}
                    </p>
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
              <p className="text-sm font-medium text-foreground">Sesión autenticada y protegida.</p>
              <p className="mt-1 text-sm leading-6 text-muted">
                Cuenta creada el {formatDate(profile.createdAt)}. Usa una contraseña segura y exclusiva para LOGENT.
              </p>
            </div>

            <Button className="mt-5 w-full" onClick={() => setIsPasswordModalOpen(true)}>
              <KeyRound className="h-4 w-4" />
              Cambiar contraseña
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información personal</CardTitle>
          <CardDescription>Actualiza el nombre visible de tu propia cuenta.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileEditForm
            isSubmitting={updateProfileMutation.isPending}
            onSubmit={handleUpdateProfile}
            profile={profile}
          />
        </CardContent>
      </Card>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        isSubmitting={changePasswordMutation.isPending}
        onClose={() => setIsPasswordModalOpen(false)}
        onSubmit={handleChangePassword}
      />
    </div>
  )
}

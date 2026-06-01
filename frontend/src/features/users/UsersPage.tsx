import {
  Edit3,
  KeyRound,
  Plus,
  Power,
  PowerOff,
  Search,
  ShieldCheck,
  UsersRound,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { EmptyState } from '../../components/common/EmptyState'
import { LoadingState } from '../../components/common/LoadingState'
import { PageHeader } from '../../components/common/PageHeader'
import { SectionError } from '../../components/common/SectionError'
import { TableContainer } from '../../components/common/TableContainer'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { getApiErrorMessage } from '../../lib/api-error'
import { formatDate, formatNumber } from '../../lib/format'
import { PlanLimitInlineNotice } from '../plan/PlanLimitInlineNotice'
import { usePlanResourceLimit } from '../plan/plan-limit.helpers'
import { ResetPasswordModal } from './ResetPasswordModal'
import { RoleModal } from './RoleModal'
import { UserModal } from './UserModal'
import {
  useCreateUser,
  useResetUserPassword,
  useUpdateUser,
  useUpdateUserRole,
  useUpdateUserStatus,
  useUsers,
} from './users.queries'
import type { CreateUserPayload, UpdateUserPayload, User, UserRole } from './users.types'

const pageSizeOptions = [10, 20, 50]

const roleBadgeVariants: Record<UserRole, 'default' | 'success' | 'muted'> = {
  Admin: 'default',
  Almacenero: 'success',
  Consulta: 'muted',
}

const actionButtonBaseClass = 'h-9 w-9 border p-0 shadow-none'

type UserModalState =
  | {
      mode: 'create' | 'edit'
      user?: User
    }
  | null

function UsersErrorState() {
  return (
    <Card>
      <CardContent className="px-6 py-10">
        <SectionError text="No se pudo cargar la gestion de usuarios." />
      </CardContent>
    </Card>
  )
}

function getDisplayName(user: User) {
  return user.fullName.trim() || user.email
}

function isCreatePayload(payload: CreateUserPayload | UpdateUserPayload): payload is CreateUserPayload {
  return 'password' in payload && 'role' in payload
}

export function UsersPage() {
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [modalState, setModalState] = useState<UserModalState>(null)
  const [userForRole, setUserForRole] = useState<User | null>(null)
  const [userForReset, setUserForReset] = useState<User | null>(null)
  const [userForStatus, setUserForStatus] = useState<User | null>(null)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearch(searchInput.trim())
    }, 350)

    return () => window.clearTimeout(timeoutId)
  }, [searchInput])

  const filters = useMemo(
    () => ({
      pageNumber,
      pageSize,
      search: search || undefined,
    }),
    [pageNumber, pageSize, search],
  )

  const usersQuery = useUsers(filters)
  const createUserMutation = useCreateUser()
  const updateUserMutation = useUpdateUser()
  const updateUserRoleMutation = useUpdateUserRole()
  const updateUserStatusMutation = useUpdateUserStatus()
  const resetUserPasswordMutation = useResetUserPassword()
  const userLimit = usePlanResourceLimit('users')

  const users = useMemo(() => usersQuery.data?.items ?? [], [usersQuery.data?.items])
  const isUserCreationBlocked = userLimit.status?.isAtLimit ?? false
  const stats = useMemo(
    () => ({
      active: users.filter((user) => user.isActive).length,
      admins: users.filter((user) => user.role === 'Admin').length,
      inactive: users.filter((user) => !user.isActive).length,
      total: users.length,
    }),
    [users],
  )

  const isFormSubmitting = createUserMutation.isPending || updateUserMutation.isPending
  const isSearching = Boolean(search)

  async function handleSubmitUser(payload: CreateUserPayload | UpdateUserPayload) {
    try {
      if (modalState?.mode === 'edit' && modalState.user) {
        await updateUserMutation.mutateAsync({ id: modalState.user.id, payload })
        toast.success('Usuario actualizado correctamente.')
      } else if (isCreatePayload(payload)) {
        await createUserMutation.mutateAsync(payload)
        toast.success('Usuario creado correctamente.')
        setPageNumber(1)
      }

      setModalState(null)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  async function handleSubmitRole(payload: { role: UserRole }) {
    if (!userForRole) {
      return
    }

    try {
      await updateUserRoleMutation.mutateAsync({ id: userForRole.id, payload })
      toast.success('Rol actualizado correctamente.')
      setUserForRole(null)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  async function handleSubmitReset(payload: { newPassword: string }) {
    if (!userForReset) {
      return
    }

    try {
      await resetUserPasswordMutation.mutateAsync({ id: userForReset.id, payload })
      toast.success('Contraseña restablecida correctamente.')
      setUserForReset(null)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  async function handleConfirmStatusChange() {
    if (!userForStatus) {
      return
    }

    try {
      await updateUserStatusMutation.mutateAsync({
        id: userForStatus.id,
        payload: { isActive: !userForStatus.isActive },
      })
      toast.success(userForStatus.isActive ? 'Usuario desactivado correctamente.' : 'Usuario activado correctamente.')
      setUserForStatus(null)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  function handleSearchChange(value: string) {
    setSearchInput(value)
    setPageNumber(1)
  }

  function handleOpenCreateModal() {
    if (isUserCreationBlocked) {
      toast.error('Has alcanzado el límite de tu plan.')
      return
    }

    setModalState({ mode: 'create' })
  }

  function handlePageSizeChange(value: string) {
    setPageSize(Number(value))
    setPageNumber(1)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        action={
          <Button
            disabled={isUserCreationBlocked}
            onClick={handleOpenCreateModal}
            title={isUserCreationBlocked ? 'Has alcanzado el límite de tu plan.' : undefined}
          >
            <Plus className="h-4 w-4" />
            Nuevo usuario
          </Button>
        }
        description="Administra cuentas internas, roles y estado de acceso al sistema."
        eyebrow="Administracion"
        title="Usuarios"
      />

      <PlanLimitInlineNotice resource="users" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted">Total usuarios</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{formatNumber(stats.total)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted">Activos</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{formatNumber(stats.active)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted">Inactivos</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{formatNumber(stats.inactive)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted">Admins</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{formatNumber(stats.admins)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="grid gap-4 p-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="relative w-full lg:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              className="h-10 w-full rounded-lg border border-border bg-white pl-10 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-blue-100"
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Buscar por nombre o email"
              type="search"
              value={searchInput}
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-muted lg:justify-end">
            Filas
            <select
              className="h-10 rounded-lg border border-border bg-white px-3 text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-blue-100"
              onChange={(event) => handlePageSizeChange(event.target.value)}
              value={pageSize}
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </CardContent>
      </Card>

      {usersQuery.isLoading ? (
        <Card>
          <CardContent>
            <LoadingState text="Cargando usuarios..." />
          </CardContent>
        </Card>
      ) : usersQuery.isError ? (
        <UsersErrorState />
      ) : users.length === 0 ? (
        <EmptyState
          action={
            isSearching ? null : (
              <Button
                disabled={isUserCreationBlocked}
                onClick={handleOpenCreateModal}
                title={isUserCreationBlocked ? 'Has alcanzado el límite de tu plan.' : undefined}
              >
                <Plus className="h-4 w-4" />
                Crear primer usuario
              </Button>
            )
          }
          description={
            isSearching
              ? 'No se encontraron usuarios que coincidan con la busqueda actual.'
              : 'Crea cuentas internas para operar LOGENT con roles controlados.'
          }
          icon={<UsersRound className="h-6 w-6" />}
          title={isSearching ? 'Sin resultados' : 'Sin usuarios registrados'}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Usuarios internos</CardTitle>
            <CardDescription>Cuentas autorizadas para acceder al panel administrativo de LOGENT.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <TableContainer>
              <table className="w-full min-w-[1060px] table-fixed divide-y divide-border">
                <colgroup>
                  <col className="w-[22%]" />
                  <col className="w-[22%]" />
                  <col className="w-[13%]" />
                  <col className="w-[11%]" />
                  <col className="w-[14%]" />
                  <col className="w-[18%]" />
                </colgroup>
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Usuario</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Email</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Rol</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Estado</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Creado</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-muted">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-white">
                  {users.map((user) => (
                    <tr className="transition-colors hover:bg-slate-50/80" key={user.id}>
                      <td className="px-5 py-4">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">{getDisplayName(user)}</p>
                          <p className="mt-1 font-mono text-[11px] uppercase tracking-wide text-slate-400">
                            ID: {user.id.slice(0, 8)}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="truncate text-sm text-muted">{user.email}</p>
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant={roleBadgeVariants[user.role]}>{user.role}</Badge>
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant={user.isActive ? 'success' : 'danger'}>
                          {user.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-muted">{formatDate(user.createdAt)}</td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            aria-label={`Editar usuario ${getDisplayName(user)}`}
                            className={actionButtonBaseClass}
                            onClick={() => setModalState({ mode: 'edit', user })}
                            title="Editar usuario"
                            variant="secondary"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            aria-label={`Cambiar rol de ${getDisplayName(user)}`}
                            className={`${actionButtonBaseClass} border-[#1017D8]/15 bg-[#1017D8]/5 text-primary hover:bg-[#1017D8]/10`}
                            onClick={() => setUserForRole(user)}
                            title="Cambiar rol"
                            variant="secondary"
                          >
                            <ShieldCheck className="h-4 w-4" />
                          </Button>
                          <Button
                            aria-label={`Resetear contraseña de ${getDisplayName(user)}`}
                            className={actionButtonBaseClass}
                            onClick={() => setUserForReset(user)}
                            title="Resetear contraseña"
                            variant="secondary"
                          >
                            <KeyRound className="h-4 w-4" />
                          </Button>
                          <Button
                            aria-label={`${user.isActive ? 'Desactivar' : 'Activar'} ${getDisplayName(user)}`}
                            className={
                              user.isActive
                                ? `${actionButtonBaseClass} border-red-200 bg-red-50 text-red-700 hover:bg-red-100`
                                : `${actionButtonBaseClass} border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100`
                            }
                            onClick={() => setUserForStatus(user)}
                            title={user.isActive ? 'Desactivar usuario' : 'Activar usuario'}
                            variant="secondary"
                          >
                            {user.isActive ? (
                              <PowerOff className="h-4 w-4" />
                            ) : (
                              <Power className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableContainer>

            <div className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted">
                Pagina {usersQuery.data?.pageNumber ?? pageNumber} de {usersQuery.data?.totalPages ?? 1} ·{' '}
                {formatNumber(usersQuery.data?.totalCount ?? 0)} registros
              </p>
              <div className="flex items-center gap-2">
                <Button
                  disabled={!usersQuery.data?.hasPreviousPage}
                  onClick={() => setPageNumber((currentPage) => Math.max(1, currentPage - 1))}
                  variant="secondary"
                >
                  Anterior
                </Button>
                <Button
                  disabled={!usersQuery.data?.hasNextPage}
                  onClick={() => setPageNumber((currentPage) => currentPage + 1)}
                  variant="secondary"
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <UserModal
        isOpen={Boolean(modalState)}
        isSubmitting={isFormSubmitting}
        mode={modalState?.mode ?? 'create'}
        onClose={() => setModalState(null)}
        onSubmit={handleSubmitUser}
        user={modalState?.user}
      />

      <RoleModal
        isOpen={Boolean(userForRole)}
        isSubmitting={updateUserRoleMutation.isPending}
        onClose={() => setUserForRole(null)}
        onSubmit={handleSubmitRole}
        user={userForRole}
      />

      <ResetPasswordModal
        isOpen={Boolean(userForReset)}
        isSubmitting={resetUserPasswordMutation.isPending}
        onClose={() => setUserForReset(null)}
        onSubmit={handleSubmitReset}
        user={userForReset}
      />

      <ConfirmDialog
        confirmLabel={userForStatus?.isActive ? 'Desactivar' : 'Activar'}
        description={
          userForStatus?.isActive
            ? 'El usuario no podra iniciar sesion mientras este inactivo.'
            : 'El usuario recuperara el acceso al sistema.'
        }
        isConfirming={updateUserStatusMutation.isPending}
        isOpen={Boolean(userForStatus)}
        onCancel={() => setUserForStatus(null)}
        onConfirm={handleConfirmStatusChange}
        title={userForStatus?.isActive ? 'Desactivar usuario' : 'Activar usuario'}
      />
    </div>
  )
}

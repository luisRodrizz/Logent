import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { CircleAlert, MailCheck, ShieldCheck } from 'lucide-react'
import type { FormEventHandler } from 'react'
import { useForm, type FieldErrors, type UseFormRegister } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import logentLogo from '../../assets/brand/logent-logo.png'
import { LoadingState } from '../../components/common/LoadingState'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { getApiErrorMessage } from '../../lib/api-error'
import { formatDateTime } from '../../lib/format'
import { validateTenantUserInvitation } from './users.api'
import { useAcceptTenantUserInvitation } from './users.queries'
import type { ValidateTenantUserInvitationResponse } from './users.types'

const acceptInvitationSchema = z
  .object({
    confirmPassword: z.string().min(1, 'Confirma la contraseña.'),
    password: z.string().min(6, 'Usa al menos 6 caracteres.').max(100, 'Máximo 100 caracteres.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'],
  })

type AcceptInvitationFormValues = z.infer<typeof acceptInvitationSchema>

export function AcceptInvitationPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') ?? ''
  const acceptMutation = useAcceptTenantUserInvitation()
  const invitationQuery = useQuery<ValidateTenantUserInvitationResponse>({
    enabled: Boolean(token),
    queryFn: () => validateTenantUserInvitation(token),
    queryKey: ['tenant-user-invitation', 'validate', token],
    retry: false,
  })
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<AcceptInvitationFormValues>({
    defaultValues: {
      confirmPassword: '',
      password: '',
    },
    resolver: zodResolver(acceptInvitationSchema),
  })

  async function handleValidSubmit(values: AcceptInvitationFormValues) {
    try {
      const response = await acceptMutation.mutateAsync({
        confirmPassword: values.confirmPassword,
        password: values.password,
        token,
      })
      toast.success(response.message)
      navigate('/login', { replace: true })
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudo aceptar la invitación.'))
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-xl">
        <img alt="LOGENT" className="mx-auto mb-7 h-auto max-h-12 w-full max-w-[180px] object-contain" src={logentLogo} />

        {!token || invitationQuery.isError ? (
          <Card>
            <CardContent className="py-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-700">
                <CircleAlert className="h-6 w-6" />
              </div>
              <h1 className="mt-5 text-2xl font-semibold text-foreground">Invitación no disponible</h1>
              <p className="mt-3 text-sm leading-6 text-muted">
                {token
                  ? getApiErrorMessage(invitationQuery.error, 'El enlace es inválido o ha expirado.')
                  : 'El enlace de invitación está incompleto.'}
              </p>
              <Link className="mt-6 inline-flex text-sm font-semibold text-primary hover:underline" to="/login">
                Ir a iniciar sesión
              </Link>
            </CardContent>
          </Card>
        ) : invitationQuery.isLoading || !invitationQuery.data ? (
          <Card>
            <CardContent>
              <LoadingState text="Validando invitación..." />
            </CardContent>
          </Card>
        ) : (
          <InvitationAcceptanceForm
            invitation={invitationQuery.data}
            isSubmitting={acceptMutation.isPending}
            onSubmit={handleSubmit(handleValidSubmit)}
            register={register}
            errors={errors}
          />
        )}
      </div>
    </main>
  )
}

type AcceptanceFormProps = {
  errors: FieldErrors<AcceptInvitationFormValues>
  invitation: ValidateTenantUserInvitationResponse
  isSubmitting: boolean
  onSubmit: FormEventHandler<HTMLFormElement>
  register: UseFormRegister<AcceptInvitationFormValues>
}

function InvitationAcceptanceForm({ errors, invitation, isSubmitting, onSubmit, register }: AcceptanceFormProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#28E000]/10 text-emerald-700">
            <MailCheck className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>Únete a {invitation.companyName}</CardTitle>
            <CardDescription>
              Configura tu contraseña para activar tu cuenta interna de LOGENT.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6 grid gap-3 rounded-lg border border-border bg-slate-50 p-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Usuario invitado</p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {invitation.firstName} {invitation.lastName}
            </p>
            <p className="mt-0.5 text-xs text-muted">{invitation.email}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Acceso</p>
            <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              {invitation.role}
            </p>
            <p className="mt-0.5 text-xs text-muted">Expira {formatDateTime(invitation.expiresAt)}</p>
          </div>
        </div>

        <form className="space-y-5" onSubmit={onSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground" htmlFor="invitation-password">
              Nueva contraseña
            </label>
            <input
              autoComplete="new-password"
              className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-blue-100"
              id="invitation-password"
              type="password"
              {...register('password')}
            />
            {errors.password ? <p className="text-sm font-medium text-red-600">{errors.password.message}</p> : null}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground" htmlFor="invitation-confirm-password">
              Confirmar contraseña
            </label>
            <input
              autoComplete="new-password"
              className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-blue-100"
              id="invitation-confirm-password"
              type="password"
              {...register('confirmPassword')}
            />
            {errors.confirmPassword ? (
              <p className="text-sm font-medium text-red-600">{errors.confirmPassword.message}</p>
            ) : null}
          </div>
          <Button className="w-full" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Activando cuenta...' : 'Aceptar invitación'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

import { zodResolver } from '@hookform/resolvers/zod'
import { CircleAlert, KeyRound, LockKeyhole, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import logentLogo from '../../assets/brand/logent-logo.png'
import { getApiErrorMessage } from '../../lib/api-error'
import { resetPassword } from './auth.api'
import { resetPasswordSchema, type ResetPasswordFormValues } from './password-recovery.schema'
import './PasswordRecoveryPages.css'

type ResetState =
  | {
      status: 'form'
    }
  | {
      detail: string
      status: 'error'
    }
  | {
      status: 'success'
    }

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email')
  const token = searchParams.get('token')
  const hasValidParams = Boolean(email && token)
  const [resetState, setResetState] = useState<ResetState>(
    hasValidParams
      ? { status: 'form' }
      : {
          detail: 'El enlace de recuperación está incompleto. Solicita un nuevo correo e inténtalo nuevamente.',
          status: 'error',
        },
  )
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      confirmPassword: '',
      newPassword: '',
    },
  })

  async function onSubmit(values: ResetPasswordFormValues) {
    if (!email || !token) {
      return
    }

    try {
      const response = await resetPassword({
        confirmPassword: values.confirmPassword,
        email,
        newPassword: values.newPassword,
        token,
      })
      setResetState({ status: 'success' })
      toast.success(response.message)
    } catch (error) {
      const detail = getApiErrorMessage(
        error,
        'No pudimos restablecer tu contraseña. El enlace puede ser inválido o haber expirado.',
      )

      setResetState({
        detail,
        status: 'error',
      })
      toast.error(detail)
    }
  }

  return (
    <main className="logent-recovery">
      <section aria-live="polite" className="logent-recovery-card">
        <img alt="LOGENT" className="logent-recovery-logo" src={logentLogo} />

        {resetState.status === 'success' ? (
          <>
            <div className="logent-recovery-icon logent-recovery-icon-success">
              <ShieldCheck size={28} />
            </div>
            <p className="logent-recovery-eyebrow">Acceso actualizado</p>
            <h1>Contraseña restablecida correctamente</h1>
            <p>Ya puedes iniciar sesión con tu nueva contraseña.</p>
            <Link className="logent-recovery-primary" to="/login">
              Ir a iniciar sesión
            </Link>
          </>
        ) : null}

        {resetState.status === 'error' ? (
          <>
            <div className="logent-recovery-icon logent-recovery-icon-error">
              <CircleAlert size={28} />
            </div>
            <p className="logent-recovery-eyebrow">Enlace no disponible</p>
            <h1>Enlace inválido o incompleto</h1>
            <p>{resetState.detail}</p>
            <p>Solicita un nuevo enlace para continuar de forma segura.</p>
            <Link className="logent-recovery-primary" to="/forgot-password">
              Solicitar nuevo enlace
            </Link>
          </>
        ) : null}

        {resetState.status === 'form' ? (
          <>
            <div className="logent-recovery-icon logent-recovery-icon-neutral">
              <KeyRound size={28} />
            </div>
            <p className="logent-recovery-eyebrow">Seguridad de tu cuenta</p>
            <h1>Restablecer contraseña</h1>
            <p>Define una nueva contraseña para volver a ingresar a LOGENT.</p>

            <form className="logent-recovery-form" onSubmit={handleSubmit(onSubmit)}>
              <label className="logent-recovery-field">
                <span>Nueva contraseña</span>
                <div className="logent-recovery-input-wrap">
                  <LockKeyhole size={16} />
                  <input autoComplete="new-password" placeholder="Mínimo 6 caracteres" type="password" {...register('newPassword')} />
                </div>
                {errors.newPassword ? <small>{errors.newPassword.message}</small> : null}
              </label>

              <label className="logent-recovery-field">
                <span>Confirmar contraseña</span>
                <div className="logent-recovery-input-wrap">
                  <LockKeyhole size={16} />
                  <input autoComplete="new-password" placeholder="Repite tu nueva contraseña" type="password" {...register('confirmPassword')} />
                </div>
                {errors.confirmPassword ? <small>{errors.confirmPassword.message}</small> : null}
              </label>

              <button className="logent-recovery-primary" disabled={isSubmitting} type="submit">
                {isSubmitting ? 'Actualizando...' : 'Restablecer contraseña'}
              </button>
            </form>
          </>
        ) : null}
      </section>
    </main>
  )
}

import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Mail, MailCheck } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

import logentLogo from '../../assets/brand/logent-logo.png'
import { getApiErrorMessage } from '../../lib/api-error'
import { forgotPassword } from './auth.api'
import { forgotPasswordSchema, type ForgotPasswordFormValues } from './password-recovery.schema'
import './PasswordRecoveryPages.css'

export function ForgotPasswordPage() {
  const [requestedEmail, setRequestedEmail] = useState<string | null>(null)
  const [isResending, setIsResending] = useState(false)
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  async function requestInstructions(email: string) {
    return forgotPassword({ email })
  }

  async function onSubmit(values: ForgotPasswordFormValues) {
    try {
      const response = await requestInstructions(values.email)
      setRequestedEmail(values.email)
      toast.success(response.message)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudieron enviar las instrucciones. Inténtalo nuevamente.'))
    }
  }

  async function handleResend() {
    if (!requestedEmail) {
      return
    }

    try {
      setIsResending(true)
      const response = await requestInstructions(requestedEmail)
      toast.success(response.message)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudieron reenviar las instrucciones. Inténtalo nuevamente.'))
    } finally {
      setIsResending(false)
    }
  }

  return (
    <main className="logent-recovery">
      <Link className="logent-recovery-back" to="/login">
        <ArrowLeft size={16} />
        Volver a iniciar sesión
      </Link>

      <section aria-live="polite" className="logent-recovery-card">
        <img alt="LOGENT" className="logent-recovery-logo" src={logentLogo} />

        {requestedEmail ? (
          <>
            <div className="logent-recovery-icon logent-recovery-icon-success">
              <MailCheck size={28} />
            </div>
            <p className="logent-recovery-eyebrow">Solicitud recibida</p>
            <h1>Revisa tu correo</h1>
            <p>Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.</p>

            <div className="logent-recovery-value">
              <span>Correo indicado</span>
              <strong>{requestedEmail}</strong>
            </div>

            <div className="logent-recovery-actions">
              <Link className="logent-recovery-primary" to="/login">
                Volver al login
              </Link>
              <button className="logent-recovery-secondary" disabled={isResending} onClick={handleResend} type="button">
                {isResending ? 'Reenviando...' : 'Reenviar instrucciones'}
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="logent-recovery-eyebrow">Acceso a tu cuenta</p>
            <h1>Recuperar contraseña</h1>
            <p>Ingresa el correo de tu cuenta y te enviaremos instrucciones para restablecer tu contraseña.</p>

            <form className="logent-recovery-form" onSubmit={handleSubmit(onSubmit)}>
              <label className="logent-recovery-field">
                <span>Email</span>
                <div className="logent-recovery-input-wrap">
                  <Mail size={16} />
                  <input autoComplete="email" placeholder="admin@empresa.com" type="email" {...register('email')} />
                </div>
                {errors.email ? <small>{errors.email.message}</small> : null}
              </label>

              <button className="logent-recovery-primary" disabled={isSubmitting} type="submit">
                {isSubmitting ? 'Enviando...' : 'Enviar instrucciones'}
              </button>
            </form>

            <Link className="logent-recovery-inline-link" to="/login">
              Volver a iniciar sesión
            </Link>
          </>
        )}
      </section>
    </main>
  )
}

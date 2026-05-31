import { CircleAlert, MailCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import logentLogo from '../../assets/brand/logent-logo.png'
import { LoadingState } from '../../components/common/LoadingState'
import { getApiErrorMessage } from '../../lib/api-error'
import { confirmEmail } from './auth.api'
import './ConfirmEmailPage.css'

type ConfirmationState =
  | {
      status: 'loading'
    }
  | {
      message: string
      status: 'success'
    }
  | {
      detail: string
      status: 'error'
    }

export function ConfirmEmailPage() {
  const [searchParams] = useSearchParams()
  const [confirmationState, setConfirmationState] = useState<ConfirmationState>({ status: 'loading' })
  const userId = searchParams.get('userId')
  const token = searchParams.get('token')

  useEffect(() => {
    let isMounted = true

    async function confirmAccountEmail() {
      if (!userId || !token) {
        setConfirmationState({
          detail: 'El enlace de confirmación está incompleto. Solicita un nuevo correo e inténtalo nuevamente.',
          status: 'error',
        })
        return
      }

      try {
        const response = await confirmEmail(userId, token)

        if (isMounted) {
          setConfirmationState({
            message: response.message,
            status: 'success',
          })
        }
      } catch (error) {
        if (isMounted) {
          setConfirmationState({
            detail: getApiErrorMessage(error, 'El enlace puede ser inválido o haber expirado.'),
            status: 'error',
          })
        }
      }
    }

    void confirmAccountEmail()

    return () => {
      isMounted = false
    }
  }, [token, userId])

  return (
    <main className="logent-confirm-email">
      <section aria-live="polite" className="logent-confirm-email-card">
        <img alt="LOGENT" className="logent-confirm-email-logo" src={logentLogo} />

        {confirmationState.status === 'loading' ? (
          <div className="logent-confirm-email-loading">
            <LoadingState text="Confirmando tu correo..." />
          </div>
        ) : null}

        {confirmationState.status === 'success' ? (
          <>
            <div className="logent-confirm-email-icon logent-confirm-email-icon-success">
              <MailCheck size={28} />
            </div>
            <p className="logent-confirm-email-eyebrow">Cuenta verificada</p>
            <h1>Correo confirmado correctamente</h1>
            <p>{confirmationState.message}</p>
            <p>Ya puedes iniciar sesión en LOGENT.</p>
            <Link className="logent-confirm-email-primary" to="/login">
              Ir a iniciar sesión
            </Link>
          </>
        ) : null}

        {confirmationState.status === 'error' ? (
          <>
            <div className="logent-confirm-email-icon logent-confirm-email-icon-error">
              <CircleAlert size={28} />
            </div>
            <p className="logent-confirm-email-eyebrow">No se completó la verificación</p>
            <h1>No pudimos confirmar tu correo</h1>
            <p>{confirmationState.detail}</p>
            <p>El enlace puede ser inválido o haber expirado.</p>
            <Link className="logent-confirm-email-primary" to="/login">
              Ir a iniciar sesión
            </Link>
          </>
        ) : null}
      </section>
    </main>
  )
}

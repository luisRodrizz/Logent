import { CircleAlert, CreditCard } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '../../components/ui/Button'
import { getApiErrorMessage } from '../../lib/api-error'
import { useAuth } from '../auth/useAuth'
import { useBillingStatus, useCreateBillingPortalSession } from './billing.queries'
import type { SubscriptionAccessLevel } from './billing.types'

const accessPresentation: Record<
  Exclude<SubscriptionAccessLevel, 'ActiveAccess'>,
  { containerClassName: string; title: string }
> = {
  BlockedAccess: {
    containerClassName: 'border-red-200 bg-red-50 text-red-800',
    title: 'Acciones críticas bloqueadas',
  },
  GracePeriod: {
    containerClassName: 'border-amber-200 bg-amber-50 text-amber-800',
    title: 'Periodo de gracia de facturación',
  },
  LimitedAccess: {
    containerClassName: 'border-amber-200 bg-amber-50 text-amber-800',
    title: 'Acceso operativo limitado',
  },
}

export function SubscriptionAccessBanner() {
  const { user } = useAuth()
  const billingStatusQuery = useBillingStatus(true, 60_000)
  const portalSessionMutation = useCreateBillingPortalSession()
  const status = billingStatusQuery.data

  if (!status || status.accessLevel === 'ActiveAccess') {
    return null
  }

  const presentation = accessPresentation[status.accessLevel]
  const canManageBilling = user?.roles.includes('Admin') && status.canManageBilling

  async function handleOpenBillingPortal() {
    try {
      const session = await portalSessionMutation.mutateAsync()
      window.location.assign(session.sessionUrl)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudo abrir el portal de facturación.'))
    }
  }

  return (
    <div
      className={`mb-5 flex flex-col gap-4 rounded-lg border px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${presentation.containerClassName}`}
      role="status"
    >
      <div className="flex min-w-0 items-start gap-3">
        <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold">{presentation.title}</p>
          <p className="mt-1 text-sm leading-6">{status.accessMessage}</p>
          <p className="text-xs leading-5 opacity-80">{status.accessDetail}</p>
        </div>
      </div>

      {canManageBilling ? (
        <Button
          className="shrink-0"
          disabled={portalSessionMutation.isPending}
          onClick={() => void handleOpenBillingPortal()}
          size="sm"
          variant="secondary"
        >
          <CreditCard className="h-4 w-4" aria-hidden="true" />
          {portalSessionMutation.isPending ? 'Abriendo...' : 'Gestionar facturación'}
        </Button>
      ) : (
        <Link
          className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-border bg-white px-3 text-sm font-semibold text-foreground transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6] focus-visible:ring-offset-2"
          to="/plan"
        >
          Ver plan
        </Link>
      )}
    </div>
  )
}

import { CheckCircle2, CreditCard, LayoutDashboard } from 'lucide-react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Badge } from '../../components/ui/Badge'
import { Card, CardContent } from '../../components/ui/Card'
import { formatDate } from '../../lib/format'
import { useAuth } from '../auth/useAuth'
import { planQueryKeys } from '../plan/plan.queries'
import { billingQueryKeys, useBillingStatus } from './billing.queries'

export function BillingSuccessPage() {
  const queryClient = useQueryClient()
  const { isAuthenticated } = useAuth()
  const billingStatusQuery = useBillingStatus(isAuthenticated, isAuthenticated ? 3000 : false)

  useEffect(() => {
    if (!isAuthenticated) {
      return
    }

    void queryClient.invalidateQueries({ queryKey: billingQueryKeys.status })
    void queryClient.invalidateQueries({ queryKey: planQueryKeys.usage })
  }, [isAuthenticated, queryClient])

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <Card className="w-full max-w-2xl border-slate-200">
        <CardContent className="space-y-7 p-8 text-center sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Stripe Checkout</p>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Pago recibido correctamente
            </h1>
            <p className="mx-auto max-w-lg text-sm leading-6 text-muted">
              Stripe está notificando a LOGENT. El plan se actualizará únicamente después de validar el webhook.
            </p>
          </div>

          {isAuthenticated && billingStatusQuery.data ? (
            <div className="grid gap-3 rounded-lg border border-border bg-slate-50/70 p-4 text-left sm:grid-cols-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Plan registrado</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{billingStatusQuery.data.plan}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Suscripción</p>
                <div className="mt-1">
                  <Badge variant={billingStatusQuery.data.hasActiveSubscription ? 'success' : 'warning'}>
                    {billingStatusQuery.data.subscriptionStatus ?? 'Procesando'}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Próxima renovación</p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {formatDate(billingStatusQuery.data.currentPeriodEnd, 'Pendiente de confirmación')}
                </p>
              </div>
            </div>
          ) : null}

          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0E16B8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              to={isAuthenticated ? '/plan' : '/login'}
            >
              <CreditCard className="h-4 w-4" aria-hidden="true" />
              {isAuthenticated ? 'Ver plan y facturación' : 'Iniciar sesión'}
            </Link>
            {isAuthenticated ? (
              <Link
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 text-sm font-semibold text-foreground transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6] focus-visible:ring-offset-2"
                to="/dashboard"
              >
                <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                Volver al dashboard
              </Link>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

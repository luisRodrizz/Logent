import { ArrowLeft, CreditCard } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '../../components/ui/Card'
import { useAuth } from '../auth/useAuth'

export function BillingCancelPage() {
  const { isAuthenticated } = useAuth()

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <Card className="w-full max-w-xl border-slate-200">
        <CardContent className="space-y-7 p-8 text-center sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600">
            <CreditCard className="h-7 w-7" aria-hidden="true" />
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Stripe Checkout</p>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Pago cancelado</h1>
            <p className="mx-auto max-w-md text-sm leading-6 text-muted">
              No se realizó ningún cobro y el plan de tu empresa permanece sin cambios.
            </p>
          </div>

          <Link
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0E16B8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            to={isAuthenticated ? '/plan' : '/pricing'}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {isAuthenticated ? 'Volver a planes' : 'Ver planes'}
          </Link>
        </CardContent>
      </Card>
    </main>
  )
}

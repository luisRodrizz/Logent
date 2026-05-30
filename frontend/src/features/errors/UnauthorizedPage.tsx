import { LayoutDashboard, ShieldAlert, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card, CardContent } from '../../components/ui/Card'

export function UnauthorizedPage() {
  const navigate = useNavigate()

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <Card className="w-full max-w-xl border-slate-200">
        <CardContent className="space-y-7 p-8 text-center sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-700">
            <ShieldAlert className="h-7 w-7" aria-hidden="true" />
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">403</p>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Acceso no autorizado
            </h1>
            <p className="mx-auto max-w-md text-sm leading-6 text-muted">
              No tienes permisos para acceder a este módulo.
            </p>
          </div>

          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button type="button" onClick={() => navigate('/dashboard')}>
              <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
              Volver al dashboard
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/profile')}>
              <UserRound className="h-4 w-4" aria-hidden="true" />
              Ir a mi perfil
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

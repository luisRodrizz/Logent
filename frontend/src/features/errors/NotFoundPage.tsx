import { Home, LayoutDashboard, LogIn, SearchX } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card, CardContent } from '../../components/ui/Card'
import { useAuth } from '../auth/useAuth'

export function NotFoundPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const primaryTarget = isAuthenticated ? '/dashboard' : '/login'
  const PrimaryIcon = isAuthenticated ? LayoutDashboard : LogIn

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <Card className="w-full max-w-xl border-slate-200">
        <CardContent className="space-y-7 p-8 text-center sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-primary">
            <SearchX className="h-7 w-7" aria-hidden="true" />
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">404</p>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Página no encontrada
            </h1>
            <p className="mx-auto max-w-md text-sm leading-6 text-muted">
              La ruta que intentas abrir no existe o fue movida.
            </p>
          </div>

          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button type="button" onClick={() => navigate(primaryTarget)}>
              <PrimaryIcon className="h-4 w-4" aria-hidden="true" />
              {isAuthenticated ? 'Volver al dashboard' : 'Ir al login'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/')}>
              <Home className="h-4 w-4" aria-hidden="true" />
              Ir al inicio
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

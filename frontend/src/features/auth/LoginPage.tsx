import { zodResolver } from '@hookform/resolvers/zod'
import { Boxes, LockKeyhole, Mail } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { LoadingState } from '../../components/common/LoadingState'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { useAuth } from './useAuth'

const loginSchema = z.object({
  email: z.string().min(1, 'Ingresa tu email.').email('Ingresa un email valido.'),
  password: z.string().min(1, 'Ingresa tu password.'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading, login } = useAuth()
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate])

  async function onSubmit(values: LoginFormValues) {
    try {
      await login(values.email, values.password)
      navigate('/dashboard', { replace: true })
    } catch {
      toast.error('Credenciales incorrectas o usuario no autorizado.')
    }
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6">
        <LoadingState text="Validando sesion..." />
      </main>
    )
  }

  if (isAuthenticated) {
    return <Navigate replace to="/dashboard" />
  }

  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-[1.05fr_0.95fr]">
      <section className="hidden border-r border-border bg-sidebar px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-sidebar">
            <Boxes className="h-5 w-5" />
          </div>
          <div>
            <p className="text-base font-semibold">InventorySaaS</p>
            <p className="text-xs text-slate-400">Inventory Platform</p>
          </div>
        </div>

        <div className="max-w-xl space-y-5">
          <p className="text-sm font-semibold uppercase text-teal-300">Panel privado</p>
          <h1 className="text-4xl font-semibold tracking-normal">Control operativo para inventario moderno.</h1>
          <p className="max-w-lg text-sm leading-6 text-slate-300">
            Accede al panel administrativo de inventario y continua la gestion desde una experiencia limpia, segura y
            preparada para operaciones reales.
          </p>
        </div>

        <p className="text-xs text-slate-500">InventorySaaS Dev Workspace</p>
      </section>

      <section className="flex items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-md space-y-6">
          <div className="flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar text-white">
              <Boxes className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-foreground">InventorySaaS</p>
              <p className="text-xs text-muted">Inventory Platform</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Iniciar sesion</CardTitle>
              <CardDescription>Accede al panel administrativo de inventario.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground" htmlFor="email">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                    <input
                      autoComplete="email"
                      className="h-11 w-full rounded-lg border border-border bg-white pl-10 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-blue-100"
                      id="email"
                      placeholder="admin@inventorysaas.com"
                      type="email"
                      {...register('email')}
                    />
                  </div>
                  {errors.email ? <p className="text-sm font-medium text-red-600">{errors.email.message}</p> : null}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground" htmlFor="password">
                    Password
                  </label>
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                    <input
                      autoComplete="current-password"
                      className="h-11 w-full rounded-lg border border-border bg-white pl-10 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-blue-100"
                      id="password"
                      placeholder="Admin123"
                      type="password"
                      {...register('password')}
                    />
                  </div>
                  {errors.password ? (
                    <p className="text-sm font-medium text-red-600">{errors.password.message}</p>
                  ) : null}
                </div>

                <Button className="w-full" disabled={isSubmitting} type="submit">
                  {isSubmitting ? 'Validando...' : 'Entrar'}
                </Button>
              </form>

              <div className="mt-5 rounded-lg border border-border bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase text-muted">Credenciales demo</p>
                <p className="mt-2 text-sm font-medium text-foreground">admin@inventorysaas.com</p>
                <p className="text-sm text-muted">Admin123</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}

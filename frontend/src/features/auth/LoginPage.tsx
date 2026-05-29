import { zodResolver } from '@hookform/resolvers/zod'
import { LockKeyhole, Mail } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { LoadingState } from '../../components/common/LoadingState'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import logentLogo from '../../assets/brand/logent-logo.png'
import { useAuth } from './useAuth'

const loginSchema = z.object({
  email: z.string().min(1, 'Ingresa tu email.').email('Ingresa un email válido.'),
  password: z.string().min(1, 'Ingresa tu contraseña.'),
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
        <LoadingState text="Validando sesión..." />
      </main>
    )
  }

  if (isAuthenticated) {
    return <Navigate replace to="/dashboard" />
  }

  return (
    <main className="grid min-h-screen bg-slate-50 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="hidden border-r border-white/10 bg-[#07111F] px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="space-y-5">
          <img alt="LOGENT" className="h-11 w-auto object-contain" src={logentLogo} />
          <div>
            <p className="text-sm font-semibold text-slate-100">Gestión de inventarios</p>
            <p className="text-xs text-slate-400">Plataforma operativa segura</p>
          </div>
        </div>

        <div className="max-w-xl space-y-5">
          <p className="text-xs font-semibold uppercase text-[#28E000]">Panel privado</p>
          <h1 className="text-4xl font-semibold tracking-normal text-slate-50">Gestión inteligente de inventarios</h1>
          <p className="max-w-lg text-sm leading-6 text-slate-300">
            Controla stock, movimientos, Kardex y reportes desde una plataforma segura y preparada para operaciones
            reales.
          </p>
        </div>

        <div className="space-y-1 border-t border-white/10 pt-5">
          <p className="text-xs font-medium text-slate-300">LOGENT Dev Workspace</p>
          <p className="text-xs text-slate-500">Ambiente local de demostración</p>
        </div>
      </section>

      <section className="flex items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-[440px] space-y-6">
          <div className="space-y-3 lg:hidden">
            <img alt="LOGENT" className="h-9 w-auto object-contain" src={logentLogo} />
            <div>
              <p className="font-semibold text-foreground">LOGENT</p>
              <p className="text-xs text-muted">Gestión de inventarios</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase text-slate-500">Acceso seguro</p>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Bienvenido a LOGENT</h2>
            <p className="text-sm leading-6 text-muted">
              Ingresa con tus credenciales para continuar al panel administrativo.
            </p>
          </div>

          <Card className="border-slate-200 bg-white shadow-[0_10px_24px_rgb(15_23_42/0.06)]">
            <CardHeader className="border-b-0 px-7 pb-2 pt-7">
              <CardTitle>Iniciar sesión</CardTitle>
              <CardDescription>Accede al panel administrativo de LOGENT.</CardDescription>
            </CardHeader>
            <CardContent className="px-7 pb-7 pt-5">
              <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground" htmlFor="email">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                    <input
                      autoComplete="email"
                      className="h-12 w-full rounded-xl border border-border bg-white pl-10 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-slate-400 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
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
                    Contraseña
                  </label>
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                    <input
                      autoComplete="current-password"
                      className="h-12 w-full rounded-xl border border-border bg-white pl-10 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-slate-400 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
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

                <Button
                  className="h-12 w-full bg-blue-600 text-sm shadow-sm shadow-blue-900/10 hover:bg-blue-700"
                  disabled={isSubmitting}
                  type="submit"
                >
                  {isSubmitting ? 'Validando...' : 'Entrar'}
                </Button>
              </form>

              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                <p className="text-xs font-semibold uppercase text-muted">Credenciales demo</p>
                <p className="mt-2 text-sm font-medium text-foreground">admin@inventorysaas.com</p>
                <p className="text-sm text-muted">Admin123</p>
                <p className="mt-3 text-xs leading-5 text-muted">Ambiente local de demostración.</p>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted">
            LOGENT · Gestión de inventarios para operaciones empresariales
          </p>
        </div>
      </section>
    </main>
  )
}

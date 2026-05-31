import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Building2, LockKeyhole, Mail, MapPin, Phone, UserRound } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import logentLogo from '../../assets/brand/logent-logo.png'
import { LoadingState } from '../../components/common/LoadingState'
import { getApiErrorMessage } from '../../lib/api-error'
import { registerCompanySchema, type RegisterCompanyFormValues } from './register-company.schema'
import { useAuth } from './useAuth'
import './RegisterCompanyPage.css'

export function RegisterCompanyPage() {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading, registerCompany } = useAuth()

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<RegisterCompanyFormValues>({
    resolver: zodResolver(registerCompanySchema),
    defaultValues: {
      address: '',
      adminEmail: '',
      adminFullName: '',
      adminPassword: '',
      companyName: '',
      confirmPassword: '',
      email: '',
      phone: '',
      ruc: '',
    },
  })

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate])

  async function onSubmit(values: RegisterCompanyFormValues) {
    try {
      await registerCompany(values)
      toast.success('Empresa registrada correctamente.')
      navigate('/dashboard', { replace: true })
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudo registrar la empresa. Revisa los datos e inténtalo nuevamente.'))
    }
  }

  if (isLoading) {
    return (
      <main className="logent-register-loading">
        <LoadingState text="Validando sesión..." />
      </main>
    )
  }

  if (isAuthenticated) {
    return <Navigate replace to="/dashboard" />
  }

  return (
    <main className="logent-register">
      <Link className="logent-register-back" to="/">
        <ArrowLeft size={16} />
        Volver al inicio
      </Link>

      <section className="logent-register-shell">
        <header className="logent-register-header">
          <img alt="LOGENT" className="logent-register-logo" src={logentLogo} />
          <p className="logent-register-eyebrow">Registro de empresa</p>
          <h1>Crea el espacio de trabajo de tu empresa</h1>
          <p>Configura tu organización y el acceso del primer administrador para comenzar a operar en LOGENT.</p>
        </header>

        <form className="logent-register-card" onSubmit={handleSubmit(onSubmit)}>
          <section className="logent-register-section">
            <div className="logent-register-section-heading">
              <Building2 size={18} />
              <div>
                <h2>Datos de la empresa</h2>
                <p>Información principal de la organización.</p>
              </div>
            </div>

            <div className="logent-register-grid">
              <label className="logent-register-field logent-register-field-wide">
                <span>Nombre de la empresa</span>
                <div className="logent-register-input-wrap">
                  <Building2 size={16} />
                  <input autoComplete="organization" placeholder="Empresa Prueba SAC" {...register('companyName')} />
                </div>
                {errors.companyName ? <small>{errors.companyName.message}</small> : null}
              </label>

              <label className="logent-register-field">
                <span>RUC <em>Opcional</em></span>
                <div className="logent-register-input-wrap">
                  <Building2 size={16} />
                  <input inputMode="numeric" placeholder="20600000001" {...register('ruc')} />
                </div>
                {errors.ruc ? <small>{errors.ruc.message}</small> : null}
              </label>

              <label className="logent-register-field">
                <span>Email de la empresa</span>
                <div className="logent-register-input-wrap">
                  <Mail size={16} />
                  <input autoComplete="email" placeholder="contacto@empresa.com" type="email" {...register('email')} />
                </div>
                {errors.email ? <small>{errors.email.message}</small> : null}
              </label>

              <label className="logent-register-field">
                <span>Teléfono <em>Opcional</em></span>
                <div className="logent-register-input-wrap">
                  <Phone size={16} />
                  <input autoComplete="tel" placeholder="999888777" type="tel" {...register('phone')} />
                </div>
                {errors.phone ? <small>{errors.phone.message}</small> : null}
              </label>

              <label className="logent-register-field">
                <span>Dirección <em>Opcional</em></span>
                <div className="logent-register-input-wrap">
                  <MapPin size={16} />
                  <input autoComplete="street-address" placeholder="Lima, Perú" {...register('address')} />
                </div>
                {errors.address ? <small>{errors.address.message}</small> : null}
              </label>
            </div>
          </section>

          <section className="logent-register-section">
            <div className="logent-register-section-heading">
              <UserRound size={18} />
              <div>
                <h2>Administrador inicial</h2>
                <p>Esta cuenta tendrá permisos de administración dentro de la empresa.</p>
              </div>
            </div>

            <div className="logent-register-grid">
              <label className="logent-register-field logent-register-field-wide">
                <span>Nombre completo</span>
                <div className="logent-register-input-wrap">
                  <UserRound size={16} />
                  <input autoComplete="name" placeholder="Administrador Prueba" {...register('adminFullName')} />
                </div>
                {errors.adminFullName ? <small>{errors.adminFullName.message}</small> : null}
              </label>

              <label className="logent-register-field logent-register-field-wide">
                <span>Email del administrador</span>
                <div className="logent-register-input-wrap">
                  <Mail size={16} />
                  <input autoComplete="email" placeholder="admin@empresa.com" type="email" {...register('adminEmail')} />
                </div>
                {errors.adminEmail ? <small>{errors.adminEmail.message}</small> : null}
              </label>

              <label className="logent-register-field">
                <span>Contraseña</span>
                <div className="logent-register-input-wrap">
                  <LockKeyhole size={16} />
                  <input autoComplete="new-password" placeholder="Mínimo 6 caracteres" type="password" {...register('adminPassword')} />
                </div>
                {errors.adminPassword ? <small>{errors.adminPassword.message}</small> : null}
              </label>

              <label className="logent-register-field">
                <span>Confirmar contraseña</span>
                <div className="logent-register-input-wrap">
                  <LockKeyhole size={16} />
                  <input autoComplete="new-password" placeholder="Repite la contraseña" type="password" {...register('confirmPassword')} />
                </div>
                {errors.confirmPassword ? <small>{errors.confirmPassword.message}</small> : null}
              </label>
            </div>
          </section>

          <footer className="logent-register-actions">
            <p>
              ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link>
            </p>

            <button disabled={isSubmitting} type="submit">
              {isSubmitting ? 'Creando empresa...' : 'Crear cuenta de empresa'}
            </button>
          </footer>
        </form>
      </section>
    </main>
  )
}

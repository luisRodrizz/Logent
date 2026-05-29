import { zodResolver } from '@hookform/resolvers/zod'
import { motion, type Variants } from 'framer-motion'
import { ArrowLeft, LockKeyhole, Mail, ShieldCheck } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'

import { LoadingState } from '../../components/common/LoadingState'
import logentLogo from '../../assets/brand/logent-logo.png'
import { useAuth } from './useAuth'
import './LoginPage.css'

const loginSchema = z.object({
  email: z.string().min(1, 'Ingresa tu email.').email('Ingresa un email válido.'),
  password: z.string().min(1, 'Ingresa tu contraseña.'),
})

type LoginFormValues = z.infer<typeof loginSchema>

const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.42,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

const fadeIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.985,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

const stagger: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
}

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
      email: 'admin@inventorysaas.com',
      password: 'Admin123',
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

  function handleForgotPassword() {
    toast.info('Recuperación de contraseña simulada. Esta función se implementará en una fase posterior.')
  }

  if (isLoading) {
    return (
      <main className="logent-login-loading">
        <LoadingState text="Validando sesión..." />
      </main>
    )
  }

  if (isAuthenticated) {
    return <Navigate replace to="/dashboard" />
  }

  return (
    <main className="logent-login">
      <Link className="logent-login-back" to="/">
        <ArrowLeft size={16} />
        Volver al inicio
      </Link>

      <motion.section
        animate="visible"
        className="logent-login-shell"
        initial="hidden"
        variants={stagger}
      >
        <motion.div className="logent-login-brand" variants={fadeUp}>
          <motion.img
            alt="LOGENT"
            className="logent-login-logo"
            src={logentLogo}
            transition={{
              duration: 0.18,
              ease: [0.22, 1, 0.36, 1],
            }}
            whileHover={{
              scale: 1.025,
            }}
          />

          <p className="logent-login-eyebrow">Panel privado</p>
          <p>
            Ingresa a LOGENT para controlar stock, movimientos, Kardex, reportes y auditoría desde un entorno seguro.
          </p>
        </motion.div>

        <motion.form className="logent-login-card" onSubmit={handleSubmit(onSubmit)} variants={fadeIn}>
          <div className="logent-login-card-head">
            <h2>Iniciar sesión</h2>
            <span>Usa tus credenciales para acceder al sistema.</span>
          </div>

          <div className="logent-login-field">
            <label htmlFor="email">Email</label>

            <div className="logent-login-input-wrap">
              <Mail size={17} />
              <input
                autoComplete="email"
                id="email"
                placeholder="admin@inventorysaas.com"
                type="email"
                {...register('email')}
              />
            </div>

            {errors.email ? <p className="logent-login-error">{errors.email.message}</p> : null}
          </div>

          <div className="logent-login-field">
            <label htmlFor="password">Contraseña</label>

            <div className="logent-login-input-wrap">
              <LockKeyhole size={17} />
              <input
                autoComplete="current-password"
                id="password"
                placeholder="Admin123"
                type="password"
                {...register('password')}
              />
            </div>

            {errors.password ? <p className="logent-login-error">{errors.password.message}</p> : null}
          </div>

          <button className="logent-login-submit" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Validando...' : 'Entrar'}
          </button>

          <button className="logent-login-forgot" onClick={handleForgotPassword} type="button">
            ¿Olvidaste tu contraseña?
          </button>

          <div className="logent-login-demo">
            <div className="logent-login-demo-head">
              <div>
                <ShieldCheck size={16} />
                <strong>Credenciales demo</strong>
              </div>
              <span>Demo</span>
            </div>

            <div className="logent-login-demo-row">
              <span>Email</span>
              <code>admin@inventorysaas.com</code>
            </div>

            <div className="logent-login-demo-row">
              <span>Password</span>
              <code>Admin123</code>
            </div>
          </div>
        </motion.form>

        <motion.p className="logent-login-note" variants={fadeUp}>
          LOGENT · Gestión de inventarios para operaciones empresariales
        </motion.p>
      </motion.section>
    </main>
  )
}
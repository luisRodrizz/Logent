import { LogOut, Menu, UserRound } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/useAuth'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'

type TopbarProps = {
  description: string
  onMenuClick: () => void
  title: string
}

const pageTitles = [
  { match: '/admin/users', subtitle: 'Cuentas y roles internos', title: 'Usuarios' },
  { match: '/settings/company', subtitle: 'Cuenta y organización', title: 'Empresa' },
  { match: '/plan', subtitle: 'Capacidad y plan actual', title: 'Plan y uso' },
  { match: '/profile', subtitle: 'Cuenta y seguridad', title: 'Mi perfil' },
  { match: '/audit-logs', subtitle: 'Administración', title: 'Auditoría' },
  { match: '/categories', subtitle: 'Datos maestros', title: 'Categorías' },
  { match: '/suppliers', subtitle: 'Datos maestros', title: 'Proveedores' },
  { match: '/warehouses', subtitle: 'Datos maestros', title: 'Almacenes' },
  { match: '/products', subtitle: 'Datos maestros', title: 'Productos' },
  { match: '/stock', subtitle: 'Operación', title: 'Stock' },
  { match: '/movements', subtitle: 'Operación', title: 'Movimientos' },
  { match: '/kardex', subtitle: 'Operación', title: 'Kardex' },
  { match: '/reports', subtitle: 'Análisis', title: 'Reportes' },
  { match: '/dashboard', subtitle: 'Resumen operativo', title: 'Dashboard' },
]

function getPageTitle(pathname: string, fallback: { subtitle: string; title: string }) {
  return pageTitles.find((page) => pathname === page.match || pathname.startsWith(`${page.match}/`)) ?? fallback
}

export function Topbar({ description, onMenuClick, title }: TopbarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const displayName = user?.fullName || user?.userName || user?.email || 'Usuario'
  const currentPage = getPageTitle(location.pathname, { subtitle: description, title })

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-white/95 shadow-[0_1px_2px_rgb(15_23_42/0.03)] backdrop-blur">
      <div className="flex min-h-[68px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            aria-label="Abrir menú"
            className="h-10 w-10 shrink-0 p-0 lg:hidden"
            onClick={onMenuClick}
            variant="secondary"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold uppercase tracking-wide text-muted">LOGENT</p>
            <div className="flex min-w-0 items-baseline gap-2">
              <h1 className="truncate text-lg font-semibold text-foreground">{currentPage.title}</h1>
              <span className="hidden text-sm text-muted md:inline">{currentPage.subtitle}</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden items-center gap-1.5 xl:flex">
            {user?.roles.map((role) => (
              <Badge className="bg-slate-50 text-slate-600 ring-slate-200" key={role} variant="muted">
                {role}
              </Badge>
            ))}
          </div>
          <div className="hidden items-center gap-3 border-l border-border pl-3 md:flex">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <UserRound className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="max-w-44 truncate text-sm font-semibold text-foreground">{displayName}</p>
              <p className="text-xs text-muted">Sesión activa</p>
            </div>
          </div>
          <Link
            aria-label="Mi perfil"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white px-0 text-sm font-semibold text-foreground transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6] focus-visible:ring-offset-2 sm:w-auto sm:px-3"
            to="/profile"
          >
            <UserRound className="h-4 w-4 sm:hidden" />
            <span className="hidden sm:inline">Mi perfil</span>
          </Link>
          <Button aria-label="Salir" className="shrink-0" onClick={handleLogout} size="sm" variant="ghost">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Salir</span>
          </Button>
        </div>
      </div>
    </header>
  )
}

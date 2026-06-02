import { ArrowUpCircle, Building2, LayoutDashboard, LogOut, Menu, ShieldCheck, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import logentLogo from '../../assets/brand/logent-logo.png'
import { Button } from '../../components/ui/Button'
import { cn } from '../../lib/utils'
import { useAuth } from '../auth/useAuth'
import { usePlatformDashboardSummary } from './platform-dashboard.queries'

const platformNavigation = [
  {
    href: '/platform',
    icon: LayoutDashboard,
    label: 'Dashboard',
  },
  {
    href: '/platform/companies',
    icon: Building2,
    label: 'Empresas',
  },
  {
    href: '/platform/upgrade-requests',
    icon: ArrowUpCircle,
    label: 'Solicitudes',
  },
]

function PlatformNavigation({
  onNavigate,
  pendingUpgradeRequests,
}: {
  onNavigate?: () => void
  pendingUpgradeRequests?: number
}) {
  return (
    <nav className="space-y-1" aria-label="Navegación de plataforma">
      {platformNavigation.map((item) => {
        const Icon = item.icon

        return (
          <NavLink
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[#1017D8]/5 text-primary ring-1 ring-inset ring-[#1017D8]/10'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
              )
            }
            key={item.href}
            end={item.href === '/platform'}
            onClick={onNavigate}
            to={item.href}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
            {item.href === '/platform/upgrade-requests' && pendingUpgradeRequests ? (
              <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
                {pendingUpgradeRequests}
              </span>
            ) : null}
          </NavLink>
        )
      })}
    </nav>
  )
}

function PlatformSidebar({
  onNavigate,
  pendingUpgradeRequests,
}: {
  onNavigate?: () => void
  pendingUpgradeRequests?: number
}) {
  return (
    <div className="flex h-full flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-6 py-6">
        <img className="h-auto w-36 object-contain" src={logentLogo} alt="LOGENT" />
        <div className="mt-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          <ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />
          Plataforma
        </div>
      </div>

      <div className="flex-1 px-4 py-5">
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          Administración global
        </p>
        <PlatformNavigation onNavigate={onNavigate} pendingUpgradeRequests={pendingUpgradeRequests} />
      </div>

      <div className="border-t border-slate-200 px-6 py-4">
        <p className="text-xs font-semibold text-slate-700">LOGENT Platform</p>
        <p className="mt-1 text-xs text-slate-500">Control multiempresa</p>
      </div>
    </div>
  )
}

export function PlatformLayout() {
  const [isMobileNavigationOpen, setIsMobileNavigationOpen] = useState(false)
  const { logout, user } = useAuth()
  const dashboardSummaryQuery = usePlatformDashboardSummary()
  const location = useLocation()
  const navigate = useNavigate()
  const pageTitle = location.pathname === '/platform'
    ? 'Dashboard'
    : location.pathname.includes('/upgrade-requests/')
    ? 'Detalle de solicitud'
    : location.pathname === '/platform/upgrade-requests'
      ? 'Solicitudes de plan'
      : location.pathname.includes('/companies/')
        ? 'Detalle de empresa'
        : 'Empresas'

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">
        <PlatformSidebar pendingUpgradeRequests={dashboardSummaryQuery.data?.pendingUpgradeRequests} />
      </aside>

      {isMobileNavigationOpen ? (
        <div className="fixed inset-0 z-[90] lg:hidden">
          <button
            aria-label="Cerrar navegación"
            className="absolute inset-0 bg-slate-950/35"
            onClick={() => setIsMobileNavigationOpen(false)}
            type="button"
          />
          <aside className="relative h-full w-72 max-w-[86vw] shadow-xl">
            <button
              aria-label="Cerrar navegación"
              className="absolute right-3 top-3 z-10 rounded-md p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-950"
              onClick={() => setIsMobileNavigationOpen(false)}
              type="button"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            <PlatformSidebar
              onNavigate={() => setIsMobileNavigationOpen(false)}
              pendingUpgradeRequests={dashboardSummaryQuery.data?.pendingUpgradeRequests}
            />
          </aside>
        </div>
      ) : null}

      <div className="min-h-screen lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                aria-label="Abrir navegación"
                className="rounded-md p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 lg:hidden"
                onClick={() => setIsMobileNavigationOpen(true)}
                type="button"
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </button>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-950">{pageTitle}</p>
                <p className="truncate text-xs text-slate-500">Administración global de LOGENT</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden min-w-0 text-right sm:block">
                <p className="truncate text-sm font-semibold text-slate-800">{user?.fullName || user?.email}</p>
                <p className="text-xs text-slate-500">SuperAdmin</p>
              </div>
              <Button aria-label="Cerrar sesión" onClick={handleLogout} size="sm" variant="secondary">
                <LogOut className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Cerrar sesión</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1500px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

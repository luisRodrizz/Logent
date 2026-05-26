import { LogOut, Menu, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/useAuth'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'

type TopbarProps = {
  description: string
  onMenuClick: () => void
  title: string
}

export function Topbar({ description, onMenuClick, title }: TopbarProps) {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const displayName = user?.fullName || user?.userName || user?.email || 'Usuario'

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-white/95 shadow-[0_1px_2px_rgb(15_23_42/0.03)] backdrop-blur">
      <div className="flex min-h-[68px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            aria-label="Abrir menu"
            className="h-10 w-10 shrink-0 p-0 lg:hidden"
            onClick={onMenuClick}
            variant="secondary"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold uppercase tracking-wide text-muted">InventorySaaS</p>
            <div className="flex min-w-0 items-baseline gap-2">
              <h1 className="truncate text-lg font-semibold text-foreground">{title}</h1>
              <span className="hidden text-sm text-muted md:inline">{description}</span>
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
              <p className="text-xs text-muted">Sesion activa</p>
            </div>
          </div>
          <Button aria-label="Salir" className="shrink-0" onClick={handleLogout} size="sm" variant="ghost">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Salir</span>
          </Button>
        </div>
      </div>
    </header>
  )
}

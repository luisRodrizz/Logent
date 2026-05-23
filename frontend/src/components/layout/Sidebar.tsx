import { Boxes, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../features/auth/useAuth'
import { Badge } from '../ui/Badge'
import { NavItem } from './NavItem'
import { getNavigationItemsForRoles } from './navigation'

type SidebarProps = {
  onNavigate?: () => void
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const { user } = useAuth()
  const visibleNavigationItems = getNavigationItemsForRoles(user?.roles ?? [])

  return (
    <aside className="flex h-full w-72 flex-col border-r border-slate-800 bg-sidebar text-white">
      <div className="border-b border-white/10 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-sidebar ring-1 ring-white/10">
            <Boxes className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold">InventorySaaS</p>
            <p className="truncate text-xs text-slate-400">Operations Console</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Navegacion principal">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Modulos</p>
        <div className="space-y-0.5">
          {visibleNavigationItems.map((item) => (
            <NavItem item={item} key={item.href} onNavigate={onNavigate} />
          ))}
        </div>
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="rounded-lg border border-white/10 bg-slate-900 px-3 py-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-300">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold">Workspace</p>
                <Badge className="bg-emerald-400/10 text-emerald-200 ring-emerald-300/20" variant="success">
                  Dev
                </Badge>
              </div>
              <p className="mt-1 text-xs leading-5 text-slate-400">Sesion JWT activa y navegacion ajustada por rol.</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

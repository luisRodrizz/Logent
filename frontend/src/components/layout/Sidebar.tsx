import { Boxes, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../features/auth/useAuth'
import { Badge } from '../ui/Badge'
import { NavItem } from './NavItem'
import { getNavigationGroupsForRoles } from './navigation'

type SidebarProps = {
  onNavigate?: () => void
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const { user } = useAuth()
  const visibleNavigationGroups = getNavigationGroupsForRoles(user?.roles ?? [])
  const visibleNavigationCount = visibleNavigationGroups.reduce((total, group) => total + group.items.length, 0)
  const userRoles = user?.roles ?? []

  return (
    <aside className="flex h-full w-72 flex-col border-r border-slate-800 bg-sidebar text-white shadow-[1px_0_0_rgb(255_255_255/0.03)]">
      <div className="border-b border-white/10 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-sidebar shadow-sm ring-1 ring-white/10">
            <Boxes className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold tracking-tight">InventorySaaS</p>
            <p className="truncate text-xs font-medium text-slate-400">Operations Console</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Navegacion principal">
        <div className="mb-3 flex items-center justify-between px-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Modulos</p>
          <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
            {visibleNavigationCount}
          </span>
        </div>
        <div className="space-y-4">
          {visibleNavigationGroups.map((group, index) => (
            <div className={index > 0 ? 'border-t border-white/[0.06] pt-4' : undefined} key={group.label}>
              <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavItem item={item} key={item.href} onNavigate={onNavigate} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>

      <div className="border-t border-white/10 px-3 py-4">
        <div className="rounded-lg border border-white/10 bg-white/[0.035] px-3 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-teal-300 ring-1 ring-white/10">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center justify-between gap-2">
                <p className="truncate text-sm font-semibold">Workspace</p>
                <Badge className="bg-white/[0.06] text-slate-300 ring-white/10" variant="muted">
                  Dev
                </Badge>
              </div>
              <p className="mt-1 truncate text-xs text-slate-500">
                {userRoles.length > 0 ? userRoles.join(' / ') : 'Sesion activa'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

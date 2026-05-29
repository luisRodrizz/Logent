import { useAuth } from '../../features/auth/useAuth'
import logentLogo from '../../assets/brand/logent-logo.png'
import { NavItem } from './NavItem'
import { getNavigationGroupsForRoles } from './navigation'

type SidebarProps = {
  onNavigate?: () => void
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const { user } = useAuth()
  const visibleNavigationGroups = getNavigationGroupsForRoles(user?.roles ?? [])
  const userRoles = user?.roles ?? []
  const primaryRole = userRoles[0] ?? 'Sesión activa'

  return (
    <aside className="flex h-full min-h-0 w-72 flex-col overflow-hidden border-r border-border bg-white text-foreground">
      <div className="shrink-0 border-b border-border px-5 py-7">
        <div className="flex justify-center">
          <img
            alt="LOGENT"
            className="h-auto max-h-11 w-full max-w-[168px] object-contain"
            src={logentLogo}
          />
        </div>
      </div>

      <nav className="scrollbar-none min-h-0 flex-1 overflow-y-auto px-3 py-3" aria-label="Navegación principal">
        <div className="space-y-2.5">
          {visibleNavigationGroups.map((group, index) => (
            <div className={index > 0 ? 'border-t border-slate-100 pt-2.5' : undefined} key={group.label}>
              <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
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

      <div className="shrink-0 border-t border-border px-5 py-3">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <p className="truncate text-xs font-medium text-slate-700">{primaryRole} · Dev</p>
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#28E000]" />
        </div>
        <p className="mt-0.5 truncate text-[11px] leading-4 text-muted">Control operativo activo</p>
      </div>
    </aside>
  )
}

import { Boxes } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { NavItem } from './NavItem'
import { navigationItems } from './navigation'

type SidebarProps = {
  onNavigate?: () => void
}

export function Sidebar({ onNavigate }: SidebarProps) {
  return (
    <aside className="flex h-full w-72 flex-col bg-sidebar text-white">
      <div className="border-b border-white/10 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-sidebar">
            <Boxes className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold">InventorySaaS</p>
            <p className="truncate text-xs text-slate-400">Inventory Platform</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5" aria-label="Navegacion principal">
        {navigationItems.map((item) => (
          <NavItem item={item} key={item.href} onNavigate={onNavigate} />
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="rounded-xl border border-white/10 bg-slate-900/80 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold">Workspace</p>
            <Badge variant="success">Dev</Badge>
          </div>
          <p className="text-xs leading-5 text-slate-400">Shell administrativo listo para autenticacion en Fase 21.</p>
        </div>
      </div>
    </aside>
  )
}

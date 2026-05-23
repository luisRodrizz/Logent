import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/utils'
import type { NavigationItem } from './navigation'

type NavItemProps = {
  item: NavigationItem
  onNavigate?: () => void
}

export function NavItem({ item, onNavigate }: NavItemProps) {
  const Icon = item.icon

  return (
    <NavLink
      className={({ isActive }) =>
        cn(
          'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white',
          isActive && 'bg-white/[0.08] text-white ring-1 ring-white/10 hover:bg-white/[0.1]',
        )
      }
      onClick={onNavigate}
      to={item.href}
    >
      <Icon className="h-4 w-4 shrink-0 text-current opacity-70 transition-opacity group-hover:opacity-100" />
      <span className="truncate">{item.label}</span>
    </NavLink>
  )
}

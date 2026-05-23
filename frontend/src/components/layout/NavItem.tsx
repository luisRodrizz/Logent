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
          'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white',
          isActive && 'bg-primary text-white shadow-sm shadow-blue-950/20 hover:bg-primary',
        )
      }
      onClick={onNavigate}
      to={item.href}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{item.label}</span>
    </NavLink>
  )
}

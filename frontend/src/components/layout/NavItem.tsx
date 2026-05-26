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
          'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 outline-none transition-colors hover:bg-white/[0.055] hover:text-white focus-visible:ring-2 focus-visible:ring-white/15',
          isActive &&
            'bg-white/[0.075] text-white shadow-[inset_3px_0_0_rgb(20_184_166)] ring-1 ring-white/10 hover:bg-white/[0.095]',
        )
      }
      onClick={onNavigate}
      to={item.href}
    >
      <Icon className="h-4 w-4 shrink-0 text-current opacity-75 transition-opacity group-hover:opacity-100" />
      <span className="truncate">{item.label}</span>
    </NavLink>
  )
}

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
          'group relative flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 outline-none transition-colors hover:bg-slate-50 hover:text-foreground focus-visible:ring-2 focus-visible:ring-[#14B8A6]/30',
          isActive &&
            'bg-[#ECFDF3] text-foreground shadow-[inset_3px_0_0_#28E000] ring-1 ring-[#28E000]/20 hover:bg-[#ECFDF3] [&>svg]:text-[#147A08]',
        )
      }
      onClick={onNavigate}
      to={item.href}
    >
      <Icon className="h-4 w-4 shrink-0 text-current opacity-80 transition-colors group-hover:text-[#147A08] group-hover:opacity-100" />
      <span className="truncate">{item.label}</span>
    </NavLink>
  )
}

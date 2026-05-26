import { X } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from '../ui/Button'
import { Sidebar } from './Sidebar'

type MobileSidebarProps = {
  isOpen: boolean
  onClose: () => void
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  return (
    <div className={cn('fixed inset-0 z-[70] lg:hidden', !isOpen && 'pointer-events-none')}>
      <div
        className={cn(
          'absolute inset-0 bg-slate-950/55 backdrop-blur-[1px] transition-opacity',
          isOpen ? 'opacity-100' : 'opacity-0',
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          'absolute inset-y-0 left-0 w-72 max-w-[86vw] shadow-2xl shadow-slate-950/35 transition-transform duration-200',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <Sidebar onNavigate={onClose} />
        <Button
          aria-label="Cerrar menu"
          className="absolute right-3 top-3 h-9 w-9 rounded-full bg-white/10 p-0 text-white hover:bg-white/20 focus-visible:ring-white/30"
          onClick={onClose}
          variant="ghost"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

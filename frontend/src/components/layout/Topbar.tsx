import { LogOut, Menu, UserRound } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'

type TopbarProps = {
  description: string
  onMenuClick: () => void
  title: string
}

export function Topbar({ description, onMenuClick, title }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-white/90 backdrop-blur">
      <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
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
            <p className="truncate text-sm font-medium text-muted">{description}</p>
            <h1 className="truncate text-lg font-semibold text-foreground">{title}</h1>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Badge className="hidden sm:inline-flex" variant="warning">
            Development
          </Badge>
          <div className="hidden items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 md:flex">
            <UserRound className="h-4 w-4 text-muted" />
            <span className="text-sm font-semibold text-foreground">Admin</span>
          </div>
          <Button aria-label="Salir" size="sm" variant="ghost">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Salir</span>
          </Button>
        </div>
      </div>
    </header>
  )
}

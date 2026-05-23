import type { ReactNode } from 'react'
import { Card, CardContent } from '../ui/Card'

type EmptyStateProps = {
  action?: ReactNode
  description: string
  icon?: ReactNode
  title: string
}

export function EmptyState({ action, description, icon, title }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center px-6 py-12 text-center">
        {icon && (
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
            {icon}
          </div>
        )}
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted">{description}</p>
        {action && <div className="mt-6">{action}</div>}
      </CardContent>
    </Card>
  )
}

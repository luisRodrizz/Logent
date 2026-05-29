import type { ReactNode } from 'react'

type PageHeaderProps = {
  action?: ReactNode
  description?: string
  eyebrow?: string
  title: string
}

export function PageHeader({ action, description, eyebrow, title }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 space-y-1.5">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-wide text-[#147A08]">{eyebrow}</p>
        ) : null}
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h1>
        {description && <p className="max-w-2xl text-sm leading-6 text-muted">{description}</p>}
      </div>
      {action && <div className="flex w-full shrink-0 items-center gap-2 sm:w-auto">{action}</div>}
    </div>
  )
}

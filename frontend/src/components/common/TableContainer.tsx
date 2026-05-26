import type { ReactNode } from 'react'

type TableContainerProps = {
  children: ReactNode
}

export function TableContainer({ children }: TableContainerProps) {
  return (
    <div className="w-full min-w-0 overflow-hidden rounded-lg border border-border">
      <div className="w-full overflow-x-auto">{children}</div>
    </div>
  )
}

import type { ReactNode } from 'react'

type TableContainerProps = {
  children: ReactNode
}

export function TableContainer({ children }: TableContainerProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="overflow-x-auto">{children}</div>
    </div>
  )
}

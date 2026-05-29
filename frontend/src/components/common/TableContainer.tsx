import type { ReactNode } from 'react'

type TableContainerProps = {
  children: ReactNode
}

export function TableContainer({ children }: TableContainerProps) {
  return (
    <div className="w-full min-w-0 overflow-hidden rounded-lg border border-border bg-white shadow-[0_1px_2px_rgb(15_23_42/0.03)]">
      <div className="w-full overflow-x-auto">{children}</div>
    </div>
  )
}

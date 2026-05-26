import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'

type ModalOverlayProps = {
  children: ReactNode
}

export function ModalOverlay({ children }: ModalOverlayProps) {
  return createPortal(
    <div className="fixed inset-0 z-[80] flex min-h-screen w-full items-start justify-center overflow-y-auto bg-slate-950/45 px-4 py-6 backdrop-blur-[1px] sm:items-center sm:py-8">
      {children}
    </div>,
    document.body,
  )
}

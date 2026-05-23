type LoadingStateProps = {
  text?: string
}

export function LoadingState({ text = 'Cargando...' }: LoadingStateProps) {
  return (
    <div className="flex min-h-40 items-center justify-center gap-3 px-4 text-center text-sm font-medium text-muted">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-primary" />
      {text}
    </div>
  )
}

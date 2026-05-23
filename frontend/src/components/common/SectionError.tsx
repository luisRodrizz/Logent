type SectionErrorProps = {
  text?: string
}

export function SectionError({ text = 'No se pudo cargar esta seccion.' }: SectionErrorProps) {
  return (
    <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
      {text}
    </div>
  )
}

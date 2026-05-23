const shortDateFormatter = new Intl.DateTimeFormat('es-PE', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const dateTimeFormatter = new Intl.DateTimeFormat('es-PE', {
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  month: 'short',
  year: 'numeric',
})

const numberFormatter = new Intl.NumberFormat('es-PE')

const currencyFormatter = new Intl.NumberFormat('es-PE', {
  currency: 'PEN',
  maximumFractionDigits: 2,
  style: 'currency',
})

function parseDate(value?: string | null): Date | null {
  if (!value) {
    return null
  }

  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? null : date
}

export function formatDate(value?: string | null, fallback = 'Sin fecha'): string {
  const date = parseDate(value)

  return date ? shortDateFormatter.format(date) : fallback
}

export function formatDateTime(value?: string | null, fallback = 'Sin fecha'): string {
  const date = parseDate(value)

  return date ? dateTimeFormatter.format(date) : fallback
}

export function formatNumber(value?: number | null, fallback = '0'): string {
  return typeof value === 'number' && Number.isFinite(value) ? numberFormatter.format(value) : fallback
}

export function formatCurrency(value?: number | null, fallback = 'S/ 0.00'): string {
  return typeof value === 'number' && Number.isFinite(value) ? currencyFormatter.format(value) : fallback
}

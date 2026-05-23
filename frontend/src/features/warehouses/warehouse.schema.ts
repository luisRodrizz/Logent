import { z } from 'zod'

export const warehouseSchema = z.object({
  description: z.string().max(300, 'La descripcion no puede superar 300 caracteres.').optional(),
  location: z.string().max(200, 'La ubicacion no puede superar 200 caracteres.').optional(),
  name: z
    .string()
    .trim()
    .min(1, 'Ingresa el nombre del almacen.')
    .max(120, 'El nombre no puede superar 120 caracteres.'),
})

export type WarehouseFormValues = z.infer<typeof warehouseSchema>

function normalizeOptionalText(value?: string): string | null {
  const normalized = value?.trim()

  return normalized ? normalized : null
}

export function toWarehousePayload(values: WarehouseFormValues) {
  return {
    description: normalizeOptionalText(values.description),
    location: normalizeOptionalText(values.location),
    name: values.name.trim(),
  }
}

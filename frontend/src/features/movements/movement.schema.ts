import { z } from 'zod'
import type { CreateMovementRequest, MovementType } from '../../types/movement'

export const movementTypes = ['Entry', 'Exit', 'Transfer'] as const satisfies MovementType[]

const movementDetailSchema = z.object({
  productId: z.string().min(1, 'Selecciona un producto.'),
  quantity: z
    .number()
    .int('La cantidad debe ser un numero entero.')
    .min(1, 'La cantidad debe ser mayor que cero.'),
  unitCost: z.number().min(0, 'El costo unitario no puede ser negativo.'),
})

export const movementSchema = z
  .object({
    details: z.array(movementDetailSchema).min(1, 'Agrega al menos un producto.'),
    observation: z.string().max(500, 'La observacion no puede superar 500 caracteres.').optional(),
    type: z.enum(movementTypes),
    warehouseDestinationId: z.string().optional(),
    warehouseOriginId: z.string().optional(),
  })
  .superRefine((values, context) => {
    if (values.type === 'Entry' && !values.warehouseDestinationId) {
      context.addIssue({
        code: 'custom',
        message: 'Selecciona el almacen destino.',
        path: ['warehouseDestinationId'],
      })
    }

    if (values.type === 'Exit' && !values.warehouseOriginId) {
      context.addIssue({
        code: 'custom',
        message: 'Selecciona el almacen origen.',
        path: ['warehouseOriginId'],
      })
    }

    if (values.type === 'Transfer') {
      if (!values.warehouseOriginId) {
        context.addIssue({
          code: 'custom',
          message: 'Selecciona el almacen origen.',
          path: ['warehouseOriginId'],
        })
      }

      if (!values.warehouseDestinationId) {
        context.addIssue({
          code: 'custom',
          message: 'Selecciona el almacen destino.',
          path: ['warehouseDestinationId'],
        })
      }

      if (values.warehouseOriginId && values.warehouseOriginId === values.warehouseDestinationId) {
        context.addIssue({
          code: 'custom',
          message: 'El origen y destino deben ser diferentes.',
          path: ['warehouseDestinationId'],
        })
      }
    }
  })

export type MovementFormValues = z.infer<typeof movementSchema>

function normalizeOptionalText(value?: string): string | null {
  const normalized = value?.trim()

  return normalized ? normalized : null
}

export function toMovementPayload(values: MovementFormValues): CreateMovementRequest {
  return {
    details: values.details.map((detail) => ({
      productId: detail.productId,
      quantity: detail.quantity,
      unitCost: detail.unitCost,
    })),
    observation: normalizeOptionalText(values.observation),
    type: values.type,
    warehouseDestinationId:
      values.type === 'Entry' || values.type === 'Transfer' ? normalizeOptionalText(values.warehouseDestinationId) : null,
    warehouseOriginId:
      values.type === 'Exit' || values.type === 'Transfer' ? normalizeOptionalText(values.warehouseOriginId) : null,
  }
}

import { z } from 'zod'

export const productSchema = z.object({
  categoryId: z.string().min(1, 'Selecciona una categoria.'),
  code: z.string().trim().min(1, 'Ingresa el codigo del producto.').max(50, 'El codigo no puede superar 50 caracteres.'),
  description: z.string().max(500, 'La descripcion no puede superar 500 caracteres.').optional(),
  minimumStock: z
    .number()
    .int('El stock minimo debe ser un numero entero.')
    .min(0, 'El stock minimo no puede ser negativo.'),
  name: z.string().trim().min(1, 'Ingresa el nombre del producto.').max(160, 'El nombre no puede superar 160 caracteres.'),
  purchasePrice: z.number().min(0, 'El precio de compra no puede ser negativo.'),
  salePrice: z.number().min(0, 'El precio de venta no puede ser negativo.'),
  supplierId: z.string().optional(),
})

export type ProductFormValues = z.infer<typeof productSchema>

function normalizeOptionalText(value?: string): string | null {
  const normalized = value?.trim()

  return normalized ? normalized : null
}

export function toProductPayload(values: ProductFormValues) {
  return {
    categoryId: values.categoryId,
    code: values.code.trim(),
    description: normalizeOptionalText(values.description),
    minimumStock: values.minimumStock,
    name: values.name.trim(),
    purchasePrice: values.purchasePrice,
    salePrice: values.salePrice,
    supplierId: normalizeOptionalText(values.supplierId),
  }
}

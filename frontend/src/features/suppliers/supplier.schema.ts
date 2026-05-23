import { z } from 'zod'

export const supplierSchema = z.object({
  address: z.string().max(250, 'La direccion no puede superar 250 caracteres.').optional(),
  businessName: z
    .string()
    .trim()
    .min(1, 'Ingresa la razon social del proveedor.')
    .max(160, 'La razon social no puede superar 160 caracteres.'),
  email: z
    .string()
    .trim()
    .max(160, 'El email no puede superar 160 caracteres.')
    .optional()
    .refine((value) => !value || z.string().email().safeParse(value).success, 'Ingresa un email valido.'),
  phone: z.string().max(30, 'El telefono no puede superar 30 caracteres.').optional(),
  ruc: z.string().max(20, 'El RUC no puede superar 20 caracteres.').optional(),
})

export type SupplierFormValues = z.infer<typeof supplierSchema>

function normalizeOptionalText(value?: string): string | null {
  const normalized = value?.trim()

  return normalized ? normalized : null
}

export function toSupplierPayload(values: SupplierFormValues) {
  return {
    address: normalizeOptionalText(values.address),
    businessName: values.businessName.trim(),
    email: normalizeOptionalText(values.email),
    phone: normalizeOptionalText(values.phone),
    ruc: normalizeOptionalText(values.ruc),
  }
}

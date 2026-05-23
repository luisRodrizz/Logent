import { z } from 'zod'

export const categorySchema = z.object({
  description: z
    .string()
    .max(300, 'La descripcion no puede superar 300 caracteres.')
    .optional(),
  name: z
    .string()
    .trim()
    .min(1, 'Ingresa el nombre de la categoria.')
    .max(120, 'El nombre no puede superar 120 caracteres.'),
})

export type CategoryFormValues = z.infer<typeof categorySchema>

export function toCategoryPayload(values: CategoryFormValues) {
  const description = values.description?.trim()

  return {
    description: description ? description : null,
    name: values.name.trim(),
  }
}

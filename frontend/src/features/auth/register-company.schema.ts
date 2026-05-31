import { z } from 'zod'

export const registerCompanySchema = z
  .object({
    companyName: z.string().trim().min(1, 'Ingresa el nombre de la empresa.').max(160, 'Usa hasta 160 caracteres.'),
    ruc: z.string().trim().max(20, 'Usa hasta 20 caracteres.').optional(),
    email: z.string().trim().min(1, 'Ingresa el email de la empresa.').email('Ingresa un email válido.').max(160, 'Usa hasta 160 caracteres.'),
    phone: z.string().trim().max(30, 'Usa hasta 30 caracteres.').optional(),
    address: z.string().trim().max(250, 'Usa hasta 250 caracteres.').optional(),
    adminFullName: z.string().trim().min(1, 'Ingresa el nombre del administrador.').max(160, 'Usa hasta 160 caracteres.'),
    adminEmail: z.string().trim().min(1, 'Ingresa el email del administrador.').email('Ingresa un email válido.').max(256, 'Usa hasta 256 caracteres.'),
    adminPassword: z.string().min(1, 'Ingresa una contraseña temporal.').min(6, 'Usa al menos 6 caracteres.').max(100, 'Usa hasta 100 caracteres.'),
    confirmPassword: z.string().min(1, 'Confirma la contraseña temporal.'),
  })
  .refine((values) => values.adminPassword === values.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'],
  })

export type RegisterCompanyFormValues = z.infer<typeof registerCompanySchema>

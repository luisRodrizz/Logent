import { z } from 'zod'

export const forgotPasswordSchema = z.object({
  email: z.string().trim().min(1, 'Ingresa tu email.').email('Ingresa un email válido.').max(256, 'Usa hasta 256 caracteres.'),
})

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(1, 'Ingresa una nueva contraseña.').min(6, 'Usa al menos 6 caracteres.').max(100, 'Usa hasta 100 caracteres.'),
    confirmPassword: z.string().min(1, 'Confirma tu nueva contraseña.'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'],
  })

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

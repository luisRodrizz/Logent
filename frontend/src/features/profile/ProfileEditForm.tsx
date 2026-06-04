import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '../../components/ui/Button'
import type { Profile, UpdateProfilePayload } from './profile.types'

const profileSchema = z.object({
  firstName: z.string().trim().min(1, 'Ingresa tu nombre.').max(100, 'Máximo 100 caracteres.'),
  lastName: z.string().trim().min(1, 'Ingresa tu apellido.').max(100, 'Máximo 100 caracteres.'),
})

type ProfileFormValues = z.infer<typeof profileSchema>

type ProfileEditFormProps = {
  isSubmitting?: boolean
  onSubmit: (payload: UpdateProfilePayload) => Promise<void> | void
  profile: Profile
}

export function ProfileEditForm({ isSubmitting = false, onSubmit, profile }: ProfileEditFormProps) {
  const {
    formState: { errors, isDirty },
    handleSubmit,
    register,
    reset,
  } = useForm<ProfileFormValues>({
    defaultValues: {
      firstName: profile.firstName,
      lastName: profile.lastName,
    },
    resolver: zodResolver(profileSchema),
  })

  useEffect(() => {
    reset({
      firstName: profile.firstName,
      lastName: profile.lastName,
    })
  }, [profile.firstName, profile.lastName, reset])

  async function handleValidSubmit(values: ProfileFormValues) {
    await onSubmit({
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
    })
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(handleValidSubmit)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground" htmlFor="profile-first-name">
            Nombre
          </label>
          <input
            autoComplete="given-name"
            className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-blue-100"
            id="profile-first-name"
            {...register('firstName')}
          />
          {errors.firstName ? <p className="text-sm font-medium text-red-600">{errors.firstName.message}</p> : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground" htmlFor="profile-last-name">
            Apellido
          </label>
          <input
            autoComplete="family-name"
            className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-blue-100"
            id="profile-last-name"
            {...register('lastName')}
          />
          {errors.lastName ? <p className="text-sm font-medium text-red-600">{errors.lastName.message}</p> : null}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-slate-50 px-4 py-3 text-sm leading-6 text-muted">
        El email, los roles y la empresa asociada se administran mediante los flujos autorizados de LOGENT.
      </div>

      <div className="flex justify-end">
        <Button disabled={!isDirty || isSubmitting} type="submit">
          {isSubmitting ? 'Guardando...' : 'Guardar perfil'}
        </Button>
      </div>
    </form>
  )
}

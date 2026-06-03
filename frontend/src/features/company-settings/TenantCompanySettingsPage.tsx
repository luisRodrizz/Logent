import { zodResolver } from '@hookform/resolvers/zod'
import {
  Building2,
  CheckCircle2,
  Globe,
  Image,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Trash2,
  Upload,
} from 'lucide-react'
import { useEffect, useRef, type ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { LoadingState } from '../../components/common/LoadingState'
import { PageHeader } from '../../components/common/PageHeader'
import { SectionError } from '../../components/common/SectionError'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { useAuth } from '../auth/useAuth'
import { getApiErrorMessage } from '../../lib/api-error'
import { formatDate } from '../../lib/format'
import {
  useDeleteCompanyLogo,
  useTenantCompanySettings,
  useUpdateTenantCompanySettings,
  useUploadCompanyLogo,
} from './company-settings.queries'
import type { TenantCompanySettings, UpdateTenantCompanySettingsPayload } from './company-settings.types'

const allowedLogoFileTypes = ['image/jpeg', 'image/png', 'image/webp']
const maxLogoFileSize = 2 * 1024 * 1024

const urlField = z
  .string()
  .trim()
  .optional()
  .refine((value) => !value || isValidUrl(value), 'Ingresa una URL valida.')

const companySettingsSchema = z.object({
  address: z.string().trim().max(250, 'La direccion no debe superar 250 caracteres.').optional(),
  commercialName: z.string().trim().max(150, 'El nombre comercial no debe superar 150 caracteres.').optional(),
  contactEmail: z
    .string()
    .trim()
    .max(150, 'El correo de contacto no debe superar 150 caracteres.')
    .optional()
    .refine((value) => !value || z.string().email().safeParse(value).success, 'Ingresa un correo valido.'),
  logoUrl: urlField,
  phone: z.string().trim().max(30, 'El telefono no debe superar 30 caracteres.').optional(),
  website: urlField,
})

type CompanySettingsFormValues = z.infer<typeof companySettingsSchema>

const emptyFormValues: CompanySettingsFormValues = {
  address: '',
  commercialName: '',
  contactEmail: '',
  logoUrl: '',
  phone: '',
  website: '',
}

const planBadgeVariants = {
  Enterprise: 'warning',
  Free: 'muted',
  Pro: 'success',
  Starter: 'default',
} as const

function isValidUrl(value: string) {
  try {
    const url = new URL(value)

    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function toFormValues(company: TenantCompanySettings): CompanySettingsFormValues {
  return {
    address: company.address ?? '',
    commercialName: company.commercialName ?? '',
    contactEmail: company.contactEmail ?? '',
    logoUrl: company.logoUrl ?? '',
    phone: company.phone ?? '',
    website: company.website ?? '',
  }
}

function toPayload(values: CompanySettingsFormValues): UpdateTenantCompanySettingsPayload {
  return {
    address: normalizeOptional(values.address),
    commercialName: normalizeOptional(values.commercialName),
    contactEmail: normalizeOptional(values.contactEmail),
    logoUrl: normalizeOptional(values.logoUrl),
    phone: normalizeOptional(values.phone),
    website: normalizeOptional(values.website),
  }
}

function normalizeOptional(value?: string) {
  const normalized = value?.trim()

  return normalized ? normalized : null
}

function getDisplayName(company: TenantCompanySettings) {
  return company.commercialName || company.name
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-sm font-medium text-red-600">{message}</p> : null
}

export function TenantCompanySettingsPage() {
  const { user } = useAuth()
  const canEdit = user?.roles.includes('Admin') ?? false
  const logoInputRef = useRef<HTMLInputElement | null>(null)
  const companySettingsQuery = useTenantCompanySettings()
  const updateCompanySettingsMutation = useUpdateTenantCompanySettings()
  const uploadCompanyLogoMutation = useUploadCompanyLogo()
  const deleteCompanyLogoMutation = useDeleteCompanyLogo()
  const {
    formState: { errors, isDirty },
    handleSubmit,
    register,
    reset,
  } = useForm<CompanySettingsFormValues>({
    defaultValues: emptyFormValues,
    resolver: zodResolver(companySettingsSchema),
  })

  useEffect(() => {
    if (companySettingsQuery.data) {
      reset(toFormValues(companySettingsQuery.data))
    }
  }, [companySettingsQuery.data, reset])

  async function handleValidSubmit(values: CompanySettingsFormValues) {
    if (!canEdit) {
      toast.info('Solo los administradores pueden actualizar los datos de la empresa.')
      return
    }

    try {
      const updatedCompany = await updateCompanySettingsMutation.mutateAsync(toPayload(values))
      reset(toFormValues(updatedCompany))
      toast.success('Datos de la empresa actualizados correctamente.')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudo actualizar la informacion de la empresa.'))
    }
  }

  function handleOpenLogoPicker() {
    if (!canEdit) {
      toast.info('Solo los administradores pueden actualizar el logo de la empresa.')
      return
    }

    logoInputRef.current?.click()
  }

  async function handleLogoFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    if (!allowedLogoFileTypes.includes(file.type)) {
      toast.error('El logo debe ser JPG, PNG o WebP.')
      return
    }

    if (file.size > maxLogoFileSize) {
      toast.error('El logo no debe superar 2 MB.')
      return
    }

    try {
      const updatedCompany = await uploadCompanyLogoMutation.mutateAsync(file)
      reset(toFormValues(updatedCompany))
      toast.success('Logo actualizado correctamente.')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudo subir el logo de la empresa.'))
    }
  }

  async function handleDeleteLogo() {
    if (!canEdit) {
      toast.info('Solo los administradores pueden actualizar el logo de la empresa.')
      return
    }

    try {
      const updatedCompany = await deleteCompanyLogoMutation.mutateAsync()
      reset(toFormValues(updatedCompany))
      toast.success('Logo eliminado correctamente.')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudo quitar el logo de la empresa.'))
    }
  }

  if (companySettingsQuery.isLoading) {
    return (
      <Card>
        <CardContent>
          <LoadingState text="Cargando empresa..." />
        </CardContent>
      </Card>
    )
  }

  if (companySettingsQuery.isError || !companySettingsQuery.data) {
    return (
      <Card>
        <CardContent className="px-6 py-10">
          <SectionError
            text={getApiErrorMessage(companySettingsQuery.error, 'No se pudo cargar la informacion de la empresa.')}
          />
        </CardContent>
      </Card>
    )
  }

  const company = companySettingsQuery.data
  const isSubmitting = updateCompanySettingsMutation.isPending
  const isLogoSubmitting = uploadCompanyLogoMutation.isPending || deleteCompanyLogoMutation.isPending

  return (
    <div className="space-y-6">
      <PageHeader
        description="Configura la informacion principal de tu organizacion."
        eyebrow="Cuenta"
        title="Empresa"
      />

      <Card>
        <CardContent className="p-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-white text-primary shadow-sm">
                {company.logoUrl ? (
                  <img alt={`Logo de ${getDisplayName(company)}`} className="h-full w-full object-contain p-2" src={company.logoUrl} />
                ) : (
                  <Building2 className="h-7 w-7" />
                )}
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-xl font-semibold text-foreground">{getDisplayName(company)}</h2>
                  <Badge variant={company.isActive ? 'success' : 'danger'}>
                    {company.isActive ? 'Activa' : 'Suspendida'}
                  </Badge>
                  <Badge variant={planBadgeVariants[company.plan]}>{company.plan}</Badge>
                </div>
                <p className="mt-1 truncate text-sm text-muted">{company.name}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium">RUC: {company.ruc ?? 'Sin RUC'}</span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium">Slug: {company.slug}</span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium">
                    Creada: {formatDate(company.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-[#28E000]/20 bg-[#28E000]/5 px-4 py-3 text-sm text-emerald-800">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                <p className="font-medium">La identidad legal, el plan y el estado se gestionan desde plataforma.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {!canEdit ? (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="font-medium">Solo los administradores pueden actualizar los datos de la empresa.</p>
        </div>
      ) : null}

      <Card>
        <CardHeader className="gap-4 sm:flex sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
          <div>
            <CardTitle>Logo de empresa</CardTitle>
            <CardDescription>
              Usa una imagen clara para identificar tu organizacion en LOGENT.
            </CardDescription>
          </div>
          <input
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleLogoFileChange}
            ref={logoInputRef}
            type="file"
          />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-slate-50 text-muted">
                {company.logoUrl ? (
                  <img
                    alt={`Logo de ${getDisplayName(company)}`}
                    className="h-full w-full object-contain p-2"
                    src={company.logoUrl}
                  />
                ) : (
                  <Image className="h-7 w-7" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {company.logoUrl ? 'Logo configurado' : 'Sin logo configurado'}
                </p>
                <p className="mt-1 max-w-xl text-sm leading-6 text-muted">
                  Formatos permitidos: JPG, PNG o WebP. Maximo 2 MB.
                </p>
              </div>
            </div>

            {canEdit ? (
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button disabled={isLogoSubmitting} onClick={handleOpenLogoPicker} variant="secondary">
                  <Upload className="h-4 w-4" />
                  {uploadCompanyLogoMutation.isPending ? 'Subiendo...' : 'Subir logo'}
                </Button>
                {company.logoUrl ? (
                  <Button
                    className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                    disabled={isLogoSubmitting}
                    onClick={handleDeleteLogo}
                    variant="secondary"
                  >
                    <Trash2 className="h-4 w-4" />
                    {deleteCompanyLogoMutation.isPending ? 'Quitando...' : 'Quitar logo'}
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informacion de contacto</CardTitle>
          <CardDescription>
            Actualiza los datos visibles de contacto y presencia digital de tu empresa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit(handleValidSubmit)}>
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground" htmlFor="commercial-name">
                  Nombre comercial
                </label>
                <input
                  className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-muted"
                  disabled={!canEdit || isSubmitting}
                  id="commercial-name"
                  placeholder="LOGENT Operaciones"
                  {...register('commercialName')}
                />
                <FieldError message={errors.commercialName?.message} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground" htmlFor="contact-email">
                  Correo de contacto
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <input
                    className="h-11 w-full rounded-lg border border-border bg-white pl-10 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-muted"
                    disabled={!canEdit || isSubmitting}
                    id="contact-email"
                    placeholder="contacto@empresa.com"
                    type="email"
                    {...register('contactEmail')}
                  />
                </div>
                <FieldError message={errors.contactEmail?.message} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground" htmlFor="phone">
                  Telefono
                </label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <input
                    className="h-11 w-full rounded-lg border border-border bg-white pl-10 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-muted"
                    disabled={!canEdit || isSubmitting}
                    id="phone"
                    placeholder="987654321"
                    {...register('phone')}
                  />
                </div>
                <FieldError message={errors.phone?.message} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground" htmlFor="website">
                  Sitio web
                </label>
                <div className="relative">
                  <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <input
                    className="h-11 w-full rounded-lg border border-border bg-white pl-10 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-muted"
                    disabled={!canEdit || isSubmitting}
                    id="website"
                    placeholder="https://empresa.com"
                    {...register('website')}
                  />
                </div>
                <FieldError message={errors.website?.message} />
              </div>

              <div className="space-y-2 lg:col-span-2">
                <label className="text-sm font-semibold text-foreground" htmlFor="address">
                  Direccion
                </label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted" />
                  <textarea
                    className="min-h-24 w-full resize-y rounded-lg border border-border bg-white py-3 pl-10 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-muted"
                    disabled={!canEdit || isSubmitting}
                    id="address"
                    placeholder="Direccion fiscal o sede principal"
                    {...register('address')}
                  />
                </div>
                <FieldError message={errors.address?.message} />
              </div>

              <div className="space-y-2 lg:col-span-2">
                <label className="text-sm font-semibold text-foreground" htmlFor="logo-url">
                  URL de logo
                </label>
                <div className="relative">
                  <Image className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <input
                    className="h-11 w-full rounded-lg border border-border bg-white pl-10 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-muted"
                    disabled={!canEdit || isSubmitting}
                    id="logo-url"
                    placeholder="https://empresa.com/logo.png"
                    {...register('logoUrl')}
                  />
                </div>
                <FieldError message={errors.logoUrl?.message} />
                <p className="text-xs text-muted">
                  Puede completarse manualmente o actualizarse automaticamente al subir un archivo.
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
              <Button
                disabled={!canEdit || isSubmitting || !isDirty}
                onClick={() => reset(toFormValues(company))}
                variant="secondary"
              >
                Restaurar
              </Button>
              <Button disabled={!canEdit || isSubmitting || !isDirty} type="submit">
                {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

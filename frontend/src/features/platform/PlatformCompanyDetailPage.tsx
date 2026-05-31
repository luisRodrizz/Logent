import {
  Activity,
  ArrowLeft,
  Boxes,
  Building2,
  CheckCircle2,
  Package,
  RefreshCcw,
  Save,
  ShieldAlert,
  Users,
  Warehouse,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { LoadingState } from '../../components/common/LoadingState'
import { PageHeader } from '../../components/common/PageHeader'
import { SectionError } from '../../components/common/SectionError'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { getApiErrorMessage } from '../../lib/api-error'
import { formatDate, formatNumber } from '../../lib/format'
import {
  usePlatformCompany,
  useUpdatePlatformCompanyPlan,
  useUpdatePlatformCompanyStatus,
} from './platform.queries'
import { platformPlans, type PlatformPlan } from './platform.types'

export function PlatformCompanyDetailPage() {
  const { id } = useParams()
  const companyQuery = usePlatformCompany(id)
  const updatePlanMutation = useUpdatePlatformCompanyPlan()
  const updateStatusMutation = useUpdatePlatformCompanyStatus()
  const company = companyQuery.data
  const [selectedPlan, setSelectedPlan] = useState<PlatformPlan | null>(null)
  const [reason, setReason] = useState('')

  async function handlePlanUpdate() {
    if (!company) {
      return
    }

    try {
      await updatePlanMutation.mutateAsync({ id: company.id, payload: { plan: selectedPlan ?? company.plan } })
      setSelectedPlan(null)
      toast.success('Plan actualizado correctamente.')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudo actualizar el plan de la empresa.'))
    }
  }

  async function handleStatusUpdate() {
    if (!company) {
      return
    }

    try {
      await updateStatusMutation.mutateAsync({
        id: company.id,
        payload: {
          isActive: !company.isActive,
          reason: reason.trim() || undefined,
        },
      })
      setReason('')
      toast.success(company.isActive ? 'Empresa suspendida correctamente.' : 'Empresa reactivada correctamente.')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudo actualizar el estado de la empresa.'))
    }
  }

  if (!id) {
    return <SectionError text="No se encontró el identificador de la empresa." />
  }

  if (companyQuery.isLoading) {
    return <LoadingState text="Cargando detalle de empresa..." />
  }

  if (companyQuery.isError) {
    return <SectionError text={getApiErrorMessage(companyQuery.error, 'No se pudo cargar el detalle de la empresa.')} />
  }

  if (!company) {
    return <SectionError text="No se encontró la empresa solicitada." />
  }

  const metrics = [
    { icon: Users, label: 'Usuarios', value: company.usersCount },
    { icon: Activity, label: 'Usuarios activos', value: company.activeUsersCount },
    { icon: Package, label: 'Productos', value: company.productsCount },
    { icon: Warehouse, label: 'Almacenes', value: company.warehousesCount },
    { icon: RefreshCcw, label: 'Movimientos', value: company.movementsCount },
    { icon: Boxes, label: 'Registros de stock', value: company.stockItemsCount },
  ]

  return (
    <div className="space-y-6">
      <Link className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline" to="/platform/companies">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Volver a empresas
      </Link>

      <PageHeader
        action={<Badge variant={company.isActive ? 'success' : 'danger'}>{company.isActive ? 'Activa' : 'Suspendida'}</Badge>}
        description="Consulta la configuración y el volumen operativo de esta empresa dentro de la plataforma."
        eyebrow="Plataforma · Empresa"
        title={company.name}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Métricas de empresa">
        {metrics.map((metric) => {
          const Icon = metric.icon

          return (
            <Card key={metric.label}>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#1017D8]/15 bg-[#1017D8]/5 text-primary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm text-muted">{metric.label}</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{formatNumber(metric.value)}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Datos de la empresa</CardTitle>
            <CardDescription>Información registrada durante el alta de la organización.</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {[
                ['RUC', company.ruc || 'Sin RUC'],
                ['Email', company.email || 'Sin email'],
                ['Teléfono', company.phone || 'Sin teléfono'],
                ['Dirección', company.address || 'Sin dirección'],
                ['Slug', company.slug],
                ['Fecha de creación', formatDate(company.createdAt)],
              ].map(([label, value]) => (
                <div className="min-w-0" key={label}>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
                  <dd className="mt-1 break-words text-sm font-medium text-slate-800">{value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Plan comercial</CardTitle>
              <CardDescription>Actualiza el plan asignado. Los límites se aplicarán en una fase posterior.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Plan</span>
                <select
                  className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none focus:border-[#1017D8]/50 focus:ring-2 focus:ring-[#1017D8]/10"
                  onChange={(event) => setSelectedPlan(event.target.value as PlatformPlan)}
                  value={selectedPlan ?? company.plan}
                >
                  {platformPlans.map((platformPlan) => (
                    <option key={platformPlan} value={platformPlan}>
                      {platformPlan}
                    </option>
                  ))}
                </select>
              </label>
              <Button
                className="w-full"
                disabled={(selectedPlan ?? company.plan) === company.plan || updatePlanMutation.isPending}
                onClick={handlePlanUpdate}
              >
                <Save className="h-4 w-4" aria-hidden="true" />
                {updatePlanMutation.isPending ? 'Actualizando...' : 'Actualizar plan'}
              </Button>
            </CardContent>
          </Card>

          <Card className={company.isActive ? 'border-amber-200' : 'border-emerald-200'}>
            <CardHeader>
              <CardTitle>{company.isActive ? 'Suspender empresa' : 'Reactivar empresa'}</CardTitle>
              <CardDescription>
                {company.isActive
                  ? 'Los usuarios tenant dejarán de iniciar sesión y sus tokens activos serán bloqueados.'
                  : 'Los usuarios tenant recuperarán el acceso operativo a LOGENT.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Motivo opcional</span>
                <textarea
                  className="min-h-24 w-full resize-y rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground outline-none placeholder:text-slate-400 focus:border-[#1017D8]/50 focus:ring-2 focus:ring-[#1017D8]/10"
                  maxLength={500}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Agrega una referencia administrativa para el cambio de estado."
                  value={reason}
                />
              </label>
              <Button
                className="w-full"
                disabled={updateStatusMutation.isPending}
                onClick={handleStatusUpdate}
                variant={company.isActive ? 'danger' : 'primary'}
              >
                {company.isActive ? <ShieldAlert className="h-4 w-4" aria-hidden="true" /> : <CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
                {updateStatusMutation.isPending
                  ? 'Actualizando...'
                  : company.isActive
                    ? 'Suspender empresa'
                    : 'Reactivar empresa'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <p className="flex items-center gap-2 text-xs text-muted">
        <Building2 className="h-4 w-4" aria-hidden="true" />
        Última actualización: {formatDate(company.updatedAt, 'Sin actualizaciones registradas')}
      </p>
    </div>
  )
}

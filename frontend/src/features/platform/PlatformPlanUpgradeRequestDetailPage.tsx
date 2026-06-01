import { ArrowLeft, Building2, CheckCircle2, ExternalLink, XCircle } from 'lucide-react'
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
import { formatDateTime } from '../../lib/format'
import {
  useApprovePlatformPlanUpgradeRequest,
  usePlatformPlanUpgradeRequest,
  useRejectPlatformPlanUpgradeRequest,
} from './platform-upgrade.queries'
import type { PlatformUpgradeRequestStatus } from './platform-upgrade.types'

const statusLabels: Record<PlatformUpgradeRequestStatus, string> = {
  Approved: 'Aprobada',
  Pending: 'Pendiente',
  Rejected: 'Rechazada',
}

const statusBadgeVariants: Record<PlatformUpgradeRequestStatus, 'success' | 'warning' | 'danger'> = {
  Approved: 'success',
  Pending: 'warning',
  Rejected: 'danger',
}

export function PlatformPlanUpgradeRequestDetailPage() {
  const { id } = useParams()
  const approveMutation = useApprovePlatformPlanUpgradeRequest()
  const rejectMutation = useRejectPlatformPlanUpgradeRequest()
  const requestQuery = usePlatformPlanUpgradeRequest(id)
  const [resolutionNote, setResolutionNote] = useState('')
  const request = requestQuery.data
  const isResolving = approveMutation.isPending || rejectMutation.isPending

  async function handleApprove() {
    if (!request) {
      return
    }

    try {
      await approveMutation.mutateAsync({
        id: request.id,
        payload: { resolutionNote: resolutionNote.trim() || undefined },
      })
      setResolutionNote('')
      toast.success('Solicitud aprobada correctamente.')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudo aprobar la solicitud.'))
    }
  }

  async function handleReject() {
    if (!request) {
      return
    }

    try {
      await rejectMutation.mutateAsync({
        id: request.id,
        payload: { resolutionNote: resolutionNote.trim() || undefined },
      })
      setResolutionNote('')
      toast.success('Solicitud rechazada correctamente.')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudo rechazar la solicitud.'))
    }
  }

  if (!id) {
    return <SectionError text="No se encontró el identificador de la solicitud." />
  }

  if (requestQuery.isLoading) {
    return <LoadingState text="Cargando detalle de solicitud..." />
  }

  if (requestQuery.isError) {
    return <SectionError text={getApiErrorMessage(requestQuery.error, 'No se pudo cargar la solicitud.')} />
  }

  if (!request) {
    return <SectionError text="No se encontró la solicitud requerida." />
  }

  return (
    <div className="space-y-6">
      <Link
        className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
        to="/platform/upgrade-requests"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Volver a solicitudes
      </Link>

      <PageHeader
        action={<Badge variant={statusBadgeVariants[request.status]}>{statusLabels[request.status]}</Badge>}
        description="Revisa la solicitud tenant y registra una resolución administrativa."
        eyebrow="Plataforma · Solicitud de plan"
        title={request.companyName}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumen de solicitud</CardTitle>
              <CardDescription>Información enviada por la empresa para ampliar su capacidad operativa.</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
                {[
                  ['Plan actual', request.currentPlan],
                  ['Plan solicitado', request.requestedPlan],
                  ['Solicitante', request.requestedByName],
                  ['Fecha de solicitud', formatDateTime(request.createdAt)],
                  ['Fecha de resolución', formatDateTime(request.resolvedAt, 'Pendiente de resolución')],
                ].map(([label, value]) => (
                  <div className="min-w-0" key={label}>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
                    <dd className="mt-1 break-words text-sm font-medium text-slate-800">{value}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mensaje tenant</CardTitle>
              <CardDescription>Contexto compartido por la empresa al enviar la solicitud.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-slate-700">{request.message || 'Sin mensaje adicional.'}</p>
            </CardContent>
          </Card>

          {request.resolutionNote ? (
            <Card>
              <CardHeader>
                <CardTitle>Nota de resolución</CardTitle>
                <CardDescription>Referencia administrativa registrada al resolver la solicitud.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-slate-700">{request.resolutionNote}</p>
                {request.resolvedByName ? (
                  <p className="mt-3 text-xs text-muted">Resuelta por {request.resolvedByName}</p>
                ) : null}
              </CardContent>
            </Card>
          ) : null}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Empresa</CardTitle>
              <CardDescription>Abre el detalle general para revisar su configuración y volumen operativo.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:border-[#1017D8]/30 hover:bg-[#1017D8]/5"
                to={`/platform/companies/${request.companyId}`}
              >
                <Building2 className="h-4 w-4" aria-hidden="true" />
                Ver empresa
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </Link>
            </CardContent>
          </Card>

          {request.status === 'Pending' ? (
            <Card className="border-amber-200">
              <CardHeader>
                <CardTitle>Resolver solicitud</CardTitle>
                <CardDescription>
                  Aprobar actualizará el plan de la empresa. Rechazar conservará el plan actual.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Nota opcional</span>
                  <textarea
                    className="min-h-28 w-full resize-y rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground outline-none placeholder:text-slate-400 focus:border-[#1017D8]/50 focus:ring-2 focus:ring-[#1017D8]/10"
                    maxLength={500}
                    onChange={(event) => setResolutionNote(event.target.value)}
                    placeholder="Agrega una referencia administrativa para la resolución."
                    value={resolutionNote}
                  />
                  <span className="mt-1 block text-right text-xs text-muted">{resolutionNote.length}/500</span>
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Button disabled={isResolving} onClick={handleReject} variant="secondary">
                    <XCircle className="h-4 w-4 text-red-600" aria-hidden="true" />
                    {rejectMutation.isPending ? 'Rechazando...' : 'Rechazar'}
                  </Button>
                  <Button disabled={isResolving} onClick={handleApprove}>
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    {approveMutation.isPending ? 'Aprobando...' : 'Aprobar'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  )
}

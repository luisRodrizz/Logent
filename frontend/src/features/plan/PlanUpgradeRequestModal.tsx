import { ArrowUpCircle, Check, ShieldCheck, X } from 'lucide-react'
import { useState } from 'react'
import { ModalOverlay } from '../../components/common/ModalOverlay'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { formatNumber } from '../../lib/format'
import { planDefinitions, planResourceLabels, planResources } from './plan.constants'
import type { CreatePlanUpgradeRequestPayload, PlanType } from './plan.types'

type PlanUpgradeRequestModalProps = {
  availablePlans: PlanType[]
  initialPlan?: PlanType | null
  isSubmitting?: boolean
  onClose: () => void
  onSubmit: (payload: CreatePlanUpgradeRequestPayload) => Promise<void> | void
}

export function PlanUpgradeRequestModal({
  availablePlans,
  initialPlan,
  isSubmitting = false,
  onClose,
  onSubmit,
}: PlanUpgradeRequestModalProps) {
  const [message, setMessage] = useState('')
  const [requestedPlan, setRequestedPlan] = useState<PlanType | ''>(initialPlan ?? availablePlans[0] ?? '')
  const requestedPlanDefinition = planDefinitions.find((definition) => definition.plan === requestedPlan)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!requestedPlan) {
      return
    }

    await onSubmit({
      message: message.trim() || undefined,
      requestedPlan,
    })
  }

  return (
    <ModalOverlay>
      <Card aria-modal="true" className="w-full max-w-xl" role="dialog">
        <CardHeader className="relative pr-14">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-[#1017D8]/5 text-primary ring-1 ring-[#1017D8]/15">
            <ArrowUpCircle className="h-5 w-5" aria-hidden="true" />
          </div>
          <CardTitle>Solicitar actualización de plan</CardTitle>
          <CardDescription>
            Envía una solicitud al administrador de LOGENT. El plan no cambiará hasta que sea revisado.
          </CardDescription>
          <Button
            aria-label="Cerrar modal"
            className="absolute right-4 top-4 h-9 w-9 p-0"
            onClick={onClose}
            variant="ghost"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-foreground">Plan solicitado</span>
              <select
                className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-blue-100"
                onChange={(event) => setRequestedPlan(event.target.value as PlanType)}
                required
                value={requestedPlan}
              >
                {availablePlans.map((plan) => (
                  <option key={plan} value={plan}>
                    {plan}
                  </option>
                ))}
              </select>
            </label>

            {requestedPlanDefinition ? (
              <div className="rounded-lg border border-border bg-slate-50/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Resumen del plan {requestedPlanDefinition.plan}</p>
                    <p className="mt-1 text-xs leading-5 text-muted">{requestedPlanDefinition.description}</p>
                  </div>
                  <ShieldCheck className="h-5 w-5 shrink-0 text-[#14B8A6]" aria-hidden="true" />
                </div>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {planResources.map((resource) => {
                    const limit = requestedPlanDefinition.limits[resource]

                    return (
                      <li className="flex items-center justify-between gap-3 text-xs" key={resource}>
                        <span className="flex min-w-0 items-center gap-2 text-muted">
                          <Check className="h-3.5 w-3.5 shrink-0 text-[#147A08]" aria-hidden="true" />
                          {planResourceLabels[resource]}
                        </span>
                        <strong className="shrink-0 text-foreground">
                          {limit === null ? 'Capacidad extendida' : formatNumber(limit)}
                        </strong>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ) : null}

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-foreground">Mensaje opcional</span>
              <textarea
                className="min-h-28 w-full resize-y rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground outline-none placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-blue-100"
                maxLength={500}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Describe brevemente por qué tu operación necesita mayor capacidad."
                value={message}
              />
              <span className="block text-right text-xs text-muted">{message.length}/500</span>
            </label>

            <p className="rounded-lg border border-blue-100 bg-blue-50/60 px-4 py-3 text-xs leading-5 text-slate-600">
              Esta solicitud será revisada por el equipo administrador de LOGENT. No se realizará ningún cobro ni
              cambio automático de plan.
            </p>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button disabled={isSubmitting} onClick={onClose} variant="secondary">
                Cancelar
              </Button>
              <Button disabled={!requestedPlan || isSubmitting} type="submit">
                {isSubmitting
                  ? 'Enviando...'
                  : requestedPlan === 'Enterprise'
                    ? 'Enviar consulta Enterprise'
                    : `Solicitar ${requestedPlan}`}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </ModalOverlay>
  )
}

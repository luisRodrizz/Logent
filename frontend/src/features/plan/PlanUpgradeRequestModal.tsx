import { ArrowUpCircle, X } from 'lucide-react'
import { useState } from 'react'
import { ModalOverlay } from '../../components/common/ModalOverlay'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
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

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button disabled={isSubmitting} onClick={onClose} variant="secondary">
                Cancelar
              </Button>
              <Button disabled={!requestedPlan || isSubmitting} type="submit">
                {isSubmitting ? 'Enviando...' : 'Enviar solicitud'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </ModalOverlay>
  )
}

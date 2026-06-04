import { CircleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getPlanResourceLimitStatus, planUsageResources } from './plan-limit.helpers'
import { usePlanUsage } from './plan.queries'

export function PlanUsageAlert() {
  const planUsageQuery = usePlanUsage()

  if (!planUsageQuery.data) {
    return null
  }

  const statuses = planUsageResources.map((resource) =>
    getPlanResourceLimitStatus(planUsageQuery.data, resource),
  )
  const reached = statuses.filter((status) => status.isAtLimit)
  const near = statuses.filter((status) => status.isNearLimit)
  const relevant = reached.length > 0 ? reached : near

  if (relevant.length === 0) {
    return null
  }

  const isAtLimit = reached.length > 0
  const resourceNames = relevant.map((status) => status.label).join(', ')

  return (
    <div
      className={`flex flex-col gap-3 rounded-lg border px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${
        isAtLimit ? 'border-red-200 bg-red-50 text-red-700' : 'border-amber-200 bg-amber-50 text-amber-700'
      }`}
    >
      <div className="flex items-start gap-3">
        <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold">
            {isAtLimit ? 'Tu empresa alcanzó límites del plan actual.' : 'Tu empresa está cerca de sus límites.'}
          </p>
          <p className="mt-1 text-xs leading-5">
            Revisa el consumo de {resourceNames} para mantener la operación disponible.
          </p>
        </div>
      </div>
      <Link
        className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-current/20 bg-white px-3 text-sm font-semibold text-foreground transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1017D8] focus-visible:ring-offset-2"
        to="/plan"
      >
        {isAtLimit ? 'Mejorar plan' : 'Ver plan'}
      </Link>
    </div>
  )
}

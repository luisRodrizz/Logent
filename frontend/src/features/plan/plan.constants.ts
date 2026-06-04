import type { PlanResource } from './plan-limit.helpers'
import type { PlanType } from './plan.types'

export type PlanComparisonResource = Exclude<PlanResource, 'monthlyMovements'>

export type PlanDefinition = {
  description: string
  limits: Record<PlanComparisonResource, number | null>
  plan: PlanType
}

export const planResources: PlanComparisonResource[] = ['users', 'products', 'warehouses', 'suppliers', 'categories']

export const planResourceLabels: Record<PlanComparisonResource, string> = {
  categories: 'Categorías',
  products: 'Productos',
  suppliers: 'Proveedores',
  users: 'Usuarios',
  warehouses: 'Almacenes',
}

export const planDefinitions: PlanDefinition[] = [
  {
    description: 'Para iniciar una operación pequeña con control centralizado.',
    limits: {
      categories: 20,
      products: 50,
      suppliers: 25,
      users: 3,
      warehouses: 2,
    },
    plan: 'Free',
  },
  {
    description: 'Para equipos en crecimiento que necesitan mayor capacidad.',
    limits: {
      categories: 100,
      products: 500,
      suppliers: 100,
      users: 10,
      warehouses: 5,
    },
    plan: 'Starter',
  },
  {
    description: 'Para operaciones consolidadas con inventarios más amplios.',
    limits: {
      categories: 500,
      products: 5000,
      suppliers: 1000,
      users: 50,
      warehouses: 20,
    },
    plan: 'Pro',
  },
  {
    description: 'Para organizaciones que requieren capacidad extendida.',
    limits: {
      categories: null,
      products: null,
      suppliers: null,
      users: null,
      warehouses: null,
    },
    plan: 'Enterprise',
  },
]

export function getHigherPlans(plan: PlanType): PlanType[] {
  const currentPlanIndex = planDefinitions.findIndex((definition) => definition.plan === plan)

  return planDefinitions.slice(currentPlanIndex + 1).map((definition) => definition.plan)
}

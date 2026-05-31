import {
  ArrowRight,
  Boxes,
  Building2,
  PackagePlus,
  Tags,
  Truck,
  type LucideIcon,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '../../components/ui/Card'

type OnboardingStep = {
  description: string
  href: string
  icon: LucideIcon
  label: string
  title: string
}

const onboardingSteps: OnboardingStep[] = [
  {
    description: 'Define el punto inicial donde recibirás tus existencias.',
    href: '/warehouses',
    icon: Building2,
    label: 'Abrir almacenes',
    title: 'Crear tu primer almacén',
  },
  {
    description: 'Organiza el catálogo antes de registrar tus productos.',
    href: '/categories',
    icon: Tags,
    label: 'Abrir categorías',
    title: 'Registrar categorías',
  },
  {
    description: 'Agrega los proveedores habituales de tu operación.',
    href: '/suppliers',
    icon: Truck,
    label: 'Abrir proveedores',
    title: 'Agregar proveedores',
  },
  {
    description: 'Incorpora los artículos que necesitas controlar.',
    href: '/products',
    icon: Boxes,
    label: 'Abrir productos',
    title: 'Crear productos',
  },
  {
    description: 'Carga las existencias iniciales y comienza tu Kardex.',
    href: '/movements',
    icon: PackagePlus,
    label: 'Abrir movimientos',
    title: 'Registrar una entrada',
  },
]

export function TenantOnboardingCard() {
  return (
    <Card className="overflow-hidden border-t-2 border-t-[#28E000]">
      <CardContent className="p-0">
        <div className="border-b border-border bg-white px-5 py-5 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#147A08]">Primeros pasos</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">Configura tu inventario inicial</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
            Tu empresa ya está registrada en LOGENT. Completa estos pasos para empezar a operar tu inventario.
          </p>
        </div>

        <div className="grid bg-slate-50 sm:grid-cols-2 xl:grid-cols-5">
          {onboardingSteps.map((step, index) => {
            const StepIcon = step.icon

            return (
              <Link
                aria-label={step.label}
                className="group flex min-h-52 flex-col border-b border-border bg-white px-5 py-5 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1017D8] sm:border-r xl:border-b-0"
                key={step.href}
                to={step.href}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#14B8A6]/20 bg-[#14B8A6]/10 text-[#0F766E]">
                    <StepIcon className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-400">0{index + 1}</span>
                </div>
                <h3 className="mt-5 text-sm font-semibold leading-5 text-foreground">{step.title}</h3>
                <p className="mt-2 text-xs leading-5 text-muted">{step.description}</p>
                <span className="mt-auto flex items-center gap-1.5 pt-5 text-xs font-semibold text-[#1017D8]">
                  {step.label}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

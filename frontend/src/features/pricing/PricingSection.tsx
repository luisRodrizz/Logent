import { Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { planDefinitions, planResourceLabels, planResources } from '../plan/plan.constants'
import type { PlanType } from '../plan/plan.types'
import './PricingSection.css'

type PricingSectionProps = {
  compact?: boolean
  id?: string
}

const planCommercialDetails: Record<
  PlanType,
  {
    benefits: string[]
    cta: string
    price: string
    priceDetail: string
  }
> = {
  Enterprise: {
    benefits: ['Capacidad extendida', 'Acompañamiento comercial', 'Escalabilidad para múltiples equipos'],
    cta: 'Contactar y evaluar',
    price: 'A medida',
    priceDetail: 'según operación',
  },
  Free: {
    benefits: ['Operación inicial completa', 'Control de stock y movimientos', 'Sin costo mensual'],
    cta: 'Empezar gratis',
    price: 'S/ 0',
    priceDetail: 'para comenzar',
  },
  Pro: {
    benefits: ['Mayor capacidad operativa', 'Equipos y catálogos amplios', 'Preparado para operaciones consolidadas'],
    cta: 'Solicitar Pro',
    price: 'S/ 199',
    priceDetail: 'referencial / mes',
  },
  Starter: {
    benefits: ['Más usuarios y almacenes', 'Capacidad para equipos en crecimiento', 'Gestión centralizada'],
    cta: 'Elegir Starter',
    price: 'S/ 79',
    priceDetail: 'referencial / mes',
  },
}

export function PricingSection({ compact = false, id }: PricingSectionProps) {
  function getPlanTarget(plan: PlanType) {
    return `/register-company?plan=${plan}`
  }

  return (
    <section className={compact ? 'logent-pricing logent-pricing-compact' : 'logent-pricing'} id={id}>
      <div className="logent-pricing-heading">
        <p>Planes LOGENT</p>
        <h2>Capacidad para cada etapa de tu operación</h2>
        <span>
          Comienza con las funciones esenciales y amplía los límites cuando tu empresa lo necesite.
        </span>
      </div>

      <div className="logent-pricing-grid">
        {planDefinitions.map((definition) => {
          const commercial = planCommercialDetails[definition.plan]
          const isRecommended = definition.plan === 'Pro'

          return (
            <article
              className={isRecommended ? 'logent-pricing-card logent-pricing-card-featured' : 'logent-pricing-card'}
              key={definition.plan}
            >
              <div className="logent-pricing-card-head">
                <div>
                  <h3>{definition.plan}</h3>
                  <p>{definition.description}</p>
                </div>
                {isRecommended ? <span className="logent-pricing-badge">Recomendado</span> : null}
              </div>

              <div className="logent-pricing-price">
                <strong>{commercial.price}</strong>
                <span>{commercial.priceDetail}</span>
              </div>

              <ul className="logent-pricing-limits" aria-label={`Límites del plan ${definition.plan}`}>
                {planResources.map((resource) => (
                  <li key={resource}>
                    <span>{planResourceLabels[resource]}</span>
                    <strong>{definition.limits[resource] === null ? 'Capacidad extendida' : definition.limits[resource]}</strong>
                  </li>
                ))}
              </ul>

              {!compact ? (
                <ul className="logent-pricing-benefits">
                  {commercial.benefits.map((benefit) => (
                    <li key={benefit}>
                      <Check aria-hidden="true" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              ) : null}

              <Link
                className={isRecommended ? 'logent-pricing-cta logent-pricing-cta-primary' : 'logent-pricing-cta'}
                to={getPlanTarget(definition.plan)}
              >
                {commercial.cta}
              </Link>
            </article>
          )
        })}
      </div>

      <p className="logent-pricing-note">
        Los importes mostrados son referenciales para la presentación comercial. LOGENT aún no procesa pagos en línea.
      </p>
    </section>
  )
}

import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import logentLogo from '../../assets/brand/logent-logo.png'
import { PricingSection } from './PricingSection'
import './PricingPage.css'

export function PricingPage() {
  return (
    <main className="logent-pricing-page">
      <header className="logent-pricing-page-header">
        <div className="logent-pricing-page-container logent-pricing-page-nav">
          <Link aria-label="Ir al inicio" to="/">
            <img alt="LOGENT" src={logentLogo} />
          </Link>
          <div className="logent-pricing-page-actions">
            <Link className="logent-pricing-page-back" to="/">
              <ArrowLeft aria-hidden="true" />
              Volver al inicio
            </Link>
            <Link className="logent-pricing-page-login" to="/login">
              Acceder al sistema
            </Link>
          </div>
        </div>
      </header>

      <section className="logent-pricing-page-content">
        <div className="logent-pricing-page-container">
          <PricingSection />
        </div>
      </section>

      <section className="logent-pricing-page-cta">
        <div className="logent-pricing-page-container">
          <div>
            <p>Empieza con una operación ordenada</p>
            <h2>Crea el espacio de trabajo de tu empresa en LOGENT.</h2>
          </div>
          <Link to="/register-company">Empezar gratis</Link>
        </div>
      </section>
    </main>
  )
}

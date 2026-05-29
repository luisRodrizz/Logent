import {
  ArrowLeftRight,
  BarChart3,
  Boxes,
  Eye,
  FileText,
  History,
  LayoutDashboard,
  Package,
  ShieldCheck,
  Tags,
  Truck,
  UserRoundCog,
  Warehouse,
} from 'lucide-react'
import { motion, type Variants } from 'framer-motion'
import { Link } from 'react-router-dom'

import logentLogo from '../../assets/brand/logent-logo.png'
import deviceMockup from '../../assets/landing/logent-device-mockup.png'
import './LandingPage.css'

const features = [
  {
    icon: Boxes,
    title: 'Stock actualizado por almacén',
  },
  {
    icon: ArrowLeftRight,
    title: 'Movimientos con trazabilidad',
  },
  {
    icon: History,
    title: 'Kardex automático',
  },
  {
    icon: BarChart3,
    title: 'Reportes operativos',
  },
  {
    icon: ShieldCheck,
    title: 'Auditoría de acciones',
  },
]

const modules = [
  { icon: LayoutDashboard, title: 'Dashboard' },
  { icon: Tags, title: 'Categorías' },
  { icon: Truck, title: 'Proveedores' },
  { icon: Warehouse, title: 'Almacenes' },
  { icon: Package, title: 'Productos' },
  { icon: Boxes, title: 'Stock' },
  { icon: ArrowLeftRight, title: 'Movimientos' },
  { icon: History, title: 'Kardex' },
  { icon: FileText, title: 'Reportes' },
  { icon: ShieldCheck, title: 'Auditoría' },
]

const roles = [
  {
    description: 'Administración completa del sistema, configuración, usuarios y auditoría profunda.',
    icon: ShieldCheck,
    title: 'Admin',
  },
  {
    description: 'Operación diaria, registro de movimientos, ingresos y salidas de inventario.',
    icon: UserRoundCog,
    title: 'Almacenero',
  },
  {
    description: 'Acceso de solo lectura para revisión de stock, Kardex y reportes básicos.',
    icon: Eye,
    title: 'Consulta',
  },
]

const navItems = [
  { href: '#funciones', label: 'Funciones' },
  { href: '#modulos', label: 'Módulos' },
  { href: '#roles', label: 'Roles' },
  { href: '#demo', label: 'Demo' },
]

const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: 'easeOut',
    },
  },
}

const fadeIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
}

const stagger: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const sectionReveal: Variants = {
  hidden: {
    opacity: 0,
    y: 22,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.48,
      ease: 'easeOut',
    },
  },
}


export function LandingPage() {
  return (
    <main className="logent-landing">
      <motion.header
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="logent-landing-header"
        initial={{
          opacity: 0,
          y: -10,
        }}
        transition={{
          duration: 0.35,
          ease: 'easeOut',
        }}
      >
        <div className="logent-landing-container logent-landing-nav">
          <motion.a
            aria-label="Ir al inicio"
            className="logent-landing-logo-link"
            href="#inicio"
            whileHover={{
              scale: 1.035,
            }}
            whileTap={{
              scale: 0.98,
            }}
            transition={{
              duration: 0.18,
              ease: 'easeOut',
            }}
          >
            <img alt="LOGENT" className="logent-landing-logo" src={logentLogo} />
          </motion.a>

          <nav aria-label="Navegación pública" className="logent-landing-links">
            {navItems.map((item) => (
              <a href={item.href} key={item.href}>
                {item.label}
              </a>
            ))}
          </nav>

          <Link className="logent-landing-button" to="/login">
            Acceder al sistema
          </Link>
        </div>
      </motion.header>

      <motion.section
        animate="visible"
        className="logent-landing-hero"
        id="inicio"
        initial="hidden"
        variants={stagger}
      >
        <div className="logent-landing-container logent-landing-hero-grid">
          <motion.div className="logent-landing-hero-copy" variants={fadeUp}>
            <h1 className="logent-landing-title">
              Gestión de inventarios clara, segura y trazable
            </h1>

            <p className="logent-landing-description">
              LOGENT centraliza productos, almacenes, stock, movimientos, Kardex,
              reportes y auditoría en una plataforma preparada para operaciones reales.
            </p>

            <div className="logent-landing-actions">
              <Link className="logent-landing-button" to="/login">
                Acceder al sistema
              </Link>

              <a className="logent-landing-button-secondary" href="#modulos">
                Ver módulos
              </a>
            </div>
          </motion.div>

          <motion.div className="logent-landing-mockup-wrap" variants={fadeIn}>
            <motion.img
              alt="Vista responsive del sistema LOGENT en escritorio, tablet y móvil"
              className="logent-landing-mockup"
              src={deviceMockup}
              transition={{
                duration: 0.22,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={{
                scale: 1.015,
                y: -4,
              }}
            />
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        className="logent-landing-section"
        id="funciones"
        initial="hidden"
        variants={sectionReveal}
        viewport={{
          once: true,
          amount: 0.2,
        }}
        whileInView="visible"
      >
        <div className="logent-landing-container">
          <h2 className="logent-landing-section-title">Qué resuelve</h2>

          <motion.div
            className="logent-landing-feature-grid"
            initial="hidden"
            variants={stagger}
            viewport={{
              once: true,
              amount: 0.25,
            }}
            whileInView="visible"
          >
            {features.map((feature) => {
              const Icon = feature.icon

              return (
                <motion.article
                  className="logent-landing-card"
                  key={feature.title}
                  transition={{
                    duration: 0.2,
                    ease: 'easeOut',
                  }}
                  variants={fadeUp}
                  whileHover={{
                    y: -1,
                  }}
                >
                  <div className="logent-landing-card-icon">
                    <Icon size={20} />
                  </div>

                  <h3 className="logent-landing-card-title">{feature.title}</h3>
                </motion.article>
              )
            })}
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        className="logent-landing-section logent-landing-section-white"
        id="modulos"
        initial="hidden"
        variants={sectionReveal}
        viewport={{
          once: true,
          amount: 0.2,
        }}
        whileInView="visible"
      >
        <div className="logent-landing-container">
          <h2 className="logent-landing-section-title">Módulos principales</h2>

          <motion.div
            className="logent-landing-modules-grid"
            initial="hidden"
            variants={stagger}
            viewport={{
              once: true,
              amount: 0.2,
            }}
            whileInView="visible"
          >
            {modules.map((module) => {
              const Icon = module.icon

              return (
                <motion.article
                  className="logent-landing-module-item"
                  key={module.title}
                  transition={{
                    duration: 0.18,
                    ease: 'easeOut',
                  }}
                  variants={fadeUp}
                  whileHover={{
                    y: -1,
                  }}
                >
                  <Icon />
                  <span>{module.title}</span>
                </motion.article>
              )
            })}
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        className="logent-landing-section"
        id="roles"
        initial="hidden"
        variants={sectionReveal}
        viewport={{
          once: true,
          amount: 0.2,
        }}
        whileInView="visible"
      >
        <div className="logent-landing-container">
          <div className="logent-landing-roles-header">
            <h2>Control de Acceso (Roles)</h2>
            <p>Permisos estructurados para garantizar la seguridad de la información.</p>
          </div>

          <motion.div
            className="logent-landing-roles-grid"
            initial="hidden"
            variants={stagger}
            viewport={{
              once: true,
              amount: 0.25,
            }}
            whileInView="visible"
          >
            {roles.map((role) => {
              const Icon = role.icon

              return (
                <motion.article
                  className="logent-landing-role-card"
                  key={role.title}
                  transition={{
                    duration: 0.2,
                    ease: 'easeOut',
                  }}
                  variants={fadeUp}
                  whileHover={{
                    y: -1,
                  }}
                >
                  <div className="logent-landing-role-head">
                    <Icon />
                    <h3>{role.title}</h3>
                  </div>

                  <p>{role.description}</p>
                </motion.article>
              )
            })}
          </motion.div>
        </div>
      </motion.section>

      <section className="logent-landing-demo" id="demo">
        <div className="logent-landing-container">
          <motion.article
            className="logent-landing-demo-card"
            initial="hidden"
            variants={fadeUp}
            viewport={{
              once: true,
              amount: 0.35,
            }}
            whileInView="visible"
          >
            <div className="logent-landing-demo-icon">
              <LayoutDashboard size={20} />
            </div>

            <h2>Acceso a Demo</h2>
            <p>Ambiente local/demo para presentación del proyecto.</p>

            <div className="logent-landing-demo-credentials">
              <div className="logent-landing-demo-row">
                <span>Email</span>
                <code>admin@inventorysaas.com</code>
              </div>

              <div className="logent-landing-demo-row">
                <span>Password</span>
                <code>Admin123</code>
              </div>
            </div>

            <Link className="logent-landing-button" to="/login">
              Ir al login
            </Link>
          </motion.article>
        </div>
      </section>

      <motion.footer
        className="logent-landing-footer"
        initial="hidden"
        variants={sectionReveal}
        viewport={{
          once: true,
          amount: 0.15,
        }}
        whileInView="visible"
      >
        <div className="logent-landing-container logent-landing-footer-inner">
          <div className="logent-landing-footer-grid">
            <div className="logent-landing-footer-brand">
              <motion.a
                aria-label="Volver al inicio"
                className="logent-landing-footer-logo"
                href="#inicio"
                whileHover={{
                  scale: 1.02,
                }}
                whileTap={{
                  scale: 0.98,
                }}
                transition={{
                  duration: 0.18,
                  ease: 'easeOut',
                }}
              >
                <img alt="LOGENT" src={logentLogo} />
                <strong>LOGENT / InventorySaaS</strong>
              </motion.a>

              <p>
                LOGENT es una solución integral de gestión de inventarios diseñada
                para ofrecer trazabilidad total y control operativo preciso.
              </p>
            </div>

            <div className="logent-landing-footer-col">
              <strong>Producto</strong>
              <a href="#funciones">Funciones</a>
              <a href="#modulos">Módulos</a>
              <a href="#demo">Demo</a>
            </div>

            <div className="logent-landing-footer-col">
              <strong>Recursos</strong>
              <Link to="/login">Acceder</Link>
              <a href="#roles">Roles</a>
            </div>
          </div>

          <p className="logent-landing-copy">
            © 2026 LOGENT. Sistema de gestión de inventarios profesional enfocado en precisión y claridad administrativa.
          </p>
        </div>
      </motion.footer>
    </main>
  )
}
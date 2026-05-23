import {
  ArrowRightLeft,
  BarChart3,
  Boxes,
  ClipboardList,
  LayoutDashboard,
  Package,
  ScrollText,
  ShieldCheck,
  Tags,
  Truck,
  Warehouse,
  type LucideIcon,
} from 'lucide-react'
import type { AuthRole } from '../../types/auth'

export type NavigationItem = {
  allowedRoles: AuthRole[]
  description: string
  href: string
  icon: LucideIcon
  label: string
}

export const routeRoles = {
  auditLogs: ['Admin'],
  categories: ['Admin'],
  dashboard: ['Admin', 'Almacenero', 'Consulta'],
  kardex: ['Admin', 'Almacenero', 'Consulta'],
  movements: ['Admin', 'Almacenero'],
  products: ['Admin'],
  reports: ['Admin', 'Almacenero', 'Consulta'],
  stock: ['Admin', 'Almacenero', 'Consulta'],
  suppliers: ['Admin'],
  warehouses: ['Admin'],
} satisfies Record<string, AuthRole[]>

export const navigationItems: NavigationItem[] = [
  {
    allowedRoles: routeRoles.dashboard,
    description: 'Resumen operativo',
    href: '/dashboard',
    icon: LayoutDashboard,
    label: 'Dashboard',
  },
  {
    allowedRoles: routeRoles.categories,
    description: 'Clasificacion de productos',
    href: '/categories',
    icon: Tags,
    label: 'Categorias',
  },
  {
    allowedRoles: routeRoles.suppliers,
    description: 'Gestion de proveedores',
    href: '/suppliers',
    icon: Truck,
    label: 'Proveedores',
  },
  {
    allowedRoles: routeRoles.warehouses,
    description: 'Ubicaciones y sedes',
    href: '/warehouses',
    icon: Warehouse,
    label: 'Almacenes',
  },
  {
    allowedRoles: routeRoles.products,
    description: 'Catalogo maestro',
    href: '/products',
    icon: Package,
    label: 'Productos',
  },
  {
    allowedRoles: routeRoles.stock,
    description: 'Existencias actuales',
    href: '/stock',
    icon: Boxes,
    label: 'Stock',
  },
  {
    allowedRoles: routeRoles.movements,
    description: 'Entradas, salidas y transferencias',
    href: '/movements',
    icon: ArrowRightLeft,
    label: 'Movimientos',
  },
  {
    allowedRoles: routeRoles.kardex,
    description: 'Trazabilidad de inventario',
    href: '/kardex',
    icon: ClipboardList,
    label: 'Kardex',
  },
  {
    allowedRoles: routeRoles.reports,
    description: 'Indicadores y analitica',
    href: '/reports',
    icon: BarChart3,
    label: 'Reportes',
  },
  {
    allowedRoles: routeRoles.auditLogs,
    description: 'Registro de acciones',
    href: '/audit-logs',
    icon: ShieldCheck,
    label: 'Auditoria',
  },
]

export const defaultNavigationItem: NavigationItem = {
  allowedRoles: routeRoles.dashboard,
  description: 'Panel administrativo de inventario',
  href: '/dashboard',
  icon: ScrollText,
  label: 'Dashboard',
}

export function getNavigationItemsForRoles(roles: string[]): NavigationItem[] {
  return navigationItems.filter((item) => item.allowedRoles.some((role) => roles.includes(role)))
}

import {
  ArrowRightLeft,
  BarChart3,
  Boxes,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  Package,
  ScrollText,
  ShieldCheck,
  Tags,
  Truck,
  UsersRound,
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

export type NavigationGroup = {
  items: NavigationItem[]
  label: string
}

export const routeRoles = {
  auditLogs: ['Admin'],
  categories: ['Admin'],
  dashboard: ['Admin', 'Almacenero', 'Consulta'],
  kardex: ['Admin', 'Almacenero', 'Consulta'],
  movements: ['Admin', 'Almacenero'],
  plan: ['Admin', 'Almacenero', 'Consulta'],
  products: ['Admin'],
  reports: ['Admin', 'Almacenero', 'Consulta'],
  stock: ['Admin', 'Almacenero', 'Consulta'],
  suppliers: ['Admin'],
  users: ['Admin'],
  warehouses: ['Admin'],
} satisfies Record<string, AuthRole[]>

export const navigationGroups: NavigationGroup[] = [
  {
    label: 'General',
    items: [
      {
        allowedRoles: routeRoles.dashboard,
        description: 'Resumen operativo',
        href: '/dashboard',
        icon: LayoutDashboard,
        label: 'Dashboard',
      },
    ],
  },
  {
    label: 'Datos maestros',
    items: [
      {
        allowedRoles: routeRoles.categories,
        description: 'Clasificación de productos',
        href: '/categories',
        icon: Tags,
        label: 'Categorías',
      },
      {
        allowedRoles: routeRoles.suppliers,
        description: 'Gestión de proveedores',
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
    ],
  },
  {
    label: 'Operación',
    items: [
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
    ],
  },
  {
    label: 'Análisis',
    items: [
      {
        allowedRoles: routeRoles.reports,
        description: 'Indicadores y analítica',
        href: '/reports',
        icon: BarChart3,
        label: 'Reportes',
      },
    ],
  },
  {
    label: 'Administración',
    items: [
      {
        allowedRoles: routeRoles.users,
        description: 'Cuentas y roles internos',
        href: '/admin/users',
        icon: UsersRound,
        label: 'Usuarios',
      },
      {
        allowedRoles: routeRoles.auditLogs,
        description: 'Registro de acciones',
        href: '/audit-logs',
        icon: ShieldCheck,
        label: 'Auditoría',
      },
    ],
  },
  {
    label: 'Cuenta',
    items: [
      {
        allowedRoles: routeRoles.plan,
        description: 'Capacidad y plan actual',
        href: '/plan',
        icon: CreditCard,
        label: 'Plan',
      },
    ],
  },
]

export const navigationItems: NavigationItem[] = navigationGroups.flatMap((group) => group.items)

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

export function getNavigationGroupsForRoles(roles: string[]): NavigationGroup[] {
  return navigationGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.allowedRoles.some((role) => roles.includes(role))),
    }))
    .filter((group) => group.items.length > 0)
}

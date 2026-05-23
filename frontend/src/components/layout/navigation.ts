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

export type NavigationItem = {
  description: string
  href: string
  icon: LucideIcon
  label: string
}

export const navigationItems: NavigationItem[] = [
  {
    description: 'Resumen operativo',
    href: '/dashboard',
    icon: LayoutDashboard,
    label: 'Dashboard',
  },
  {
    description: 'Clasificacion de productos',
    href: '/categories',
    icon: Tags,
    label: 'Categorias',
  },
  {
    description: 'Gestion de proveedores',
    href: '/suppliers',
    icon: Truck,
    label: 'Proveedores',
  },
  {
    description: 'Ubicaciones y sedes',
    href: '/warehouses',
    icon: Warehouse,
    label: 'Almacenes',
  },
  {
    description: 'Catalogo maestro',
    href: '/products',
    icon: Package,
    label: 'Productos',
  },
  {
    description: 'Existencias actuales',
    href: '/stock',
    icon: Boxes,
    label: 'Stock',
  },
  {
    description: 'Entradas, salidas y transferencias',
    href: '/movements',
    icon: ArrowRightLeft,
    label: 'Movimientos',
  },
  {
    description: 'Trazabilidad de inventario',
    href: '/kardex',
    icon: ClipboardList,
    label: 'Kardex',
  },
  {
    description: 'Indicadores y analitica',
    href: '/reports',
    icon: BarChart3,
    label: 'Reportes',
  },
  {
    description: 'Registro de acciones',
    href: '/audit-logs',
    icon: ShieldCheck,
    label: 'Auditoria',
  },
]

export const defaultNavigationItem: NavigationItem = {
  description: 'Panel administrativo de inventario',
  href: '/dashboard',
  icon: ScrollText,
  label: 'Dashboard',
}

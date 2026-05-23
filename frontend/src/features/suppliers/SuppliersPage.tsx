import { Truck } from 'lucide-react'
import { EmptyState } from '../../components/common/EmptyState'
import { PageHeader } from '../../components/common/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'

export function SuppliersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        description="Gestion de proveedores asociados al inventario."
        title="Proveedores"
      />
      <Card>
        <CardHeader>
          <CardTitle>Directorio de proveedores</CardTitle>
          <CardDescription>Este modulo se implementara en una fase posterior.</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            description="Aqui se agregaran listados, busqueda y acciones de mantenimiento para proveedores."
            icon={<Truck className="h-6 w-6" />}
            title="Proveedores pendientes"
          />
        </CardContent>
      </Card>
    </div>
  )
}

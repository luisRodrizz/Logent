import { Warehouse } from 'lucide-react'
import { EmptyState } from '../../components/common/EmptyState'
import { PageHeader } from '../../components/common/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'

export function WarehousesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        description="Control de almacenes, sedes y ubicaciones operativas."
        title="Almacenes"
      />
      <Card>
        <CardHeader>
          <CardTitle>Gestion de almacenes</CardTitle>
          <CardDescription>Este modulo se implementara en una fase posterior.</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            description="Las vistas de almacenes se prepararan para listar y mantener ubicaciones del inventario."
            icon={<Warehouse className="h-6 w-6" />}
            title="Almacenes listos para configurar"
          />
        </CardContent>
      </Card>
    </div>
  )
}

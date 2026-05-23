import { Package } from 'lucide-react'
import { EmptyState } from '../../components/common/EmptyState'
import { PageHeader } from '../../components/common/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'

export function ProductsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        description="Catalogo maestro de productos, SKU y configuracion de stock minimo."
        title="Productos"
      />
      <Card>
        <CardHeader>
          <CardTitle>Catalogo de productos</CardTitle>
          <CardDescription>Este modulo se implementara en una fase posterior.</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            description="Los formularios, filtros y tablas de productos se agregaran cuando llegue la fase de CRUD."
            icon={<Package className="h-6 w-6" />}
            title="Productos preparados"
          />
        </CardContent>
      </Card>
    </div>
  )
}

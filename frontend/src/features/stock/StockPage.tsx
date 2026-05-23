import { Boxes } from 'lucide-react'
import { EmptyState } from '../../components/common/EmptyState'
import { PageHeader } from '../../components/common/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'

export function StockPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        description="Consulta de existencias por producto y almacen."
        title="Stock"
      />
      <Card>
        <CardHeader>
          <CardTitle>Existencias actuales</CardTitle>
          <CardDescription>Este modulo se implementara en una fase posterior.</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            description="El stock sera una vista de consulta conectada al backend; no se editara manualmente desde aqui."
            icon={<Boxes className="h-6 w-6" />}
            title="Stock pendiente de API"
          />
        </CardContent>
      </Card>
    </div>
  )
}

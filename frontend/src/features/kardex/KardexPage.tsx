import { ClipboardList } from 'lucide-react'
import { EmptyState } from '../../components/common/EmptyState'
import { PageHeader } from '../../components/common/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'

export function KardexPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        description="Trazabilidad de inventario generada por movimientos."
        title="Kardex"
      />
      <Card>
        <CardHeader>
          <CardTitle>Historial Kardex</CardTitle>
          <CardDescription>Este modulo se implementara en una fase posterior.</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            description="Kardex sera una vista de solo lectura para consultar entradas, salidas y saldos."
            icon={<ClipboardList className="h-6 w-6" />}
            title="Kardex pendiente"
          />
        </CardContent>
      </Card>
    </div>
  )
}

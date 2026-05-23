import { ArrowRightLeft } from 'lucide-react'
import { EmptyState } from '../../components/common/EmptyState'
import { PageHeader } from '../../components/common/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'

export function MovementsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        description="Registro futuro de entradas, salidas y transferencias."
        title="Movimientos"
      />
      <Card>
        <CardHeader>
          <CardTitle>Operaciones de inventario</CardTitle>
          <CardDescription>Este modulo se implementara en una fase posterior.</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            description="Los movimientos generaran Kardex automaticamente cuando se conecte el flujo operativo."
            icon={<ArrowRightLeft className="h-6 w-6" />}
            title="Movimientos listos para construir"
          />
        </CardContent>
      </Card>
    </div>
  )
}

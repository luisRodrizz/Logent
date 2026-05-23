import { BarChart3 } from 'lucide-react'
import { EmptyState } from '../../components/common/EmptyState'
import { PageHeader } from '../../components/common/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'

export function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        description="Reportes operativos y resumenes para decision."
        title="Reportes"
      />
      <Card>
        <CardHeader>
          <CardTitle>Centro de reportes</CardTitle>
          <CardDescription>Este modulo se implementara en una fase posterior.</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            description="Los reportes y graficos se conectaran cuando se implemente el consumo de API."
            icon={<BarChart3 className="h-6 w-6" />}
            title="Reportes preparados"
          />
        </CardContent>
      </Card>
    </div>
  )
}

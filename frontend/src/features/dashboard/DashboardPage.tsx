import { LayoutDashboard } from 'lucide-react'
import { EmptyState } from '../../components/common/EmptyState'
import { PageHeader } from '../../components/common/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        description="Vista inicial del panel administrativo. Los indicadores reales se conectaran en Fase 22."
        title="Dashboard"
      />
      <Card>
        <CardHeader>
          <CardTitle>Resumen del sistema</CardTitle>
          <CardDescription>Este modulo se implementara en una fase posterior.</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            description="Aqui se mostraran metricas, alertas de stock y movimientos recientes cuando el dashboard consuma la API."
            icon={<LayoutDashboard className="h-6 w-6" />}
            title="Dashboard preparado"
          />
        </CardContent>
      </Card>
    </div>
  )
}

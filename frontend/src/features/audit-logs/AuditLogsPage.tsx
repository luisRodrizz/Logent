import { ShieldCheck } from 'lucide-react'
import { EmptyState } from '../../components/common/EmptyState'
import { PageHeader } from '../../components/common/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'

export function AuditLogsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        description="Consulta futura de acciones auditadas por usuario, entidad y evento."
        title="Auditoria"
      />
      <Card>
        <CardHeader>
          <CardTitle>Registro de auditoria</CardTitle>
          <CardDescription>Este modulo se implementara en una fase posterior.</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            description="Los permisos por rol y el acceso exclusivo de Admin se conectaran en fases posteriores."
            icon={<ShieldCheck className="h-6 w-6" />}
            title="Auditoria pendiente"
          />
        </CardContent>
      </Card>
    </div>
  )
}

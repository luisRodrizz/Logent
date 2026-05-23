import { Tags } from 'lucide-react'
import { EmptyState } from '../../components/common/EmptyState'
import { PageHeader } from '../../components/common/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'

export function CategoriesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        description="Administracion de categorias para clasificar productos."
        title="Categorias"
      />
      <Card>
        <CardHeader>
          <CardTitle>Catalogo de categorias</CardTitle>
          <CardDescription>Este modulo se implementara en una fase posterior.</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            description="La gestion de categorias se conectara a los endpoints correspondientes cuando se implementen los CRUD."
            icon={<Tags className="h-6 w-6" />}
            title="Categorias listas para construir"
          />
        </CardContent>
      </Card>
    </div>
  )
}

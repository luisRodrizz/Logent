import type { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import type { AuthRole } from '../../types/auth'
import { useAuth } from './useAuth'

type RequireRoleProps = {
  allowedRoles: AuthRole[]
  children: ReactNode
}

export function RequireRole({ allowedRoles, children }: RequireRoleProps) {
  const { user } = useAuth()
  const hasAllowedRole = user?.roles.some((role) => allowedRoles.includes(role as AuthRole))

  if (!hasAllowedRole) {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>Acceso restringido</CardTitle>
          <CardDescription>
            Tu rol actual no tiene permisos para abrir esta seccion del panel administrativo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-muted">
            Solicita acceso a un administrador si necesitas consultar esta informacion.
          </p>
        </CardContent>
      </Card>
    )
  }

  return children
}

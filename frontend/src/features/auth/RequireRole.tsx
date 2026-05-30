import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import type { AuthRole } from '../../types/auth'
import { useAuth } from './useAuth'

type RequireRoleProps = {
  allowedRoles: AuthRole[]
  children: ReactNode
}

export function RequireRole({ allowedRoles, children }: RequireRoleProps) {
  const location = useLocation()
  const { user } = useAuth()
  const hasAllowedRole = user?.roles.some((role) => allowedRoles.includes(role as AuthRole))

  if (!hasAllowedRole) {
    return <Navigate replace state={{ from: location }} to="/unauthorized" />
  }

  return children
}

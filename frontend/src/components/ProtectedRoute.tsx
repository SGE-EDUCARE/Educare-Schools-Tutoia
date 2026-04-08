import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore, type Role } from '../store/useAuthStore'

interface ProtectedRouteProps {
  allowedRoles?: Role[]
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Se não tem role específica ou se a role do user está dentro das permitidas
  if (!allowedRoles || (user && allowedRoles.includes(user.role))) {
    return <Outlet />
  }

  // Redireciona para um 'Não autorizado' ou página inicial baseado na user role
  return <Navigate to="/unauthorized" replace />
}

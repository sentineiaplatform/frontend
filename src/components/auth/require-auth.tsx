import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuth } from '@/contexts/auth-context'

/** Protege rotas filhas: exige sessão válida; caso contrário redireciona para `/login`. */
export function RequireAuth() {
  const { isReady, isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isReady) {
    return (
      <div className="text-muted-foreground flex min-h-svh items-center justify-center text-sm">
        A carregar…
      </div>
    )
  }

  if (!isAuthenticated) {
    const redirectTo = `${location.pathname}${location.search}${location.hash}`
    return <Navigate to="/login" replace state={{ redirectTo }} />
  }

  return <Outlet />
}

import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

import { useAuth } from '@/contexts/auth-context'

/** Para páginas só públicas (ex.: login): utilizador autenticado vai para a app. */
export function RedirectIfAuthenticated({ children }: Readonly<{ children: ReactNode }>) {
  const { isReady, isAuthenticated } = useAuth()

  if (!isReady) {
    return (
      <div className="text-muted-foreground flex min-h-svh items-center justify-center text-sm">
        A carregar…
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/app/painel" replace />
  }

  return <>{children}</>
}

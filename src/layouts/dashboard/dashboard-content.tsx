import { Outlet } from 'react-router-dom'

import { cn } from '@/lib/utils'

/** Área principal onde as páginas do dashboard são renderizadas. */
export function DashboardContent() {
  return (
    <div
      data-dashboard-main-scroll
      className={cn(
        'scrollbar-app bg-muted/35 flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-y-contain px-2 md:px-3 lg:px-4',
        'pt-4 pb-4 md:pt-6 md:pb-6',
        '[&:has([data-investigacao-workspace])]:pt-0',
      )}
    >
      <Outlet />
    </div>
  )
}

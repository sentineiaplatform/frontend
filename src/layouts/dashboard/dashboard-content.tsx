import { Outlet } from 'react-router-dom'

/** Área principal onde as páginas do dashboard são renderizadas. */
export function DashboardContent() {
  return (
    <div
      data-dashboard-main-scroll
      className="scrollbar-app bg-muted/35 flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-y-contain p-4 md:p-6"
    >
      <Outlet />
    </div>
  )
}

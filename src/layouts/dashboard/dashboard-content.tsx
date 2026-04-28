import { Outlet } from 'react-router-dom'

/** Área principal onde as páginas do dashboard são renderizadas. */
export function DashboardContent() {
  return (
    <div
      data-dashboard-main-scroll
      className="scrollbar-app bg-muted/35 flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-y-contain py-4 px-2 md:py-6 md:px-3 lg:px-4"
    >
      <Outlet />
    </div>
  )
}

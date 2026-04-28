import { Outlet } from 'react-router-dom'

/** Área principal onde as páginas do dashboard são renderizadas. */
export function DashboardContent() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <Outlet />
    </div>
  )
}

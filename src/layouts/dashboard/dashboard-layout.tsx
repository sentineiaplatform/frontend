import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

import { DashboardContent } from '@/layouts/dashboard/dashboard-content'
import { DashboardHeader } from '@/layouts/dashboard/dashboard-header'
import { DashboardSidebar } from '@/layouts/dashboard/dashboard-sidebar'

/** Shell do aplicativo interno — sidebar persistida, header fixo e conteúdo com rota aninhada. */
export function DashboardLayout() {
  return (
    <SidebarProvider defaultOpen>
      <DashboardSidebar />
      <SidebarInset className="flex min-h-svh flex-col overflow-x-hidden">
        <DashboardHeader />
        <DashboardContent />
      </SidebarInset>
    </SidebarProvider>
  )
}

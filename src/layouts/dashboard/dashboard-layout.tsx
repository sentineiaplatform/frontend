import type { CSSProperties } from 'react'

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

import { DashboardContent } from '@/layouts/dashboard/dashboard-content'
import { DashboardHeader } from '@/layouts/dashboard/dashboard-header'
import { DashboardSidebar } from '@/layouts/dashboard/dashboard-sidebar'

/**
 * Referência tipo Finerdx: linha superior full-width no topo; sidebar + conteúdo ocupam só a área abaixo do header.
 * O `SidebarProvider` usa altura fixa ao viewport para o scroll ficar na área principal (estilo da scrollbar), não no documento.
 */
export function DashboardLayout() {
  return (
    <SidebarProvider
      defaultOpen
      className="flex h-[100dvh] max-h-[100dvh] min-h-0 w-full flex-col overflow-hidden border-0 p-0"
      style={{ '--sidebar-width': '14rem' } as CSSProperties}
    >
      <DashboardHeader />
      {/* Reserva a altura do header (fixed fora do fluxo) para o flex filho encaixar em min-h-0 + scroll */}
      <div className="h-14 shrink-0" aria-hidden />
      <div className="flex min-h-0 w-full flex-1 flex-row items-stretch overflow-hidden">
        <DashboardSidebar />
        <SidebarInset className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <DashboardContent />
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

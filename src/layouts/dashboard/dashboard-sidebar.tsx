import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar'

const skeletonRows = Array.from({ length: 8 }, (_, i) => i)

/** Navegação lateral — apenas placeholders até definir menus reais. */
export function DashboardSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-sidebar-border gap-4 border-b p-4">
        <div className="flex items-center gap-2">
          {/* Logo / marca — skeleton */}
          <div className="bg-sidebar-accent h-10 w-full max-w-[10rem] rounded-lg" />
          <span className="sr-only">Menu principal</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {skeletonRows.map((i) => (
              <SidebarMenuItem key={`nav-s-${i}`}>
                <SidebarMenuSkeleton showIcon />
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
          <SidebarSeparator className="my-4" />
          <SidebarMenu>
            {skeletonRows.slice(0, 4).map((i) => (
              <SidebarMenuItem key={`nav-ss-${i}`}>
                <SidebarMenuSkeleton showIcon />
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-sidebar-border gap-4 border-t p-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="flex items-center gap-3">
              <div className="bg-sidebar-accent size-9 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-2 overflow-hidden">
                <div className="bg-sidebar-accent h-3.5 rounded-md" />
                <div className="bg-sidebar-accent h-3 w-2/3 rounded-md" />
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

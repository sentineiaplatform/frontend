import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'

/** Barra superior global — aciona sidebar + área de comando / usuário como skeleton. */
export function DashboardHeader() {
  return (
    <header className="bg-background sticky top-0 z-10 flex shrink-0 flex-wrap items-center gap-3 gap-y-4 border-b px-4 py-3 md:px-6">
      <div className="flex shrink-0 items-center gap-2">
        <SidebarTrigger />
      </div>
      <Separator orientation="vertical" className="data-[orientation=vertical]:h-9" />
      {/* Breadcrumbs / contexto */}
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        <Skeleton className="h-5 w-32 max-w-[40vw] md:w-52" />
        <Skeleton className="h-5 w-20 max-w-[30vw]" />
      </div>
      {/* Ações — busca / notificações / perfil (skeleton) */}
      <div className="flex shrink-0 items-center gap-2 md:gap-3">
        <Skeleton className="hidden h-9 w-48 sm:block lg:w-64" />
        <Skeleton className="size-9 rounded-full" />
      </div>
    </header>
  )
}

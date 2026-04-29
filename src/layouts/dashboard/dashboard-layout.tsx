import type { CSSProperties } from 'react'
import { useLayoutEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { SidebarInset, SidebarProvider, useSidebar } from '@/components/ui/sidebar'

import { ConfiguracoesSidebar } from '@/layouts/dashboard/configuracoes-sidebar'
import { DashboardContent } from '@/layouts/dashboard/dashboard-content'
import { DashboardHeader } from '@/layouts/dashboard/dashboard-header'
import { DashboardSidebar } from '@/layouts/dashboard/dashboard-sidebar'
import { cn } from '@/lib/utils'

function DashboardShellBody() {
  const { pathname } = useLocation()
  const { setOpen } = useSidebar()
  const areaConfiguracoes = pathname.startsWith('/app/configuracoes')
  const areaAnteriorRef = useRef<boolean | null>(null)
  const [travarAnimLarguraPrincipal, setTravarAnimLarguraPrincipal] = useState(false)

  /**
   * Largura animada em sidebar + coluna + troca de rota = reflow contínuo (travamento).
   * Aqui: sem animação de largura ao cruzar /app/configuracoes, só aplica estado aberto/fechado.
   * `travarAnimLarguraPrincipal` desliga transição CSS do shadcn por 2 frames no cruce.
   */
  useLayoutEffect(() => {
    const anterior = areaAnteriorRef.current
    const agora = areaConfiguracoes
    areaAnteriorRef.current = agora

    if (anterior === null) {
      if (agora) setOpen(false)
      return
    }

    if (anterior === agora) {
      return
    }

    setTravarAnimLarguraPrincipal(true)
    if (agora) {
      setOpen(false)
    } else {
      setOpen(true)
    }

    let raf2 = 0
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        setTravarAnimLarguraPrincipal(false)
      })
    })

    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
    }
  }, [areaConfiguracoes, setOpen])

  const principalSemAnimLargura = travarAnimLarguraPrincipal || areaConfiguracoes

  return (
    <div
      className={cn(
        'flex min-h-0 w-full flex-1 flex-row items-stretch overflow-hidden',
        principalSemAnimLargura
          ? '[&_[data-slot=sidebar-gap]]:!transition-none [&_[data-slot=sidebar-container]]:!transition-none'
            : [
              '[&_[data-slot=sidebar-gap]]:!transition-[width] [&_[data-slot=sidebar-gap]]:!duration-300 [&_[data-slot=sidebar-gap]]:!ease-[cubic-bezier(0.22,1,0.36,1)]',
              '[&_[data-slot=sidebar-container]]:!transition-[left,right,width] [&_[data-slot=sidebar-container]]:!duration-300 [&_[data-slot=sidebar-container]]:!ease-[cubic-bezier(0.22,1,0.36,1)]',
              'motion-reduce:[&_[data-slot=sidebar-gap]]:!transition-none motion-reduce:[&_[data-slot=sidebar-container]]:!transition-none',
            ],
      )}
    >
      <DashboardSidebar />
      <ConfiguracoesSidebar open={areaConfiguracoes} />
      <SidebarInset className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <DashboardContent />
      </SidebarInset>
    </div>
  )
}

/**
 * Sidebar principal + coluna de configurações: evitar animar `width` ao entrar/sair de configurações
 * (isso dispara layout pesado junto com `<Outlet />`).
 */
export function DashboardLayout() {
  return (
    <SidebarProvider
      defaultOpen
      className="flex h-[100dvh] max-h-[100dvh] min-h-0 w-full flex-col overflow-hidden border-0 p-0"
      style={{ '--sidebar-width': '14rem' } as CSSProperties}
    >
      <DashboardHeader />
      <div className="h-14 shrink-0" aria-hidden />
      <DashboardShellBody />
    </SidebarProvider>
  )
}

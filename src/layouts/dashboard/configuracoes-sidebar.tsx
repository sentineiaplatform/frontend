import { Link, useLocation } from 'react-router-dom'
import {
  ArrowLeftIcon,
  ScrollTextIcon,
  ShieldIcon,
  SlidersHorizontalIcon,
  UserIcon,
  type LucideIcon,
} from 'lucide-react'

import { Separator } from '@/components/ui/separator'
import { navItemButtonClass } from '@/layouts/dashboard/dashboard-nav-shared'
import { cn } from '@/lib/utils'

const configuracoesNavItems: { to: string; label: string; icon: LucideIcon }[] = [
  { to: '/app/configuracoes/geral', label: 'Geral', icon: SlidersHorizontalIcon },
  { to: '/app/configuracoes/perfil', label: 'Perfil', icon: UserIcon },
  { to: '/app/configuracoes/seguranca', label: 'Segurança', icon: ShieldIcon },
  { to: '/app/configuracoes/logs', label: 'Logs', icon: ScrollTextIcon },
]

function navAtivo(pathname: string, to: string) {
  return pathname === to
}

type ConfiguracoesSidebarProps = {
  /** Quando true, expande em largura em sincronia com o colapso do sidebar principal. */
  open: boolean
}

/**
 * Coluna ao lado do principal: **sem** transição de largura (troca instantânea) para não disputar
 * layout com o sidebar shadcn nem com a página do `<Outlet />`.
 */
export function ConfiguracoesSidebar({ open }: Readonly<ConfiguracoesSidebarProps>) {
  const { pathname } = useLocation()

  return (
    <aside
      aria-hidden={!open}
      aria-label="Submenu de configurações"
      className={cn(
        'relative hidden shrink-0 md:flex',
        'bg-brand-navy flex-col text-white [contain:layout]',
        'overflow-hidden',
        open
          ? 'w-[min(13.5rem,100%)] max-w-[13.5rem] border-r border-white/15 opacity-100'
          : 'w-0 max-w-0 border-r border-transparent opacity-0 pointer-events-none',
      )}
    >
      <div
        className={cn(
          'flex h-full min-h-0 flex-col',
          'w-[13.5rem] max-w-[13.5rem]',
          'pt-2 pb-2',
          '[scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,.2)_transparent]',
        )}
      >
        <div className="sticky top-0 z-[1] mb-1 space-y-2 px-2">
          <Link
            to="/app/painel"
            className={cn(
              'flex min-h-8 items-center gap-2 rounded-lg px-2 py-1.5 text-[12px] font-medium text-white/80',
              'hover:bg-white/10 hover:text-white',
              '[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-white/55',
              'transition-colors duration-150',
            )}
          >
            <ArrowLeftIcon className="shrink-0" strokeWidth={1.65} aria-hidden />
            <span>Voltar</span>
          </Link>
          <div className="px-1">
            <p className="text-[0.625rem] font-semibold tracking-[0.12em] text-white/50 uppercase">
              Configurações
            </p>
          </div>
          <Separator className="bg-white/10" />
        </div>

        <nav
          className={cn(
            'min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain px-0 pb-1',
            'touch-pan-y',
          )}
        >
          <ul className="flex flex-col gap-0.5">
            {configuracoesNavItems.map((item) => {
              const active = navAtivo(pathname, item.to)
              const Icon = item.icon
              return (
                <li key={item.to} className="group/menu-item relative">
                  <Link
                    to={item.to}
                    data-active={active ? 'true' : undefined}
                    className={cn(
                      'peer/menu-button flex w-full cursor-pointer items-center overflow-hidden',
                      'ring-sidebar-ring outline-hidden',
                      navItemButtonClass(active),
                    )}
                  >
                    <Icon className="shrink-0" strokeWidth={1.65} aria-hidden />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </aside>
  )
}

import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from 'next-themes'
import {
  BarChart3Icon,
  BotIcon,
  ChevronDownIcon,
  CircleHelpIcon,
  EyeIcon,
  DatabaseIcon,
  FileTextIcon,
  InboxIcon,
  LayoutDashboardIcon,
  MoonIcon,
  SettingsIcon,
  SparklesIcon,
  SunIcon,
  type LucideIcon,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import {
  navItemButtonClass,
  navItemButtonFooterClass,
  navSubmenuActiveClass,
} from '@/layouts/dashboard/dashboard-nav-shared'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

/** Badge à direita no menu navy: leitura estável no hover da linha (evita texto clarinho sobre fundo claro). */
const SIDEBAR_NAV_BADGE_CLASS =
  'h-auto min-h-5 min-w-0 rounded-full border border-white/25 bg-white/[0.94] px-2 py-[3px] text-[10px] font-semibold uppercase leading-none tracking-wide text-slate-900 shadow-sm ring-1 ring-black/[0.06]'

const SIDEBAR_NAV_BADGE_SM_CLASS =
  'h-auto min-h-5 min-w-0 rounded-full border border-white/25 bg-white/[0.94] px-1.5 py-[3px] text-[9px] font-semibold uppercase leading-none tracking-wide text-slate-900 shadow-sm ring-1 ring-black/[0.06]'

type NavLeaf = {
  to: string
  label: string
  tooltip: string
  icon: LucideIcon
  badge?: string
}

const principalLeafItems: NavLeaf[] = [
  { to: '/app/painel', label: 'Painel', tooltip: 'Painel', icon: LayoutDashboardIcon },
  { to: '/app/denuncias', label: 'Denúncias', tooltip: 'Denúncias', icon: InboxIcon },
]

function navItemActive(pathname: string, to: string) {
  return pathname === to
}

/** Submenus e fundo navy: texto mais claro. */
const subNavClass =
  'h-7 min-h-0 py-1 text-[12px] font-medium text-white/72 hover:bg-white/[0.06] hover:text-white'

/** Seta dos itens pai colapsáveis: `ml-auto` encostava na borda direita do botão / da barra. */
const parentNavChevronClass =
  'ml-auto mr-1 size-3.5 shrink-0 text-white/45 transition-transform duration-200 group-data-[state=open]:rotate-180'

const relatoriosSub = [
  { to: '/app/relatorios/visao-geral', label: 'Visão geral' },
  { to: '/app/relatorios/por-periodo', label: 'Por período' },
  { to: '/app/relatorios/agendados', label: 'Agendados' },
]

const dadosMestresSub = [
  { to: '/app/dados-mestres/status-denuncias', label: 'Status denúncias' },
  { to: '/app/dados-mestres/categoria-denuncias', label: 'Categoria denúncias' },
]

export function DashboardSidebar() {
  const { pathname } = useLocation()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const lightSelected =
    mounted &&
    (theme === 'light' || (theme === 'system' && resolvedTheme === 'light'))
  const darkSelected =
    mounted &&
    (theme === 'dark' || (theme === 'system' && resolvedTheme === 'dark'))

  const configuracoesActive = pathname.startsWith('/app/configuracoes')

  return (
    <Sidebar
      collapsible="icon"
      className={cn(
        'border-sidebar-border bg-brand-navy z-30 border-t border-r border-white/15 text-white',
        '!top-14 !bottom-0 !h-auto max-h-none rounded-none',
        'h-auto max-h-none min-h-0 overflow-hidden [&_[data-slot=sidebar-inner]]:!min-h-0',
        '[&_[data-slot=sidebar-inner]]:!bg-brand-navy [&_[data-slot=sidebar-inner]]:rounded-none',
      )}
    >
      <SidebarContent
        className={cn(
          'flex min-h-0 flex-1 flex-col gap-0 overflow-hidden px-0 pb-0 pt-2',
          'group-data-[collapsible=icon]:min-h-0 group-data-[collapsible=icon]:overflow-hidden',
        )}
      >
        {/* Navegação principal rolável */}
        <div
          className={cn(
            'min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain pb-2',
            '[scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,.2)_transparent]',
            'touch-pan-y',
          )}
        >
          <SidebarGroup className="p-0">
            <div className="mb-2 flex items-center justify-between px-3 font-heading text-white/50 group-data-[collapsible=icon]:mb-1.5 group-data-[collapsible=icon]:justify-center">
              <span className="text-[0.625rem] font-semibold tracking-[0.12em] uppercase group-data-[collapsible=icon]:hidden">
                Principal
              </span>
              <SidebarTrigger
                type="button"
                className="size-7 shrink-0 text-white/72 hover:bg-white/10 hover:text-white [&_svg]:size-3.5"
              />
            </div>

            <SidebarMenu className="gap-0.5">
              {principalLeafItems.map((item) => {
                const active = navItemActive(pathname, item.to)
                const Icon = item.icon
                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.tooltip}
                      isActive={active}
                      className={navItemButtonClass(active)}
                    >
                      <Link to={item.to}>
                        <Icon className="shrink-0" strokeWidth={1.65} aria-hidden />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.badge ? (
                      <SidebarMenuBadge className={SIDEBAR_NAV_BADGE_CLASS}>{item.badge}</SidebarMenuBadge>
                    ) : null}
                  </SidebarMenuItem>
                )
              })}

              <SidebarMenuItem>
                <Collapsible defaultOpen={false} className="group w-full min-w-0">
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip="Relatórios"
                      isActive={false}
                      type="button"
                      className={cn(navItemButtonClass(false), 'pr-3.5')}
                    >
                      <FileTextIcon className="shrink-0" strokeWidth={1.65} aria-hidden />
                      <span>Relatórios</span>
                      <ChevronDownIcon className={parentNavChevronClass} aria-hidden />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className="mx-0 ml-2.5 gap-0 px-2.5 pr-1.5 py-0.5 [&_[data-sidebar=menu-sub-item]]:before:bg-white/25 [&_[data-sidebar=menu-sub-item]]:after:bg-white/25">
                      {relatoriosSub.map((sub) => {
                        const subActive = navItemActive(pathname, sub.to)
                        return (
                          <SidebarMenuSubItem key={sub.label}>
                            <SidebarMenuSubButton
                              asChild
                              size="sm"
                              isActive={subActive}
                              className={cn(
                                subNavClass,
                                subActive && navSubmenuActiveClass(),
                              )}
                            >
                              <Link to={sub.to}>{sub.label}</Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Insights IA"
                  isActive={navItemActive(pathname, '/app/indicadores')}
                  className={cn(
                    navItemButtonClass(navItemActive(pathname, '/app/indicadores')),
                    'pr-8',
                  )}
                >
                  <Link to="/app/indicadores">
                    <BarChart3Icon className="shrink-0" strokeWidth={1.65} aria-hidden />
                    <span>Insights IA</span>
                  </Link>
                </SidebarMenuButton>
                <SidebarMenuAction
                  aria-label="Pré-visualizar"
                  title="Pré-visualizar"
                  type="button"
                  className="text-white/50 hover:bg-white/10 hover:text-white"
                  onClick={(e) => e.preventDefault()}
                >
                  <EyeIcon className="size-3.5" strokeWidth={1.65} />
                </SidebarMenuAction>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>

          <SidebarSeparator className="mx-3 h-px bg-white/15 group-data-[collapsible=icon]:mx-2" />

          <SidebarGroup className="p-0">
            <SidebarMenu className="gap-0.5">
              <SidebarMenuItem>
                <Collapsible defaultOpen className="group w-full min-w-0">
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip="Dados Mestres"
                      isActive={false}
                      type="button"
                      className={cn(navItemButtonClass(false), 'pr-3.5')}
                    >
                      <DatabaseIcon className="shrink-0" strokeWidth={1.65} aria-hidden />
                      <span>Dados Mestres</span>
                      <ChevronDownIcon className={parentNavChevronClass} aria-hidden />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className="mx-0 ml-2.5 gap-0 px-2.5 pr-1.5 py-0.5 [&_[data-sidebar=menu-sub-item]]:before:bg-white/25 [&_[data-sidebar=menu-sub-item]]:after:bg-white/25">
                      {dadosMestresSub.map((sub) => {
                        const subActive = navItemActive(pathname, sub.to)
                        return (
                          <SidebarMenuSubItem key={sub.label}>
                            <SidebarMenuSubButton
                              asChild
                              size="sm"
                              isActive={subActive}
                              className={cn(
                                subNavClass,
                                subActive && navSubmenuActiveClass(),
                              )}
                            >
                              <Link to={sub.to}>{sub.label}</Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  type="button"
                  tooltip="Copiloto IA — em breve"
                  isActive={false}
                  className={cn(navItemButtonClass(false), 'text-white/[0.82] [&_svg]:text-white/55')}
                  onClick={() => toast.message('Copiloto IA disponível em breve.')}
                >
                  <BotIcon className="shrink-0" strokeWidth={1.65} aria-hidden />
                  <span>Copiloto IA</span>
                </SidebarMenuButton>
                <SidebarMenuBadge title="Em breve" className={SIDEBAR_NAV_BADGE_SM_CLASS}>
                  Breve
                </SidebarMenuBadge>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </div>

        {/* Conta / ajuda: acima do toggle de tema — respiro do fundo da barra */}
        <div className="mt-auto shrink-0 border-t border-white/[0.06] px-0 pb-3 pt-2">
          <SidebarGroup className="p-0">
            <SidebarMenu className="gap-0">
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Recursos Pro"
                  isActive={navItemActive(pathname, '/app/recursos-pro')}
                  className={navItemButtonFooterClass(navItemActive(pathname, '/app/recursos-pro'))}
                >
                  <Link to="/app/recursos-pro">
                    <SparklesIcon className="shrink-0" strokeWidth={1.5} aria-hidden />
                    <span>Recursos Pro</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Configurações"
                  isActive={configuracoesActive}
                  className={navItemButtonFooterClass(configuracoesActive)}
                >
                  <Link to="/app/configuracoes">
                    <SettingsIcon className="shrink-0" strokeWidth={1.5} aria-hidden />
                    <span>Configurações</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Ajuda"
                  isActive={navItemActive(pathname, '/app/ajuda')}
                  className={navItemButtonFooterClass(navItemActive(pathname, '/app/ajuda'))}
                >
                  <Link to="/app/ajuda">
                    <CircleHelpIcon className="shrink-0" strokeWidth={1.5} aria-hidden />
                    <span>Ajuda</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </div>
      </SidebarContent>

      <SidebarFooter className="shrink-0 gap-0 border-t border-white/[0.06] bg-brand-navy px-2 py-2 pb-3">
        {mounted === false ? (
          <div className="h-6 w-full rounded-md bg-white/[0.07]" aria-hidden />
        ) : (
          <div
            className={cn(
              'flex rounded-md bg-white/[0.06] p-px',
              'ring-1 ring-inset ring-white/[0.08]',
              'group-data-[collapsible=icon]:flex-col',
            )}
            aria-label="Tema da interface"
          >
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn(
                'h-6 flex-1 gap-0.5 rounded-[4px] px-1.5 text-[9px] font-medium tracking-tight',
                lightSelected
                  ? 'bg-white text-[#7c3aed] shadow-sm'
                  : 'text-white/55 hover:bg-white/[0.05] hover:text-white/90',
              )}
              onClick={() => setTheme('light')}
            >
              <SunIcon
                className={cn(
                  'size-2.5 shrink-0',
                  lightSelected ? 'text-[#7c3aed]' : 'text-white/50',
                )}
                strokeWidth={1.75}
                aria-hidden
              />
              <span className="group-data-[collapsible=icon]:hidden">Claro</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn(
                'h-6 flex-1 gap-0.5 rounded-[4px] px-1.5 text-[9px] font-medium tracking-tight',
                darkSelected
                  ? 'bg-white text-[#7c3aed] shadow-sm'
                  : 'text-white/55 hover:bg-white/[0.05] hover:text-white/90',
              )}
              onClick={() => setTheme('dark')}
            >
              <MoonIcon
                className={cn(
                  'size-2.5 shrink-0',
                  darkSelected ? 'text-[#7c3aed]' : 'text-white/50',
                )}
                strokeWidth={1.75}
                aria-hidden
              />
              <span className="group-data-[collapsible=icon]:hidden">Escuro</span>
            </Button>
          </div>
        )}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

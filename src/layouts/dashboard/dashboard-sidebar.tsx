import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from 'next-themes'
import {
  BarChart3Icon,
  Building2Icon,
  ChevronDownIcon,
  CircleHelpIcon,
  EyeIcon,
  FileTextIcon,
  InboxIcon,
  LandmarkIcon,
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
import { cn } from '@/lib/utils'

/** Ativo: tokens `primary` (não `--sidebar-accent`/surface menta); força estado `data-*` do SidebarMenuButton. */
function navItemButtonClass(active: boolean) {
  return cn(
    'h-auto min-h-8 px-2 py-1.5 text-[13px] font-medium leading-snug shadow-none ring-0 transition-colors duration-150',
    'justify-start gap-2 text-left [&_svg]:size-4',
    active
      ? [
          'font-semibold',
          'mx-0 w-full max-w-none rounded-none',
          '!bg-primary !px-4 !text-primary-foreground',
          '[&_svg]:!text-primary-foreground',
          'hover:!bg-primary/90 hover:!text-primary-foreground',
          'focus-visible:!ring-primary/40',
          'active:!bg-primary/85 active:!text-primary-foreground',
          'data-active:!bg-primary data-active:!text-primary-foreground data-active:[&_svg]:!text-primary-foreground',
          'data-active:!font-semibold',
          'group-data-[collapsible=icon]:!mx-auto group-data-[collapsible=icon]:!max-w-none group-data-[collapsible=icon]:!rounded-md group-data-[collapsible=icon]:!px-2',
        ]
      : [
          'rounded-lg mx-2 px-2',
          '!bg-transparent text-white/[0.88]',
          'hover:!bg-white/10 hover:!text-white',
          '[&_svg]:text-white/60 hover:[&_svg]:text-white/95',
          'group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:max-w-none',
        ],
  )
}

type NavLeaf = {
  to: string
  label: string
  tooltip: string
  icon: LucideIcon
  badge?: string
}

const principalLeafItems: NavLeaf[] = [
  { to: '/dashboard', label: 'Painel', tooltip: 'Painel', icon: LayoutDashboardIcon },
  { to: '/dashboard', label: 'Denúncias', tooltip: 'Denúncias', icon: InboxIcon, badge: '3' },
]

function navActivePainel(label: string, pathname: string) {
  return label === 'Painel' && pathname === '/dashboard'
}

/** Submenus e fundo navy: texto mais claro. */
const subNavClass =
  'h-7 min-h-0 py-1 text-[12px] font-medium text-white/72 hover:bg-white/[0.06] hover:text-white'

const relatoriosSub = [
  { to: '/dashboard', label: 'Visão geral' },
  { to: '/dashboard', label: 'Por período' },
  { to: '/dashboard', label: 'Agendados' },
]

const financeiroSub = [
  { to: '/dashboard', label: 'Carteira' },
  { to: '/dashboard', label: 'Cartão corporativo' },
  { to: '/dashboard', label: 'Repasses' },
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

  const badgeMint =
    'rounded-full border border-white/25 bg-primary/25 px-1.5 py-px text-[10px] font-semibold leading-none text-white'

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
                const active = navActivePainel(item.label, pathname)
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
                    {item.badge === undefined ? null : (
                      <SidebarMenuBadge className={badgeMint}>{item.badge}</SidebarMenuBadge>
                    )}
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
                      className={navItemButtonClass(false)}
                    >
                      <FileTextIcon className="shrink-0" strokeWidth={1.65} aria-hidden />
                      <span>Relatórios</span>
                      <ChevronDownIcon
                        className="ml-auto size-3.5 shrink-0 text-white/45 transition-transform duration-200 group-data-[state=open]:rotate-180"
                        aria-hidden
                      />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className="mx-0 ml-2.5 gap-0 border-l border-white/25 pl-2.5 pr-0 py-0.5">
                      {relatoriosSub.map((sub) => (
                        <SidebarMenuSubItem key={sub.label}>
                          <SidebarMenuSubButton asChild size="sm" className={subNavClass}>
                            <Link to={sub.to}>{sub.label}</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Indicadores"
                  isActive={false}
                  className={cn(navItemButtonClass(false), 'pr-8')}
                >
                  <Link to="/dashboard">
                    <BarChart3Icon className="shrink-0" strokeWidth={1.65} aria-hidden />
                    <span>Indicadores</span>
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
                      tooltip="Financeiro"
                      isActive={false}
                      type="button"
                      className={navItemButtonClass(false)}
                    >
                      <LandmarkIcon className="shrink-0" strokeWidth={1.65} aria-hidden />
                      <span>Financeiro</span>
                      <ChevronDownIcon
                        className="ml-auto size-3.5 shrink-0 text-white/45 transition-transform duration-200 group-data-[state=open]:rotate-180"
                        aria-hidden
                      />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className="mx-0 ml-2.5 gap-0 border-l border-white/25 pl-2.5 pr-0 py-0.5">
                      {financeiroSub.map((sub) => (
                        <SidebarMenuSubItem key={sub.label}>
                          <SidebarMenuSubButton asChild size="sm" className={subNavClass}>
                            <Link to={sub.to}>{sub.label}</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Análises"
                  isActive={false}
                  className={navItemButtonClass(false)}
                >
                  <Link to="/dashboard">
                    <Building2Icon className="shrink-0" strokeWidth={1.65} aria-hidden />
                    <span>Análises</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </div>

        {/* Conta / ajuda: colado ao fundo (acima do toggle de tema) */}
        <div className="mt-auto shrink-0 border-t border-white/10 pb-3 pt-3">
          <SidebarGroup className="p-0">
            <SidebarMenu className="gap-0.5">
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Recursos Pro"
                  isActive={false}
                  className={navItemButtonClass(false)}
                >
                  <Link to="/dashboard">
                    <SparklesIcon className="shrink-0" strokeWidth={1.65} aria-hidden />
                    <span>Recursos Pro</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Configurações"
                  isActive={false}
                  className={navItemButtonClass(false)}
                >
                  <Link to="/dashboard">
                    <SettingsIcon className="shrink-0" strokeWidth={1.65} aria-hidden />
                    <span>Configurações</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Ajuda"
                  isActive={false}
                  className={navItemButtonClass(false)}
                >
                  <Link to="/dashboard">
                    <CircleHelpIcon className="shrink-0" strokeWidth={1.65} aria-hidden />
                    <span>Ajuda</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </div>
      </SidebarContent>

      <SidebarFooter className="shrink-0 gap-0 border-t border-white/10 bg-brand-navy px-2 py-1">
        {mounted === false ? (
          <div className="h-7 w-full rounded-md bg-white/10" aria-hidden />
        ) : (
          <div
            className={cn(
              'flex rounded-md bg-white/[0.08] p-px',
              'ring-1 ring-inset ring-white/12',
              'group-data-[collapsible=icon]:flex-col',
            )}
            aria-label="Tema da interface"
          >
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn(
                'h-7 flex-1 gap-1 rounded-[5px] px-2 text-[10px] font-medium tracking-tight',
                lightSelected
                  ? 'bg-white text-[#7c3aed] shadow-sm'
                  : 'text-white/60 hover:bg-white/[0.06] hover:text-white',
              )}
              onClick={() => setTheme('light')}
            >
              <SunIcon
                className={cn(
                  'size-3 shrink-0',
                  lightSelected ? 'text-[#7c3aed]' : 'text-white/55',
                )}
                strokeWidth={1.85}
                aria-hidden
              />
              <span className="group-data-[collapsible=icon]:hidden">Claro</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn(
                'h-7 flex-1 gap-1 rounded-[5px] px-2 text-[10px] font-medium tracking-tight',
                darkSelected
                  ? 'bg-white text-[#7c3aed] shadow-sm'
                  : 'text-white/60 hover:bg-white/[0.06] hover:text-white',
              )}
              onClick={() => setTheme('dark')}
            >
              <MoonIcon
                className={cn(
                  'size-3 shrink-0',
                  darkSelected ? 'text-[#7c3aed]' : 'text-white/55',
                )}
                strokeWidth={1.85}
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

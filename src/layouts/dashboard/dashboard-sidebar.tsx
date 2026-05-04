import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from 'next-themes'
import {
  BarChart3Icon,
  BotIcon,
  ChevronDownIcon,
  CircleHelpIcon,
  DatabaseIcon,
  InboxIcon,
  LayoutDashboardIcon,
  MoonIcon,
  Search,
  SettingsIcon,
  SparklesIcon,
  SunIcon,
  X,
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
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
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

const dadosMestresSub = [
  { to: '/app/dados-mestres/status-denuncias', label: 'Status denúncias' },
  { to: '/app/dados-mestres/categoria-denuncias', label: 'Categoria denúncias' },
  { to: '/app/dados-mestres/prioridade-denuncias', label: 'Prioridade denúncias' },
  { to: '/app/dados-mestres/departamento-denuncias', label: 'Departamento denúncias' },
  { to: '/app/dados-mestres/workflows', label: 'Workflows' },
]

type NavSearchItem = { to: string; label: string; group: string }

const ALL_NAV_ITEMS: NavSearchItem[] = [
  { to: '/app/painel', label: 'Painel', group: 'Principal' },
  { to: '/app/denuncias', label: 'Denúncias', group: 'Principal' },
  ...dadosMestresSub.map((s) => ({ ...s, group: 'Dados Mestres' })),
  { to: '/app/recursos-pro', label: 'Recursos Pro', group: 'Geral' },
  { to: '/app/configuracoes', label: 'Configurações', group: 'Geral' },
  { to: '/app/ajuda', label: 'Ajuda', group: 'Geral' },
]

export function DashboardSidebar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const { state: sidebarState, setOpen: setSidebarOpen } = useSidebar()
  const [dadosMestresOpen, setDadosMestresOpen] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [busca, setBusca] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Fecha busca ao navegar
  useEffect(() => {
    setBusca('')
  }, [pathname])

  const collapsed = sidebarState === 'collapsed'

  const resultados = busca.trim().length > 0
    ? ALL_NAV_ITEMS.filter((item) =>
        item.label.toLowerCase().includes(busca.trim().toLowerCase()) ||
        item.group.toLowerCase().includes(busca.trim().toLowerCase()),
      )
    : []

  function abrirBusca() {
    setSidebarOpen(true)
    // aguarda expansão do sidebar antes de focar
    setTimeout(() => searchInputRef.current?.focus(), 120)
  }

  function selecionarResultado(to: string) {
    setBusca('')
    navigate(to)
  }

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
        {/* Campo de busca */}
        <div className="shrink-0 px-2 pb-1.5 group-data-[collapsible=icon]:px-1.5">
          {collapsed ? (
            <button
              type="button"
              aria-label="Abrir busca de menus"
              onClick={abrirBusca}
              className="flex w-full items-center justify-center rounded-md p-1.5 text-white/55 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Search className="size-4 shrink-0" strokeWidth={1.75} />
            </button>
          ) : (
            <div className="relative">
              <Search
                className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-white/40"
                strokeWidth={1.75}
                aria-hidden
              />
              <input
                ref={searchInputRef}
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar…"
                aria-label="Buscar menus e submenus"
                className={cn(
                  'w-full rounded-md border border-white/10 bg-white/[0.06] py-1.5 pr-7 pl-8',
                  'text-[12px] text-white placeholder:text-white/35',
                  'outline-none transition-colors focus:border-white/25 focus:bg-white/[0.09]',
                )}
              />
              {busca.length > 0 && (
                <button
                  type="button"
                  aria-label="Limpar busca"
                  onClick={() => { setBusca(''); searchInputRef.current?.focus() }}
                  className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded p-0.5 text-white/40 hover:text-white/80"
                >
                  <X className="size-3" strokeWidth={2} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Resultados da busca (substitui a nav quando há query) */}
        {!collapsed && busca.trim().length > 0 && (
          <div className="shrink-0 overflow-y-auto px-2 pb-2">
            {resultados.length === 0 ? (
              <p className="px-1 py-3 text-center text-[11px] text-white/40">Nenhum resultado.</p>
            ) : (
              <ul className="flex flex-col gap-0.5">
                {resultados.map((item) => (
                  <li key={item.to}>
                    <button
                      type="button"
                      onClick={() => selecionarResultado(item.to)}
                      className={cn(
                        'flex w-full flex-col rounded-md px-2.5 py-1.5 text-left transition-colors hover:bg-white/10',
                        pathname === item.to && 'bg-white/[0.13]',
                      )}
                    >
                      <span className="text-[12.5px] font-medium text-white/90">{item.label}</span>
                      <span className="text-[10px] text-white/40">{item.group}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Navegação principal rolável — oculta durante busca */}
        <div
          className={cn(
            'min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain pb-2',
            '[scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,.2)_transparent]',
            'touch-pan-y',
            !collapsed && busca.trim().length > 0 && 'hidden',
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
            </SidebarMenu>
          </SidebarGroup>

          <SidebarSeparator className="mx-3 h-px bg-white/15 group-data-[collapsible=icon]:mx-2" />

          <SidebarGroup className="p-0">
            <SidebarMenu className="gap-0.5">
              <SidebarMenuItem>
                <Collapsible
                  open={dadosMestresOpen}
                  onOpenChange={setDadosMestresOpen}
                  className="group w-full min-w-0"
                >
                  <div
                    className="w-full min-w-0"
                    onClickCapture={(e) => {
                      if (sidebarState !== 'collapsed') return
                      setSidebarOpen(true)
                      setDadosMestresOpen(true)
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                  >
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
                  </div>
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

              <SidebarMenuItem>
                <SidebarMenuButton
                  type="button"
                  tooltip="Insights IA — em breve"
                  isActive={false}
                  className={cn(navItemButtonClass(false), 'text-white/[0.82] [&_svg]:text-white/55')}
                  onClick={() => toast.message('Insights IA disponível em breve.')}
                >
                  <BarChart3Icon className="shrink-0" strokeWidth={1.65} aria-hidden />
                  <span>Insights IA</span>
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

import { cn } from '@/lib/utils'

/** Ativo: tokens `primary`; inativo: superfície transparente sobre `brand-navy`. */
export function navItemButtonClass(active: boolean) {
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

/** Rodapé da sidebar (Recursos Pro, Configurações, Ajuda): visual mais enxuto. */
export function navItemButtonFooterClass(active: boolean) {
  return cn(
    'h-auto min-h-7 px-1.5 py-0.5 text-[11px] font-normal leading-tight tracking-tight shadow-none ring-0 transition-colors duration-150',
    'justify-start gap-1.5 text-left [&_svg]:size-3.5',
    active
      ? [
          'font-medium',
          'mx-0 w-full max-w-none rounded-md',
          '!bg-primary/95 !px-2.5 !text-primary-foreground',
          '[&_svg]:!text-primary-foreground',
          'hover:!bg-primary/85 hover:!text-primary-foreground',
          'focus-visible:!ring-primary/30',
          'active:!bg-primary/80 active:!text-primary-foreground',
          'data-active:!bg-primary/95 data-active:!text-primary-foreground data-active:[&_svg]:!text-primary-foreground',
          'data-active:!font-medium',
          'group-data-[collapsible=icon]:!mx-auto group-data-[collapsible=icon]:!rounded-md group-data-[collapsible=icon]:!px-2',
        ]
      : [
          'rounded-md mx-1.5 px-1.5',
          '!bg-transparent text-white/70',
          'hover:!bg-white/[0.06] hover:!text-white/95',
          '[&_svg]:text-white/40 hover:[&_svg]:text-white/85',
          'group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:max-w-none',
        ],
  )
}

/** Item ativo de submenu: mesmo fundo/texto `primary` dos itens principais da barra. */
export function navSubmenuActiveClass() {
  return cn(
    'font-semibold shadow-none ring-0',
    '!bg-primary !text-primary-foreground',
    'hover:!bg-primary/90 hover:!text-primary-foreground',
    'active:!bg-primary/85 active:!text-primary-foreground',
    'data-active:!bg-primary data-active:!text-primary-foreground data-active:!font-semibold',
  )
}

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

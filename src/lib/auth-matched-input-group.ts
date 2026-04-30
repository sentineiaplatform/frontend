/**
 * Mesmas classes de `InputGroup` / addon / controle usadas em
 * `login-form.tsx` e `register-form.tsx` (altura h-11, borda padrão shadcn).
 */
export const AUTH_INPUT_GROUP_CLASS = 'h-11 min-h-11 shadow-none'
export const AUTH_INPUT_GROUP_ADDON_CLASS = 'text-muted-foreground'
export const AUTH_INPUT_GROUP_CONTROL_CLASS = 'h-11 min-h-11'

/**
 * `SelectTrigger` dentro de `InputGroup`: borda fica no grupo; trigger sem borda própria.
 * Mesmo padrão visual de `ConfiguracoesGeralPage` / `ConfiguracoesSegurancaPage`.
 */
export const AUTH_SELECT_TRIGGER_IN_GROUP_CLASS =
  'text-foreground data-placeholder:text-muted-foreground h-11 min-h-11 w-full min-w-0 flex-1 cursor-pointer rounded-none border-0 bg-transparent px-2 py-0 text-sm shadow-none focus-visible:border-0 focus-visible:ring-0 focus-visible:ring-offset-0 data-[size=default]:h-11 [&_svg:not([class*="size-"])]:size-4'

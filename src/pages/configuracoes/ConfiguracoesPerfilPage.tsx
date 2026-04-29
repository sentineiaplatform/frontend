import { useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  AlertCircleIcon,
  ChevronRightIcon,
  GlobeIcon,
  MailIcon,
  PhoneIcon,
  UserIcon,
  UsersRoundIcon,
  XIcon,
} from 'lucide-react'
import { toast } from 'sonner'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { useSessionDisplayName } from '@/hooks/use-session-display-name'
import {
  AUTH_INPUT_GROUP_ADDON_CLASS,
  AUTH_INPUT_GROUP_CLASS,
  AUTH_INPUT_GROUP_CONTROL_CLASS,
} from '@/lib/auth-matched-input-group'
import { cn } from '@/lib/utils'
import {
  displayNameInitials,
  setSessionDisplayName,
} from '@/lib/session-user'

import {
  configuracoesPageShellClass,
  configuracoesSectionCardClass,
  configuracoesSectionIconClass,
} from '@/pages/configuracoes/configuracoes-layout'
import { appendConfigAuditLog } from '@/pages/configuracoes/configuracoes-audit-log'
import {
  type PerfilFormValues,
  perfilFormSchema,
} from '@/pages/configuracoes/perfil-schema'
import { labelFusoFromStorage } from '@/pages/configuracoes/timezone-opcoes'

function partirNomeCompleto(nome: string) {
  const p = nome.trim().split(/\s+/).filter(Boolean)
  if (p.length === 0) return { first: '', last: '' }
  if (p.length === 1) return { first: p[0] ?? '', last: '' }
  return { first: p[0] ?? '', last: p.slice(1).join(' ') }
}

/** Perfil — mesmo padrão visual das outras abas de configurações. */
export function ConfiguracoesPerfilPage() {
  const displayName = useSessionDisplayName()
  const { first: firstDefault, last: lastDefault } = useMemo(
    () => partirNomeCompleto(displayName.trim() === '' ? 'Usuário' : displayName),
    [displayName],
  )

  const defaultValues = useMemo<PerfilFormValues>(
    () => ({
      firstName: firstDefault,
      lastName: lastDefault,
      email: 'voce@empresa.com.br',
      phone: '11999990000',
    }),
    [firstDefault, lastDefault],
  )

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm<PerfilFormValues>({
    resolver: zodResolver(perfilFormSchema),
    defaultValues,
  })

  const emailLive = useWatch({ control, name: 'email', defaultValue: defaultValues.email })
  const phoneLive = useWatch({ control, name: 'phone', defaultValue: defaultValues.phone })
  const fusoLabel = labelFusoFromStorage()

  function onSubmit(values: PerfilFormValues) {
    const nome = `${values.firstName.trim()} ${values.lastName.trim()}`.trim()
    setSessionDisplayName(nome)
    reset(values)
    toast.success('Perfil atualizado', {
      description: 'As alterações foram salvas neste dispositivo (pré-backend).',
    })
    appendConfigAuditLog({
      category: 'perfil',
      action: 'Perfil atualizado',
      detail: nome || undefined,
    })
  }

  function onCancel() {
    reset(defaultValues)
    toast.message('Alterações descartadas.')
  }

  const tituloExibicao =
    displayName.trim() === '' ? 'Usuário' : displayName.trim()
  const iniciais = displayNameInitials(tituloExibicao)

  return (
    <div className={configuracoesPageShellClass}>
      <header className="border-border/50 flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-start sm:gap-4">
        <Avatar className="border-border/60 bg-muted/30 size-11 shrink-0 rounded-xl border sm:size-12">
          <AvatarFallback className="rounded-xl bg-primary/10 font-heading text-sm font-semibold text-primary">
            {iniciais}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 gap-y-1">
            <h1 className="text-foreground font-heading text-xl font-semibold tracking-tight sm:text-2xl">
              {tituloExibicao}
            </h1>
            <span className="text-muted-foreground bg-muted/50 border-border/50 inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase sm:text-[11px]">
              Armazenamento local
            </span>
          </div>
          <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed">
            Operador · Analista de denúncias. Dados abaixo ficam só neste navegador até existir API de
            perfil; o fuso horário vem de{' '}
            <span className="text-foreground/90">Configurações → Geral</span>.
          </p>
          <p className="text-muted-foreground flex flex-wrap items-center gap-x-1.5 gap-y-0.5 pt-3 text-[11px] leading-relaxed sm:text-xs">
            <span className="inline-flex min-w-0 items-center gap-1">
              <MailIcon className="size-3 shrink-0 opacity-70" aria-hidden />
              <span className="truncate text-foreground">{emailLive}</span>
            </span>
            <span className="text-border" aria-hidden>
              ·
            </span>
            <span className="inline-flex items-center gap-1 tabular-nums">
              <PhoneIcon className="size-3 shrink-0 opacity-70" aria-hidden />
              <span className="text-foreground">+55 {phoneLive}</span>
            </span>
            <span className="text-border" aria-hidden>
              ·
            </span>
            <span className="inline-flex items-center gap-1" title="Definido em Configurações → Geral">
              <GlobeIcon className="size-3 shrink-0 opacity-70" aria-hidden />
              <span className="text-foreground">{fusoLabel}</span>
            </span>
          </p>
        </div>
      </header>

      <form
        id="form-perfil"
        className="mt-6 w-full min-w-0"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <div className={cn(configuracoesSectionCardClass, 'min-h-0')}>
          <div className="mb-5 flex gap-3">
            <div className={configuracoesSectionIconClass}>
              <UserIcon className="size-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <FieldLegend className="text-foreground font-heading !mb-0 px-0 text-base font-semibold tracking-tight">
                Dados pessoais
              </FieldLegend>
              <FieldDescription className="text-muted-foreground !mt-1 max-w-md px-0 text-xs leading-snug">
                Ajuste nome, contatos e visualização neste dispositivo.
              </FieldDescription>
            </div>
          </div>

          <FieldSet className="min-w-0 flex-1 gap-0 border-0 p-0">
            <FieldGroup className="gap-4 sm:grid sm:grid-cols-2 sm:gap-x-4 sm:gap-y-4">
            <Field data-invalid={errors.firstName ? true : undefined}>
              <FieldLabel htmlFor="perfil-first" className="text-sm font-medium">
                Nome
              </FieldLabel>
              <InputGroup className={AUTH_INPUT_GROUP_CLASS}>
                <InputGroupAddon
                  align="inline-start"
                  className={AUTH_INPUT_GROUP_ADDON_CLASS}
                >
                  <UserIcon className="size-4 shrink-0" aria-hidden />
                </InputGroupAddon>
                <InputGroupInput
                  id="perfil-first"
                  className={AUTH_INPUT_GROUP_CONTROL_CLASS}
                  autoComplete="given-name"
                  aria-invalid={errors.firstName ? 'true' : undefined}
                  placeholder="Seu nome"
                  {...register('firstName')}
                />
              </InputGroup>
              {errors.firstName ? (
                <FieldError className="flex items-start gap-2 [&>svg]:shrink-0">
                  <AlertCircleIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
                  <span>{errors.firstName.message}</span>
                </FieldError>
              ) : null}
            </Field>

            <Field data-invalid={errors.lastName ? true : undefined}>
              <FieldLabel htmlFor="perfil-last" className="text-sm font-medium">
                Sobrenome
              </FieldLabel>
              <InputGroup className={AUTH_INPUT_GROUP_CLASS}>
                <InputGroupAddon
                  align="inline-start"
                  className={AUTH_INPUT_GROUP_ADDON_CLASS}
                >
                  <UsersRoundIcon className="size-4 shrink-0" aria-hidden />
                </InputGroupAddon>
                <InputGroupInput
                  id="perfil-last"
                  className={AUTH_INPUT_GROUP_CONTROL_CLASS}
                  autoComplete="family-name"
                  aria-invalid={errors.lastName ? 'true' : undefined}
                  placeholder="Sobrenome"
                  {...register('lastName')}
                />
              </InputGroup>
              {errors.lastName ? (
                <FieldError className="flex items-start gap-2 [&>svg]:shrink-0">
                  <AlertCircleIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
                  <span>{errors.lastName.message}</span>
                </FieldError>
              ) : null}
            </Field>

            <Field data-invalid={errors.email ? true : undefined}>
              <FieldLabel htmlFor="perfil-email" className="text-sm font-medium">
                E-mail
              </FieldLabel>
              <InputGroup className={AUTH_INPUT_GROUP_CLASS}>
                <InputGroupAddon
                  align="inline-start"
                  className={AUTH_INPUT_GROUP_ADDON_CLASS}
                >
                  <MailIcon className="size-4 shrink-0" aria-hidden />
                </InputGroupAddon>
                <InputGroupInput
                  id="perfil-email"
                  type="email"
                  className={AUTH_INPUT_GROUP_CONTROL_CLASS}
                  autoComplete="email"
                  aria-invalid={errors.email ? 'true' : undefined}
                  placeholder="voce@empresa.com.br"
                  {...register('email')}
                />
              </InputGroup>
              {errors.email ? (
                <FieldError className="flex items-start gap-2 [&>svg]:shrink-0">
                  <AlertCircleIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
                  <span>{errors.email.message}</span>
                </FieldError>
              ) : null}
            </Field>

            <Field data-invalid={errors.phone ? true : undefined}>
              <FieldLabel htmlFor="perfil-phone" className="text-sm font-medium">
                Telefone
              </FieldLabel>
              <InputGroup className={AUTH_INPUT_GROUP_CLASS}>
                <InputGroupAddon
                  align="inline-start"
                  className={cn(AUTH_INPUT_GROUP_ADDON_CLASS, 'gap-1.5')}
                >
                  <PhoneIcon className="size-4 shrink-0" aria-hidden />
                  <span className="text-xs font-medium tabular-nums">+55</span>
                </InputGroupAddon>
                <InputGroupInput
                  id="perfil-phone"
                  type="tel"
                  className={AUTH_INPUT_GROUP_CONTROL_CLASS}
                  placeholder="11999990000"
                  inputMode="numeric"
                  autoComplete="tel"
                  aria-invalid={errors.phone ? 'true' : undefined}
                  {...register('phone')}
                />
              </InputGroup>
              {errors.phone ? (
                <FieldError className="flex items-start gap-2 [&>svg]:shrink-0">
                  <AlertCircleIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
                  <span>{errors.phone.message}</span>
                </FieldError>
              ) : null}
            </Field>
            </FieldGroup>
          </FieldSet>

          <div className="border-border/40 mt-6 flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground h-9 gap-1.5 text-xs"
              onClick={onCancel}
              disabled={!isDirty}
            >
              <XIcon className="size-3.5 shrink-0 opacity-90" aria-hidden />
              Cancelar
            </Button>
            <Button type="submit" size="sm" className="h-9 gap-1.5 px-4 font-medium sm:min-w-[132px]">
              <span>Salvar</span>
              <ChevronRightIcon className="size-3.5 opacity-90" aria-hidden />
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

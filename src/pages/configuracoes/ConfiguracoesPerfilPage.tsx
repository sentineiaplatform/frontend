import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  AlertCircleIcon,
  ChevronRightIcon,
  CircleUserRoundIcon,
  GlobeIcon,
  MailIcon,
  UserIcon,
  XIcon,
} from 'lucide-react'
import { toast } from 'sonner'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { useAuth } from '@/contexts/auth-context'
import { useSessionDisplayName } from '@/hooks/use-session-display-name'
import { useSessionEmail } from '@/hooks/use-session-email'
import {
  AUTH_INPUT_GROUP_ADDON_CLASS,
  AUTH_INPUT_GROUP_CLASS,
  AUTH_INPUT_GROUP_CONTROL_CLASS,
  AUTH_SELECT_TRIGGER_IN_GROUP_CLASS,
} from '@/lib/auth-matched-input-group'
import { cn } from '@/lib/utils'
import {
  accessTokenUpdatedEventName,
  getAccessTokenRememberPreference,
  getStoredAccessToken,
  setStoredAccessToken,
  waitForStoredAccessToken,
} from '@/lib/auth-token-storage'
import {
  jwtEmailFromToken,
  jwtNameFromToken,
  jwtPerfilIdFromToken,
} from '@/lib/jwt-decode'
import { syncSessionDisplayNameFromToken } from '@/lib/sync-session-from-token'
import {
  displayNameFromEmail,
  displayNameInitials,
  getSessionDisplayName,
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
import { type PerfilDto, fetchPerfisList } from '@/services/perfil-service'
import {
  fetchCurrentUserProfile,
  patchCurrentUserProfile,
} from '@/services/user-profile-service'
import { AuthRequestError } from '@/services/auth/types'

/** UUID estável para `SelectItem` / valor do formulário (evita mismatch por maiúsculas/minúsculas). */
function normalizePerfilId(raw: string): string {
  return raw.trim().toLowerCase()
}

/** Conta (perfil do utilizador) — mesmo padrão visual das outras abas de configurações. */
export function ConfiguracoesPerfilPage() {
  const { isReady, isAuthenticated } = useAuth()
  const displayName = useSessionDisplayName()
  const sessionEmail = useSessionEmail()
  const [profileLoading, setProfileLoading] = useState(true)
  const [loadedProfile, setLoadedProfile] = useState<{
    name: string
    email: string
    perfilId: string
  } | null>(null)
  const [opcoesPerfil, setOpcoesPerfil] = useState<{ id: string; name: string }[]>([])

  function buildOpcoesPerfil(list: PerfilDto[], perfilId: string, perfilName: string): { id: string; name: string }[] {
    const opts = list.map((p) => ({
      id: normalizePerfilId(String(p.id)),
      name: p.name,
    }))
    const id = normalizePerfilId(perfilId)
    if (id.length > 0 && !opts.some((o) => o.id === id)) {
      const nome = perfilName.trim()
      opts.push({ id, name: nome.length > 0 ? nome : 'Perfil' })
    }
    return opts
  }

  const defaultValues = useMemo<PerfilFormValues>(() => {
    if (loadedProfile) {
      return {
        fullName: loadedProfile.name,
        email: loadedProfile.email,
        perfilId: loadedProfile.perfilId,
      }
    }
    const nome = displayName.trim() === '' ? 'Usuário' : displayName.trim()
    return {
      fullName: nome,
      email: sessionEmail.trim(),
      perfilId: '',
    }
  }, [loadedProfile, displayName, sessionEmail])

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<PerfilFormValues>({
    resolver: zodResolver(perfilFormSchema),
    defaultValues,
  })

  const loadProfileGeneration = useRef(0)

  const loadProfile = useCallback(async () => {
    if (!isAuthenticated) {
      loadProfileGeneration.current += 1
      setOpcoesPerfil([])
      setProfileLoading(false)
      return
    }
    const gen = ++loadProfileGeneration.current
    await waitForStoredAccessToken(2000)
    if (gen !== loadProfileGeneration.current) return
    if (!getStoredAccessToken()) {
      setProfileLoading(false)
      return
    }
    setProfileLoading(true)
    try {
      const [p, perfisList] = await Promise.all([
        fetchCurrentUserProfile(),
        fetchPerfisList().catch((): PerfilDto[] => []),
      ])
      if (gen !== loadProfileGeneration.current) return
      const perfilIdNorm = normalizePerfilId(String(p.perfilId))
      setOpcoesPerfil(buildOpcoesPerfil(perfisList, perfilIdNorm, p.perfilName))
      setLoadedProfile({
        name: p.name,
        email: p.email,
        perfilId: perfilIdNorm,
      })
      setSessionDisplayName(p.name.trim())
    } catch (e) {
      if (e instanceof AuthRequestError && e.status === 401) {
        /* Token limpo e estado atualizado em authorizedFetch → RequireAuth envia para /login. */
        return
      }
      if (gen !== loadProfileGeneration.current) return
      const token = getStoredAccessToken()
      const email =
        token != null && token.length > 0
          ? jwtEmailFromToken(token)?.trim().toLowerCase() ?? ''
          : ''
      const nameFromJwt =
        token != null && token.length > 0 ? jwtNameFromToken(token)?.trim() : undefined
      const stored = getSessionDisplayName()?.trim()
      const nome =
        (nameFromJwt && nameFromJwt.length > 0 ? nameFromJwt : null) ??
        (stored && stored.length > 0 ? stored : null) ??
        (email ? displayNameFromEmail(email) : 'Usuário')
      const perfilFromJwt = token != null && token.length > 0 ? jwtPerfilIdFromToken(token) : null
      const fallbackPerfilId = perfilFromJwt != null ? normalizePerfilId(perfilFromJwt) : ''
      let perfisFallback: PerfilDto[] = []
      try {
        perfisFallback = await fetchPerfisList()
      } catch {
        perfisFallback = []
      }
      if (gen !== loadProfileGeneration.current) return
      setOpcoesPerfil(buildOpcoesPerfil(perfisFallback, fallbackPerfilId, ''))
      setLoadedProfile({ name: nome, email, perfilId: fallbackPerfilId })
      const description =
        e instanceof AuthRequestError ? e.message : 'Tente novamente dentro de instantes.'
      toast.error('Não foi possível carregar o perfil', { description })
    } finally {
      if (gen === loadProfileGeneration.current) {
        setProfileLoading(false)
      }
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (!isReady) return
    const handle = window.setTimeout(() => {
      void loadProfile()
    }, 0)
    return () => window.clearTimeout(handle)
  }, [isReady, loadProfile])

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  /** Radix Select só mostra o rótulo quando o valor coincide com um `SelectItem`; re-aplica após opções existirem. */
  useEffect(() => {
    const pid = loadedProfile?.perfilId?.trim()
    if (!pid || opcoesPerfil.length === 0) return
    const normalized = normalizePerfilId(pid)
    if (!opcoesPerfil.some((o) => o.id === normalized)) return
    setValue('perfilId', normalized, { shouldDirty: false, shouldValidate: true })
  }, [loadedProfile?.perfilId, opcoesPerfil, setValue])

  /** Primeira montagem sem token no storage: `waitForStoredAccessToken` pode expirar antes do login gravar o JWT. */
  useEffect(() => {
    if (!isReady || !isAuthenticated) return
    const onToken = () => {
      if (!getStoredAccessToken()) return
      if (loadedProfile !== null) return
      void loadProfile()
    }
    const evt = accessTokenUpdatedEventName()
    globalThis.addEventListener(evt, onToken)
    return () => globalThis.removeEventListener(evt, onToken)
  }, [isReady, isAuthenticated, loadedProfile, loadProfile])

  const emailLive = useWatch({ control, name: 'email', defaultValue: defaultValues.email })
  const fusoLabel = labelFusoFromStorage()

  async function onSubmit(values: PerfilFormValues) {
    const nome = values.fullName.trim()
    try {
      const updated = await patchCurrentUserProfile({
        name: nome,
        email: values.email.trim(),
        perfilId: values.perfilId,
      })
      setStoredAccessToken(updated.accessToken, getAccessTokenRememberPreference())
      syncSessionDisplayNameFromToken(updated.accessToken)
      setLoadedProfile({
        name: updated.name,
        email: updated.email,
        perfilId: normalizePerfilId(String(updated.perfilId)),
      })
      reset({
        fullName: updated.name,
        email: updated.email,
        perfilId: normalizePerfilId(String(updated.perfilId)),
      })
      toast.success('Perfil atualizado', {
        description: 'As alterações foram guardadas.',
      })
      appendConfigAuditLog({
        category: 'perfil',
        action: 'Conta atualizada',
        detail: nome || undefined,
      })
    } catch (e) {
      if (e instanceof AuthRequestError && e.status === 401) {
        return
      }
      const description =
        e instanceof AuthRequestError ? e.message : 'Tente novamente dentro de instantes.'
      toast.error('Não foi possível guardar o perfil', { description })
    }
  }

  function onCancel() {
    reset(defaultValues)
    toast.message('Alterações descartadas.')
  }

  const tituloExibicao =
    loadedProfile?.name.trim() ||
    (displayName.trim() === '' ? 'Usuário' : displayName.trim())
  const iniciais = displayNameInitials(tituloExibicao)

  if (!isReady || profileLoading) {
    return (
      <div className={configuracoesPageShellClass}>
        <p className="text-muted-foreground text-sm">A carregar perfil…</p>
      </div>
    )
  }

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
          </div>
          <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed">
            Conta ligada à sessão autenticada na API SentinelIA. O nome e o e-mail correspondem ao
            utilizador em sessão; edite abaixo e guarde quando quiser atualizar. O fuso horário define-se
            em{' '}
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
                Nome completo e e-mail da conta; utilize Salvar para aplicar as alterações.
              </FieldDescription>
            </div>
          </div>

          <FieldSet className="min-w-0 flex-1 gap-0 border-0 p-0">
            <FieldGroup className="gap-4 sm:grid sm:grid-cols-2 sm:gap-x-4 sm:gap-y-4">
            <Field
              className="sm:col-span-2"
              data-invalid={errors.fullName ? true : undefined}
            >
              <FieldLabel htmlFor="perfil-full-name" className="text-sm font-medium">
                Nome completo
              </FieldLabel>
              <InputGroup className={AUTH_INPUT_GROUP_CLASS}>
                <InputGroupAddon
                  align="inline-start"
                  className={AUTH_INPUT_GROUP_ADDON_CLASS}
                >
                  <UserIcon className="size-4 shrink-0" aria-hidden />
                </InputGroupAddon>
                <InputGroupInput
                  id="perfil-full-name"
                  className={AUTH_INPUT_GROUP_CONTROL_CLASS}
                  autoComplete="name"
                  aria-invalid={errors.fullName ? 'true' : undefined}
                  placeholder="Nome completo"
                  {...register('fullName')}
                />
              </InputGroup>
              {errors.fullName ? (
                <FieldError className="flex items-start gap-2 [&>svg]:shrink-0">
                  <AlertCircleIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
                  <span>{errors.fullName.message}</span>
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

            <Field
              className="sm:col-span-2"
              data-invalid={errors.perfilId ? true : undefined}
            >
              <FieldLabel htmlFor="perfil-org-select" className="text-sm font-medium">
                Perfil organizacional
              </FieldLabel>
              <Controller
                control={control}
                name="perfilId"
                render={({ field }) => (
                  <InputGroup className={AUTH_INPUT_GROUP_CLASS}>
                    <InputGroupAddon
                      align="inline-start"
                      className={AUTH_INPUT_GROUP_ADDON_CLASS}
                    >
                      <CircleUserRoundIcon className="size-4 shrink-0" aria-hidden />
                    </InputGroupAddon>
                    <Select
                      value={field.value.length > 0 ? field.value : undefined}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger
                        id="perfil-org-select"
                        ref={field.ref}
                        onBlur={field.onBlur}
                        aria-invalid={errors.perfilId ? 'true' : undefined}
                        className={AUTH_SELECT_TRIGGER_IN_GROUP_CLASS}
                      >
                        <SelectValue placeholder="Selecionar perfil…" />
                      </SelectTrigger>
                      <SelectContent position="popper" sideOffset={6} align="start" className="rounded-lg">
                        {opcoesPerfil.map((op) => (
                          <SelectItem key={op.id} value={op.id} className="rounded-md">
                            {op.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </InputGroup>
                )}
              />
              <p className="text-muted-foreground mt-1.5 max-w-xl text-xs leading-snug">
                Define o papel na organização. Permissões por módulo em{' '}
                <span className="text-foreground/85">Configurações → Permissões</span>.
              </p>
              {errors.perfilId ? (
                <FieldError className="flex items-start gap-2 [&>svg]:shrink-0">
                  <AlertCircleIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
                  <span>{errors.perfilId.message}</span>
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
            <Button
              type="submit"
              size="sm"
              className="h-9 gap-1.5 px-4 font-medium sm:min-w-[132px]"
              disabled={isSubmitting}
            >
              <span>Salvar</span>
              <ChevronRightIcon className="size-3.5 opacity-90" aria-hidden />
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

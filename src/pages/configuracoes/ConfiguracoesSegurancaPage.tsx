import { useMemo, useRef, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import {
  AlertCircleIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ClockIcon,
  EyeIcon,
  EyeOffIcon,
  InfoIcon,
  KeyRoundIcon,
  LockIcon,
  ShieldIcon,
  XIcon,
} from 'lucide-react'
import { toast } from 'sonner'

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
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AUTH_INPUT_GROUP_ADDON_CLASS,
  AUTH_INPUT_GROUP_CLASS,
  AUTH_INPUT_GROUP_CONTROL_CLASS,
} from '@/lib/auth-matched-input-group'
import {
  CONFIG_SEGURANCA_PREFS_KEY,
  SENHA_ATUAL_PADRAO,
  gravarSenhaLocal,
  lerSenhaArmazenadaLocal,
} from '@/lib/seguranca-local-storage'
import { cn } from '@/lib/utils'

import {
  configuracoesPageShellClass,
  configuracoesSectionCardClass,
  configuracoesSectionIconClass,
} from '@/pages/configuracoes/configuracoes-layout'
import { appendConfigAuditLog } from '@/pages/configuracoes/configuracoes-audit-log'
import {
  type SegurancaPrefsValues,
  type SegurancaSenhaValues,
  segurancaPrefsSchema,
  segurancaSenhaSchema,
} from '@/pages/configuracoes/seguranca-schema'

const defaultPrefs: SegurancaPrefsValues = {
  lockScreenMinutes: '30',
}

const defaultSenha: SegurancaSenhaValues = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
}

const lockHintByValue: Record<SegurancaPrefsValues['lockScreenMinutes'], string> = {
  '15':
    'Após 15 minutos sem cliques ou teclas, pediremos login de novo (quando o bloqueio estiver ligado no app).',
  '30':
    'Após meia hora inativo, a sessão será considerada ociosa — útil em computadores compartilhados.',
  '60':
    'Uma hora sem uso antes de bloquear; bom equilíbrio em estações de trabalho pessoais.',
  '0':
    'Sem bloqueio automático por tempo. Use quando confiar no dispositivo ou em política externa.',
}

function readPrefsInitial(): SegurancaPrefsValues {
  try {
    const raw = localStorage.getItem(CONFIG_SEGURANCA_PREFS_KEY)
    if (!raw) return defaultPrefs
    const merged = { ...defaultPrefs, ...JSON.parse(raw) } as unknown
    const parsed = segurancaPrefsSchema.safeParse(merged)
    return parsed.success ? parsed.data : defaultPrefs
  } catch {
    return defaultPrefs
  }
}

function selectTriggerClass() {
  return cn(
    'text-foreground data-placeholder:text-muted-foreground h-11 min-h-11 w-full min-w-0 flex-1 cursor-pointer rounded-none border-0 bg-transparent px-2 py-0 text-sm shadow-none focus-visible:border-0 focus-visible:ring-0 focus-visible:ring-offset-0 data-[size=default]:h-11 [&_svg:not([class*="size-"])]:size-4',
  )
}

export function ConfiguracoesSegurancaPage() {
  const prefsInitial = useMemo(() => readPrefsInitial(), [])
  const prefsBaselineRef = useRef(prefsInitial)

  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [demoOpen, setDemoOpen] = useState(false)

  const prefsForm = useForm<SegurancaPrefsValues>({
    resolver: zodResolver(segurancaPrefsSchema),
    defaultValues: prefsInitial,
  })

  const lockPreview = useWatch({
    control: prefsForm.control,
    name: 'lockScreenMinutes',
    defaultValue: prefsInitial.lockScreenMinutes,
  })

  const senhaForm = useForm<SegurancaSenhaValues>({
    resolver: zodResolver(segurancaSenhaSchema),
    defaultValues: defaultSenha,
    mode: 'onTouched',
  })

  function onSubmitPrefs(values: SegurancaPrefsValues) {
    try {
      localStorage.setItem(CONFIG_SEGURANCA_PREFS_KEY, JSON.stringify(values))
    } catch {
      toast.error('Não foi possível salvar', {
        description: 'Armazenamento local indisponível.',
      })
      return
    }
    prefsBaselineRef.current = values
    prefsForm.reset(values)
    toast.success('Preferências de segurança salvas', {
      description: 'Configurações guardadas neste dispositivo.',
    })
    const bloqueioLabel: Record<string, string> = {
      '15': '15 minutos',
      '30': '30 minutos',
      '60': '60 minutos',
      '0': 'sem bloqueio automático',
    }
    appendConfigAuditLog({
      category: 'seguranca',
      action: 'Preferências de segurança salvas',
      detail: `Bloqueio após inatividade: ${bloqueioLabel[values.lockScreenMinutes] ?? values.lockScreenMinutes}`,
    })
  }

  function onCancelPrefs() {
    prefsForm.reset(prefsBaselineRef.current)
    toast.message('Alterações descartadas.')
  }

  function onSubmitSenha(values: SegurancaSenhaValues) {
    const esperada = lerSenhaArmazenadaLocal()
    if (values.currentPassword !== esperada) {
      senhaForm.setError('currentPassword', {
        type: 'manual',
        message: 'Senha atual incorreta.',
      })
      return
    }
    try {
      gravarSenhaLocal(values.newPassword)
    } catch {
      toast.error('Não foi possível atualizar a senha', {
        description: 'Armazenamento local indisponível.',
      })
      return
    }
    senhaForm.reset(defaultSenha)
    setShowCurrent(false)
    setShowNew(false)
    setShowConfirm(false)
    toast.success('Senha atualizada', {
      description: 'Nova senha salva neste navegador (pré-backend).',
    })
    appendConfigAuditLog({
      category: 'seguranca',
      action: 'Senha atualizada',
    })
  }

  function onCancelSenha() {
    senhaForm.reset(defaultSenha)
    setShowCurrent(false)
    setShowNew(false)
    setShowConfirm(false)
    toast.message('Alterações descartadas.')
  }

  const { errors: prefsErrors, isDirty: prefsDirty } = prefsForm.formState
  const { errors: senhaErrors, isDirty: senhaDirty } = senhaForm.formState

  const lockHint = lockHintByValue[lockPreview] ?? lockHintByValue['30']

  return (
    <div className={configuracoesPageShellClass}>
      <header className="border-border/50 flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-start sm:gap-4">
        <div className="bg-muted/30 text-muted-foreground border-border/60 flex size-11 shrink-0 items-center justify-center rounded-xl border sm:size-12">
          <ShieldIcon className="size-5 sm:size-[1.35rem]" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 gap-y-1">
            <h1 className="text-foreground font-heading text-xl font-semibold tracking-tight sm:text-2xl">
              Segurança
            </h1>
            <span className="text-muted-foreground bg-muted/50 border-border/50 inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase sm:text-[11px]">
              Armazenamento local
            </span>
          </div>
          <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed">
            Defina quando o painel deve pedir login novamente e atualize a senha deste navegador. Em
            produção, tudo abaixo passará pela API da organização.
          </p>
        </div>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-2 lg:items-start lg:gap-8">
        <form
          id="form-seguranca-prefs"
          className={cn(configuracoesSectionCardClass, 'min-h-0')}
          onSubmit={prefsForm.handleSubmit(onSubmitPrefs)}
          noValidate
        >
          <div className="mb-5 flex gap-3">
            <div className={configuracoesSectionIconClass}>
              <ClockIcon className="size-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <FieldLegend className="text-foreground font-heading !mb-0 px-0 text-base font-semibold tracking-tight">
                Sessão e bloqueio
              </FieldLegend>
              <p className="text-muted-foreground mt-1 text-xs leading-snug">
                Controle de inatividade (preferência salva aqui; o bloqueio real virá com o app).
              </p>
            </div>
          </div>

          <FieldSet className="min-w-0 flex-1 gap-0 border-0 p-0">
            <FieldGroup className="gap-3">
              <Field data-invalid={prefsErrors.lockScreenMinutes ? true : undefined}>
                <FieldLabel htmlFor="seg-lock" className="text-sm font-medium">
                  Bloquear após inatividade
                </FieldLabel>
                <FieldDescription className="text-muted-foreground !mt-1 text-xs">
                  Quanto tempo sem uso antes de exigir nova autenticação.
                </FieldDescription>
                <Controller
                  name="lockScreenMinutes"
                  control={prefsForm.control}
                  render={({ field }) => (
                    <InputGroup className={cn(AUTH_INPUT_GROUP_CLASS, 'mt-2')}>
                      <InputGroupAddon
                        align="inline-start"
                        className={AUTH_INPUT_GROUP_ADDON_CLASS}
                      >
                        <ClockIcon className="size-4 shrink-0" aria-hidden />
                      </InputGroupAddon>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger
                          id="seg-lock"
                          ref={field.ref}
                          onBlur={field.onBlur}
                          aria-describedby="seg-lock-hint"
                          aria-invalid={prefsErrors.lockScreenMinutes ? 'true' : undefined}
                          className={selectTriggerClass()}
                        >
                          <SelectValue placeholder="Escolha o intervalo" />
                        </SelectTrigger>
                        <SelectContent position="popper" sideOffset={6} align="start" className="rounded-lg">
                          <SelectItem value="15" className="rounded-md">
                            15 minutos
                          </SelectItem>
                          <SelectItem value="30" className="rounded-md">
                            30 minutos
                          </SelectItem>
                          <SelectItem value="60" className="rounded-md">
                            60 minutos
                          </SelectItem>
                          <SelectItem value="0" className="rounded-md">
                            Não bloquear automaticamente
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </InputGroup>
                  )}
                />
                {prefsErrors.lockScreenMinutes ? (
                  <FieldError className="mt-2 flex items-start gap-2 [&>svg]:shrink-0">
                    <AlertCircleIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
                    <span>{prefsErrors.lockScreenMinutes.message}</span>
                  </FieldError>
                ) : null}
                <p
                  id="seg-lock-hint"
                  className="text-muted-foreground mt-3 flex gap-2 rounded-lg bg-muted/30 px-3 py-2 text-xs leading-relaxed"
                >
                  <InfoIcon className="text-muted-foreground mt-0.5 size-3.5 shrink-0 opacity-80" aria-hidden />
                  <span>{lockHint}</span>
                </p>
              </Field>
            </FieldGroup>
          </FieldSet>

          <div className="border-border/40 mt-6 flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground h-9 gap-1.5 text-xs"
              onClick={onCancelPrefs}
              disabled={!prefsDirty}
            >
              <XIcon className="size-3.5 shrink-0 opacity-90" aria-hidden />
              Cancelar
            </Button>
            <Button type="submit" size="sm" className="h-9 gap-1.5 px-4 font-medium sm:min-w-[132px]">
              <span>Salvar preferências</span>
              <ChevronRightIcon className="size-3.5 opacity-90" aria-hidden />
            </Button>
          </div>
        </form>

        <form
          id="form-seguranca-senha"
          className={cn(configuracoesSectionCardClass, 'min-h-0')}
          onSubmit={senhaForm.handleSubmit(onSubmitSenha)}
          noValidate
        >
          <div className="mb-5 flex gap-3">
            <div className={configuracoesSectionIconClass}>
              <KeyRoundIcon className="size-5" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <FieldLegend className="text-foreground font-heading !mb-0 px-0 text-base font-semibold tracking-tight">
                Alterar senha
              </FieldLegend>
              <p className="text-muted-foreground mt-1 text-xs leading-snug">
                Confirme a senha atual e defina uma nova com pelo menos 8 caracteres.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setDemoOpen((o) => !o)}
            aria-expanded={demoOpen}
            className="text-muted-foreground hover:text-foreground hover:bg-muted/40 mb-4 flex w-full items-center gap-2 rounded-lg border border-border/50 bg-muted/20 px-3 py-2 text-left text-xs transition-colors"
          >
            <ChevronDownIcon
              className={cn('size-3.5 shrink-0 transition-transform', demoOpen && 'rotate-180')}
              aria-hidden
            />
            <span className="font-medium">Modo demonstração — como a senha funciona aqui</span>
          </button>
          {demoOpen ? (
            <div className="text-muted-foreground border-border/50 -mt-2 mb-4 rounded-lg border border-dashed px-3 py-2.5 text-[11px] leading-relaxed sm:text-xs">
              Sem backend, a verificação usa só este navegador. Senha inicial:{' '}
              <code className="bg-muted/60 text-foreground rounded px-1 py-0.5 font-mono text-[11px]">
                {SENHA_ATUAL_PADRAO}
              </code>
              . Depois da primeira troca, use sempre a senha que você gravou aqui.
            </div>
          ) : null}

          <FieldSet className="min-w-0 gap-0 border-0 p-0">
            <FieldGroup className="gap-5">
              <Field data-invalid={senhaErrors.currentPassword ? true : undefined}>
                <FieldLabel htmlFor="seg-pass-current" className="text-sm font-medium">
                  Senha atual
                </FieldLabel>
                <InputGroup className={AUTH_INPUT_GROUP_CLASS}>
                  <InputGroupAddon
                    align="inline-start"
                    className={AUTH_INPUT_GROUP_ADDON_CLASS}
                  >
                    <LockIcon className="size-4 shrink-0" aria-hidden />
                  </InputGroupAddon>
                  <Controller
                    name="currentPassword"
                    control={senhaForm.control}
                    render={({ field }) => (
                      <InputGroupInput
                        {...field}
                        id="seg-pass-current"
                        type={showCurrent ? 'text' : 'password'}
                        autoComplete="current-password"
                        placeholder="············"
                        className={AUTH_INPUT_GROUP_CONTROL_CLASS}
                        aria-invalid={senhaErrors.currentPassword ? 'true' : undefined}
                      />
                    )}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setShowCurrent((v) => !v)}
                      aria-label={showCurrent ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      {showCurrent ? (
                        <EyeOffIcon className="size-4" aria-hidden />
                      ) : (
                        <EyeIcon className="size-4" aria-hidden />
                      )}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
                {senhaErrors.currentPassword ? (
                  <FieldError className="mt-1.5 flex items-start gap-2 [&>svg]:shrink-0">
                    <AlertCircleIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
                    <span>{senhaErrors.currentPassword.message}</span>
                  </FieldError>
                ) : null}
              </Field>

              <Field data-invalid={senhaErrors.newPassword ? true : undefined}>
                <FieldLabel htmlFor="seg-pass-new" className="text-sm font-medium">
                  Nova senha
                </FieldLabel>
                <FieldDescription className="text-muted-foreground !mt-1 text-xs">
                  Mínimo 8 caracteres. Combine letras, números e símbolos quando o sistema exigir.
                </FieldDescription>
                <InputGroup className={cn(AUTH_INPUT_GROUP_CLASS, 'mt-2')}>
                  <InputGroupAddon
                    align="inline-start"
                    className={AUTH_INPUT_GROUP_ADDON_CLASS}
                  >
                    <LockIcon className="size-4 shrink-0" aria-hidden />
                  </InputGroupAddon>
                  <Controller
                    name="newPassword"
                    control={senhaForm.control}
                    render={({ field }) => (
                      <InputGroupInput
                        {...field}
                        id="seg-pass-new"
                        type={showNew ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder="Nova senha (8+ caracteres)"
                        className={AUTH_INPUT_GROUP_CONTROL_CLASS}
                        aria-invalid={senhaErrors.newPassword ? 'true' : undefined}
                      />
                    )}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setShowNew((v) => !v)}
                      aria-label={showNew ? 'Ocultar nova senha' : 'Mostrar nova senha'}
                    >
                      {showNew ? (
                        <EyeOffIcon className="size-4" aria-hidden />
                      ) : (
                        <EyeIcon className="size-4" aria-hidden />
                      )}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
                {senhaErrors.newPassword ? (
                  <FieldError className="mt-1.5 flex items-start gap-2 [&>svg]:shrink-0">
                    <AlertCircleIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
                    <span>{senhaErrors.newPassword.message}</span>
                  </FieldError>
                ) : null}
              </Field>

              <Field data-invalid={senhaErrors.confirmPassword ? true : undefined}>
                <FieldLabel htmlFor="seg-pass-confirm" className="text-sm font-medium">
                  Confirmar nova senha
                </FieldLabel>
                <InputGroup className={AUTH_INPUT_GROUP_CLASS}>
                  <InputGroupAddon
                    align="inline-start"
                    className={AUTH_INPUT_GROUP_ADDON_CLASS}
                  >
                    <LockIcon className="size-4 shrink-0" aria-hidden />
                  </InputGroupAddon>
                  <Controller
                    name="confirmPassword"
                    control={senhaForm.control}
                    render={({ field }) => (
                      <InputGroupInput
                        {...field}
                        id="seg-pass-confirm"
                        type={showConfirm ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder="Repita a nova senha"
                        className={AUTH_INPUT_GROUP_CONTROL_CLASS}
                        aria-invalid={senhaErrors.confirmPassword ? 'true' : undefined}
                      />
                    )}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setShowConfirm((v) => !v)}
                      aria-label={showConfirm ? 'Ocultar confirmação' : 'Mostrar confirmação'}
                    >
                      {showConfirm ? (
                        <EyeOffIcon className="size-4" aria-hidden />
                      ) : (
                        <EyeIcon className="size-4" aria-hidden />
                      )}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
                {senhaErrors.confirmPassword ? (
                  <FieldError className="mt-1.5 flex items-start gap-2 [&>svg]:shrink-0">
                    <AlertCircleIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
                    <span>{senhaErrors.confirmPassword.message}</span>
                  </FieldError>
                ) : null}
              </Field>
            </FieldGroup>
          </FieldSet>

          <p className="text-muted-foreground mt-4 text-center text-xs sm:text-left">
            <Link
              to="/recuperar-senha"
              className="text-primary font-medium underline-offset-4 hover:underline"
            >
              Esqueci minha senha
            </Link>{' '}
            <span className="hidden sm:inline">— envio por e-mail quando o backend estiver ativo.</span>
          </p>

          <div className="border-border/40 mt-5 flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground h-9 gap-1.5 text-xs"
              onClick={onCancelSenha}
              disabled={!senhaDirty}
            >
              <XIcon className="size-3.5 shrink-0 opacity-90" aria-hidden />
              Cancelar
            </Button>
            <Button type="submit" size="sm" className="h-9 gap-1.5 px-4 font-medium sm:min-w-[148px]">
              <span>Atualizar senha</span>
              <ChevronRightIcon className="size-3.5 opacity-90" aria-hidden />
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import {
  AlertCircleIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  EyeIcon,
  EyeOffIcon,
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
  AUTH_INPUT_GROUP_ADDON_CLASS,
  AUTH_INPUT_GROUP_CLASS,
  AUTH_INPUT_GROUP_CONTROL_CLASS,
} from '@/lib/auth-matched-input-group'
import { useAuth } from '@/contexts/auth-context'
import {
  SENHA_ATUAL_PADRAO,
  gravarSenhaLocal,
  lerSenhaArmazenadaLocal,
} from '@/lib/seguranca-local-storage'
import { cn } from '@/lib/utils'
import { changeCurrentUserPassword } from '@/services/user-profile-service'
import { AuthRequestError } from '@/services/auth/types'

import {
  configuracoesPageShellClass,
  configuracoesSectionCardClass,
  configuracoesSectionIconClass,
} from '@/pages/configuracoes/configuracoes-layout'
import {
  type SegurancaSenhaValues,
  segurancaSenhaSchema,
} from '@/pages/configuracoes/seguranca-schema'

const defaultSenha: SegurancaSenhaValues = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
}

export function ConfiguracoesSegurancaPage() {
  const { isAuthenticated } = useAuth()

  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [demoOpen, setDemoOpen] = useState(false)

  const senhaForm = useForm<SegurancaSenhaValues>({
    resolver: zodResolver(segurancaSenhaSchema),
    defaultValues: defaultSenha,
    mode: 'onTouched',
  })

  async function onSubmitSenha(values: SegurancaSenhaValues) {
    if (isAuthenticated) {
      try {
        await changeCurrentUserPassword({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        })
        senhaForm.reset(defaultSenha)
        setShowCurrent(false)
        setShowNew(false)
        setShowConfirm(false)
        toast.success('Senha atualizada', {
          description: 'A nova senha já está ativa na sua conta.',
        })
      } catch (e) {
        if (e instanceof AuthRequestError && e.status === 401) {
          return
        }
        if (e instanceof AuthRequestError && e.status === 400) {
          const msg = e.message.toLowerCase()
          if (msg.includes('senha atual') || msg.includes('incorreta')) {
            senhaForm.setError('currentPassword', {
              type: 'manual',
              message: e.message,
            })
            return
          }
          if (msg.includes('diferente')) {
            senhaForm.setError('newPassword', {
              type: 'manual',
              message: e.message,
            })
            return
          }
          toast.error('Não foi possível atualizar a senha', { description: e.message })
          return
        }
        toast.error('Não foi possível atualizar a senha', {
          description: 'Tente novamente dentro de instantes.',
        })
      }
      return
    }

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
  }

  function onCancelSenha() {
    senhaForm.reset(defaultSenha)
    setShowCurrent(false)
    setShowNew(false)
    setShowConfirm(false)
    toast.message('Alterações descartadas.')
  }

  const {
    errors: senhaErrors,
    isDirty: senhaDirty,
    isSubmitting: senhaSubmitting,
  } = senhaForm.formState

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
            {isAuthenticated ? (
              <span className="text-muted-foreground bg-muted/50 border-border/50 inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase sm:text-[11px]">
                Senha na API
              </span>
            ) : null}
          </div>
          <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed">
            Altere a palavra-passe da conta. Com sessão iniciada, a alteração é validada no servidor.
          </p>
        </div>
      </header>

      <div className="mt-6 w-full min-w-0">
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

          {!isAuthenticated ? (
            <>
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
                  Sem sessão na API, a verificação usa só este navegador. Senha inicial:{' '}
                  <code className="bg-muted/60 text-foreground rounded px-1 py-0.5 font-mono text-[11px]">
                    {SENHA_ATUAL_PADRAO}
                  </code>
                  . Depois da primeira troca, use sempre a senha que você gravou aqui.
                </div>
              ) : null}
            </>
          ) : (
            <p className="text-muted-foreground mb-4 rounded-lg border border-border/40 bg-muted/15 px-3 py-2 text-[11px] leading-relaxed sm:text-xs">
              A senha atual é validada no servidor. Use a mesma palavra-passe com que entra na SentinelIA.
            </p>
          )}

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
            <span className="hidden sm:inline">— envio por e-mail.</span>
          </p>

          <div className="border-border/40 mt-5 flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground h-9 gap-1.5 text-xs"
              onClick={onCancelSenha}
              disabled={!senhaDirty || senhaSubmitting}
            >
              <XIcon className="size-3.5 shrink-0 opacity-90" aria-hidden />
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={senhaSubmitting}
              className="h-9 gap-1.5 px-4 font-medium sm:min-w-[148px]"
            >
              <span>{senhaSubmitting ? 'A atualizar…' : 'Atualizar senha'}</span>
              <ChevronRightIcon className="size-3.5 opacity-90" aria-hidden />
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

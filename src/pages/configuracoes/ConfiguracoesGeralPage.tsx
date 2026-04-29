import { useMemo, useRef } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  AlertCircleIcon,
  Building2Icon,
  CalendarDaysIcon,
  ChevronRightIcon,
  GlobeIcon,
  LanguagesIcon,
  SlidersHorizontalIcon,
  XIcon,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Field,
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
import { cn } from '@/lib/utils'

import {
  configuracoesPageShellClass,
  configuracoesSectionCardClass,
  configuracoesSectionIconClass,
} from '@/pages/configuracoes/configuracoes-layout'
import { appendConfigAuditLog } from '@/pages/configuracoes/configuracoes-audit-log'
import {
  type GeralFormValues,
  geralFormSchema,
} from '@/pages/configuracoes/geral-schema'
import {
  CONFIG_GERAL_STORAGE_KEY,
  TIMEZONE_OPCOES,
} from '@/pages/configuracoes/timezone-opcoes'

const defaultGeralValues: GeralFormValues = {
  organizationName: '',
  locale: 'pt-BR',
  dateFormat: 'dd/MM/yyyy',
  defaultTimezone: 'America/Sao_Paulo',
}

function readInitial(): GeralFormValues {
  try {
    const raw = localStorage.getItem(CONFIG_GERAL_STORAGE_KEY)
    if (!raw) return defaultGeralValues
    const merged = {
      ...defaultGeralValues,
      ...JSON.parse(raw),
    } as unknown
    const parsed = geralFormSchema.safeParse(merged)
    return parsed.success ? parsed.data : defaultGeralValues
  } catch {
    return defaultGeralValues
  }
}

function selectTriggerClass() {
  return cn(
    'text-foreground data-placeholder:text-muted-foreground h-11 min-h-11 w-full min-w-0 flex-1 cursor-pointer rounded-none border-0 bg-transparent px-2 py-0 text-sm shadow-none focus-visible:border-0 focus-visible:ring-0 focus-visible:ring-offset-0 data-[size=default]:h-11 [&_svg:not([class*="size-"])]:size-4',
  )
}

/** Configurações gerais da instância (persistência local até existir API). */
export function ConfiguracoesGeralPage() {
  const initial = useMemo(() => readInitial(), [])
  const baselineRef = useRef<GeralFormValues>(initial)

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm<GeralFormValues>({
    resolver: zodResolver(geralFormSchema),
    defaultValues: initial,
  })

  function onSubmit(values: GeralFormValues) {
    const payload: GeralFormValues = {
      ...values,
      organizationName: values.organizationName.trim(),
    }
    try {
      localStorage.setItem(CONFIG_GERAL_STORAGE_KEY, JSON.stringify(payload))
    } catch {
      toast.error('Não foi possível salvar', {
        description: 'Armazenamento local indisponível.',
      })
      return
    }
    baselineRef.current = payload
    reset(payload)
    toast.success('Configurações salvas', {
      description: 'Preferências guardadas neste dispositivo.',
    })
    appendConfigAuditLog({
      category: 'geral',
      action: 'Configurações gerais salvas',
      detail: payload.organizationName
        ? `Organização: ${payload.organizationName}`
        : undefined,
    })
  }

  function onCancel() {
    reset(baselineRef.current)
    toast.message('Alterações descartadas.')
  }

  return (
    <div className={configuracoesPageShellClass}>
      <header className="border-border/50 flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-start sm:gap-4">
        <div className="bg-muted/30 text-muted-foreground border-border/60 flex size-11 shrink-0 items-center justify-center rounded-xl border sm:size-12">
          <SlidersHorizontalIcon className="size-5 sm:size-[1.35rem]" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 gap-y-1">
            <h1 className="text-foreground font-heading text-xl font-semibold tracking-tight sm:text-2xl">
              Geral
            </h1>
            <span className="text-muted-foreground bg-muted/50 border-border/50 inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase sm:text-[11px]">
              Armazenamento local
            </span>
          </div>
          <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed">
            Organização e regional (idioma, datas, fuso). O tema fica no menu lateral. Salvo só neste
            navegador até existir API.
          </p>
        </div>
      </header>

      <form
        id="form-config-geral"
        className="mt-6 w-full min-w-0"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <div className="grid gap-6 lg:grid-cols-2 lg:items-start lg:gap-8">
          <div className={cn(configuracoesSectionCardClass, 'min-h-0')}>
            <div className="mb-5 flex gap-3">
              <div className={configuracoesSectionIconClass}>
                <Building2Icon className="size-5" aria-hidden />
              </div>
              <div className="min-w-0">
                <FieldLegend className="text-foreground font-heading !mb-0 px-0 text-base font-semibold tracking-tight">
                  Instituição
                </FieldLegend>
                <p className="text-muted-foreground mt-1 text-xs leading-snug">
                  Nome exibido para a instância neste dispositivo.
                </p>
              </div>
            </div>
            <FieldSet className="min-w-0 flex-1 gap-0 border-0 p-0">
              <FieldGroup className="gap-3">
                <Field data-invalid={errors.organizationName ? true : undefined}>
                  <FieldLabel htmlFor="geral-org" className="text-sm font-medium">
                    Nome da organização
                  </FieldLabel>
                  <InputGroup className={AUTH_INPUT_GROUP_CLASS}>
                    <InputGroupAddon
                      align="inline-start"
                      className={AUTH_INPUT_GROUP_ADDON_CLASS}
                    >
                      <Building2Icon className="size-4 shrink-0" aria-hidden />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="geral-org"
                      className={AUTH_INPUT_GROUP_CONTROL_CLASS}
                      placeholder="Ex.: Minha empresa S.A."
                      aria-invalid={errors.organizationName ? 'true' : undefined}
                      autoComplete="organization"
                      {...register('organizationName')}
                    />
                  </InputGroup>
                  {errors.organizationName ? (
                    <FieldError className="flex items-start gap-2 [&>svg]:shrink-0">
                      <AlertCircleIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
                      <span>{errors.organizationName.message}</span>
                    </FieldError>
                  ) : null}
                </Field>
              </FieldGroup>
            </FieldSet>
          </div>

          <div className={cn(configuracoesSectionCardClass, 'min-h-0')}>
            <div className="mb-5 flex gap-3">
              <div className={configuracoesSectionIconClass}>
                <GlobeIcon className="size-5" aria-hidden />
              </div>
              <div className="min-w-0">
                <FieldLegend className="text-foreground font-heading !mb-0 px-0 text-base font-semibold tracking-tight">
                  Regional
                </FieldLegend>
                <p className="text-muted-foreground mt-1 text-xs leading-snug">
                  Idioma da interface, formato de datas e fuso padrão.
                </p>
              </div>
            </div>
            <FieldSet className="min-w-0 flex-1 gap-0 border-0 p-0">
              <FieldGroup className="gap-3">
                <Field data-invalid={errors.locale ? true : undefined}>
                  <FieldLabel htmlFor="geral-locale" className="text-sm font-medium">
                    Idioma
                  </FieldLabel>
                  <Controller
                    name="locale"
                    control={control}
                    render={({ field }) => (
                      <InputGroup className={AUTH_INPUT_GROUP_CLASS}>
                        <InputGroupAddon
                          align="inline-start"
                          className={AUTH_INPUT_GROUP_ADDON_CLASS}
                        >
                          <LanguagesIcon className="size-4 shrink-0" aria-hidden />
                        </InputGroupAddon>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger
                            id="geral-locale"
                            ref={field.ref}
                            onBlur={field.onBlur}
                            aria-invalid={errors.locale ? 'true' : undefined}
                            className={selectTriggerClass()}
                          >
                            <SelectValue placeholder="Idioma" />
                          </SelectTrigger>
                          <SelectContent position="popper" sideOffset={6} align="start" className="rounded-lg">
                            <SelectItem value="pt-BR" className="rounded-md">
                              Português (Brasil)
                            </SelectItem>
                            <SelectItem value="en-US" className="rounded-md">
                              English (US)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </InputGroup>
                    )}
                  />
                  {errors.locale ? (
                    <FieldError className="flex items-start gap-2 [&>svg]:shrink-0">
                      <AlertCircleIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
                      <span>{errors.locale.message}</span>
                    </FieldError>
                  ) : null}
                </Field>

                <Field data-invalid={errors.dateFormat ? true : undefined}>
                  <FieldLabel htmlFor="geral-datefmt" className="text-sm font-medium">
                    Formato de data
                  </FieldLabel>
                  <Controller
                    name="dateFormat"
                    control={control}
                    render={({ field }) => (
                      <InputGroup className={AUTH_INPUT_GROUP_CLASS}>
                        <InputGroupAddon
                          align="inline-start"
                          className={AUTH_INPUT_GROUP_ADDON_CLASS}
                        >
                          <CalendarDaysIcon className="size-4 shrink-0" aria-hidden />
                        </InputGroupAddon>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger
                            id="geral-datefmt"
                            ref={field.ref}
                            onBlur={field.onBlur}
                            aria-invalid={errors.dateFormat ? 'true' : undefined}
                            className={selectTriggerClass()}
                          >
                            <SelectValue placeholder="Formato" />
                          </SelectTrigger>
                          <SelectContent position="popper" sideOffset={6} align="start" className="rounded-lg">
                            <SelectItem value="dd/MM/yyyy" className="rounded-md">
                              31/12/2024 (dd/MM/aaaa)
                            </SelectItem>
                            <SelectItem value="yyyy-MM-dd" className="rounded-md">
                              2024-12-31 (aaaa-mm-dd)
                            </SelectItem>
                            <SelectItem value="MM/dd/yyyy" className="rounded-md">
                              12/31/2024 (mm/dd/aaaa)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </InputGroup>
                    )}
                  />
                  {errors.dateFormat ? (
                    <FieldError className="flex items-start gap-2 [&>svg]:shrink-0">
                      <AlertCircleIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
                      <span>{errors.dateFormat.message}</span>
                    </FieldError>
                  ) : null}
                </Field>

                <Field data-invalid={errors.defaultTimezone ? true : undefined}>
                  <FieldLabel htmlFor="geral-tz" className="text-sm font-medium">
                    Fuso horário padrão
                  </FieldLabel>
                  <Controller
                    name="defaultTimezone"
                    control={control}
                    render={({ field }) => (
                      <InputGroup className={AUTH_INPUT_GROUP_CLASS}>
                        <InputGroupAddon
                          align="inline-start"
                          className={AUTH_INPUT_GROUP_ADDON_CLASS}
                        >
                          <GlobeIcon className="size-4 shrink-0" aria-hidden />
                        </InputGroupAddon>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger
                            id="geral-tz"
                            ref={field.ref}
                            onBlur={field.onBlur}
                            aria-invalid={errors.defaultTimezone ? 'true' : undefined}
                            className={selectTriggerClass()}
                          >
                            <SelectValue placeholder="Fuso" />
                          </SelectTrigger>
                          <SelectContent position="popper" sideOffset={6} align="start" className="rounded-lg">
                            {TIMEZONE_OPCOES.map((z) => (
                              <SelectItem key={z.value} value={z.value} className="rounded-md">
                                {z.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </InputGroup>
                    )}
                  />
                  {errors.defaultTimezone ? (
                    <FieldError className="flex items-start gap-2 [&>svg]:shrink-0">
                      <AlertCircleIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
                      <span>{errors.defaultTimezone.message}</span>
                    </FieldError>
                  ) : null}
                </Field>
              </FieldGroup>
            </FieldSet>
          </div>
        </div>

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
      </form>
    </div>
  )
}

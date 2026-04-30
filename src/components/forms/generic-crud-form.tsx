import type { LucideIcon } from 'lucide-react'
import { AlertCircleIcon, ChevronRightIcon, XIcon } from 'lucide-react'
import { Controller, type FieldErrors, type FieldValues, type Path, type UseFormReturn } from 'react-hook-form'

import { LexKitRichTextField } from '@/components/forms/lexkit-richtext-field'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupTextarea,
} from '@/components/ui/input-group'
import { Switch } from '@/components/ui/switch'
import {
  AUTH_INPUT_GROUP_ADDON_CLASS,
  AUTH_INPUT_GROUP_CLASS,
  AUTH_INPUT_GROUP_CONTROL_CLASS,
} from '@/lib/auth-matched-input-group'
import { cn } from '@/lib/utils'
import { configuracoesSectionIconClass } from '@/pages/configuracoes/configuracoes-layout'

export type CrudFormPresentation = 'page' | 'modal'

export type CrudFormFieldColumns = 1 | 2 | 3

type CrudFieldBase<T extends FieldValues> = {
  name: Path<T>
  label: string
  description?: string
  /** Ícone à esquerda (mesmo padrão de login / configurações). */
  icon?: LucideIcon
  /**
   * Em `fieldColumns` 2 ou 3: ocupa a linha inteira (ex.: descrição longa).
   * Se omitido, `textarea` assume linha inteira; demais ficam em uma célula.
   */
  fullRow?: boolean
}

type CrudTextField<T extends FieldValues> = CrudFieldBase<T> & {
  type: 'text' | 'textarea'
  placeholder?: string
}

type CrudNumberField<T extends FieldValues> = CrudFieldBase<T> & {
  type: 'number'
  placeholder?: string
  min?: number
  max?: number
  step?: number
}

type CrudSwitchField<T extends FieldValues> = CrudFieldBase<T> & {
  type: 'switch'
}

type CrudRichTextField<T extends FieldValues> = CrudFieldBase<T> & {
  type: 'richtext'
  placeholder?: string
}

export type CrudFormField<T extends FieldValues> =
  | CrudTextField<T>
  | CrudNumberField<T>
  | CrudSwitchField<T>
  | CrudRichTextField<T>

type GenericCrudFormProps<T extends FieldValues> = {
  title: string
  description: string
  /** Ícone principal ao lado do título (padrão visual das Configurações). */
  headerIcon?: LucideIcon
  /** Ícone opcional na linha da descrição. */
  headerDescriptionIcon?: LucideIcon
  submitLabel: string
  cancelLabel?: string
  presentation?: CrudFormPresentation
  /** Grade responsiva dos campos (1 = empilhado; 2–3 = colunas a partir de sm/lg). */
  fieldColumns?: CrudFormFieldColumns
  form: UseFormReturn<T>
  fields: CrudFormField<T>[]
  onSubmit: (values: T) => void
  onCancel: () => void
}

function getFieldErrorMessage<T extends FieldValues>(
  errors: FieldErrors<T>,
  fieldName: Path<T>,
) {
  const raw = errors[fieldName as keyof FieldErrors<T>] as
    | { message?: string }
    | undefined
  return typeof raw?.message === 'string' ? raw.message : undefined
}

function fieldGroupGridClass(columns: CrudFormFieldColumns) {
  if (columns === 1) return 'flex flex-col gap-4'
  if (columns === 2) return 'grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-4'
  return 'grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-4 lg:grid-cols-3 lg:gap-x-4'
}

function fieldCellClass(
  columns: CrudFormFieldColumns,
  fullRow: boolean,
) {
  if (columns === 1) return undefined
  if (!fullRow) return undefined
  if (columns === 2) return 'sm:col-span-2'
  return 'sm:col-span-2 lg:col-span-3'
}

function isFullRowField(
  field: CrudFormField<FieldValues>,
  columns: CrudFormFieldColumns,
) {
  if (columns === 1) return false
  if (field.fullRow !== undefined) return field.fullRow
  return field.type === 'textarea' || field.type === 'richtext'
}

function dialogMaxClass(columns: CrudFormFieldColumns) {
  if (columns >= 3) return 'max-w-xl sm:max-w-2xl lg:max-w-4xl'
  if (columns === 2) return 'max-w-xl sm:max-w-2xl'
  return 'max-w-xl sm:max-w-2xl'
}

function pageMaxClass(columns: CrudFormFieldColumns) {
  if (columns >= 3) return 'max-w-5xl'
  if (columns === 2) return 'max-w-4xl'
  return 'max-w-3xl'
}

function FieldErrorWithIcon({ message }: Readonly<{ message: string }>) {
  return (
    <FieldError className="flex items-start gap-2 [&>svg]:shrink-0">
      <AlertCircleIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <span>{message}</span>
    </FieldError>
  )
}

function GenericCrudFormContent<T extends FieldValues>({
  title,
  description,
  headerIcon: HeaderIcon,
  headerDescriptionIcon: HeaderDescriptionIcon,
  submitLabel,
  cancelLabel = 'Cancelar',
  fieldColumns = 1,
  form,
  fields,
  onSubmit,
  onCancel,
}: Readonly<Omit<GenericCrudFormProps<T>, 'presentation'>>) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
  } = form

  const gridClass = fieldGroupGridClass(fieldColumns)

  return (
    <form
      className="space-y-6"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <header
        className={cn(
          'border-b border-border/50 pb-4',
          HeaderIcon
            ? 'flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4'
            : 'space-y-1',
        )}
      >
        {HeaderIcon ? (
          <div className={configuracoesSectionIconClass}>
            <HeaderIcon className="size-5" aria-hidden />
          </div>
        ) : null}
        <div
          className={cn(
            'min-w-0',
            HeaderIcon ? 'flex-1 space-y-1.5' : 'space-y-1',
          )}
        >
          <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="text-muted-foreground flex gap-2 text-sm leading-relaxed">
            {HeaderDescriptionIcon ? (
              <HeaderDescriptionIcon
                className="text-muted-foreground/80 mt-0.5 size-4 shrink-0"
                aria-hidden
              />
            ) : null}
            <span className="min-w-0">{description}</span>
          </p>
        </div>
      </header>

      <FieldSet className="border-0 p-0">
        <FieldGroup className={cn(gridClass, fieldColumns === 1 && 'gap-4')}>
          {fields.map((field) => {
            const errorMessage = getFieldErrorMessage(errors, field.name)
            const fieldId = String(field.name)
            const Icon = field.icon
            const fullRow = isFullRowField(field, fieldColumns)
            const cellClass = fieldCellClass(fieldColumns, fullRow)

            if (field.type === 'richtext') {
              return (
                <Field
                  key={fieldId}
                  className={cellClass}
                  data-invalid={errorMessage ? true : undefined}
                >
                  <div className="flex items-center gap-2">
                    {Icon ? (
                      <Icon className="text-muted-foreground size-4 shrink-0" aria-hidden />
                    ) : null}
                    <FieldLabel htmlFor={fieldId} className="text-sm font-medium">
                      {field.label}
                    </FieldLabel>
                  </div>
                  {field.description ? (
                    <FieldDescription>{field.description}</FieldDescription>
                  ) : null}
                  <Controller
                    control={control}
                    name={field.name}
                    render={({ field: rhfField }) => (
                      <LexKitRichTextField
                        id={fieldId}
                        value={typeof rhfField.value === 'string' ? rhfField.value : ''}
                        onChange={rhfField.onChange}
                        onBlur={rhfField.onBlur}
                        placeholder={field.placeholder}
                        disabled={isSubmitting}
                        invalid={Boolean(errorMessage)}
                      />
                    )}
                  />
                  {errorMessage ? <FieldErrorWithIcon message={errorMessage} /> : null}
                </Field>
              )
            }

            if (field.type === 'textarea') {
              return (
                <Field
                  key={fieldId}
                  className={cellClass}
                  data-invalid={errorMessage ? true : undefined}
                >
                  <FieldLabel htmlFor={fieldId} className="text-sm font-medium">
                    {field.label}
                  </FieldLabel>
                  {field.description ? (
                    <FieldDescription>{field.description}</FieldDescription>
                  ) : null}
                  <InputGroup
                    className={cn(
                      AUTH_INPUT_GROUP_CLASS,
                      'h-auto min-h-[6.5rem] items-stretch py-0',
                    )}
                  >
                    {Icon ? (
                      <InputGroupAddon
                        align="block-start"
                        className={cn(AUTH_INPUT_GROUP_ADDON_CLASS, 'pt-3')}
                      >
                        <Icon className="size-4 shrink-0" aria-hidden />
                      </InputGroupAddon>
                    ) : null}
                    <InputGroupTextarea
                      id={fieldId}
                      placeholder={field.placeholder}
                      rows={4}
                      className={cn(AUTH_INPUT_GROUP_CONTROL_CLASS, 'min-h-[5.5rem] resize-y py-2.5')}
                      aria-invalid={errorMessage ? 'true' : undefined}
                      {...register(field.name)}
                    />
                  </InputGroup>
                  {errorMessage ? <FieldErrorWithIcon message={errorMessage} /> : null}
                </Field>
              )
            }

            if (field.type === 'number') {
              return (
                <Field
                  key={fieldId}
                  className={cellClass}
                  data-invalid={errorMessage ? true : undefined}
                >
                  <FieldLabel htmlFor={fieldId} className="text-sm font-medium">
                    {field.label}
                  </FieldLabel>
                  {field.description ? (
                    <FieldDescription>{field.description}</FieldDescription>
                  ) : null}
                  <InputGroup className={AUTH_INPUT_GROUP_CLASS}>
                    {Icon ? (
                      <InputGroupAddon align="inline-start" className={AUTH_INPUT_GROUP_ADDON_CLASS}>
                        <Icon className="size-4 shrink-0" aria-hidden />
                      </InputGroupAddon>
                    ) : null}
                    <InputGroupInput
                      id={fieldId}
                      type="number"
                      placeholder={field.placeholder}
                      min={field.min}
                      max={field.max}
                      step={field.step ?? 1}
                      className={AUTH_INPUT_GROUP_CONTROL_CLASS}
                      aria-invalid={errorMessage ? 'true' : undefined}
                      {...register(field.name, {
                        setValueAs: (value) => {
                          if (value === '') return undefined
                          return Number(value)
                        },
                      })}
                    />
                  </InputGroup>
                  {errorMessage ? <FieldErrorWithIcon message={errorMessage} /> : null}
                </Field>
              )
            }

            if (field.type === 'switch') {
              return (
                <Field
                  key={fieldId}
                  className={cellClass}
                  data-invalid={errorMessage ? true : undefined}
                >
                  <div className="flex h-full min-h-[2.75rem] items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/10 px-3 py-2.5 sm:min-h-0 sm:py-3">
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        {Icon ? (
                          <Icon className="text-muted-foreground size-4 shrink-0" aria-hidden />
                        ) : null}
                        <FieldLabel htmlFor={fieldId} className="text-sm font-medium">
                          {field.label}
                        </FieldLabel>
                      </div>
                      {field.description ? (
                        <FieldDescription className="!mt-1">{field.description}</FieldDescription>
                      ) : null}
                    </div>
                    <Controller
                      control={control}
                      name={field.name}
                      render={({ field: rhfField }) => (
                        <Switch
                          id={fieldId}
                          checked={Boolean(rhfField.value)}
                          onCheckedChange={rhfField.onChange}
                          aria-invalid={errorMessage ? 'true' : undefined}
                        />
                      )}
                    />
                  </div>
                  {errorMessage ? <FieldErrorWithIcon message={errorMessage} /> : null}
                </Field>
              )
            }

            return (
              <Field
                key={fieldId}
                className={cellClass}
                data-invalid={errorMessage ? true : undefined}
              >
                <FieldLabel htmlFor={fieldId} className="text-sm font-medium">
                  {field.label}
                </FieldLabel>
                {field.description ? (
                  <FieldDescription>{field.description}</FieldDescription>
                ) : null}
                <InputGroup className={AUTH_INPUT_GROUP_CLASS}>
                  {Icon ? (
                    <InputGroupAddon align="inline-start" className={AUTH_INPUT_GROUP_ADDON_CLASS}>
                      <Icon className="size-4 shrink-0" aria-hidden />
                    </InputGroupAddon>
                  ) : null}
                  <InputGroupInput
                    id={fieldId}
                    type="text"
                    placeholder={field.placeholder}
                    className={AUTH_INPUT_GROUP_CONTROL_CLASS}
                    aria-invalid={errorMessage ? 'true' : undefined}
                    {...register(field.name)}
                  />
                </InputGroup>
                {errorMessage ? <FieldErrorWithIcon message={errorMessage} /> : null}
              </Field>
            )
          })}
        </FieldGroup>
      </FieldSet>

      <div className="flex flex-col-reverse gap-2 border-t border-border/40 pt-4 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground h-9 gap-1.5 text-xs"
          onClick={onCancel}
          disabled={isSubmitting || !isDirty}
        >
          <XIcon className="size-3.5 shrink-0 opacity-90" aria-hidden />
          {cancelLabel}
        </Button>
        <Button type="submit" size="sm" className="h-9 gap-1.5 px-4 font-medium sm:min-w-[132px]" disabled={isSubmitting}>
          <span>{submitLabel}</span>
          <ChevronRightIcon className="size-3.5 opacity-90" aria-hidden />
        </Button>
      </div>
    </form>
  )
}

export function GenericCrudForm<T extends FieldValues>({
  presentation = 'page',
  fieldColumns = 1,
  ...props
}: Readonly<GenericCrudFormProps<T>>) {
  if (presentation === 'modal') {
    return (
      <Dialog open onOpenChange={(open) => !open && props.onCancel()}>
        <DialogContent className={cn('gap-0 p-0 sm:p-0', dialogMaxClass(fieldColumns))}>
          <DialogHeader className="sr-only">
            <DialogTitle>{props.title}</DialogTitle>
            <DialogDescription>{props.description}</DialogDescription>
          </DialogHeader>
          <div className="max-h-[min(85dvh,720px)] overflow-y-auto p-4 sm:p-5">
            <GenericCrudFormContent {...props} fieldColumns={fieldColumns} />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className={cn('mx-auto w-full px-4 pb-8 sm:px-6', pageMaxClass(fieldColumns))}>
      <div className="rounded-xl border border-border/60 bg-background px-4 py-5 sm:px-5 sm:py-6">
        <GenericCrudFormContent {...props} fieldColumns={fieldColumns} />
      </div>
    </div>
  )
}

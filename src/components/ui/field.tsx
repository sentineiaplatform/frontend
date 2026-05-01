"use client"

import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { CircleHelp } from "lucide-react"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type FieldHintContextValue = {
  hintId: string | null
  setHintId: (id: string | null) => void
}

const FieldHintContext = createContext<FieldHintContextValue | null>(null)

export function useFieldHintId(): string | null {
  return useContext(FieldHintContext)?.hintId ?? null
}

function mergeLabelDescriptionChildren(children: ReactNode): ReactNode {
  const arr = Children.toArray(children)
  const out: ReactNode[] = []

  let i = 0
  while (i < arr.length) {
    const cur = arr[i]
    const nxt = arr[i + 1]

    if (
      isValidElement(cur) &&
      isValidElement(nxt) &&
      cur.type === FieldLabel &&
      nxt.type === FieldDescription
    ) {
      const rowKey = cur.key ?? nxt.key ?? `field-label-row-${i}`
      const labelEl = cur as ReactElement<React.ComponentProps<typeof FieldLabel>>
      const hintEl = nxt as ReactElement<
        React.ComponentProps<typeof FieldDescription>
      >
      const hintVariant =
        hintEl.props.variant ??
        (hintEl.props.inline ? "inline" : "default")
      const hintMergeProps =
        hintVariant === "tooltip"
          ? {
              variant: "tooltip" as const,
              tooltipTriggerAriaLabel: hintEl.props.tooltipTriggerAriaLabel,
            }
          : { inline: true as const }
      // Label primitivo usa `display: flex`; dois filhos viram dois itens flex e a dica
      // quebra sozinha para a linha de baixo. Rótulo + dica no mesmo fluxo inline.
      out.push(
        <div
          key={rowKey}
          data-slot="field-label-row"
          className={cn(
            "min-h-9 w-full min-w-0 max-w-full sm:min-h-10",
            "group-data-[orientation=horizontal]/field:flex-auto",
            "@md/field-group:group-data-[orientation=responsive]/field:flex-auto",
          )}
        >
          {cloneElement(labelEl, {
            className: cn(
              labelEl.props.className,
              "!block !h-auto !w-full !min-w-0 !max-w-full !gap-0 !p-0 !leading-snug",
              "!font-normal text-foreground",
            ),
            children: (
              <>
                <span className="text-sm font-medium leading-snug">
                  {labelEl.props.children}
                </span>
                {cloneElement(hintEl, hintMergeProps)}
              </>
            ),
          })}
        </div>,
      )
      i += 2
      continue
    }

    out.push(cur)
    i += 1
  }

  return out
}

function FieldSet({ className, ...props }: React.ComponentProps<"fieldset">) {
  return (
    <fieldset
      data-slot="field-set"
      className={cn(
        "flex flex-col gap-4 has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3",
        className
      )}
      {...props}
    />
  )
}

function FieldLegend({
  className,
  variant = "legend",
  ...props
}: React.ComponentProps<"legend"> & { variant?: "legend" | "label" }) {
  return (
    <legend
      data-slot="field-legend"
      data-variant={variant}
      className={cn(
        "mb-1.5 font-medium data-[variant=label]:text-sm data-[variant=legend]:text-base",
        className
      )}
      {...props}
    />
  )
}

function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-group"
      className={cn(
        "group/field-group @container/field-group flex w-full flex-col gap-5 data-[slot=checkbox-group]:gap-3 *:data-[slot=field-group]:gap-4",
        className
      )}
      {...props}
    />
  )
}

const fieldVariants = cva(
  "group/field flex w-full min-w-0 gap-2 data-[invalid=true]:text-destructive",
  {
    variants: {
      orientation: {
        vertical: "flex-col *:w-full [&>.sr-only]:w-auto",
        horizontal:
          "flex-row items-center has-[>[data-slot=field-content]]:items-start *:data-[slot=field-label]:flex-auto has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
        responsive:
          "flex-col *:w-full @md/field-group:flex-row @md/field-group:items-center @md/field-group:*:w-auto @md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:*:data-[slot=field-label]:flex-auto [&>.sr-only]:w-auto @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
      },
    },
    defaultVariants: {
      orientation: "vertical",
    },
  }
)

function Field({
  className,
  orientation = "vertical",
  children,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof fieldVariants>) {
  const [hintId, setHintId] = useState<string | null>(null)
  const hintContext = useMemo(() => ({ hintId, setHintId }), [hintId])

  return (
    <FieldHintContext.Provider value={hintContext}>
      <div
        role="group"
        data-slot="field"
        data-orientation={orientation}
        className={cn(fieldVariants({ orientation }), className)}
        {...props}
      >
        {mergeLabelDescriptionChildren(children)}
      </div>
    </FieldHintContext.Provider>
  )
}

function FieldLabelRow({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-label-row"
      className={cn(
        "min-h-9 w-full min-w-0 max-w-full sm:min-h-10",
        "group-data-[orientation=horizontal]/field:flex-auto",
        "@md/field-group:group-data-[orientation=responsive]/field:flex-auto",
        className,
      )}
      {...props}
    />
  )
}

function FieldContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-content"
      className={cn(
        "group/field-content flex min-w-0 flex-1 flex-col gap-0.5 leading-snug",
        className
      )}
      {...props}
    />
  )
}

function FieldLabel({
  className,
  ...props
}: React.ComponentProps<typeof Label>) {
  return (
    <Label
      data-slot="field-label"
      className={cn(
        "group/field-label peer/field-label flex w-fit gap-2 leading-snug group-data-[disabled=true]/field:opacity-50 has-data-checked:border-primary/30 has-data-checked:bg-primary/5 has-[>[data-slot=field]]:rounded-lg has-[>[data-slot=field]]:border *:data-[slot=field]:p-2.5 dark:has-data-checked:border-primary/20 dark:has-data-checked:bg-primary/10",
        "has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col",
        className
      )}
      {...props}
    />
  )
}

function FieldTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-label"
      className={cn(
        "flex w-fit items-center gap-2 text-sm font-medium group-data-[disabled=true]/field:opacity-50",
        className
      )}
      {...props}
    />
  )
}

function FieldDescription({
  className,
  inline,
  variant: variantProp,
  tooltipTriggerAriaLabel,
  children,
  ...props
}: React.ComponentProps<"p"> & {
  /** Quando true (ou ao seguir `FieldLabel` dentro de `Field`), renderiza após o rótulo entre parênteses, em texto menor. */
  inline?: boolean
  /** `tooltip`: ícone "?" com tooltip; o texto completo continua disponível para leitores de ecrã via `aria-describedby` no controlo. */
  variant?: "default" | "inline" | "tooltip"
  /** Rótulo acessível do botão «?» quando `variant="tooltip"`. */
  tooltipTriggerAriaLabel?: string
}) {
  const generatedId = useId()
  const hintCtx = useContext(FieldHintContext)
  const variant = variantProp ?? (inline ? "inline" : "default")

  useLayoutEffect(() => {
    if ((variant !== "inline" && variant !== "tooltip") || !hintCtx) return
    hintCtx.setHintId(generatedId)
    return () => {
      hintCtx.setHintId(null)
    }
  }, [variant, hintCtx, generatedId])

  if (variant === "tooltip") {
    return (
      <>
        <span
          id={generatedId}
          data-slot="field-description"
          data-variant="tooltip-sr"
          className="sr-only"
        >
          {children}
        </span>
        <span data-slot="field-description" data-variant="tooltip" className="inline-flex">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className={cn(
                  "text-muted-foreground hover:text-foreground inline-flex shrink-0 rounded-sm outline-none",
                  "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                )}
                aria-label={
                  tooltipTriggerAriaLabel ?? "Informação sobre o campo"
                }
              >
                <CircleHelp className="size-3.5" aria-hidden />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={6} className="max-w-xs text-left">
              {children}
            </TooltipContent>
          </Tooltip>
        </span>
      </>
    )
  }

  if (variant === "inline") {
    return (
      <span
        id={generatedId}
        data-slot="field-description"
        data-variant="inline"
        className={cn(
          "text-xs font-normal leading-snug text-muted-foreground",
          "[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
          className,
        )}
        {...(props as React.ComponentPropsWithoutRef<"span">)}
      >
        ({children})
      </span>
    )
  }

  return (
    <p
      data-slot="field-description"
      className={cn(
        "mt-0 text-left text-sm leading-normal font-normal text-muted-foreground group-has-data-horizontal/field:text-balance",
        "last:mt-0 nth-last-2:-mt-1",
        "[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
        className,
      )}
      {...props}
    >
      {children}
    </p>
  )
}

function FieldSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  children?: React.ReactNode
}) {
  return (
    <div
      data-slot="field-separator"
      data-content={!!children}
      className={cn(
        "relative -my-2 h-5 text-sm group-data-[variant=outline]/field-group:-mb-2",
        className
      )}
      {...props}
    >
      <Separator className="absolute inset-0 top-1/2" />
      {children && (
        <span
          className="relative mx-auto block w-fit bg-background px-2 text-muted-foreground"
          data-slot="field-separator-content"
        >
          {children}
        </span>
      )}
    </div>
  )
}

function FieldError({
  className,
  children,
  errors,
  ...props
}: React.ComponentProps<"div"> & {
  errors?: Array<{ message?: string } | undefined>
}) {
  const content = useMemo(() => {
    if (children) {
      return children
    }

    if (!errors?.length) {
      return null
    }

    const uniqueErrors = [
      ...new Map(errors.map((error) => [error?.message, error])).values(),
    ]

    if (uniqueErrors?.length == 1) {
      return uniqueErrors[0]?.message
    }

    return (
      <ul className="ml-4 flex list-disc flex-col gap-1">
        {uniqueErrors.map(
          (error, index) =>
            error?.message && <li key={index}>{error.message}</li>
        )}
      </ul>
    )
  }, [children, errors])

  if (!content) {
    return null
  }

  return (
    <div
      role="alert"
      data-slot="field-error"
      className={cn("text-sm font-normal text-destructive", className)}
      {...props}
    >
      {content}
    </div>
  )
}

export {
  Field,
  FieldLabel,
  FieldLabelRow,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldContent,
  FieldTitle,
}

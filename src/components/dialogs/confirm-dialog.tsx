import type { LucideIcon } from 'lucide-react'
import { AlertTriangle, HelpCircle } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'

export type AppConfirmVariant = 'default' | 'destructive'

export type AppConfirmOptions = {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: AppConfirmVariant
  icon?: LucideIcon
}

type ConfirmDialogProps = {
  open: boolean
  options: AppConfirmOptions
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

const APP_CONFIRM_PRIMARY_ID = 'app-confirm-primary-action'

export function ConfirmDialog({
  open,
  options,
  onOpenChange,
  onConfirm,
}: ConfirmDialogProps) {
  const variant = options.variant ?? 'default'
  const Icon = options.icon ?? (variant === 'destructive' ? AlertTriangle : HelpCircle)
  const confirmLabel = options.confirmLabel ?? 'Confirmar'
  const cancelLabel = options.cancelLabel ?? 'Cancelar'

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        size="default"
        className="shadow-lg"
        onOpenAutoFocus={(e) => {
          e.preventDefault()
          window.requestAnimationFrame(() => {
            document.getElementById(APP_CONFIRM_PRIMARY_ID)?.focus()
          })
        }}
      >
        <AlertDialogHeader>
          <AlertDialogMedia
            className={cn(
              variant === 'destructive' ? 'text-destructive' : 'text-muted-foreground',
            )}
          >
            <Icon aria-hidden className="size-6" strokeWidth={1.75} />
          </AlertDialogMedia>
          <AlertDialogTitle>{options.title}</AlertDialogTitle>
          {options.description ? (
            <AlertDialogDescription>{options.description}</AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel type="button">{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            id={APP_CONFIRM_PRIMARY_ID}
            type="button"
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            onClick={() => onConfirm()}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

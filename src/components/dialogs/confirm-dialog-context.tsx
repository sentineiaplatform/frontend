import * as React from 'react'
import { ConfirmDialog, type AppConfirmOptions } from '@/components/dialogs/confirm-dialog'

type AppConfirmContextValue = {
  confirm: (options: AppConfirmOptions) => Promise<boolean>
}

const AppConfirmContext = React.createContext<AppConfirmContextValue | null>(null)

export function AppConfirmProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const [options, setOptions] = React.useState<AppConfirmOptions | null>(null)
  const pendingRef = React.useRef<{ resolve: (value: boolean) => void } | null>(null)
  const confirmedRef = React.useRef(false)

  const settle = React.useCallback((result: boolean) => {
    const pending = pendingRef.current
    pendingRef.current = null
    pending?.resolve(result)
    setOpen(false)
    setOptions(null)
  }, [])

  const confirm = React.useCallback((opts: AppConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      confirmedRef.current = false
      pendingRef.current = { resolve }
      setOptions(opts)
      setOpen(true)
    })
  }, [])

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      if (!next) {
        if (!confirmedRef.current && pendingRef.current) {
          settle(false)
        }
        confirmedRef.current = false
      }
    },
    [settle],
  )

  const handleConfirm = React.useCallback(() => {
    confirmedRef.current = true
    settle(true)
  }, [settle])

  return (
    <AppConfirmContext.Provider value={{ confirm }}>
      {children}
      {options ? (
        <ConfirmDialog
          open={open}
          options={options}
          onOpenChange={handleOpenChange}
          onConfirm={handleConfirm}
        />
      ) : null}
    </AppConfirmContext.Provider>
  )
}

export function useConfirmDialog(): AppConfirmContextValue {
  const ctx = React.useContext(AppConfirmContext)
  if (!ctx) {
    throw new Error('useConfirmDialog deve ser usado dentro de AppConfirmProvider.')
  }
  return ctx
}

export type { AppConfirmOptions }

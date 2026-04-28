import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4 text-emerald-600 dark:text-emerald-400" />
        ),
        info: <InfoIcon className="size-4 text-sky-600 dark:text-sky-400" />,
        warning: (
          <TriangleAlertIcon className="size-4 text-amber-600 dark:text-amber-400" />
        ),
        error: (
          <OctagonXIcon className="size-4 text-red-600 dark:text-red-400" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "cn-toast border shadow-md backdrop-blur-sm [&_[data-description]]:opacity-90",
          success:
            "!border !bg-emerald-50 !text-emerald-950 !border-emerald-200 dark:!bg-emerald-950/45 dark:!text-emerald-50 dark:!border-emerald-700",
          error:
            "!border !bg-red-50 !text-red-950 !border-red-200 dark:!bg-red-950/45 dark:!text-red-50 dark:!border-red-800",
          warning:
            "!border !bg-amber-50 !text-amber-950 !border-amber-200 dark:!bg-amber-950/40 dark:!text-amber-50 dark:!border-amber-700",
          info: "!border !bg-sky-50 !text-sky-950 !border-sky-200 dark:!bg-sky-950/40 dark:!text-sky-50 dark:!border-sky-700",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

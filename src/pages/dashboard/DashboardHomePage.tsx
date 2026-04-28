import { Skeleton } from '@/components/ui/skeleton'

/** Página inicial do dashboard — apenas skeleton até definir KPIs/widgets. */
export function DashboardHomePage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-9 w-[min(280px,60vw)]" />
        <Skeleton className="h-4 w-[min(520px,90vw)]" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={`dash-card-${i}`} className="h-44 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-72 w-full max-w-full rounded-xl" />
    </div>
  )
}

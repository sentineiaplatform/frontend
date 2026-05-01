import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function HomePage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>React + Vite + shadcn/ui</CardTitle>
          <CardDescription>
            Projeto base com preset Nova. Componentes em{' '}
            <code className="text-foreground rounded bg-muted px-1 py-0.5 text-sm">
              @/components/ui
            </code>
            .
          </CardDescription>
        </CardHeader>
      </Card>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link to="/login">Entrar</Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link to="/design-system">Design system</Link>
        </Button>
      </div>
    </div>
  )
}

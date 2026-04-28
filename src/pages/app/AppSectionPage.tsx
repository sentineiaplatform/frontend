/** Página temporal até cada rota ganhar UI própria. */
export function AppSectionPage({ title }: Readonly<{ title: string }>) {
  return (
    <div className="space-y-4">
      <h1 className="text-foreground font-heading text-2xl font-semibold tracking-tight">
        {title}
      </h1>
      <p className="text-muted-foreground text-sm">Conteúdo em breve.</p>
    </div>
  )
}

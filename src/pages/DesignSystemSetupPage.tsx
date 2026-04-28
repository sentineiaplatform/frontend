import { Link } from 'react-router-dom'
import logoUrl from '@/assets/logo.png'
import { ComponentShowcase } from '@/components/design-system/ComponentShowcase'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const previewText =
  'Aa Bb Cc 012345 — The quick brown fox jumps over the lazy dog.'

const brandPalette = [
  {
    name: 'Navy marca',
    token: 'brand-navy',
    className: 'bg-brand-navy',
    note: 'Painel escuro, hero e fundos institucionais',
  },
  {
    name: 'Verde primário',
    token: 'primary',
    className: 'bg-primary',
    note: 'Botões principais, ícones de ação, links de destaque',
  },
  {
    name: 'Fundo app',
    token: 'background',
    className: 'bg-background border border-border',
    note: 'Área clara ao lado do painel (cinza/azul muito claro)',
  },
  {
    name: 'Superfície / card',
    token: 'card',
    className: 'bg-card border border-border',
    note: 'Cartões e formulários sobre o fundo claro',
  },
  {
    name: 'Aviso suave',
    token: 'accent',
    className: 'bg-accent',
    note: 'Faixas informativas (ex.: acesso monitorado)',
  },
] as const

export function DesignSystemSetupPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 p-6 pb-16">
      <header className="flex flex-col gap-4 border-b pb-8">
        <img
          src={logoUrl}
          alt="SentineIA"
          className="h-14 w-auto max-w-[min(100%,20rem)] object-contain object-left"
          decoding="async"
        />
        <div className="flex flex-col gap-2">
          <p className="text-muted-foreground text-sm tracking-wide uppercase">
            Design system
          </p>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Guia da marca
          </h1>
          <p className="text-muted-foreground max-w-prose leading-relaxed">
            Paleta e tipografia oficiais da interface SentineIA.
          </p>
        </div>
      </header>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="font-heading text-lg font-medium">Paleta de cores</h2>
          <p className="text-muted-foreground text-sm">
            Tokens alinhados ao login SentineIA: navy, verde esmeralda e
            superfícies claras.
          </p>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {brandPalette.map((swatch) => (
            <li key={swatch.token}>
              <Card className="overflow-hidden py-0">
                <div
                  className={`h-20 rounded-none rounded-t-xl ${swatch.className}`}
                />
                <CardHeader className="pb-3 pt-3">
                  <CardTitle className="text-sm">{swatch.name}</CardTitle>
                  <CardDescription className="text-xs leading-snug">
                    <span className="text-foreground font-mono text-[11px]">
                      {swatch.token}
                    </span>
                    {' — '}
                    {swatch.note}
                  </CardDescription>
                </CardHeader>
              </Card>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4">
          <Button type="button">Botão primário</Button>
          <Button type="button" variant="secondary">
            Secundário
          </Button>
          <Button type="button" variant="outline">
            Contorno
          </Button>
          <Link
            to="/design-system"
            className="text-primary text-sm font-medium underline-offset-4 hover:underline"
          >
            Link em verde primário
          </Link>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="font-heading text-lg font-medium">Tipografia</h2>
          <p className="text-muted-foreground text-sm">
            Família única: Geist Variable (interface e títulos via{' '}
            <span className="font-mono text-[11px]">font-sans</span> /{' '}
            <span className="font-mono text-[11px]">font-heading</span>).
          </p>
        </div>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Geist Variable</CardTitle>
            <CardDescription>Corpo e headings — definido em index.css.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/90 font-sans text-lg leading-relaxed">
              {previewText}
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-6">
        <div>
          <h2 className="font-heading text-lg font-medium">
            Biblioteca de componentes (shadcn / Radix)
          </h2>
          <p className="text-muted-foreground text-sm">
            Pré-visualização de todos os blocos em{' '}
            <span className="font-mono text-xs">@/components/ui</span> com a
            paleta e a Geist aplicadas.
          </p>
        </div>
        <ComponentShowcase />
      </section>

      <footer className="flex flex-wrap items-center gap-4 border-t pt-8">
        <Button variant="outline" asChild>
          <Link to="/">Voltar ao início</Link>
        </Button>
      </footer>
    </div>
  )
}

import { Link } from 'react-router-dom'
import {
  ArrowRightIcon,
  BarChart3Icon,
  Building2Icon,
  CheckIcon,
  Clock3Icon,
  FileSearchIcon,
  FingerprintIcon,
  GlobeIcon,
  LockIcon,
  MessageSquareQuoteIcon,
  ShieldCheckIcon,
  SparklesIcon,
  WorkflowIcon,
} from 'lucide-react'

import { SentineLogo } from '@/components/brand/sentine-logo'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const heroHighlights = [
  { icon: LockIcon, text: 'Canal seguro e anônimo' },
  { icon: SparklesIcon, text: 'Triagem inteligente por risco' },
  { icon: FingerprintIcon, text: 'Evidências com trilha auditável' },
] as const

const modules = [
  {
    icon: WorkflowIcon,
    title: 'Workflow investigativo ponta a ponta',
    description:
      'Da receção ao relatório final com etapas claras, responsáveis e decisões registradas.',
    image:
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80',
  },
  {
    icon: FileSearchIcon,
    title: 'Gestão de evidências e análise',
    description:
      'Centralize fatos, fundamentação e impacto para decisões consistentes em compliance.',
    image:
      'https://images.unsplash.com/photo-1664575599618-8f6bd76fc670?auto=format&fit=crop&w=1400&q=80',
  },
  {
    icon: BarChart3Icon,
    title: 'Visão executiva de risco',
    description:
      'Métricas e painéis para priorização de casos e acompanhamento de eficiência operacional.',
    image:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1400&q=80',
  },
] as const

const screenshots = [
  {
    title: 'Triagem guiada',
    subtitle: 'Checklist + decisão de rota',
    image:
      'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1600&q=80',
  },
  {
    title: 'Investigação estruturada',
    subtitle: 'Comentários, envolvidos e vínculos',
    image:
      'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1600&q=80',
  },
  {
    title: 'Plano e governança',
    subtitle: 'Ações corretivas + aprovações',
    image:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1600&q=80',
  },
] as const

const planCards = [
  {
    name: 'Starter',
    price: 'R$ 890',
    period: '/mês',
    recommended: true,
    cta: 'Assinar Starter',
    features: ['Até 25 casos/mês', 'Triagem e investigação completas', 'Histórico auditável'],
  },
  {
    name: 'Growth',
    price: 'R$ 1.790',
    period: '/mês',
    recommended: false,
    cta: 'Assinar Growth',
    features: ['Até 100 casos/mês', 'Aprovação multinível', 'Relatórios executivos'],
  },
  {
    name: 'Scale',
    price: 'Sob consulta',
    period: '',
    recommended: false,
    cta: 'Falar com vendas',
    features: ['Volume corporativo', 'SLA avançado por etapa', 'Onboarding dedicado'],
  },
] as const

const testimonials = [
  {
    quote:
      'Conseguimos reduzir retrabalho na triagem e padronizar decisões com muito mais segurança.',
    author: 'Head de Compliance',
    company: 'Grupo financeiro nacional',
    avatar:
      'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=280&q=80',
  },
  {
    quote:
      'A liderança ganhou visibilidade real sobre risco e tempo de resposta em cada caso.',
    author: 'Diretora de Pessoas',
    company: 'Empresa de tecnologia',
    avatar:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=280&q=80',
  },
] as const

const faqs = [
  {
    id: 'faq-1',
    q: 'A SentineIA é indicada para operações já em andamento?',
    a: 'Sim. A plataforma entra sem interromper o canal atual e ajuda a organizar backlog de casos.',
  },
  {
    id: 'faq-2',
    q: 'Como funciona a evolução de plano?',
    a: 'A migração é contínua, sem perda de histórico e com expansão de recursos por necessidade.',
  },
  {
    id: 'faq-3',
    q: 'A plataforma atende auditoria interna?',
    a: 'Sim. Trilhas, decisões e evidências ficam registradas para validação e governança.',
  },
] as const

const trustStats = [
  { label: 'Tempo de triagem', value: '-35%', icon: Clock3Icon },
  { label: 'Casos com evidência completa', value: '+42%', icon: FingerprintIcon },
  { label: 'Visibilidade executiva', value: '+100%', icon: Building2Icon },
] as const

function FeatureTick({ children }: Readonly<{ children: string }>) {
  return (
    <li className="flex items-start gap-2 text-sm">
      <span className="mt-0.5 inline-flex size-4 items-center justify-center rounded-full bg-primary/20 text-primary">
        <CheckIcon className="size-3" aria-hidden />
      </span>
      <span>{children}</span>
    </li>
  )
}

export function HomePage() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <header className="sticky top-4 z-50 mx-4 rounded-xl border border-border/70 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3">
          <SentineLogo size="md" />
          <nav className="hidden items-center gap-5 text-sm text-muted-foreground md:flex">
            <a href="#recursos" className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground">
              <GlobeIcon className="size-3.5" aria-hidden />
              <span>Recursos</span>
            </a>
            <a href="#produto" className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground">
              <WorkflowIcon className="size-3.5" aria-hidden />
              <span>Produto</span>
            </a>
            <a href="#planos" className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground">
              <BarChart3Icon className="size-3.5" aria-hidden />
              <span>Planos</span>
            </a>
            <a href="#faq" className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground">
              <MessageSquareQuoteIcon className="size-3.5" aria-hidden />
              <span>FAQ</span>
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="h-10 px-3 text-sm focus-visible:ring-2 focus-visible:ring-primary"
              asChild
            >
              <Link to="/login" className="inline-flex items-center gap-1.5">
                <LockIcon className="size-4" aria-hidden />
                <span>Entrar</span>
              </Link>
            </Button>
            <Button className="h-10 px-3 text-sm focus-visible:ring-2 focus-visible:ring-primary" asChild>
              <Link to="/cadastro" className="inline-flex items-center gap-1.5">
                <SparklesIcon className="size-4" aria-hidden />
                <span>Teste grátis</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,oklch(0.56_0.14_163_/_.16),transparent_55%)] motion-reduce:animate-none" />
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-6 pt-14 pb-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <Badge variant="secondary" className="h-7 gap-1.5 bg-primary/10 text-primary">
              <ShieldCheckIcon className="size-3.5" aria-hidden />
              SaaS de denúncias para compliance moderno
            </Badge>
            <h1 className="font-heading text-balance text-4xl font-bold tracking-tight sm:text-5xl">
              Refaça sua operação de denúncias com um produto orientado a recursos.
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              A SentineIA combina canal seguro, triagem, investigação e governança em um fluxo único.
              Evolua por funcionalidades sem perder rastreabilidade.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {heroHighlights.map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.text}
                    className="cursor-pointer rounded-lg border border-border/60 bg-card px-3 py-2 text-sm transition-shadow duration-200 hover:shadow-lg"
                  >
                    <span className="inline-flex items-center gap-2">
                      <span className="inline-flex size-6 items-center justify-center rounded-md bg-primary/15 text-primary">
                        <Icon className="size-3.5" aria-hidden />
                      </span>
                      {item.text}
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="h-11 gap-2 px-5 text-sm focus-visible:ring-2 focus-visible:ring-primary" asChild>
                <Link to="/cadastro">
                  Iniciar avaliação
                  <ArrowRightIcon className="size-4" aria-hidden />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-11 px-5 text-sm focus-visible:ring-2 focus-visible:ring-primary"
                asChild
              >
                <Link to="/login">Acessar plataforma</Link>
              </Button>
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Sem cartão de crédito • Teste grátis • Onboarding assistido
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1400&q=80"
              alt="Time de compliance analisando painel em notebook"
              className="h-40 w-full rounded-xl border border-border/60 object-cover sm:h-44"
              loading="lazy"
            />
            <img
              src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1400&q=80"
              alt="Reunião de investigação com equipe multidisciplinar"
              className="h-40 w-full rounded-xl border border-border/60 object-cover sm:h-44"
              loading="lazy"
            />
            <img
              src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1600&q=80"
              alt="Profissional avaliando indicadores de risco em dashboard"
              className="h-40 w-full rounded-xl border border-border/60 object-cover sm:col-span-2 sm:h-52"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-4">
        <div className="grid gap-3 md:grid-cols-3">
          {trustStats.map((item) => {
            const Icon = item.icon
            return (
              <Card key={item.label} className="border-border/70 bg-card">
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-lg font-semibold">{item.value}</p>
                  </div>
                  <span className="inline-flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <Icon className="size-4.5" aria-hidden />
                  </span>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      <section id="recursos" className="mx-auto w-full max-w-7xl px-6 py-10">
        <div className="mb-6 flex items-center gap-2">
          <GlobeIcon className="size-4 text-primary" aria-hidden />
          <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            Recursos que compõem o seu processo
          </h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {modules.map((module) => {
            const Icon = module.icon
            return (
              <Card
                key={module.title}
                className="cursor-pointer overflow-hidden border-border/70 bg-card transition-shadow duration-200 hover:shadow-lg"
              >
                <img
                  src={module.image}
                  alt={module.title}
                  className="h-40 w-full object-cover"
                  loading="lazy"
                />
                <CardHeader className="space-y-2">
                  <span className="inline-flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <Icon className="size-4.5" aria-hidden />
                  </span>
                  <CardTitle className="text-base">{module.title}</CardTitle>
                  <CardDescription>{module.description}</CardDescription>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      </section>

      <section id="produto" className="mx-auto w-full max-w-7xl px-6 py-10">
        <Card className="border-border/70 bg-card">
          <CardHeader>
            <CardTitle>Produto em ação</CardTitle>
            <CardDescription>
              Visual de referência para as principais etapas da jornada.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {screenshots.map((shot) => (
              <div key={shot.title} className="space-y-2">
                <img
                  src={shot.image}
                  alt={shot.title}
                  className="h-44 w-full rounded-xl border border-border/60 object-cover"
                  loading="lazy"
                />
                <p className="text-sm font-medium">{shot.title}</p>
                <p className="text-muted-foreground text-xs">{shot.subtitle}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section id="planos" className="mx-auto w-full max-w-7xl px-6 py-10">
        <div className="mb-6">
          <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            Planos baseados em funcionalidades
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Comece com Starter e evolua quando precisar de governança avançada.
          </p>
          <p className="mt-1 text-xs text-primary">Assinatura mensal com implantação guiada.</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {planCards.map((plan) => (
            <Card
              key={plan.name}
              className={[
                'border-border/70 bg-card',
                plan.recommended ? 'ring-2 ring-primary' : '',
              ].join(' ')}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  {plan.name}
                  {plan.recommended ? (
                    <Badge className="bg-primary text-primary-foreground">Recomendado</Badge>
                  ) : null}
                </CardTitle>
                <CardDescription>{plan.period ? `${plan.price} ${plan.period}` : plan.price}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <FeatureTick key={feature}>{feature}</FeatureTick>
                  ))}
                </ul>
                <Button className="h-11 w-full text-sm focus-visible:ring-2 focus-visible:ring-primary" asChild>
                  <Link to="/cadastro">{plan.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-10">
        <div className="grid gap-4 lg:grid-cols-2">
          {testimonials.map((item) => (
            <Card key={item.quote} className="border-border/70 bg-card">
              <CardHeader className="space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={item.avatar}
                    alt={`Avatar de ${item.author}`}
                    className="size-11 rounded-full border border-border/60 object-cover"
                    loading="lazy"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{item.author}</p>
                    <p className="text-muted-foreground text-xs">{item.company}</p>
                  </div>
                </div>
                <CardDescription className="text-sm leading-relaxed">
                  <MessageSquareQuoteIcon className="mr-1 inline size-4 text-primary" aria-hidden />
                  {item.quote}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section id="faq" className="mx-auto w-full max-w-7xl px-6 py-10">
        <Card className="border-border/70 bg-card">
          <CardHeader>
            <CardTitle>Perguntas frequentes</CardTitle>
            <CardDescription>Respostas objetivas para decisão de contratação.</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              {faqs.map((faq) => (
                <AccordionItem key={faq.id} value={faq.id}>
                  <AccordionTrigger className="focus-visible:ring-2 focus-visible:ring-primary">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent>{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 pt-6 pb-14">
        <div className="rounded-2xl bg-brand-navy px-6 py-8 text-white ring-1 ring-white/10">
          <h3 className="font-heading text-2xl font-semibold tracking-tight">
            Pronto para estruturar seu canal com padrão de auditoria?
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
            Centralize denúncias, investigação e decisão em uma plataforma única com paleta e experiência alinhadas ao dashboard.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button
              className="h-11 px-5 text-sm bg-primary text-primary-foreground hover:opacity-95 focus-visible:ring-2 focus-visible:ring-primary"
              asChild
            >
              <Link to="/cadastro">Quero testar agora</Link>
            </Button>
            <Button variant="secondary" className="h-11 px-5 text-sm focus-visible:ring-2 focus-visible:ring-white/70" asChild>
              <Link to="/login">Entrar na plataforma</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}

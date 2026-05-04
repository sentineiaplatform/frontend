import { Link } from 'react-router-dom'
import {
  ActivityIcon,
  ArrowRightIcon,
  BadgeCheckIcon,
  Building2Icon,
  ChartNoAxesCombinedIcon,
  CheckCircle2Icon,
  Clock3Icon,
  FileCheck2Icon,
  GemIcon,
  GlobeIcon,
  LandmarkIcon,
  MessageCircleIcon,
  PhoneCallIcon,
  QuoteIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TargetIcon,
  UsersIcon,
} from 'lucide-react'
import { SentineLogo } from '@/components/brand/sentine-logo'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const etapas = [
  'Receba denúncias em um canal estruturado e sigiloso.',
  'Priorize casos com apoio de IA e critérios de compliance.',
  'Mantenha histórico verificável com evidências imutáveis.',
] as const

const destaquesHero = [
  { icon: ShieldAlertIcon, texto: 'Canal seguro e anônimo' },
  { icon: ActivityIcon, texto: 'Triagem com IA em tempo real' },
  { icon: FileCheck2Icon, texto: 'Rastro auditável para compliance' },
] as const

const ganhos = [
  {
    icon: Clock3Icon,
    titulo: 'Acelere apurações críticas',
    descricao: 'Organize casos por urgência para decisões mais rápidas e seguras.',
  },
  {
    icon: GemIcon,
    titulo: 'Comprove integridade',
    descricao: 'Use prova criptográfica para reforçar auditoria e governança.',
  },
  {
    icon: ShieldCheckIcon,
    titulo: 'Fortaleça a confiança interna',
    descricao: 'Aumente adesão ao canal com experiência segura e transparente.',
  },
] as const

const canais = [
  {
    icon: GlobeIcon,
    titulo: 'Web responsiva',
    descricao: 'Acesso simples em qualquer dispositivo, com jornada guiada.',
  },
  {
    icon: MessageCircleIcon,
    titulo: 'Integração com mensageria',
    descricao: 'Amplie a captação com canais digitais usados no dia a dia.',
  },
  {
    icon: PhoneCallIcon,
    titulo: 'Atendimento complementar',
    descricao: 'Combine formatos de entrada para ampliar cobertura e confiança.',
  },
] as const

const personas = [
  {
    icon: LandmarkIcon,
    titulo: 'Compliance',
    descricao:
      'Ganhe rastreabilidade, trilha de auditoria e visão estratégica de riscos.',
  },
  {
    icon: UsersIcon,
    titulo: 'RH e Pessoas',
    descricao:
      'Estruture um canal confiável para assédio, conduta e clima organizacional.',
  },
  {
    icon: Building2Icon,
    titulo: 'Jurídico e Financeiro',
    descricao:
      'Reduza exposição a fraudes e litígios com governança orientada por evidências.',
  },
] as const

const faqs = [
  {
    id: 'faq-1',
    pergunta: 'A SentineIA garante anonimato?',
    resposta:
      'A plataforma é desenhada para preservar sigilo do denunciante, com controles de acesso, trilha de auditoria e arquitetura orientada à segurança.',
  },
  {
    id: 'faq-2',
    pergunta: 'É possível personalizar o canal para a minha empresa?',
    resposta:
      'Sim. Você configura comunicação, fluxos e regras operacionais conforme sua estratégia de compliance e governança.',
  },
  {
    id: 'faq-3',
    pergunta: 'A solução ajuda em auditorias internas?',
    resposta:
      'Sim. A SentineIA organiza histórico, status e evidências para facilitar prestação de contas e comprovação de integridade.',
  },
] as const

const destaquesConfianca = [
  'Mais de 5.000 organizações já estruturaram canais robustos com plataformas especializadas no mercado.',
  'Canal disponível 24h com foco em segurança, confidencialidade e alta adesão dos colaboradores.',
  'Gestão orientada por indicadores para acelerar decisões de compliance, RH e jurídico.',
] as const

const depoimentos = [
  {
    quote:
      'Com um canal mais estruturado, ganhamos clareza nas apurações e mais confiança das lideranças no processo.',
    autor: 'Diretoria de Compliance',
    empresa: 'Empresa de grande porte',
  },
  {
    quote:
      'A adoção aumentou quando simplificamos a entrada dos relatos e mostramos compromisso real com sigilo.',
    autor: 'Liderança de RH',
    empresa: 'Grupo multissetorial',
  },
] as const

export function HomePage() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <header className="border-b border-border/70 bg-background/95 backdrop-blur">
        <div className="bg-brand-navy px-6 py-2 text-center text-xs text-white/90">
          Preparado para fortalecer conformidade e gestão de riscos com um canal
          de denúncias confiável?
        </div>
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <SentineLogo size="md" />
          <nav className="hidden items-center gap-5 text-sm text-muted-foreground md:flex">
            <a href="#solucoes" className="hover:text-foreground">
              Soluções
            </a>
            <a href="#areas" className="hover:text-foreground">
              Áreas atendidas
            </a>
            <a href="#depoimentos" className="hover:text-foreground">
              Depoimentos
            </a>
            <a href="#faq" className="hover:text-foreground">
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link to="/login">Entrar</Link>
            </Button>
            <Button asChild>
              <Link to="/cadastro">Começar agora</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(circle_at_top,_color-mix(in_oklch,var(--primary)_14%,transparent),transparent_62%)] motion-safe:animate-pulse" />
        <div className="pointer-events-none absolute -top-20 right-[-8rem] -z-10 size-72 rounded-full bg-primary/15 blur-3xl" />
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-16 md:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-7">
            <Badge variant="secondary" className="h-7 gap-1.5 px-3 text-[0.78rem]">
              <SparklesIcon className="size-3.5" aria-hidden />
              Plataforma premium para denúncias e compliance
            </Badge>
            <div className="space-y-4">
              <h1 className="font-heading text-balance text-4xl leading-tight font-bold tracking-tight sm:text-5xl">
                Estruture seu canal de denúncias e transforme ética em resultado
                de negócio.
              </h1>
              <p className="text-muted-foreground max-w-2xl text-base leading-relaxed sm:text-lg">
                A SentineIA é uma plataforma de gestão de denúncias e compliance
                que combina inteligência artificial, anonimato e evidência
                verificável para reduzir riscos de fraude interna e fortalecer a
                governança da organização.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
              <span className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-full px-2.5 py-1">
                <BadgeCheckIcon className="size-3.5" aria-hidden />
                Mais conformidade regulatória
              </span>
              <span className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-full px-2.5 py-1">
                <ChartNoAxesCombinedIcon className="size-3.5" aria-hidden />
                Melhor gestão de risco reputacional
              </span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {destaquesHero.map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.texto}
                    className="bg-card/75 ring-border/60 flex items-center gap-2 rounded-lg px-3 py-2 text-sm ring-1 transition-transform duration-300 hover:-translate-y-0.5"
                  >
                    <span className="bg-primary/12 text-primary inline-flex size-6 items-center justify-center rounded-md">
                      <Icon className="size-3.5" aria-hidden />
                    </span>
                    <span>{item.texto}</span>
                  </div>
                )
              })}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg" className="gap-2 shadow-sm" asChild>
                <Link to="/cadastro">
                  Falar com especialista
                  <ArrowRightIcon className="size-4" aria-hidden />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/login">Acessar plataforma</Link>
              </Button>
            </div>
          </div>

          <Card className="border-border/60 bg-card/85 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Como funciona na prática</CardTitle>
              <CardDescription>
                Um fluxo simples para operar denúncias com confiança jurídica e
                eficiência operacional.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {etapas.map((etapa, index) => (
                <div key={etapa} className="flex items-start gap-3">
                  <span className="bg-primary/10 text-primary mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-relaxed">{etapa}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-2" id="solucoes">
        <div className="mb-6 rounded-xl border border-border/70 bg-muted/35 p-4">
          <p className="text-sm font-medium">
            Algumas das empresas que avaliam canais modernos de compliance
            priorizam:
          </p>
          <ul className="mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-3">
            {destaquesConfianca.map((item) => (
              <li key={item} className="flex gap-2">
                <CheckCircle2Icon className="text-primary mt-0.5 size-4 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {ganhos.map((item) => {
            const Icon = item.icon
            return (
              <Card
                key={item.titulo}
                className="border-border/70 bg-card/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <CardHeader className="space-y-2">
                  <span className="bg-primary/10 text-primary inline-flex size-9 items-center justify-center rounded-lg">
                    <Icon className="size-4.5" aria-hidden />
                  </span>
                  <CardTitle className="text-base">{item.titulo}</CardTitle>
                  <CardDescription>{item.descricao}</CardDescription>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-14 md:py-16" id="areas">
        <div className="mb-7 max-w-2xl space-y-2">
          <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            Valor para cada área estratégica
          </h2>
          <p className="text-muted-foreground">
            A mesma plataforma atende objetivos distintos de compliance, RH e
            jurídico/financeiro.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {personas.map((item) => {
            const Icon = item.icon
            return (
              <Card
                key={item.titulo}
                className="border-border/70 bg-card/75 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <CardHeader className="space-y-2">
                  <span className="bg-brand-navy text-primary inline-flex size-10 items-center justify-center rounded-lg ring-1 ring-border/60">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <CardTitle className="text-base">{item.titulo}</CardTitle>
                  <CardDescription>{item.descricao}</CardDescription>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      </section>

      <section className="border-y border-border/70 bg-muted/35">
        <div className="mx-auto w-full max-w-6xl px-6 py-14 md:py-16">
          <div className="mb-7 max-w-2xl space-y-2">
            <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              Captação multicanal para aumentar adesão
            </h2>
            <p className="text-muted-foreground">
              Torne o relato mais acessível e amplie o volume de informações
              relevantes para investigação.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {canais.map((canal) => {
              const Icon = canal.icon
              return (
                <Card
                  key={canal.titulo}
                  className="border-border/70 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                >
                  <CardHeader className="space-y-3">
                    <span className="bg-brand-navy text-primary inline-flex size-10 items-center justify-center rounded-lg ring-1 ring-border/60">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <CardTitle className="text-base">{canal.titulo}</CardTitle>
                    <CardDescription>{canal.descricao}</CardDescription>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-14 md:py-16" id="depoimentos">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
          <Card className="border-border/70 bg-card/80">
            <CardHeader className="space-y-3">
              <Badge variant="secondary" className="w-fit">
                Prova social
              </Badge>
              <CardTitle className="text-xl">
                Organizações escolhem a SentineIA para amadurecer compliance
              </CardTitle>
              <CardDescription className="text-sm">
                “Estruturamos o canal com mais confiança, melhor qualidade nas
                denúncias e muito mais clareza para priorizar investigação.”
              </CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              Depoimento ilustrativo para reforçar valor percebido. Podemos
              trocar por cases reais assim que você quiser.
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/80">
            <CardHeader>
              <CardTitle className="text-xl">Histórias de evolução</CardTitle>
              <CardDescription>
                Relatos no formato que executivos esperam em uma avaliação de
                compra B2B.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {depoimentos.map((item) => (
                <div key={item.quote} className="rounded-lg border border-border/70 p-4">
                  <p className="text-sm leading-relaxed">
                    <QuoteIcon className="text-primary mr-1 inline size-4" />
                    {item.quote}
                  </p>
                  <p className="text-muted-foreground mt-2 text-xs">
                    {item.autor} - {item.empresa}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/80">
            <CardHeader>
              <CardTitle className="text-xl">Dúvidas frequentes</CardTitle>
              <CardDescription>
                Respostas objetivas para acelerar decisão de contratação.
              </CardDescription>
            </CardHeader>
            <CardContent id="faq">
              <Accordion type="single" collapsible>
                {faqs.map((faq) => (
                  <AccordionItem key={faq.id} value={faq.id}>
                    <AccordionTrigger>{faq.pergunta}</AccordionTrigger>
                    <AccordionContent>{faq.resposta}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-14 md:py-16">
        <div className="bg-brand-navy flex flex-col items-start justify-between gap-6 rounded-2xl px-6 py-8 text-white ring-1 ring-border/10 md:flex-row md:items-center md:px-8">
          <div className="space-y-2">
            <h3 className="font-heading text-2xl font-semibold tracking-tight">
              Pronto para elevar seu compliance a outro nível?
            </h3>
            <p className="max-w-2xl text-sm leading-relaxed text-white/85 sm:text-base">
              Entregue confiança ao conselho, segurança ao denunciante e
              eficiência à operação com uma plataforma feita para decisão rápida
              e auditoria robusta.
            </p>
            <div className="text-white/85 flex items-center gap-2 text-sm">
              <TargetIcon className="size-4" aria-hidden />
              Solicite uma proposta personalizada para sua realidade.
            </div>
          </div>
          <Button size="lg" variant="secondary" className="gap-2" asChild>
            <Link to="/cadastro" className="gap-2">
              Quero contratar a SentineIA
              <CheckCircle2Icon className="size-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  )
}

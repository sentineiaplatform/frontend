import { type FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import {
  BookOpen,
  ChevronRight,
  CircleHelp,
  Copy,
  Headphones,
  LayoutDashboard,
  ListOrdered,
  Loader2,
  Mail,
  MessageSquare,
  RotateCcw,
  Search,
  SendHorizontal,
  User,
} from 'lucide-react'
import { toast } from 'sonner'

import { RegistrosPageHeader } from '@/components/registros'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

type ChatRole = 'user' | 'support'

type ChatMessage = {
  id: string
  role: ChatRole
  text: string
  createdAt: number
}

const SUPPORT_EMAIL = 'suporte@sentine.exemplo.gov.br'

const welcomeMessage: ChatMessage = {
  id: 'welcome',
  role: 'support',
  text: 'Olá! Sou o assistente de suporte do Sentine. Como posso ajudar você hoje? Você pode descrever sua dúvida abaixo ou usar uma das sugestões.',
  createdAt: Date.now(),
}

const MOCK_REPLIES: string[] = [
  'Recebemos sua mensagem. Em um ambiente real, ela seria encaminhada à equipe de suporte. Pode detalhar o que está acontecendo (tela, passo a passo) para agilizar.',
  'Para dúvidas sobre denúncias, use o menu **Denúncias** para protocolos e triagem. Se precisar de permissões ou acesso, fale com o administrador da sua organização.',
  'Se o problema for técnico (erro ao salvar, tela em branco), informe o navegador e se possível um print — isso ajuda muito na análise.',
  'Horário comercial e canais oficiais podem ser configurados pelo administrador. Posso ajudar com orientações gerais sobre o uso do sistema.',
]

const SUGESTOES = [
  'Como registro uma nova denúncia?',
  'Onde altero meus dados de perfil?',
  'Quem vê as denúncias que cadastro?',
]

const FAQ_ITENS: ReadonlyArray<{ pergunta: string; resposta: string }> = [
  {
    pergunta: 'Como abro ou consulto uma denúncia?',
    resposta:
      'No menu **Denúncias** você vê a listagem com protocolo, status e filtros. Use a busca ou os filtros para localizar um registro e clique em **Ver detalhes** na linha desejada.',
  },
  {
    pergunta: 'Onde fica o Painel e o que ele mostra?',
    resposta:
      '**Painel** reúne indicadores e atalhos da operação. Os números dependem dos dados da sua organização e das permissões do seu usuário.',
  },
  {
    pergunta: 'O que são Dados mestres (status e categorias)?',
    resposta:
      'São cadastros de referência usados nas denúncias — por exemplo **Status denúncias** e **Categoria denúncias**. Somente perfis autorizados costumam alterá-los.',
  },
  {
    pergunta: 'Como altero idioma, fuso ou dados da organização?',
    resposta:
      'Em **Configurações** → **Geral** (e demais seções) você encontra preferências da conta e da organização, conforme liberado pelo administrador.',
  },
  {
    pergunta: 'Esqueci a senha. O que fazer?',
    resposta:
      'Na tela de **Login**, use a opção de recuperação de senha. Se sua empresa usa SSO ou política própria, siga as instruções do TI ou do administrador.',
  },
  {
    pergunta: 'Os dados no ambiente de demonstração são reais?',
    resposta:
      'Neste ambiente, parte dos dados pode ser fictícia para treinamento. Em produção, siga sempre a política de privacidade e o canal oficial de denúncias da sua instituição.',
  },
]

const GUIAS_RAPIDOS: ReadonlyArray<{ titulo: string; passos: string[] }> = [
  {
    titulo: 'Registrar uma denúncia',
    passos: [
      'Abra **Denúncias** no menu principal.',
      'Clique em **Nova** (ou equivalente) e preencha os campos obrigatórios.',
      'Revise o resumo e salve. Anote o **protocolo** para acompanhamento.',
    ],
  },
  {
    titulo: 'Atualizar perfil e segurança',
    passos: [
      'Vá em **Configurações** → **Perfil** para nome, contato e preferências.',
      'Use **Configurações** → **Segurança** para senha e opções de proteção, se disponíveis.',
    ],
  },
  {
    titulo: 'Encontrar relatórios e indicadores',
    passos: [
      'Use **Relatórios** e **Insights IA** no menu, conforme o seu perfil.',
      'Aplique períodos e filtros sugeridos na própria tela para refinar a visualização.',
    ],
  },
]

const ATALHOS_VISAO: ReadonlyArray<{
  aba: 'faq' | 'guias' | 'contato' | 'chat'
  titulo: string
  descricao: string
  icone: typeof CircleHelp
}> = [
  {
    aba: 'faq',
    titulo: 'Perguntas frequentes',
    descricao: 'Respostas rápidas sobre denúncias, configurações e acesso.',
    icone: CircleHelp,
  },
  {
    aba: 'guias',
    titulo: 'Guias rápidos',
    descricao: 'Passo a passo para as tarefas mais comuns.',
    icone: ListOrdered,
  },
  {
    aba: 'contato',
    titulo: 'Falar com o suporte',
    descricao: 'E-mail, horário e canais oficiais.',
    icone: Mail,
  },
  {
    aba: 'chat',
    titulo: 'Chat com o assistente',
    descricao: 'Descreva em suas palavras (modo demonstração).',
    icone: MessageSquare,
  },
]

function pickMockReply(userText: string): string {
  const t = userText.toLowerCase()
  if (t.includes('denúnc') || t.includes('denunc'))
    return 'Para registrar uma denúncia, acesse o menu **Denúncias** e use **Nova**. Preencha os campos obrigatórios e salve; você receberá um protocolo para acompanhamento.'
  if (t.includes('perfil') || t.includes('senha'))
    return 'Perfil e preferências ficam em **Configurações** → **Perfil**. Segurança e senha costumam estar em **Configurações** → **Segurança** (conforme o que o produto expõe).'
  if (t.includes('quem vê') || t.includes('visibilidade') || t.includes('privacid'))
    return 'Quem visualiza cada denúncia depende do perfil e das regras da sua organização. Em dúvida sobre confidencialidade, peça orientação ao seu **administrador** ou ao time de compliance.'
  const i = Math.floor(Math.random() * MOCK_REPLIES.length)
  return MOCK_REPLIES[i] ?? MOCK_REPLIES[0]
}

function renderSupportText(text: string) {
  const parts = text.split(/\*\*(.+?)\*\*/g)
  return parts.map((part, idx) =>
    idx % 2 === 1 ? (
      <strong key={idx} className="text-foreground font-semibold">
        {part}
      </strong>
    ) : (
      <span key={idx}>{part}</span>
    ),
  )
}

async function copiarEmail() {
  try {
    await navigator.clipboard.writeText(SUPPORT_EMAIL)
    toast.success('E-mail copiado para a área de transferência.')
  } catch {
    toast.error('Não foi possível copiar. Copie manualmente.')
  }
}

/** Tela de ajuda: visão geral, FAQ, guias, contato e chat de suporte. */
export function AjudaSuportePage() {
  const [aba, setAba] = useState('visao')
  const [faqBusca, setFaqBusca] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>(() => [welcomeMessage])
  const [draft, setDraft] = useState('')
  const [pendingReply, setPendingReply] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const idRef = useRef(0)
  const replyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const faqFiltrados = useMemo(() => {
    const q = faqBusca.trim().toLowerCase()
    if (q.length === 0) return [...FAQ_ITENS]
    return FAQ_ITENS.filter(
      (item) =>
        item.pergunta.toLowerCase().includes(q) || item.resposta.toLowerCase().includes(q),
    )
  }, [faqBusca])

  const nextId = () => {
    idRef.current += 1
    return `m-${idRef.current}`
  }

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, pendingReply])

  useEffect(() => {
    if (aba === 'chat') {
      const t = window.setTimeout(() => inputRef.current?.focus(), 100)
      return () => clearTimeout(t)
    }
  }, [aba])

  useEffect(() => {
    return () => {
      if (replyTimeoutRef.current !== null) {
        clearTimeout(replyTimeoutRef.current)
      }
    }
  }, [])

  const enqueueSupportReply = (userText: string) => {
    if (replyTimeoutRef.current !== null) {
      clearTimeout(replyTimeoutRef.current)
    }
    setPendingReply(true)
    const delay = 650 + Math.random() * 550
    replyTimeoutRef.current = window.setTimeout(() => {
      replyTimeoutRef.current = null
      const reply = pickMockReply(userText)
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: 'support',
          text: reply,
          createdAt: Date.now(),
        },
      ])
      setPendingReply(false)
    }, delay)
  }

  const sendText = (raw: string) => {
    const text = raw.trim()
    if (text.length === 0 || pendingReply) return
    setMessages((prev) => [
      ...prev,
      {
        id: nextId(),
        role: 'user',
        text,
        createdAt: Date.now(),
      },
    ])
    setDraft('')
    enqueueSupportReply(text)
  }

  const reiniciarChat = () => {
    if (replyTimeoutRef.current !== null) {
      clearTimeout(replyTimeoutRef.current)
      replyTimeoutRef.current = null
    }
    setPendingReply(false)
    idRef.current = 0
    setMessages([{ ...welcomeMessage, id: 'welcome', createdAt: Date.now() }])
    toast.message('Conversa reiniciada.')
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    sendText(draft)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 md:gap-6">
      <RegistrosPageHeader
        title={
          <span className="inline-flex items-center gap-2.5">
            <span className="bg-primary/8 text-primary inline-flex size-9 shrink-0 items-center justify-center rounded-lg">
              <CircleHelp className="size-[1.15rem]" strokeWidth={1.75} aria-hidden />
            </span>
            <span>Ajuda e suporte</span>
          </span>
        }
        description="Encontre respostas, tutoriais e canais de contato — ou fale com o assistente no chat de demonstração."
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 gap-1.5"
          onClick={() => setAba('chat')}
        >
          <MessageSquare className="size-3.5" strokeWidth={1.75} aria-hidden />
          Abrir chat
        </Button>
      </RegistrosPageHeader>

      <Tabs value={aba} onValueChange={setAba} className="flex min-h-0 flex-1 flex-col gap-0">
        <Card className="border-border/40 flex min-h-[min(70dvh,680px)] flex-1 flex-col overflow-hidden shadow-md ring-1 ring-black/[0.03] dark:ring-white/[0.06]">
          <div className="border-border/40 relative shrink-0 border-b bg-gradient-to-b from-muted/25 via-background to-background px-4 py-3 sm:px-5 sm:py-4">
            <TabsList
              aria-label="Seções de ajuda"
              className={cn(
                'relative h-auto w-full min-w-0 justify-start gap-1',
                'rounded-2xl border border-border/60 bg-muted/40 p-1 sm:p-1.5',
                'shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.18)]',
                'overflow-x-auto overscroll-x-contain scroll-smooth [scrollbar-width:thin]',
                'sm:flex-wrap sm:overflow-visible',
              )}
            >
              <TabsTrigger
                value="visao"
                className={cn(
                  '!flex-none shrink-0 gap-2 rounded-xl px-3.5 py-2.5 text-xs font-medium shadow-none sm:px-4 sm:text-sm',
                  'text-muted-foreground hover:text-foreground',
                  'data-active:bg-background data-active:text-foreground data-active:shadow-sm',
                  'data-active:ring-1 data-active:ring-border/55',
                  'transition-[color,box-shadow,background-color] duration-200',
                )}
              >
                <LayoutDashboard className="size-4 shrink-0 opacity-80" strokeWidth={1.75} aria-hidden />
                <span className="whitespace-nowrap">Visão geral</span>
              </TabsTrigger>
              <TabsTrigger
                value="faq"
                className={cn(
                  '!flex-none shrink-0 gap-2 rounded-xl px-3.5 py-2.5 text-xs font-medium shadow-none sm:px-4 sm:text-sm',
                  'text-muted-foreground hover:text-foreground',
                  'data-active:bg-background data-active:text-foreground data-active:shadow-sm',
                  'data-active:ring-1 data-active:ring-border/55',
                  'transition-[color,box-shadow,background-color] duration-200',
                )}
              >
                <CircleHelp className="size-4 shrink-0 opacity-80" strokeWidth={1.75} aria-hidden />
                <span className="whitespace-nowrap">FAQ</span>
                <span
                  className="bg-primary/12 text-primary ml-0.5 hidden min-w-[1.25rem] rounded-md px-1.5 py-0.5 text-center text-[10px] font-semibold tabular-nums sm:inline-block"
                  aria-label={`${FAQ_ITENS.length} artigos`}
                >
                  {FAQ_ITENS.length}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="guias"
                className={cn(
                  '!flex-none shrink-0 gap-2 rounded-xl px-3.5 py-2.5 text-xs font-medium shadow-none sm:px-4 sm:text-sm',
                  'text-muted-foreground hover:text-foreground',
                  'data-active:bg-background data-active:text-foreground data-active:shadow-sm',
                  'data-active:ring-1 data-active:ring-border/55',
                  'transition-[color,box-shadow,background-color] duration-200',
                )}
              >
                <BookOpen className="size-4 shrink-0 opacity-80" strokeWidth={1.75} aria-hidden />
                <span className="whitespace-nowrap">Guias</span>
              </TabsTrigger>
              <TabsTrigger
                value="contato"
                className={cn(
                  '!flex-none shrink-0 gap-2 rounded-xl px-3.5 py-2.5 text-xs font-medium shadow-none sm:px-4 sm:text-sm',
                  'text-muted-foreground hover:text-foreground',
                  'data-active:bg-background data-active:text-foreground data-active:shadow-sm',
                  'data-active:ring-1 data-active:ring-border/55',
                  'transition-[color,box-shadow,background-color] duration-200',
                )}
              >
                <Mail className="size-4 shrink-0 opacity-80" strokeWidth={1.75} aria-hidden />
                <span className="whitespace-nowrap">Contato</span>
              </TabsTrigger>
              <TabsTrigger
                value="chat"
                className={cn(
                  '!flex-none shrink-0 gap-2 rounded-xl px-3.5 py-2.5 text-xs font-medium shadow-none sm:px-4 sm:text-sm',
                  'text-muted-foreground hover:text-foreground',
                  'data-active:bg-background data-active:text-foreground data-active:shadow-sm',
                  'data-active:ring-1 data-active:ring-border/55',
                  'transition-[color,box-shadow,background-color] duration-200',
                )}
              >
                <MessageSquare className="size-4 shrink-0 opacity-80" strokeWidth={1.75} aria-hidden />
                <span className="whitespace-nowrap">Chat</span>
                <span className="bg-amber-500/15 text-amber-800 dark:text-amber-400 ml-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-medium tracking-wide uppercase">
                  demo
                </span>
              </TabsTrigger>
            </TabsList>
          </div>

          <CardContent className="flex min-h-0 flex-1 flex-col p-0">
            <TabsContent
              value="visao"
              className="mt-0 flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain px-4 py-6 outline-none sm:px-6"
            >
              <div className="mx-auto w-full max-w-3xl space-y-8">
                <div className="space-y-2">
                  <h2 className="text-foreground text-lg font-semibold tracking-tight">
                    Por onde começar
                  </h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Toque em um card para ir à seção. Você pode voltar a qualquer momento pelas abas no topo.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {ATALHOS_VISAO.map((item) => {
                    const Icon = item.icone
                    return (
                      <button
                        key={item.aba}
                        type="button"
                        onClick={() => setAba(item.aba)}
                        className={cn(
                          'border-border/60 bg-card group text-left shadow-sm transition-all duration-200',
                          'rounded-2xl border p-4 sm:p-5',
                          'hover:border-primary/25 hover:bg-muted/30 hover:shadow-md',
                          'focus-visible:ring-primary/40 focus-visible:ring-2 focus-visible:outline-none',
                          'active:scale-[0.99]',
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <span className="bg-primary/10 text-primary group-hover:bg-primary/15 inline-flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors">
                            <Icon className="size-[1.35rem]" strokeWidth={1.65} aria-hidden />
                          </span>
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-foreground font-medium">{item.titulo}</span>
                              <ChevronRight className="text-muted-foreground group-hover:text-primary size-4 shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden />
                            </div>
                            <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
                              {item.descricao}
                            </p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </TabsContent>

            <TabsContent
              value="faq"
              className="mt-0 flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain px-4 py-6 outline-none sm:px-6"
            >
              <div className="mx-auto w-full max-w-3xl space-y-5">
                <div className="space-y-3">
                  <h2 className="text-foreground text-lg font-semibold tracking-tight">
                    Perguntas frequentes
                  </h2>
                  <div className="relative">
                    <Search
                      className="text-muted-foreground/70 pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2"
                      strokeWidth={1.75}
                      aria-hidden
                    />
                    <Input
                      value={faqBusca}
                      onChange={(e) => setFaqBusca(e.target.value)}
                      placeholder="Buscar por assunto, ex.: denúncia, senha, painel…"
                      className="border-border/40 bg-muted/[0.92] dark:bg-muted/95 h-10 rounded-xl pl-10 pr-3 shadow-none"
                      aria-label="Buscar no FAQ"
                    />
                  </div>
                  <p className="text-muted-foreground text-xs sm:text-sm">
                    {faqFiltrados.length === FAQ_ITENS.length
                      ? `${FAQ_ITENS.length} artigos. Toque para expandir.`
                      : faqFiltrados.length === 0
                        ? 'Nenhum resultado — tente outro termo.'
                        : `${faqFiltrados.length} resultado(s) para sua busca.`}
                  </p>
                </div>
                {faqFiltrados.length > 0 ? (
                  <Accordion type="single" collapsible className="w-full space-y-2">
                    {faqFiltrados.map((item) => {
                      const globalIndex = FAQ_ITENS.indexOf(item)
                      return (
                        <AccordionItem
                          key={item.pergunta}
                          value={`faq-${globalIndex}`}
                          className="border-border/60 rounded-xl border bg-card/50 px-1 data-open:bg-card data-open:shadow-sm"
                        >
                          <AccordionTrigger className="text-foreground px-3 py-3 text-left text-sm font-medium hover:no-underline">
                            {item.pergunta}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground px-3 pb-3 text-sm leading-relaxed">
                            {renderSupportText(item.resposta)}
                          </AccordionContent>
                        </AccordionItem>
                      )
                    })}
                  </Accordion>
                ) : (
                  <div className="text-muted-foreground border-border/50 rounded-2xl border border-dashed bg-muted/20 px-6 py-12 text-center text-sm">
                    Nenhum artigo encontrado. Limpe a busca ou use outra palavra-chave.
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent
              value="guias"
              className="mt-0 flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain px-4 py-6 outline-none sm:px-6"
            >
              <div className="mx-auto w-full max-w-3xl space-y-5">
                <div className="space-y-2">
                  <h2 className="text-foreground text-lg font-semibold tracking-tight">Guias rápidos</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Cada fluxo lista os passos na ordem em que devem ser feitos.
                  </p>
                </div>
                <div className="flex flex-col gap-4">
                  {GUIAS_RAPIDOS.map((g, gi) => (
                    <Card
                      key={g.titulo}
                      size="sm"
                      className="border-border/60 overflow-hidden shadow-sm"
                    >
                      <CardHeader className="border-border/40 bg-muted/25 border-b pb-3">
                        <div className="flex items-center gap-3">
                          <span className="bg-primary text-primary-foreground flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold tabular-nums">
                            {gi + 1}
                          </span>
                          <div>
                            <CardTitle className="text-base font-semibold">{g.titulo}</CardTitle>
                            <CardDescription className="text-xs sm:text-sm">
                              Siga os passos abaixo.
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <ol className="text-muted-foreground space-y-3 text-sm leading-relaxed">
                          {g.passos.map((passo, pi) => (
                            <li key={passo} className="flex gap-3">
                              <span className="bg-muted text-muted-foreground flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums">
                                {pi + 1}
                              </span>
                              <span className="min-w-0 pt-0.5">{renderSupportText(passo)}</span>
                            </li>
                          ))}
                        </ol>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent
              value="contato"
              className="mt-0 flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain px-4 py-6 outline-none sm:px-6"
            >
              <div className="mx-auto w-full max-w-lg space-y-5">
                <div className="space-y-2">
                  <h2 className="text-foreground text-lg font-semibold tracking-tight">Contato</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Dados de exemplo — ajuste para o canal oficial da sua instituição.
                  </p>
                </div>
                <Card size="sm" className="border-border/60 overflow-hidden shadow-sm">
                  <CardHeader className="border-border/40 bg-muted/20 border-b">
                    <div className="flex items-center gap-3">
                      <span className="bg-primary/12 text-primary inline-flex size-11 items-center justify-center rounded-xl">
                        <Headphones className="size-5" strokeWidth={1.65} aria-hidden />
                      </span>
                      <div>
                        <CardTitle className="text-base">Canais de atendimento</CardTitle>
                        <CardDescription className="text-sm">Suporte e incidentes</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5 pt-5 text-sm">
                    <div className="flex items-start gap-3 rounded-xl border border-border/50 bg-muted/15 p-3">
                      <Mail className="text-primary mt-0.5 size-4 shrink-0" strokeWidth={1.75} aria-hidden />
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                          E-mail
                        </div>
                        <a
                          href={`mailto:${SUPPORT_EMAIL}`}
                          className="text-primary block truncate font-medium hover:underline"
                        >
                          {SUPPORT_EMAIL}
                        </a>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="h-8 gap-1.5"
                          onClick={() => void copiarEmail()}
                        >
                          <Copy className="size-3.5" strokeWidth={1.75} aria-hidden />
                          Copiar endereço
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-3 rounded-xl border border-border/50 bg-muted/15 p-3">
                      <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                        Horário
                      </span>
                      <p className="text-foreground flex-1 leading-relaxed">
                        Segunda a sexta, 9h às 18h (Brasília), exceto feriados.
                      </p>
                    </div>
                    <div className="rounded-xl border border-border/50 bg-muted/15 p-3">
                      <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                        Incidentes críticos
                      </p>
                      <p className="text-foreground mt-2 text-sm leading-relaxed">
                        Use o canal interno de TI ou o processo definido pelo seu gestor.
                      </p>
                    </div>
                    <Button type="button" variant="outline" className="w-full gap-2" disabled title="Integração futura">
                      <Mail className="size-4" strokeWidth={1.75} aria-hidden />
                      Abrir formulário de chamado (em breve)
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent
              value="chat"
              className="mt-0 flex min-h-[min(52dvh,520px)] flex-1 flex-col bg-muted/15 px-0 pb-0 pt-0 outline-none"
            >
              <div className="bg-background/85 border-border/40 supports-[backdrop-filter]:bg-background/75 flex shrink-0 items-start gap-3 border-b px-4 py-4 backdrop-blur-sm sm:px-5">
                <span className="bg-primary/12 text-primary inline-flex size-11 shrink-0 items-center justify-center rounded-xl">
                  <Headphones className="size-5" strokeWidth={1.65} aria-hidden />
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-semibold">Chat de suporte</span>
                    <Badge variant="secondary" className="text-[10px] font-normal">
                      Respostas automáticas
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Demonstração: o assistente sugere respostas genéricas. Não envia dados para serviços externos.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground shrink-0 gap-1.5"
                  onClick={reiniciarChat}
                  disabled={pendingReply}
                >
                  <RotateCcw className="size-3.5" strokeWidth={1.75} aria-hidden />
                  <span className="hidden sm:inline">Reiniciar</span>
                </Button>
              </div>
              <ScrollArea className="min-h-[220px] flex-1 px-4 sm:px-5">
                <ul className="flex flex-col gap-3.5 py-5" aria-label="Mensagens do chat">
                  {messages.map((m) => (
                    <li
                      key={m.id}
                      className={cn(
                        'flex gap-2.5',
                        m.role === 'user' ? 'flex-row-reverse' : 'flex-row',
                      )}
                    >
                      <div
                        className={cn(
                          'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full ring-1 ring-border/50',
                          m.role === 'support'
                            ? 'bg-primary/12 text-primary'
                            : 'bg-background text-muted-foreground',
                        )}
                        aria-hidden
                      >
                        {m.role === 'support' ? (
                          <MessageSquare className="size-4" strokeWidth={1.75} />
                        ) : (
                          <User className="size-4" strokeWidth={1.75} />
                        )}
                      </div>
                      <div
                        className={cn(
                          'max-w-[min(100%,30rem)] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed shadow-sm',
                          m.role === 'support'
                            ? 'bg-card text-foreground ring-border/40 rounded-tl-md ring-1'
                            : 'bg-primary text-primary-foreground rounded-tr-md',
                        )}
                      >
                        {m.role === 'support' ? renderSupportText(m.text) : m.text}
                      </div>
                    </li>
                  ))}
                  {pendingReply ? (
                    <li className="text-muted-foreground flex items-center gap-2 py-1 text-xs">
                      <Loader2 className="size-3.5 animate-spin" aria-hidden />
                      <span>Assistente está respondendo…</span>
                    </li>
                  ) : null}
                  <div ref={endRef} />
                </ul>
              </ScrollArea>
              <div className="bg-background border-border/40 shrink-0 space-y-3 border-t px-4 py-4 sm:px-5">
                <p className="text-muted-foreground text-xs font-medium">Sugestões rápidas</p>
                <div className="flex flex-wrap gap-2">
                  {SUGESTOES.map((s) => (
                    <Button
                      key={s}
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="border-border/50 bg-background h-9 rounded-full border text-xs font-normal shadow-none"
                      disabled={pendingReply}
                      onClick={() => sendText(s)}
                    >
                      {s}
                    </Button>
                  ))}
                </div>
                <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-end">
                  <Input
                    ref={inputRef}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Escreva sua mensagem e pressione Enter para enviar…"
                    className="border-border/60 bg-background min-h-10 flex-1 rounded-xl shadow-sm sm:min-h-11"
                    disabled={pendingReply}
                    aria-label="Mensagem"
                    autoComplete="off"
                  />
                  <Button
                    type="submit"
                    className="h-10 w-full shrink-0 gap-1.5 rounded-xl px-5 sm:h-11 sm:w-auto"
                    disabled={pendingReply || draft.trim().length === 0}
                  >
                    <SendHorizontal className="size-4" strokeWidth={1.75} aria-hidden />
                    Enviar
                  </Button>
                </form>
              </div>
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  )
}

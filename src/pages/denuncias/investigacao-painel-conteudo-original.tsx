import {
  Building2,
  ChevronDown,
  ExternalLink,
  FileText,
  Globe,
  Hash,
  Layers,
  Mail,
  MessageSquare,
  PaperclipIcon,
  Phone,
  Shield,
  Tag,
  UserRound,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import type { DenunciaMock } from '@/pages/denuncias/denuncias-mock'
import { InvestigacaoWorkspaceSecao } from '@/pages/denuncias/investigacao-workspace-secao'

function formatoData(iso: string) {
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

function iconeCanalDenuncia(canal: string): LucideIcon {
  const c = canal.toLowerCase()
  if (c.includes('web')) return Globe
  if (c.includes('telefone')) return Phone
  if (c.includes('presencial')) return Building2
  if (c.includes('e-mail') || c.includes('mail')) return Mail
  return MessageSquare
}

function CampoMeta({
  rotulo,
  valor,
  icone: Icone,
  destaque,
}: {
  rotulo: string
  valor: string
  icone?: LucideIcon
  destaque?: boolean
}) {
  return (
    <div className="min-w-0 space-y-0.5">
      <p className="text-muted-foreground text-[9px] font-semibold uppercase tracking-wide">{rotulo}</p>
      <p className={cn('flex items-center gap-1 text-[11px] leading-snug', destaque ? 'text-foreground font-medium' : 'text-muted-foreground')}>
        {Icone && <Icone className="size-3 shrink-0 opacity-75" aria-hidden />}
        {valor || '—'}
      </p>
    </div>
  )
}

/** Coluna esquerda partilhada — modelo Recepção (dados da denúncia, relato e anexos). */
export function InvestigacaoPainelConteudoOriginal({
  denuncia,
}: Readonly<{ denuncia: DenunciaMock }>) {
  const [marcadoSensivel, setMarcadoSensivel] = useState(false)
  const CanalIcon = iconeCanalDenuncia(denuncia.canal)

  return (
    <InvestigacaoWorkspaceSecao
      variant="formulario"
      titulo="Conteúdo original"
      tituloIcon={<FileText className="size-[1.05rem] sm:size-[1.15rem]" strokeWidth={2} aria-hidden />}
      acao={
        <Button
          type="button"
          variant={marcadoSensivel ? 'default' : 'outline'}
          size="sm"
          className="h-7 gap-1 px-2 text-[11px]"
          onClick={() => {
            setMarcadoSensivel((v) => !v)
            toast.message(
              marcadoSensivel ? 'Marcador sensível removido (mock).' : 'Marcado como sensível (mock).',
            )
          }}
        >
          <Shield className="size-3" aria-hidden />
          Sensível
        </Button>
      }
    >
      {/* Ficha da denúncia */}
      <div className="border-border/50 rounded-md border bg-muted/20 px-3 py-2.5 space-y-2.5">
        {/* Protocolo + título */}
        <div className="space-y-0.5">
          <p className="text-muted-foreground flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wide">
            <Hash className="size-3 shrink-0 opacity-75" aria-hidden />
            Protocolo
          </p>
          <p className="text-foreground font-mono text-xs font-semibold">{denuncia.protocolo}</p>
        </div>
        {denuncia.titulo && (
          <div className="space-y-0.5">
            <p className="text-muted-foreground flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wide">
              <FileText className="size-3 shrink-0 opacity-75" aria-hidden />
              Título
            </p>
            <p className="text-foreground text-xs font-medium leading-snug">{denuncia.titulo}</p>
          </div>
        )}
        {/* Grid de metadados */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
          <CampoMeta rotulo="Categoria" valor={denuncia.categoria} icone={Tag} destaque />
          <CampoMeta rotulo="Canal" valor={denuncia.canal} icone={CanalIcon} />
          <CampoMeta rotulo="Prioridade" valor={denuncia.prioridade} destaque />
          <CampoMeta
            rotulo="Anonimato"
            valor={denuncia.anonimato === 'anonimo' ? 'Anônimo' : 'Identificado'}
            icone={UserRound}
          />
          <CampoMeta rotulo="Departamento" valor={denuncia.departamento} icone={Building2} />
          <CampoMeta rotulo="Registrado em" valor={formatoData(denuncia.registradoEm)} />
        </div>
      </div>

      {/* Relato + anexos */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="group text-muted-foreground hover:text-foreground flex w-full items-center justify-between gap-2 rounded-md border border-border/60 bg-muted/25 px-2 py-1.5 text-[11px] font-medium">
          <span className="flex min-w-0 items-center gap-1.5">
            <Layers className="text-muted-foreground size-3.5 shrink-0 opacity-90" aria-hidden />
            <span className="truncate">Relato · anexos</span>
          </span>
          <ChevronDown
            className="size-3.5 shrink-0 transition-transform group-data-[state=open]:rotate-180"
            aria-hidden
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 space-y-2">
          <blockquote
            className={cn(
              'border-primary/35 bg-background text-foreground ring-border/40 max-h-[min(42vh,320px)] overflow-y-auto rounded-md border-l-[3px] px-2.5 py-2 text-xs leading-snug whitespace-pre-wrap ring-1 xl:max-h-[min(55vh,420px)]',
              marcadoSensivel && 'blur-[2.5px] transition-[filter] selection:blur-none',
            )}
          >
            {denuncia.relatoOriginal || '—'}
          </blockquote>
          <div>
            <p className="text-muted-foreground mb-1 flex items-center gap-1.5 text-[10px] font-medium tracking-wide uppercase">
              <PaperclipIcon className="size-3 opacity-90" aria-hidden />
              Anexos
            </p>
            {denuncia.evidencias.length === 0 ? (
              <p className="text-muted-foreground text-xs">Sem anexos.</p>
            ) : (
              <ul className="flex flex-col gap-1">
                {denuncia.evidencias.map((ev) => (
                  <li
                    key={ev.id}
                    className="border-border/50 bg-background flex flex-col gap-1 rounded-md border px-2 py-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 flex-1 items-start gap-1.5">
                      {ev.nome.toLowerCase().endsWith('.pdf') ? (
                        <FileText className="text-muted-foreground mt-0.5 size-3.5 shrink-0 opacity-90" aria-hidden />
                      ) : (
                        <PaperclipIcon className="text-muted-foreground mt-0.5 size-3.5 shrink-0 opacity-90" aria-hidden />
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-medium leading-tight">{ev.nome}</p>
                        <p className="text-muted-foreground text-[10px] tabular-nums">
                          {ev.tamanho} · {formatoData(ev.enviadoEm)}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="h-7 w-full shrink-0 gap-1 px-2 text-[11px] sm:w-auto"
                      onClick={() => toast.message('Pré-visualização (mock)', { description: ev.nome })}
                    >
                      Abrir
                      <ExternalLink className="size-3 opacity-90" aria-hidden />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </InvestigacaoWorkspaceSecao>
  )
}

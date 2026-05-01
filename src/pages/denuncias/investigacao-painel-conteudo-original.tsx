import {
  Binary,
  ChevronDown,
  ExternalLink,
  FileText,
  Layers,
  MapPin,
  MonitorSmartphone,
  PaperclipIcon,
  Shield,
} from 'lucide-react'
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

/** Coluna esquerda partilhada — modelo Recepção (relato, metadados, anexos). */
export function InvestigacaoPainelConteudoOriginal({
  denuncia,
}: Readonly<{ denuncia: DenunciaMock }>) {
  const [marcadoSensivel, setMarcadoSensivel] = useState(false)

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
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="group text-muted-foreground hover:text-foreground flex w-full items-center justify-between gap-2 rounded-md border border-border/60 bg-muted/25 px-2 py-1.5 text-[11px] font-medium">
          <span className="flex min-w-0 items-center gap-1.5">
            <Layers className="text-muted-foreground size-3.5 shrink-0 opacity-90" aria-hidden />
            <span className="truncate">Relato · metadados · anexos</span>
            <span className="text-muted-foreground font-mono text-[10px] opacity-80">{denuncia.protocolo}</span>
          </span>
          <ChevronDown
            className="size-3.5 shrink-0 transition-transform group-data-[state=open]:rotate-180"
            aria-hidden
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <blockquote
            className={cn(
              'border-primary/35 bg-background text-foreground ring-border/40 max-h-[min(42vh,320px)] overflow-y-auto rounded-md border-l-[3px] px-2.5 py-2 text-xs leading-snug whitespace-pre-wrap ring-1 xl:max-h-[min(55vh,420px)]',
              marcadoSensivel && 'blur-[2.5px] transition-[filter] selection:blur-none',
            )}
          >
            {denuncia.relatoOriginal}
          </blockquote>
          <div className="mt-2 grid grid-cols-1 gap-2">
            <div className="flex gap-2">
              <Binary className="text-muted-foreground mt-0.5 size-3.5 shrink-0 opacity-85" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-muted-foreground text-[9px] font-semibold uppercase">IP</p>
                <p className="text-foreground mt-0.5 font-mono text-[11px] leading-tight break-all">
                  {denuncia.metadadosEntrada.ip ?? '— Retido'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <MapPin className="text-muted-foreground mt-0.5 size-3.5 shrink-0 opacity-85" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-muted-foreground text-[9px] font-semibold uppercase">Localização</p>
                <p className="text-foreground mt-0.5 text-[11px] leading-tight">
                  {denuncia.metadadosEntrada.localizacaoAprox ?? '—'}
                </p>
              </div>
            </div>
            <div className="flex min-w-0 gap-2">
              <MonitorSmartphone className="text-muted-foreground mt-0.5 size-3.5 shrink-0 opacity-85" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-muted-foreground text-[9px] font-semibold uppercase">Device</p>
                <p className="text-muted-foreground mt-0.5 text-[11px] leading-snug break-all">
                  {denuncia.metadadosEntrada.userAgent ?? '—'}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-2">
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

/**
 * Quadro Kanban minimalista com dnd-kit — arrastar dentro e entre colunas, overlay animado.
 */
import { GripVertical, Inbox } from 'lucide-react'
import { Fragment, useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  pointerWithin,
  useDndContext,
  useDroppable,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { cn } from '@/lib/utils'

export const REGISTROS_KANBAN_PREFIXO_COLUNA = 'kanban_col__'

export function idDropColunaKanban(chave: string) {
  return `${REGISTROS_KANBAN_PREFIXO_COLUNA}${chave}`
}

function decodificarIdColunaKanban(id: string): string | undefined {
  if (!id.startsWith(REGISTROS_KANBAN_PREFIXO_COLUNA)) return undefined
  return id.slice(REGISTROS_KANBAN_PREFIXO_COLUNA.length)
}

/** Prioriza cartões sob o cursor para o `overIndex` do sortable empurrar itens ao vivo; zona da coluna só quando o ponteiro não está em cima de card. */
const deteccaoColisaoKanban: CollisionDetection = (args) => {
  const pointer = pointerWithin(args)
  if (pointer.length > 0) {
    const onlyCards = pointer.filter((c) => !String(c.id).startsWith(REGISTROS_KANBAN_PREFIXO_COLUNA))
    if (onlyCards.length > 0) return onlyCards
    return pointer
  }
  return closestCorners(args)
}

export type RegistrosKanbanSecao<TItem> = {
  chave: string
  itens: TItem[]
}

export function registrosKanbanAgrupar<TItem>(
  itens: readonly TItem[],
  groupBy: (item: TItem) => string,
  ordemSecoes?: readonly string[],
): RegistrosKanbanSecao<TItem>[] {
  const map = new Map<string, TItem[]>()
  for (const item of itens) {
    const chave = groupBy(item)
    const arr = map.get(chave)
    if (arr) arr.push(item)
    else map.set(chave, [item])
  }

  if (ordemSecoes?.length) {
    return ordemSecoes.map((chave) => ({
      chave,
      itens: map.get(chave) ?? [],
    }))
  }

  const chaves = [...map.keys()].sort((a, b) => a.localeCompare(b, 'pt-BR'))
  return chaves.map((chave) => ({
    chave,
    itens: map.get(chave) ?? [],
  }))
}

function clonarColunas<TItem>(m: Record<string, TItem[]>) {
  const o: Record<string, TItem[]> = {}
  for (const [k, v] of Object.entries(m)) {
    o[k] = [...v]
  }
  return o
}

/** Encontra qual coluna contém o id do item. */
function colunaPorIdItem<TItem>(
  colunas: Record<string, TItem[]>,
  id: string,
  chaveItem: (item: TItem) => string,
): string | undefined {
  for (const k of Object.keys(colunas)) {
    if (colunas[k]?.some((item) => chaveItem(item) === id)) return k
  }
}

/**
 * Aplica movimento de cartão; suporta mesmo arr (reordenação) e colunas distintas.
 */
export function moverItemEntreColunasKanban<TItem>(
  colunas: Record<string, TItem[]>,
  activeId: string,
  overId: string,
  chaveItem: (item: TItem) => string,
): Record<string, TItem[]> | undefined {
  const fromKey = colunaPorIdItem(colunas, activeId, chaveItem)
  if (!fromKey) return undefined

  let toKey = colunaPorIdItem(colunas, overId, chaveItem)
  const colDrop = decodificarIdColunaKanban(overId)
  if (colDrop !== undefined) toKey = colDrop
  if (!toKey) return undefined

  const next = clonarColunas(colunas)
  const source = next[fromKey]
  if (!source) return undefined

  const fromIndex = source.findIndex((i) => chaveItem(i) === activeId)
  if (fromIndex < 0) return undefined

  const [moved] = source.splice(fromIndex, 1)

  const dest = next[toKey] ?? []
  let insertIndex: number

  if (colDrop !== undefined) {
    insertIndex = dest.length
  } else {
    insertIndex = dest.findIndex((i) => chaveItem(i) === overId)
    if (insertIndex < 0) insertIndex = dest.length
  }

  if (fromKey === toKey) {
    const rest = [...source]
    rest.splice(insertIndex, 0, moved)
    next[toKey] = rest
    return next
  }

  dest.splice(insertIndex, 0, moved)
  next[fromKey] = source
  next[toKey] = dest
  return next
}

/** Reordenação pura na mesma lista (sem mudar coluna). */
export function reordenarKanbanNaColuna<TItem>(
  colunas: Record<string, TItem[]>,
  chaveColuna: string,
  activeId: string,
  overId: string,
  chaveItem: (item: TItem) => string,
): Record<string, TItem[]> | undefined {
  const list = colunas[chaveColuna]
  if (!list) return undefined
  const oldIndex = list.findIndex((i) => chaveItem(i) === activeId)
  const newIndex = list.findIndex((i) => chaveItem(i) === overId)
  if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return undefined
  const next = clonarColunas(colunas)
  next[chaveColuna] = arrayMove(list, oldIndex, newIndex)
  return next
}

type RegistrosKanbanProps<TItem> = {
  ordemColunasChaves: readonly string[]
  colunas: Record<string, TItem[]>
  onColunasChange: (next: Record<string, TItem[]>) => void
  chaveItem: (item: TItem) => string
  rotuloSecao: (chave: string) => string
  renderCard: (item: TItem, opc: { dragging: boolean }) => ReactNode
  className?: string
  areaLabel?: string
}

function ZonaCartoesColuna({
  chaveColuna,
  itemCount,
}: Readonly<{ chaveColuna: string; itemCount: number }>) {
  const { setNodeRef, isOver } = useDroppable({
    id: idDropColunaKanban(chaveColuna),
    data: { tipo: 'coluna', chave: chaveColuna },
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'min-h-[104px] flex-1 rounded-[10px]',
        itemCount === 0 && 'min-h-[136px]',
        isOver ? 'bg-primary/[0.07] outline outline-2 outline-offset-[-2px] outline-primary/35' : 'bg-transparent',
        'motion-safe:transition-[background-color,outline-color] motion-safe:duration-200',
      )}
    />
  )
}

function IndicadorInsercaoKanban() {
  return (
    <li className="pointer-events-none relative list-none py-0.5" aria-hidden>
      <div
        className={cn(
          'kanban-insercao-slot bg-primary h-[3px] w-full rounded-full',
          'shadow-[0_0_14px_color-mix(in_oklch,var(--primary)_50%,transparent)]',
        )}
      />
    </li>
  )
}

function LinhaCartaoKanban({
  id,
  children,
}: Readonly<{ id: string; children: ReactNode }>) {
  const { dragOverlay } = useDndContext()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  })
  const ocultarOrigemComOverlay = isDragging && dragOverlay.rect !== null

  const estilo: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: ocultarOrigemComOverlay ? 0 : undefined,
  }

  return (
    <li ref={setNodeRef} style={estilo} className="relative list-none">
      <div
        className={cn(
          'group/kanban-card',
          isDragging && 'shadow-md ring-2 ring-primary/25',
          'motion-safe:transition-shadow motion-safe:duration-200',
        )}
      >
        <div>{children}</div>
        <button
          type="button"
          className="text-muted-foreground/50 hover:text-muted-foreground absolute top-2.5 right-2 z-[2] cursor-grab rounded p-1 active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
          aria-label="Arrastar"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-3.5" strokeWidth={1.6} aria-hidden />
        </button>
      </div>
    </li>
  )
}

export function RegistrosKanban<TItem>({
  ordemColunasChaves,
  colunas,
  onColunasChange,
  chaveItem,
  rotuloSecao,
  renderCard,
  className,
  areaLabel = 'Quadro Kanban',
}: Readonly<RegistrosKanbanProps<TItem>>) {
  const [ativoId, setAtivoId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)

  const sensores = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const itemAtivo = useMemo(() => {
    if (!ativoId) return null
    for (const k of Object.keys(colunas)) {
      const f = colunas[k]?.find((i) => chaveItem(i) === ativoId)
      if (f) return f
    }
    return null
  }, [ativoId, colunas, chaveItem])

  function aoIniciar(e: DragStartEvent) {
    setAtivoId(String(e.active.id))
    setOverId(null)
  }

  function aoSobre(e: DragOverEvent) {
    setOverId(e.over?.id != null ? String(e.over.id) : null)
  }

  function aoTerminar(e: DragEndEvent) {
    const { active, over } = e
    setAtivoId(null)
    setOverId(null)
    if (!over) return

    const aid = String(active.id)
    const oid = String(over.id)
    if (aid === oid) return

    const fromKey = colunaPorIdItem(colunas, aid, chaveItem)
    if (!fromKey) return

    const colOver = decodificarIdColunaKanban(oid)
    const toKey = colOver ?? colunaPorIdItem(colunas, oid, chaveItem)
    if (!toKey) return

    if (fromKey === toKey && colOver === undefined) {
      const r = reordenarKanbanNaColuna(colunas, fromKey, aid, oid, chaveItem)
      if (r) onColunasChange(r)
      return
    }

    const r = moverItemEntreColunasKanban(colunas, aid, oid, chaveItem)
    if (r) onColunasChange(r)
  }

  function aoCancelar() {
    setAtivoId(null)
    setOverId(null)
  }

  return (
    <div className={cn('flex flex-col gap-0', className)}>
      <section
        aria-label={areaLabel}
        className="border-border/30 bg-muted/15 flex max-h-[min(78vh,58rem)] min-h-[min(42vh,22rem)] flex-col overflow-hidden rounded-xl border"
      >
        <DndContext
          sensors={sensores}
          collisionDetection={deteccaoColisaoKanban}
          onDragStart={aoIniciar}
          onDragOver={aoSobre}
          onDragEnd={aoTerminar}
          onDragCancel={aoCancelar}
        >
          <div className="scrollbar-app flex min-h-0 flex-1 gap-2.5 overflow-x-auto overflow-y-hidden px-2.5 pb-0 md:gap-3 md:px-3">
            {ordemColunasChaves.map((chave) => {
              const lista = colunas[chave] ?? []
              const ids = lista.map((i) => chaveItem(i))
              const idZonaColuna = idDropColunaKanban(chave)
              const indicadorNoFim =
                ativoId != null && overId === idZonaColuna && lista.length > 0
              const indicadorColunaVazia =
                ativoId != null && overId === idZonaColuna && lista.length === 0

              return (
                <div
                  key={chave}
                  className="border-border/40 bg-background/80 flex h-full max-h-[min(70vh,52rem)] w-[min(100%,16.5rem)] shrink-0 flex-col overflow-hidden rounded-lg border md:w-[17.5rem] dark:bg-background/60"
                >
                  <header className="flex items-baseline justify-between gap-2 border-b border-border/30 px-2.5 py-2">
                    <h3 className="text-muted-foreground font-heading max-w-[85%] truncate text-[11px] font-medium tracking-wide uppercase">
                      {rotuloSecao(chave)}
                    </h3>
                    <span className="text-muted-foreground/90 tabular-nums text-[10px]">{lista.length}</span>
                  </header>

                  <div className="relative flex min-h-0 flex-1 flex-col p-2">
                    <SortableContext items={ids} strategy={verticalListSortingStrategy}>
                      <div className="scrollbar-app flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-0.5">
                        {lista.length === 0 ? (
                          <div className="flex min-h-[136px] flex-1 flex-col">
                            <div className="text-muted-foreground m-auto flex max-w-[13rem] flex-col items-center gap-1.5 px-2 py-6 text-center">
                              <Inbox className="size-7 opacity-35" strokeWidth={1.25} aria-hidden />
                              <span className="text-[10.5px] leading-snug">Vazio</span>
                            </div>
                            {indicadorColunaVazia ? (
                              <div className="mx-1 shrink-0 px-0.5 pb-1" aria-hidden>
                                <div
                                  className={cn(
                                    'kanban-insercao-slot bg-primary h-[3px] w-full rounded-full',
                                    'shadow-[0_0_14px_color-mix(in_oklch,var(--primary)_50%,transparent)]',
                                  )}
                                />
                              </div>
                            ) : null}
                            <ZonaCartoesColuna chaveColuna={chave} itemCount={0} />
                          </div>
                        ) : (
                          <>
                            <ul className="flex flex-col gap-2">
                              {lista.map((item) => {
                                const id = chaveItem(item)
                                let slotAntes = false
                                let slotDepois = false
                                if (ativoId && overId === id && ativoId !== id) {
                                  const fromKey = colunaPorIdItem(colunas, ativoId, chaveItem)
                                  if (fromKey !== chave) {
                                    slotAntes = true
                                  } else {
                                    const oldIndex = lista.findIndex((i) => chaveItem(i) === ativoId)
                                    const newIndex = lista.findIndex((i) => chaveItem(i) === overId)
                                    if (oldIndex >= 0 && newIndex >= 0) {
                                      if (oldIndex > newIndex) slotAntes = true
                                      else if (oldIndex < newIndex) slotDepois = true
                                    }
                                  }
                                }
                                return (
                                  <Fragment key={id}>
                                    {slotAntes ? <IndicadorInsercaoKanban /> : null}
                                    <LinhaCartaoKanban id={id}>
                                      {renderCard(item, { dragging: ativoId === id })}
                                    </LinhaCartaoKanban>
                                    {slotDepois ? <IndicadorInsercaoKanban /> : null}
                                  </Fragment>
                                )
                              })}
                              {indicadorNoFim ? <IndicadorInsercaoKanban /> : null}
                            </ul>
                            <ZonaCartoesColuna chaveColuna={chave} itemCount={lista.length} />
                          </>
                        )}
                      </div>
                    </SortableContext>
                  </div>
                </div>
              )
            })}
          </div>

          <DragOverlay dropAnimation={{ duration: 220, easing: 'cubic-bezier(0.25,1,0.5,1)' }}>
            {ativoId && itemAtivo ? (
              <div className="bg-background/95 w-[min(100vw-2rem,17rem)] cursor-grabbing rounded-lg border border-primary/30 shadow-lg ring-2 ring-primary/20">
                {renderCard(itemAtivo, { dragging: true })}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </section>
    </div>
  )
}

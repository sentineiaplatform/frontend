import { useCallback, useEffect, useMemo, useRef, type FocusEvent } from 'react'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Redo2,
  Underline,
  Undo2,
} from 'lucide-react'
import {
  boldExtension,
  createEditorSystem,
  historyExtension,
  htmlExtension,
  italicExtension,
  listExtension,
  markdownExtension,
  RichText,
  underlineExtension,
} from '@lexkit/editor'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Extensões alinhadas ao [LexKit](https://lexkit.dev/) + Lexical (formatação, listas, histórico, HTML).
 */
const formRichTextExtensions = [
  boldExtension,
  italicExtension,
  underlineExtension,
  listExtension,
  historyExtension,
  markdownExtension,
  htmlExtension,
] as const

const { Provider: LexKitFormRichTextProvider, useEditor: useLexKitFormRichText } =
  createEditorSystem<typeof formRichTextExtensions>()

function plainTextToLexicalHtml(value: string): string {
  const v = value.trim()
  if (!v) return '<p></p>'
  if (v.startsWith('<')) return value
  const p = document.createElement('p')
  p.textContent = value
  return p.outerHTML
}

function LexKitRichTextToolbar() {
  const { commands, activeStates } = useLexKitFormRichText()

  const btnClass = (active: boolean) =>
    cn(
      'h-8 min-w-8 gap-0 px-2 text-xs',
      active ? 'bg-muted text-foreground' : 'text-muted-foreground',
    )

  return (
    <div
      className="flex flex-wrap items-center gap-0.5 border-b border-border/60 bg-muted/25 px-1.5 py-1"
      role="toolbar"
      aria-label="Formatação do texto"
    >
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={btnClass(Boolean(activeStates.bold))}
        onClick={() => commands.toggleBold()}
        aria-label="Negrito"
        aria-pressed={activeStates.bold ? true : undefined}
      >
        <Bold className="size-3.5" strokeWidth={2.25} aria-hidden />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={btnClass(Boolean(activeStates.italic))}
        onClick={() => commands.toggleItalic()}
        aria-label="Itálico"
        aria-pressed={activeStates.italic ? true : undefined}
      >
        <Italic className="size-3.5" strokeWidth={2.25} aria-hidden />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={btnClass(Boolean(activeStates.underline))}
        onClick={() => commands.toggleUnderline()}
        aria-label="Sublinhado"
        aria-pressed={activeStates.underline ? true : undefined}
      >
        <Underline className="size-3.5" strokeWidth={2.25} aria-hidden />
      </Button>
      <span className="bg-border/70 mx-0.5 hidden h-4 w-px sm:inline" aria-hidden />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={btnClass(Boolean(activeStates.unorderedList))}
        onClick={() => commands.toggleUnorderedList()}
        aria-label="Lista com marcadores"
        aria-pressed={activeStates.unorderedList ? true : undefined}
      >
        <List className="size-3.5" strokeWidth={2} aria-hidden />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={btnClass(Boolean(activeStates.orderedList))}
        onClick={() => commands.toggleOrderedList()}
        aria-label="Lista numerada"
        aria-pressed={activeStates.orderedList ? true : undefined}
      >
        <ListOrdered className="size-3.5" strokeWidth={2} aria-hidden />
      </Button>
      <span className="bg-border/70 mx-0.5 hidden h-4 w-px sm:inline" aria-hidden />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={btnClass(false)}
        onClick={() => commands.undo()}
        aria-label="Desfazer"
      >
        <Undo2 className="size-3.5" strokeWidth={2} aria-hidden />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={btnClass(false)}
        onClick={() => commands.redo()}
        aria-label="Refazer"
      >
        <Redo2 className="size-3.5" strokeWidth={2} aria-hidden />
      </Button>
    </div>
  )
}

function LexKitRichTextFieldInner({
  id,
  value,
  onChange,
  onBlur,
  placeholder,
  disabled,
  invalid,
  'aria-describedby': ariaDescribedBy,
}: Readonly<{
  id: string
  value: string
  onChange: (html: string) => void
  onBlur?: () => void
  placeholder?: string
  disabled?: boolean
  invalid?: boolean
  'aria-describedby'?: string
}>) {
  const { editor, commands } = useLexKitFormRichText()
  const lastSerialized = useRef<string | null>(null)
  const isImporting = useRef(false)
  const onChangeRef = useRef(onChange)
  const onBlurRef = useRef(onBlur)

  onChangeRef.current = onChange
  onBlurRef.current = onBlur

  const normalizedValue = useMemo(() => plainTextToLexicalHtml(value ?? ''), [value])

  useEffect(() => {
    if (!editor) return
    if (normalizedValue === lastSerialized.current) return
    isImporting.current = true
    lastSerialized.current = normalizedValue
    void commands
      .importFromHTML(normalizedValue, { preventFocus: true })
      .finally(() => {
        requestAnimationFrame(() => {
          isImporting.current = false
        })
      })
  }, [editor, commands, normalizedValue])

  useEffect(() => {
    if (!editor) return
    const remove = editor.registerUpdateListener(() => {
      if (isImporting.current || disabled) return
      const html = commands.exportToHTML()
      if (html === lastSerialized.current) return
      lastSerialized.current = html
      onChangeRef.current(html)
    })
    return remove
  }, [editor, commands, disabled])

  const handleContainerBlur = useCallback(
    (e: FocusEvent<HTMLDivElement>) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
        onBlurRef.current?.()
      }
    },
    [],
  )

  return (
    <div
      id={id}
      aria-describedby={ariaDescribedBy}
      className={cn(
        'lex-form-richtext overflow-hidden rounded-lg border bg-transparent shadow-none transition-colors',
        invalid
          ? 'border-destructive ring-3 ring-destructive/20 dark:ring-destructive/40'
          : 'border-input has-[[data-slot=input-group-control]:focus-visible]:border-ring has-[[data-slot=input-group-control]:focus-visible]:ring-3 has-[[data-slot=input-group-control]:focus-visible]:ring-ring/50',
        disabled && 'pointer-events-none opacity-60',
      )}
      onBlur={handleContainerBlur}
    >
      <LexKitRichTextToolbar />
      <RichText
        placeholder={placeholder ?? 'Digite o conteúdo…'}
        className="lex-form-richtext-editor bg-background/80"
        classNames={{
          container: 'relative min-h-[10rem] w-full',
          contentEditable: cn(
            'lexkit-content-editable text-foreground min-h-[9rem] px-3 py-2.5 text-sm leading-relaxed outline-none',
            '[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2',
            '[&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5',
          ),
          placeholder: 'text-muted-foreground pointer-events-none select-none px-3 py-2.5 text-sm',
        }}
      />
    </div>
  )
}

export function LexKitRichTextField({
  id,
  value,
  onChange,
  onBlur,
  placeholder,
  disabled,
  invalid,
  'aria-describedby': ariaDescribedBy,
}: Readonly<{
  id: string
  value: string
  onChange: (html: string) => void
  onBlur?: () => void
  placeholder?: string
  disabled?: boolean
  invalid?: boolean
  'aria-describedby'?: string
}>) {
  return (
    <LexKitFormRichTextProvider extensions={formRichTextExtensions}>
      <LexKitRichTextFieldInner
        id={id}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        invalid={invalid}
        aria-describedby={ariaDescribedBy}
      />
    </LexKitFormRichTextProvider>
  )
}

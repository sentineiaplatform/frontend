'use client'

import * as React from 'react'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'
import { toast } from 'sonner'
import {
  AlertCircleIcon,
  BellIcon,
  BoldIcon,
  CheckCircle2Icon,
  CircleCheckIcon,
  CopyIcon,
  DownloadIcon,
  FileEditIcon,
  FileIcon,
  FileTextIcon,
  InboxIcon,
  InfoIcon,
  ItalicIcon,
  LayersIcon,
  LayoutPanelLeftIcon,
  MailIcon,
  MenuIcon,
  OctagonXIcon,
  PackageIcon,
  PaletteIcon,
  PlusIcon,
  SettingsIcon,
  ShieldIcon,
  SparklesIcon,
  Table2Icon,
  TriangleAlertIcon,
  UnderlineIcon,
  UserIcon,
} from 'lucide-react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  AspectRatio,
} from '@/components/ui/aspect-ratio'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from '@/components/ui/button-group'
import { Calendar } from '@/components/ui/calendar'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
  Combobox,
} from '@/components/ui/combobox'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@/components/ui/command'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DirectionProvider,
} from '@/components/ui/direction'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldSet,
} from '@/components/ui/field'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group'
import { Input } from '@/components/ui/input'
import {
  InputOTPGroup,
  InputOTP,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import { Kbd, KbdGroup } from '@/components/ui/kbd'
import { Label } from '@/components/ui/label'
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from '@/components/ui/menubar'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import { Slider } from '@/components/ui/slider'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Toggle } from '@/components/ui/toggle'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const chartData = [
  { mês: 'Jan', casos: 12 },
  { mês: 'Fev', casos: 19 },
  { mês: 'Mar', casos: 8 },
  { mês: 'Abr', casos: 14 },
]
const chartConfig = {
  casos: { label: 'Casos', color: 'var(--color-primary)' },
} satisfies ChartConfig

const comboboxItems = ['React', 'Vite', 'Next.js', 'Astro']

function DsSection({
  id,
  title,
  description,
  icon,
  children,
}: {
  id: string
  title: string
  description?: string
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-24 rounded-xl border bg-card p-5 shadow-sm">
      <h3 className="font-heading flex items-center gap-2.5 text-base font-semibold tracking-tight">
        {icon ? (
          <span className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg [&_svg]:size-[18px]">
            {icon}
          </span>
        ) : null}
        {title}
      </h3>
      {description ? (
        <p className="text-muted-foreground mt-2 text-sm">{description}</p>
      ) : null}
      <Separator className="my-4" />
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  )
}

export function ComponentShowcase() {
  const [calendarDate, setCalendarDate] = React.useState<Date | undefined>(
    new Date(),
  )
  const [progress, setProgress] = React.useState(33)
  const [commandOpen, setCommandOpen] = React.useState(false)
  const [collapsibleOpen, setCollapsibleOpen] = React.useState(true)

  React.useEffect(() => {
    const t = window.setInterval(() => {
      setProgress((p) => (p >= 100 ? 13 : p + 7))
    }, 1200)
    return () => window.clearInterval(t)
  }, [])

  return (
    <div className="flex flex-col gap-8">
      <nav className="rounded-lg border bg-muted/40 px-4 py-3">
        <p className="text-muted-foreground mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide">
          <PaletteIcon className="size-3.5" />
          Nesta página
        </p>
        <div className="flex flex-wrap gap-2 text-sm">
          {(
            [
              ['feedback', 'Alertas & empty', BellIcon],
              ['botoes', 'Botões & badge', SparklesIcon],
              ['forms', 'Formulários', FileEditIcon],
              ['navegacao', 'Menus & tabs', MenuIcon],
              ['sobreposicao', 'Diálogos & folhas', LayersIcon],
              ['dados', 'Tabelas & paginação', Table2Icon],
              ['misc', 'Outros', PackageIcon],
            ] as const
          ).map(([hash, label, NavIcon]) => (
            <a
              key={hash}
              href={`#ds-${hash}`}
              className="text-primary inline-flex items-center gap-1.5 rounded-md px-2 py-1 hover:bg-accent hover:no-underline"
            >
              <NavIcon className="size-3.5 opacity-80" />
              {label}
            </a>
          ))}
        </div>
      </nav>

      <DsSection
        id="ds-feedback"
        icon={<BellIcon />}
        title="Alert, Alert dialog, accordion, collapsible"
        description="Feedback e blocos expansíveis."
      >
        <div className="flex flex-col gap-3 md:flex-row md:flex-wrap">
          <Alert className="max-w-md">
            <InfoIcon />
            <AlertTitle>Informação</AlertTitle>
            <AlertDescription>
              Texto secundário do alerta padrão.
            </AlertDescription>
          </Alert>
          <Alert variant="destructive" className="max-w-md">
            <AlertCircleIcon />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>Variante destrutiva.</AlertDescription>
          </Alert>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm">
              <SettingsIcon data-icon="inline-start" />
              Abrir alert dialog
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar ação</AlertDialogTitle>
              <AlertDialogDescription>
                Exemplo de alerta modal nativo do Radix.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction>Continuar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Accordion type="single" collapsible className="max-w-lg border-b-0">
          <AccordionItem value="a">
            <AccordionTrigger>Accordion item 1</AccordionTrigger>
            <AccordionContent>
              Conteúdo do primeiro item.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="b">
            <AccordionTrigger>Accordion item 2</AccordionTrigger>
            <AccordionContent>Segundo painel.</AccordionContent>
          </AccordionItem>
        </Accordion>

        <Collapsible open={collapsibleOpen} onOpenChange={setCollapsibleOpen}>
          <div className="flex items-center gap-2">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                <LayoutPanelLeftIcon data-icon="inline-start" />
                {collapsibleOpen ? 'Fechar' : 'Abrir'} collapsible
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="text-muted-foreground mt-2 text-sm">
            Texto revelado pelo collapsible.
          </CollapsibleContent>
        </Collapsible>

        <Empty className="min-h-[140px] border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <InboxIcon />
            </EmptyMedia>
            <EmptyTitle>Nenhum item</EmptyTitle>
            <EmptyDescription>Estado vazio com Empty + EmptyHeader.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </DsSection>

      <DsSection
        id="ds-botoes"
        icon={<SparklesIcon />}
        title="Button, Button group, Badge, Toggle, Kbd"
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button size="xs">xs</Button>
          <Button size="sm">sm</Button>
          <Button>
            <SparklesIcon data-icon="inline-start" />
            default
          </Button>
          <Button size="lg">
            <DownloadIcon data-icon="inline-start" />
            Baixar
          </Button>
          <Button variant="secondary">
            <UserIcon data-icon="inline-start" />
            secondary
          </Button>
          <Button variant="outline">outline</Button>
          <Button variant="ghost">ghost</Button>
          <Button variant="destructive">destructive</Button>
          <Button variant="link">link</Button>
          <Button size="icon" aria-label="Adicionar">
            <PlusIcon />
          </Button>
        </div>

        <ButtonGroup>
          <ButtonGroupText className="inline-flex items-center gap-1.5">
            <PaletteIcon className="size-3.5" />
            Grupo
          </ButtonGroupText>
          <ButtonGroupSeparator />
          <Button size="sm" variant="outline">
            Um
          </Button>
          <Button size="sm" variant="outline">
            Dois
          </Button>
        </ButtonGroup>

        <div className="flex flex-wrap gap-2">
          <Badge>
            <CheckCircle2Icon />
            default
          </Badge>
          <Badge variant="secondary">
            <UserIcon />
            secondary
          </Badge>
          <Badge variant="outline">
            <InfoIcon />
            outline
          </Badge>
          <Badge variant="destructive">
            <AlertCircleIcon />
            destructive
          </Badge>
          <Badge variant="ghost">
            <SparklesIcon />
            ghost
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Toggle aria-label="Negrito">
            <BoldIcon />
          </Toggle>
          <ToggleGroup type="single" defaultValue="a">
            <ToggleGroupItem value="a" aria-label="Itálico">
              <ItalicIcon />
            </ToggleGroupItem>
            <ToggleGroupItem value="b" aria-label="Sublinhado">
              <UnderlineIcon />
            </ToggleGroupItem>
            <ToggleGroupItem value="c" aria-label="Negrito">
              <BoldIcon />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <p className="text-muted-foreground text-sm">
          Atalho:{' '}
          <KbdGroup>
            <Kbd>Ctrl</Kbd>
            <span>+</span>
            <Kbd>K</Kbd>
          </KbdGroup>
        </p>
      </DsSection>

      <DsSection
        id="ds-forms"
        icon={<FileEditIcon />}
        title="Field, Input, Input group, Textarea, Select, Native select, Checkbox, Switch, Radio, Slider, OTP"
        description="Campos com tokens da marca."
      >
        <FieldSet>
          <Field>
            <FieldLabel htmlFor="ds-email">E-mail</FieldLabel>
            <FieldDescription>Com Field + Label + Input.</FieldDescription>
            <FieldContent>
              <Input id="ds-email" type="email" placeholder="nome@empresa.com" />
            </FieldContent>
          </Field>
        </FieldSet>

        <InputGroup className="max-w-sm">
          <InputGroupAddon>
            <MailIcon className="size-4" />
          </InputGroupAddon>
          <InputGroupInput placeholder="Input group" />
          <InputGroupAddon align="inline-end">
            <InputGroupText>@</InputGroupText>
          </InputGroupAddon>
        </InputGroup>

        <Textarea placeholder="Textarea" className="max-w-lg" />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="grid gap-2">
            <Label>Radix Select</Label>
            <Select defaultValue="one">
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Escolha" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="one">Um</SelectItem>
                <SelectItem value="two">Dois</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <NativeSelect className="w-[200px]">
            <NativeSelectOption value="x">Nativo A</NativeSelectOption>
            <NativeSelectOption value="y">Nativo B</NativeSelectOption>
          </NativeSelect>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <Checkbox id="c1" defaultChecked />
            <Label htmlFor="c1">Checkbox</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="s1" />
            <Label htmlFor="s1">Switch</Label>
          </div>
        </div>

        <RadioGroup defaultValue="1" className="flex gap-4">
          <div className="flex items-center gap-2">
            <RadioGroupItem value="1" id="r1" />
            <Label htmlFor="r1">Opção 1</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="2" id="r2" />
            <Label htmlFor="r2">Opção 2</Label>
          </div>
        </RadioGroup>

        <div className="max-w-sm space-y-2">
          <Label>Slider</Label>
          <Slider defaultValue={[40]} max={100} step={1} />
        </div>

        <div className="grid gap-2">
          <Label>OTP</Label>
          <InputOTP maxLength={6}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <div className="grid max-w-md gap-2">
          <Label>Combobox (Base UI)</Label>
          <Combobox items={comboboxItems}>
            <ComboboxInput placeholder="Stack…" className="w-full" />
            <ComboboxContent>
              <ComboboxEmpty>Nada encontrado.</ComboboxEmpty>
              <ComboboxList>
                {(item: string) => (
                  <ComboboxItem key={item} value={item}>
                    {item}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>
      </DsSection>

      <DsSection
        id="ds-navegacao"
        icon={<MenuIcon />}
        title="Tabs, Breadcrumb, Menubar, Dropdown, Navigation menu, Context menu, Tooltip, Hover card, Popover"
      >
        <Tabs defaultValue="1" className="max-w-md">
          <TabsList>
            <TabsTrigger value="1">Lista</TabsTrigger>
            <TabsTrigger value="2">Outra</TabsTrigger>
          </TabsList>
          <TabsContent value="1" className="text-sm">
            Conteúdo da primeira aba.
          </TabsContent>
          <TabsContent value="2" className="text-sm">
            Segunda aba.
          </TabsContent>
        </Tabs>

        <Tabs defaultValue="1" className="max-w-md">
          <TabsList variant="line">
            <TabsTrigger value="1">Linha</TabsTrigger>
            <TabsTrigger value="2">Estilo line</TabsTrigger>
          </TabsList>
          <TabsContent value="1" className="text-sm">
            Tabs com variant line.
          </TabsContent>
        </Tabs>

        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#" className="inline-flex items-center gap-1">
                <ShieldIcon className="size-3.5" />
                Início
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Design system</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>Arquivo</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>
                <FileIcon className="size-4" />
                Novo
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem variant="destructive">Sair</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>Editar</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>Desfazer</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>

        <div className="flex flex-wrap gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Dropdown
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel className="inline-flex items-center gap-2">
                <UserIcon className="size-4" />
                Conta
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2">
                <SettingsIcon className="size-4" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" className="gap-2">
                <OctagonXIcon className="size-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                Popover
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 text-sm">
              Conte útil no popover.
            </PopoverContent>
          </Popover>

          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="link" size="sm" className="h-auto p-0">
                Hover card
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-64 text-sm">
              Preview ao passar o mouse.
            </HoverCardContent>
          </HoverCard>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="secondary" size="sm">
                Tooltip
              </Button>
            </TooltipTrigger>
            <TooltipContent>Dica rápida</TooltipContent>
          </Tooltip>
        </div>

        <NavigationMenu viewport={false}>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Produto</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="p-2">
                  <li>
                    <NavigationMenuLink href="#">Denúncias</NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink href="#">Relatórios</NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="#">Contato</NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <ContextMenu>
          <ContextMenuTrigger className="bg-muted/50 flex h-20 max-w-xs items-center justify-center rounded-lg border border-dashed text-sm">
            Clique com o botão direito aqui
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem className="gap-2">
              <CopyIcon className="size-4" />
              Copiar
            </ContextMenuItem>
            <ContextMenuItem className="gap-2">
              <FileEditIcon className="size-4" />
              Colar
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>

        <DirectionProvider dir="rtl">
          <p className="text-muted-foreground text-sm">
            DirectionProvider (RTL): النص من اليمين — exemplo de direção.
          </p>
        </DirectionProvider>
      </DsSection>

      <DsSection
        id="ds-sobreposicao"
        icon={<LayersIcon />}
        title="Dialog, Sheet, Drawer, Command palette, Calendar"
      >
        <div className="flex flex-wrap gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <InfoIcon data-icon="inline-start" />
                Dialog
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Título</DialogTitle>
                <DialogDescription>Descrição do modal.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button type="button" size="sm">
                  OK
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <LayoutPanelLeftIcon data-icon="inline-start" />
                Sheet
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Painel lateral</SheetTitle>
                <SheetDescription>Conteúdo do sheet.</SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>

          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="outline" size="sm">
                <LayersIcon data-icon="inline-start" />
                Drawer
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Gaveta</DrawerTitle>
                <DrawerDescription>Mobile-friendly (Vaul).</DrawerDescription>
              </DrawerHeader>
              <DrawerFooter>
                <DrawerClose asChild>
                  <Button variant="outline" size="sm">
                    Fechar
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>

          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => setCommandOpen(true)}
          >
            <SparklesIcon data-icon="inline-start" />
            Command
          </Button>
        </div>

        <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
          <Command>
            <CommandInput placeholder="Buscar comando…" />
            <CommandList>
              <CommandEmpty>Nenhum resultado.</CommandEmpty>
              <CommandGroup heading="Sugestões">
                <CommandItem onSelect={() => setCommandOpen(false)}>
                  Nova denúncia
                  <CommandShortcut>⌘N</CommandShortcut>
                </CommandItem>
                <CommandItem onSelect={() => setCommandOpen(false)}>
                  Relatórios
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </CommandDialog>

        <div className="flex justify-start">
          <Calendar
            mode="single"
            selected={calendarDate}
            onSelect={setCalendarDate}
            className="rounded-lg border"
          />
        </div>
      </DsSection>

      <DsSection id="ds-dados" icon={<Table2Icon />} title="Table, Pagination, Chart, Item list, Card">
        <div className="rounded-md border">
          <Table>
            <TableCaption>Resumo de denúncias (exemplo).</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-xs">#1042</TableCell>
                <TableCell>
                  <Badge variant="secondary">Aberto</Badge>
                </TableCell>
                <TableCell className="text-right">28/04/2026</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">#1041</TableCell>
                <TableCell>
                  <Badge variant="outline">Em análise</Badge>
                </TableCell>
                <TableCell className="text-right">27/04/2026</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                1
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">2</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>

        <ChartContainer config={chartConfig} className="h-[200px] w-full max-w-md">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="mês"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="casos" fill="var(--color-primary)" radius={4} />
          </BarChart>
        </ChartContainer>

        <ItemGroup className="max-w-md">
          <Item variant="outline">
            <ItemMedia variant="icon">
              <FileIcon />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Documento</ItemTitle>
              <ItemDescription>Linha com Item + media + content.</ItemDescription>
            </ItemContent>
          </Item>
        </ItemGroup>

        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PackageIcon className="text-primary size-5" />
              Card
            </CardTitle>
            <CardDescription>Descrição do card.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm">Área de conteúdo.</CardContent>
          <CardFooter>
            <Button size="sm">
              <SparklesIcon data-icon="inline-start" />
              Ação
            </Button>
          </CardFooter>
        </Card>
      </DsSection>

      <DsSection
        id="ds-misc"
        icon={<PackageIcon />}
        title="Avatar, Aspect ratio, Separator, Scroll area, Resizable, Carousel, Progress, Spinner, Skeleton, Sidebar, Toaster (Sonner)"
      >
        <div className="flex flex-wrap items-center gap-4">
          <Avatar>
            <AvatarImage src="" alt="" />
            <AvatarFallback>SIA</AvatarFallback>
          </Avatar>
          <Avatar className="size-14">
            <AvatarFallback className="text-lg">IA</AvatarFallback>
          </Avatar>
        </div>

        <div className="max-w-xs">
          <AspectRatio ratio={16 / 9}>
            <div className="bg-muted flex size-full items-center justify-center rounded-md text-xs">
              16:9
            </div>
          </AspectRatio>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span>Antes</span>
          <Separator orientation="vertical" className="h-4" />
          <span>Depois</span>
        </div>

        <ScrollArea className="h-24 w-full max-w-sm rounded-md border p-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <p key={i} className="text-muted-foreground text-sm">
              Linha {i + 1} — scroll vertical.
            </p>
          ))}
        </ScrollArea>

        <ResizablePanelGroup orientation="horizontal" className="max-w-lg rounded-lg border">
          <ResizablePanel defaultSize={45} minSize={20}>
            <div className="flex h-24 items-center justify-center p-2 text-sm">
              Painel A
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={55}>
            <div className="flex h-24 items-center justify-center p-2 text-sm">
              Painel B
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>

        <div className="relative max-w-md px-10">
          <Carousel className="w-full">
            <CarouselContent>
              {['Slide 1', 'Slide 2', 'Slide 3'].map((s) => (
                <CarouselItem key={s}>
                  <div className="bg-muted flex h-24 items-center justify-center rounded-lg border">
                    {s}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-1" />
            <CarouselNext className="right-1" />
          </Carousel>
        </div>

        <div className="max-w-sm space-y-2">
          <Label>Progress ({progress}%)</Label>
          <Progress value={progress} />
        </div>

        <div className="flex items-center gap-3">
          <Spinner />
          <span className="text-muted-foreground text-sm">Spinner</span>
        </div>

        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-full max-w-xs" />
          <Skeleton className="h-4 w-2/3 max-w-xs" />
        </div>

        <SidebarProvider className="flex min-h-[200px] gap-0 overflow-hidden rounded-xl border">
          <Sidebar collapsible="none" className="border-r">
            <SidebarHeader className="p-2 text-xs font-medium">
              Sidebar
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton className="gap-2">
                    <ShieldIcon className="size-4" />
                    Compliance
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton className="gap-2">
                    <FileTextIcon className="size-4" />
                    Denúncias
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
          <SidebarInset className="flex flex-1 items-center justify-center bg-muted/30 p-4">
            <span className="text-muted-foreground text-sm">SidebarInset</span>
          </SidebarInset>
        </SidebarProvider>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Button
            size="sm"
            type="button"
            variant="outline"
            className="border-emerald-200 bg-emerald-50/50 text-emerald-900 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-100"
            onClick={() =>
              toast.success('Operação concluída', {
                description: 'Os dados foram salvos com sucesso.',
              })
            }
          >
            <CircleCheckIcon data-icon="inline-start" />
            Sucesso
          </Button>
          <Button
            size="sm"
            type="button"
            variant="outline"
            className="border-red-200 bg-red-50/50 text-red-900 hover:bg-red-100 dark:border-red-800 dark:bg-red-950/30 dark:text-red-100"
            onClick={() =>
              toast.error('Falha na operação', {
                description: 'Não foi possível concluir o envio.',
              })
            }
          >
            <OctagonXIcon data-icon="inline-start" />
            Erro
          </Button>
          <Button
            size="sm"
            type="button"
            variant="outline"
            className="border-amber-200 bg-amber-50/50 text-amber-950 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100"
            onClick={() =>
              toast.warning('Atenção necessária', {
                description: 'Revise os campos antes de continuar.',
              })
            }
          >
            <TriangleAlertIcon data-icon="inline-start" />
            Aviso
          </Button>
          <Button
            size="sm"
            type="button"
            variant="outline"
            className="border-sky-200 bg-sky-50/50 text-sky-950 hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/30 dark:text-sky-100"
            onClick={() =>
              toast.info('Informação', {
                description: 'Nova atualização disponível no sistema.',
              })
            }
          >
            <InfoIcon data-icon="inline-start" />
            Info
          </Button>
        </div>
      </DsSection>
    </div>
  )
}

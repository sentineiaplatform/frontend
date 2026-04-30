import '@xyflow/react/dist/style.css'
import '@/pages/dados-mestres/workflows/workflow-flow.css'

import {
  Background,
  BackgroundVariant,
  ConnectionLineType,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  type ColorMode,
  type DefaultEdgeOptions,
  type OnConnect,
  type OnEdgesChange,
  type OnNodesChange,
  type OnReconnect,
  type OnSelectionChangeFunc,
} from '@xyflow/react'
import { useTheme } from 'next-themes'
import { useCallback, useMemo } from 'react'

import { useWorkflowEditor } from '@/pages/dados-mestres/workflows/workflow-editor-store'
import { StatusNode } from '@/pages/dados-mestres/workflows/components/nodes/StatusNode'
import type { WfEdge, WfNode } from '@/pages/dados-mestres/workflows/workflow-mocks'
import { useWorkflowEdgePalette } from '@/pages/dados-mestres/workflows/use-workflow-edge-palette'

const CANVAS_HEIGHT_CLASS = 'h-[min(520px,calc(100dvh-13rem))] min-h-[320px] w-full'

export function WorkflowCanvas() {
  const { state, dispatch } = useWorkflowEditor()
  const edgePalette = useWorkflowEdgePalette()
  const { resolvedTheme } = useTheme()

  const colorMode = useMemo((): ColorMode => {
    if (resolvedTheme === 'dark') return 'dark'
    return 'light'
  }, [resolvedTheme])

  const defaultEdgeOptions = useMemo(
    () =>
      ({
        type: 'default',
        animated: false,
        reconnectable: true,
        style: {
          strokeWidth: 1.75,
          opacity: 1,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: edgePalette.marker,
          width: 12,
          height: 12,
        },
        labelStyle: {
          fill: 'var(--color-muted-foreground)',
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: '0.02em',
        },
        labelShowBg: true,
        labelBgStyle: {
          fill: 'var(--color-card)',
          stroke: 'var(--color-border)',
          strokeWidth: 1,
          opacity: 0.98,
        },
        labelBgPadding: [5, 3] as [number, number],
        interactionWidth: 24,
      }) satisfies DefaultEdgeOptions,
    [edgePalette.marker],
  )

  const nodeTypes = useMemo(() => ({ statusNode: StatusNode }), [])
  const showMiniMap = state.nodes.length > 1

  const onNodesChange: OnNodesChange<WfNode> = useCallback(
    (changes) => dispatch({ type: 'nodesChange', changes }),
    [dispatch],
  )

  const onEdgesChange: OnEdgesChange<WfEdge> = useCallback(
    (changes) => dispatch({ type: 'edgesChange', changes }),
    [dispatch],
  )

  const onConnect: OnConnect = useCallback(
    (connection) => dispatch({ type: 'connect', connection }),
    [dispatch],
  )

  const onSelectionChange: OnSelectionChangeFunc = useCallback(
    ({ nodes: ns, edges: es }) => {
      dispatch({
        type: 'selection',
        nodeIds: ns.map((n) => n.id),
        edgeIds: es.map((e) => e.id),
      })
    },
    [dispatch],
  )

  const onPaneClick = useCallback(() => {
    dispatch({ type: 'selection', nodeIds: [], edgeIds: [] })
  }, [dispatch])

  const onReconnect = useCallback<OnReconnect<WfEdge>>(
    (oldEdge, newConnection) => {
      dispatch({ type: 'reconnect', oldEdge, newConnection })
    },
    [dispatch],
  )

  return (
    <div className={CANVAS_HEIGHT_CLASS}>
      <div className="relative h-full w-full overflow-hidden rounded-2xl border border-zinc-200/80 bg-[var(--wf-n8n-canvas)] shadow-[inset_0_1px_0_oklch(1_0_0/0.65)] dark:border-zinc-700/80 dark:shadow-[inset_0_1px_0_oklch(1_0_0/0.04)]">
        <div className="workflow-flow-theme h-full w-full min-h-0">
          <ReactFlow
            colorMode={colorMode}
            nodes={state.nodes}
            edges={state.edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onReconnect={onReconnect}
            onSelectionChange={onSelectionChange}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            connectionLineType={ConnectionLineType.Bezier}
            edgesReconnectable
            reconnectRadius={18}
            fitView
            fitViewOptions={{ padding: 0.14 }}
            minZoom={0.25}
            maxZoom={1.6}
            deleteKeyCode={['Backspace', 'Delete']}
            proOptions={{ hideAttribution: true }}
            elevateEdgesOnSelect
            className="workflow-n8n-surface h-full w-full touch-none"
            connectionLineStyle={{ strokeWidth: 2, opacity: 0.75 }}
            aria-label="Diagrama do fluxo"
          >
            <Background
              id="wf-n8n-dots"
              variant={BackgroundVariant.Dots}
              gap={18}
              size={1.15}
              className="opacity-[0.55] dark:opacity-[0.45]"
              color="var(--wf-n8n-dot)"
            />
            <Controls
              showInteractive={false}
              className="m-3 overflow-hidden [&_button]:h-8 [&_button]:w-8 [&_button]:min-h-8 [&_button]:min-w-8 [&_button]:border-0 [&_button]:bg-transparent [&_button]:text-zinc-500 [&_button:hover]:bg-zinc-100 [&_button:hover]:text-zinc-900 dark:[&_button]:text-zinc-400 dark:[&_button:hover]:bg-zinc-800 dark:[&_button:hover]:text-zinc-100"
              aria-label="Zoom"
            />
            {showMiniMap ? (
              <MiniMap
                className="!m-3 !overflow-hidden !shadow-md"
                nodeColor={() => 'var(--color-primary)'}
                maskColor="oklch(0.2 0.03 264 / 0.12)"
                nodeStrokeWidth={0}
                zoomable
                pannable
                aria-label="Mapa"
              />
            ) : null}
          </ReactFlow>
        </div>
      </div>
    </div>
  )
}

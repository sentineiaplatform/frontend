import { useLayoutEffect, useState } from 'react'

/**
 * Cor do marcador (ponta) em oklch literal — SVG `<marker>` não herda bem `var()` do tema.
 * O traço usa `--wf-n8n-wire` em CSS (estilo n8n: fio neutro).
 */
export type WorkflowEdgePalette = { marker: string }

function readPalette(): WorkflowEdgePalette {
  if (typeof document === 'undefined') {
    return { marker: 'oklch(0.48 0.02 264)' }
  }
  const dark = document.documentElement.classList.contains('dark')
  if (dark) {
    return { marker: 'oklch(0.62 0.02 264)' }
  }
  return { marker: 'oklch(0.48 0.02 264)' }
}

export function useWorkflowEdgePalette(): WorkflowEdgePalette {
  const [palette, setPalette] = useState<WorkflowEdgePalette>(readPalette)

  useLayoutEffect(() => {
    setPalette(readPalette())
    const obs = new MutationObserver(() => setPalette(readPalette()))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])

  return palette
}

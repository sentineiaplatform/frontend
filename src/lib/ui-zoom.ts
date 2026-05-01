import { CONFIG_GERAL_STORAGE_KEY } from '@/pages/configuracoes/timezone-opcoes'

/** Percentuais permitidos para escala da interface (zoom no `documentElement`). */
export const UI_ZOOM_ALLOWED = [90, 100, 110, 125] as const
export type UiZoomPercent = (typeof UI_ZOOM_ALLOWED)[number]

export const UI_ZOOM_OPCOES: { value: `${UiZoomPercent}`; label: string }[] = [
  { value: '90', label: '90% — menor' },
  { value: '100', label: '100% — padrão' },
  { value: '110', label: '110% — maior' },
  { value: '125', label: '125% — bem maior' },
]

function parseStoredZoom(raw: string | null): UiZoomPercent {
  if (!raw) return 100
  try {
    const data = JSON.parse(raw) as { uiZoom?: unknown }
    const n = Number(data.uiZoom)
    if (UI_ZOOM_ALLOWED.includes(n as UiZoomPercent)) return n as UiZoomPercent
  } catch {
    /* ignore */
  }
  return 100
}

export function readStoredUiZoomPercent(): UiZoomPercent {
  try {
    return parseStoredZoom(localStorage.getItem(CONFIG_GERAL_STORAGE_KEY))
  } catch {
    return 100
  }
}

/** Avança ou recua um degrau na escala (90 → 100 → 110 → 125). */
export function stepUiZoomPercent(
  current: UiZoomPercent,
  delta: -1 | 1,
): UiZoomPercent {
  let i = UI_ZOOM_ALLOWED.indexOf(current)
  if (i < 0) i = 1
  const next = Math.min(UI_ZOOM_ALLOWED.length - 1, Math.max(0, i + delta))
  return UI_ZOOM_ALLOWED[next]
}

/** Aplica zoom na raiz do documento (afeta toda a SPA). */
export function applyUiZoomPercent(percent: UiZoomPercent) {
  const el = document.documentElement
  if (percent === 100) {
    el.style.removeProperty('zoom')
    return
  }
  el.style.zoom = String(percent / 100)
}

export function syncUiZoomFromGeralStorage() {
  applyUiZoomPercent(readStoredUiZoomPercent())
}

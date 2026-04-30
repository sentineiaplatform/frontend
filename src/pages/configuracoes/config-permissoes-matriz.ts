import { z } from 'zod'

import { iterKeys, type MatrizPermissoes } from '@/pages/configuracoes/permissoes-modulos'

export const PERMISSOES_MATRIZ_STORAGE_KEY = 'sentineia:permissoesMatriz'

const rowSchema = z.record(z.string(), z.boolean())
const matrizSchema = z.record(z.string(), rowSchema)

export function loadMatrizSalva(): MatrizPermissoes | null {
  try {
    const raw = localStorage.getItem(PERMISSOES_MATRIZ_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    const ok = matrizSchema.safeParse(parsed)
    if (!ok.success) return null
    const keys = new Set(iterKeys())
    const filtered: MatrizPermissoes = {}
    for (const k of keys) {
      if (ok.data[k]) filtered[k] = { ...ok.data[k] }
    }
    return filtered
  } catch {
    return null
  }
}

export function saveMatrizSalva(m: MatrizPermissoes): void {
  localStorage.setItem(PERMISSOES_MATRIZ_STORAGE_KEY, JSON.stringify(m))
}

export function clearMatrizSalva(): void {
  localStorage.removeItem(PERMISSOES_MATRIZ_STORAGE_KEY)
}

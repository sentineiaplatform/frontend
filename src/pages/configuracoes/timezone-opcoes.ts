/** Opções de fuso compartilhadas entre Configurações gerais e leituras de rótulo. */

export const TIMEZONE_OPCOES = [
  { value: 'America/Sao_Paulo', label: 'Brasília (GMT-3)' },
  { value: 'America/Manaus', label: 'Manaus (GMT-4)' },
  { value: 'America/Belem', label: 'Belém (GMT-3)' },
  { value: 'UTC', label: 'UTC' },
] as const

export const CONFIG_GERAL_STORAGE_KEY = 'sentineia:configuracoesGeral'

export function labelFusoFromStorage(): string {
  try {
    const raw = localStorage.getItem(CONFIG_GERAL_STORAGE_KEY)
    if (!raw) return TIMEZONE_OPCOES[0].label
    const tz = (JSON.parse(raw) as { defaultTimezone?: string }).defaultTimezone
    if (!tz) return TIMEZONE_OPCOES[0].label
    return (
      TIMEZONE_OPCOES.find((z) => z.value === tz)?.label ??
      TIMEZONE_OPCOES[0].label
    )
  } catch {
    return TIMEZONE_OPCOES[0].label
  }
}

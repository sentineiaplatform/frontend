import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  addPerfil,
  ensurePerfisSeed,
  removePerfil,
  type ConfigPerfil,
} from '@/pages/configuracoes/config-perfis'

export function useConfigPerfis() {
  const [perfis, setPerfis] = useState<ConfigPerfil[]>(() => ensurePerfisSeed())

  useEffect(() => {
    const sync = () => setPerfis(ensurePerfisSeed())
    window.addEventListener('sentineia:perfis-changed', sync)
    return () => window.removeEventListener('sentineia:perfis-changed', sync)
  }, [])

  const refresh = useCallback(() => {
    setPerfis(ensurePerfisSeed())
  }, [])

  const criar = useCallback((nome: string, descricao: string) => {
    const next = addPerfil(nome, descricao)
    setPerfis(next)
  }, [])

  const remover = useCallback((id: string) => {
    const next = removePerfil(id)
    if (next) setPerfis(next)
    return Boolean(next)
  }, [])

  const ids = useMemo(() => perfis.map((p) => p.id), [perfis])

  return { perfis, ids, refresh, criar, remover }
}

import { useCallback, useEffect, useMemo, useState } from 'react'

import { AuthRequestError } from '@/services/auth/types'
import {
  createPerfil,
  deletePerfil,
  fetchPerfisList,
  mapPerfilDtoToConfig,
  type ConfigPerfil,
} from '@/services/perfil-service'

export function useConfigPerfis() {
  const [perfis, setPerfis] = useState<ConfigPerfil[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const fetchList = useCallback(async (options?: { showSpinner?: boolean }) => {
    const showSpinner = options?.showSpinner !== false
    if (showSpinner) setLoading(true)
    setLoadError(null)
    try {
      const list = await fetchPerfisList()
      setPerfis(list.map(mapPerfilDtoToConfig))
    } catch (e) {
      setPerfis([])
      setLoadError(
        e instanceof AuthRequestError ? e.message : 'Não foi possível carregar os perfis.',
      )
    } finally {
      if (showSpinner) setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchList({ showSpinner: true })
  }, [fetchList])

  const refresh = useCallback(() => {
    void fetchList({ showSpinner: true })
  }, [fetchList])

  const criar = useCallback(
    async (nome: string, descricao: string) => {
      const trimmedDesc = descricao.trim()
      await createPerfil({
        name: nome.trim(),
        ...(trimmedDesc !== '' ? { description: trimmedDesc } : {}),
      })
      await fetchList({ showSpinner: false })
    },
    [fetchList],
  )

  const remover = useCallback(
    async (id: string) => {
      await deletePerfil(id)
      await fetchList({ showSpinner: false })
    },
    [fetchList],
  )

  const ids = useMemo(() => perfis.map((p) => p.id), [perfis])

  return { perfis, ids, loading, loadError, refresh, criar, remover }
}

import { useCallback, useEffect, useMemo, useState } from 'react'
import { defaultEmissionsService } from '../services'
import { CATEGORIES, type Category, type Emission, type EmissionsService, type NewEmission } from '../types/emission'

const toMessage = (e: unknown): string => (e instanceof Error ? e.message : 'Ocurrió un error inesperado.')

/**
 * Lógica del dashboard: carga, inserción y errores.
 * Recibe el servicio por parámetro (Supabase o simulado) para poder probarlo.
 */
export function useEmissions(service: EmissionsService = defaultEmissionsService) {
  const [emissions, setEmissions] = useState<Emission[]>([])
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    service
      .list()
      .then((data) => !cancelled && setEmissions(data))
      .catch((e: unknown) => !cancelled && setError(toMessage(e)))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [service])

  /** Devuelve true si se guardó. Usa actualización funcional: dos altas simultáneas no se pisan. */
  const addEmission = useCallback(
    async (input: NewEmission): Promise<boolean> => {
      setError(null)
      setPending((n) => n + 1)
      try {
        const created = await service.create(input)
        setEmissions((prev) => [created, ...prev])
        return true
      } catch (e) {
        setError(toMessage(e))
        return false
      } finally {
        setPending((n) => n - 1)
      }
    },
    [service],
  )

  const dismissError = useCallback(() => setError(null), [])

  // Derivados memoizados: solo se recalculan cuando cambia la lista.
  const totalKg = useMemo(() => emissions.reduce((sum, e) => sum + e.co2Kg, 0), [emissions])
  const totalsByCategory = useMemo(() => {
    const totals = Object.fromEntries(CATEGORIES.map((c) => [c, 0])) as Record<Category, number>
    for (const e of emissions) totals[e.category] += e.co2Kg
    return totals
  }, [emissions])

  return {
    emissions,
    loading,
    saving: pending > 0,
    error,
    totalKg,
    totalsByCategory,
    addEmission,
    dismissError,
  }
}

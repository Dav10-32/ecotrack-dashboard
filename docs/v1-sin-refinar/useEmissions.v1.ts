import { useEffect, useState } from 'react'
import { defaultEmissionsService } from '../services'
import type { Emission, EmissionsService, NewEmission } from '../types/emission'

export function useEmissions(service: EmissionsService = defaultEmissionsService) {
  const [emissions, setEmissions] = useState<Emission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    service
      .list()
      .then(setEmissions)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [service])

  const addEmission = async (input: NewEmission) => {
    try {
      const created = await service.create(input)
      setEmissions([created, ...emissions])
    } catch (e) {
      setError((e as Error).message)
    }
  }

  return { emissions, loading, error, addEmission }
}

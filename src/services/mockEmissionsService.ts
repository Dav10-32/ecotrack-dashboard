import type { Emission, EmissionsService, NewEmission } from '../types/emission'

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

const seed = (): Emission[] => [
  { id: 's1', source: 'Flota de reparto', category: 'Transporte', co2Kg: 1280.5, createdAt: '2026-11-10T09:00:00Z' },
  { id: 's2', source: 'Oficina principal (electricidad)', category: 'Energía', co2Kg: 642.25, createdAt: '2026-11-09T09:00:00Z' },
  { id: 's3', source: 'Residuos orgánicos', category: 'Residuos', co2Kg: 215, createdAt: '2026-11-08T09:00:00Z' },
]

/** Datos simulados en memoria, con latencia, para demo y desarrollo sin Supabase. */
export function createMockEmissionsService(latencyMs = 400): EmissionsService {
  let rows = seed()
  return {
    async list() {
      await wait(latencyMs)
      return [...rows]
    },
    async create(input: NewEmission) {
      await wait(latencyMs)
      const created: Emission = { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
      rows = [created, ...rows]
      return created
    },
  }
}

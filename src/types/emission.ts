export const CATEGORIES = ['Transporte', 'Energía', 'Residuos'] as const

export type Category = (typeof CATEGORIES)[number]

/** Medición de emisiones (modelo de dominio que consume la UI). */
export interface Emission {
  id: string
  source: string
  category: Category
  co2Kg: number
  createdAt: string
}

export type NewEmission = Pick<Emission, 'source' | 'category' | 'co2Kg'>

/** Contrato que cumplen tanto el servicio de Supabase como el simulado. */
export interface EmissionsService {
  list(): Promise<Emission[]>
  create(input: NewEmission): Promise<Emission>
}

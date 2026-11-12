import type { Category, Emission, EmissionsService, NewEmission } from '../types/emission'
import { supabase } from '../lib/supabase'

const TABLE = 'emisiones'

interface Row {
  id: string
  fuente: string
  categoria: Category
  co2_kg: number
  created_at: string
}

const toDomain = (r: Row): Emission => ({
  id: r.id,
  source: r.fuente,
  category: r.categoria,
  co2Kg: Number(r.co2_kg),
  createdAt: r.created_at,
})

function client() {
  if (!supabase) throw new Error('Supabase no está configurado.')
  return supabase
}

export const supabaseEmissionsService: EmissionsService = {
  async list() {
    const { data, error } = await client().from(TABLE).select('*').order('created_at', { ascending: false })
    if (error) throw new Error('No se pudieron cargar las mediciones.')
    return (data as Row[]).map(toDomain)
  },
  async create(input: NewEmission) {
    const { data, error } = await client()
      .from(TABLE)
      .insert({ fuente: input.source, categoria: input.category, co2_kg: input.co2Kg })
      .select()
      .single()
    if (error) throw new Error('No se pudo guardar la medición.')
    return toDomain(data as Row)
  },
}

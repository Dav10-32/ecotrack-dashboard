import { isSupabaseConfigured } from '../lib/supabase'
import { createMockEmissionsService } from './mockEmissionsService'
import { supabaseEmissionsService } from './supabaseEmissionsService'

/** Servicio por defecto: Supabase si hay credenciales; si no, datos simulados. */
export const defaultEmissionsService = isSupabaseConfigured
  ? supabaseEmissionsService
  : createMockEmissionsService()

# 🌱 EcoTrack – Dashboard de Emisiones

Componente `EmissionsTracker` (React + TypeScript estricto + Tailwind 4) con el hook `useEmissions` y Supabase.

## Ejecutar
```bash
npm install
npm run dev          # sin .env usa datos simulados ("Modo demo")
npm test             # 13 pruebas (Vitest + Testing Library)
npm run build        # tsc estricto + build
```

## Conectar Supabase (opcional)
1. `cp .env.example .env` y completa `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
2. Crea la tabla con `supabase/emisiones.sql` (si el backend ya la tiene, ajusta los nombres en `src/services/supabaseEmissionsService.ts`).

## Dónde está cada cosa
| Archivo | Rol |
|---|---|
| `src/components/EmissionsTracker.tsx` | Orquesta la pantalla |
| `src/components/EmissionCard.tsx` · `EmissionForm.tsx` | Tarjeta (memo) y formulario con validación |
| `src/hooks/useEmissions.ts` | Lógica: carga, inserción, errores, totales (`useMemo`) |
| `src/services/` | Supabase real y simulado, misma interfaz |
| `src/lib/supabase.ts` | Cliente de Supabase |
| `docs/` | Bitácora de prompts, v1 sin refinar y capturas |

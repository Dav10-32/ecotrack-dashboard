# Bitácora de Prompts – EmissionsTracker (Spec-to-Code)

**Spec:** tarjetas (fuente, categoría Transporte/Energía/Residuos, CO₂) · formulario para agregar · hook `useEmissions` (loading, inserción, errores) con Supabase · Tailwind.
**Stack:** React 19 + Vite + TypeScript estricto + Tailwind 4 + Supabase + Vitest.

## Prompt 1 – Estructura
```
Actúa como Arquitecto Frontend. Con React+TypeScript, diseña la arquitectura para un
"EmissionsTracker" (tarjetas fuente/categoría/CO2 + formulario + hook useEmissions sobre Supabase).
Separa UI, lógica y datos; el acceso a Supabase debe quedar detrás de una interfaz para poder
simularlo. Entrega: árbol de archivos, responsabilidad de cada uno y tipos.
```
**Resultado:** `EmissionsTracker.tsx` (UI) · `hooks/useEmissions.ts` (lógica) · `services/` (Supabase real + simulado, misma interfaz `EmissionsService`) · `types/emission.ts`. La UI nunca importa Supabase.

## Prompt 2 – Lógica (useEmissions) → v1
```
Escribe useEmissions(service) con estados loading y error: cargar al montar y addEmission
que inserte y actualice la lista.
```
**v1 generada** (funciona "a simple vista"):
```ts
const addEmission = async (input: NewEmission) => {
  try {
    const created = await service.create(input)
    setEmissions([created, ...emissions])          // usa el estado "viejo"
  } catch (e) { setError((e as Error).message) }   // el error nunca se limpia
}
```
**Revisión de la v1:** escribí 13 pruebas desde la spec y las ejecuté: **10 fallaron**. Sondeé la UI para confirmar las causas, no solo suponerlas:

| Defecto real encontrado | Evidencia |
|---|---|
| Dos altas simultáneas pierden una | prueba: 2 medidas en vez de 3 |
| El error sigue visible tras un éxito | prueba: `error` no es `null` |
| No existe estado `saving` | `undefined` |
| Inputs solo con placeholder, sin `<label>` | `getByLabelText` no encuentra nada |
| Guardar vacío envía `{source:"", co2Kg:0}` | sonda: se llamó a `create` |
| CO₂ negativo se acepta | sonda: `create` llamado 2 veces |
| Botón sin deshabilitar al guardar | `disabled: false` |
| Tarjetas, carga y errores sin semántica | sin `article`, `status` ni `alert` |

## Prompt 3 – Refinamiento con restricciones (derivadas de los fallos)
```
Refina useEmissions y EmissionsTracker con estas restricciones:
1. TypeScript estricto: sin any; errores como unknown con type guard.
2. Actualización funcional del estado para que dos altas simultáneas no se pisen.
3. Expón saving, limpia el error al reintentar y addEmission devuelve boolean.
4. Optimiza con useMemo (totales y totales por categoría), useCallback y React.memo en la tarjeta.
5. Accesibilidad: <label> asociado a cada campo, aria-invalid/aria-describedby, role="alert"
   en errores, role="status" en la carga, <article> por tarjeta, foco al campo tras guardar.
6. Valida (fuente 2-100 caracteres, CO₂ >= 0, acepta coma decimal) y no llames al servicio si falla.
7. Deshabilita el envío mientras se guarda.
```
**v2 generada:**
```ts
const addEmission = useCallback(async (input: NewEmission): Promise<boolean> => {
  setError(null); setPending((n) => n + 1)
  try {
    const created = await service.create(input)
    setEmissions((prev) => [created, ...prev])     // sin estado "viejo"
    return true
  } catch (e) { setError(toMessage(e)); return false }
  finally { setPending((n) => n - 1) }
}, [service])

const totalKg = useMemo(() => emissions.reduce((s, e) => s + e.co2Kg, 0), [emissions])
```
El componente se dividió en `EmissionCard` (memo), `EmissionForm` y `EmissionsTracker`.

## Prompt 4 – Diseño con Tailwind y feedback
```
Aplica Tailwind CSS profesional y responsive: cards con badge de categoría (el color no puede
ser la única señal: escribe la categoría), grid de 1 columna en móvil y 2 en escritorio,
formulario apilado en móvil, spinner de carga, mensaje de lista vacía, estados de foco visibles
y un indicador de "modo demo" cuando no hay credenciales de Supabase.
```
**Resultado:** UI de la captura; sin credenciales usa datos simulados, con credenciales usa Supabase (`VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`).

## Evolución y verificación
| | v1 | v2 |
|---|---|---|
| Pruebas (13) | 3 pasan, 10 fallan | **13 pasan** |
| Hook | estado viejo, sin `saving` | funcional, `saving`, `useMemo` |
| Accesibilidad | sin labels ni roles | labels, `alert`, `status`, `article` |
| Validación | ninguna | cliente, sin llamar al servicio |

Además: `tsc` estricto y `oxlint` sin errores; flujo probado en Chromium (carga → validación → alta → total 2.456,5 kg correcto); a 390 px no hay scroll horizontal. Capturas: `capturas/`.

**Límites:** no conecté un Supabase real (no hay credenciales); usé datos simulados. `supabase/emisiones.sql` es una tabla de referencia no ejecutada. No medí el impacto de `useMemo`/`memo`. Tiempo real (Realtime) queda como siguiente paso.

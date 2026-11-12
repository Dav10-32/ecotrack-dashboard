import { useEmissions } from '../hooks/useEmissions'
import { CATEGORIES, type EmissionsService } from '../types/emission'
import { formatKg } from '../utils/format'
import { EmissionCard } from './EmissionCard'
import { EmissionForm } from './EmissionForm'

interface Props {
  /** Opcional: inyecta otro servicio (pruebas). Por defecto Supabase o datos simulados. */
  service?: EmissionsService
}

export function EmissionsTracker({ service }: Props) {
  const { emissions, loading, saving, error, totalKg, totalsByCategory, addEmission, dismissError } = useEmissions(service)

  return (
    <section aria-labelledby="tracker-title" className="space-y-6">
      <div>
        <h2 id="tracker-title" className="text-lg font-semibold text-slate-900">Emisiones registradas</h2>
        <p aria-live="polite" className="mt-1 text-slate-700">
          Total: <strong className="tabular-nums">{formatKg(totalKg)} kg CO₂</strong>
        </p>
        <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
          {CATEGORIES.map((c) => (
            <div key={c} className="rounded-lg bg-slate-100 px-2 py-2">
              <dt className="text-xs text-slate-600">{c}</dt>
              <dd className="text-sm font-semibold tabular-nums text-slate-900">{formatKg(totalsByCategory[c])}</dd>
            </div>
          ))}
        </dl>
      </div>

      {error && (
        <div role="alert" className="flex items-start justify-between gap-3 rounded-lg border border-red-300 bg-red-50 p-3 text-red-900">
          <p>{error}</p>
          <button type="button" onClick={dismissError} className="font-medium underline focus:outline-none focus:ring-2 focus:ring-red-700">
            Cerrar
          </button>
        </div>
      )}

      <EmissionForm saving={saving} onSubmit={addEmission} />

      {loading ? (
        <div role="status" className="flex items-center gap-3 text-slate-700">
          <span aria-hidden="true" className="size-5 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-700" />
          Cargando mediciones…
        </div>
      ) : emissions.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-slate-600">Aún no hay mediciones. Agrega la primera arriba.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {emissions.map((e) => (
            <li key={e.id}>
              <EmissionCard emission={e} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

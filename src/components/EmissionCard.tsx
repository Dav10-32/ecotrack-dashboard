import { memo } from 'react'
import type { Category, Emission } from '../types/emission'
import { formatKg } from '../utils/format'

// El color ayuda, pero la categoría también se escribe: no depende solo del color.
const BADGE: Record<Category, string> = {
  Transporte: 'bg-sky-100 text-sky-900',
  Energía: 'bg-amber-100 text-amber-900',
  Residuos: 'bg-emerald-100 text-emerald-900',
}

interface Props {
  emission: Emission
}

function EmissionCardBase({ emission }: Props) {
  return (
    <article className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="min-w-0">
        <h3 className="truncate font-semibold text-slate-900">{emission.source}</h3>
        <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${BADGE[emission.category]}`}>
          {emission.category}
        </span>
      </div>
      <p className="shrink-0 text-right">
        <span className="block text-xl font-bold tabular-nums text-slate-900">{formatKg(emission.co2Kg)}</span>
        <span className="text-xs text-slate-600">kg CO₂</span>
      </p>
    </article>
  )
}

/** memo: una tarjeta no se vuelve a renderizar si su medición no cambió. */
export const EmissionCard = memo(EmissionCardBase)

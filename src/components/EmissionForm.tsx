import { useId, useRef, useState, type FormEvent } from 'react'
import { CATEGORIES, type Category, type NewEmission } from '../types/emission'

interface Props {
  saving: boolean
  onSubmit: (input: NewEmission) => Promise<boolean>
}

interface FieldErrors {
  source?: string
  co2?: string
}

/** Acepta "12,5" o "12.5". Devuelve null si no es un número válido. */
function parseKg(raw: string): number | null {
  const n = Number(raw.trim().replace(',', '.'))
  return raw.trim() !== '' && Number.isFinite(n) ? n : null
}

export function EmissionForm({ saving, onSubmit }: Props) {
  const uid = useId()
  const sourceRef = useRef<HTMLInputElement>(null)
  const [source, setSource] = useState('')
  const [category, setCategory] = useState<Category>('Transporte')
  const [co2, setCo2] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})

  const ids = { source: `${uid}-source`, category: `${uid}-category`, co2: `${uid}-co2` }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (saving) return

    const name = source.trim()
    const kg = parseKg(co2)
    const next: FieldErrors = {}
    if (name.length < 2 || name.length > 100) next.source = 'Escribe un nombre de entre 2 y 100 caracteres.'
    if (kg === null || kg < 0) next.co2 = 'Ingresa un número igual o mayor que 0.'
    setErrors(next)
    if (next.source || next.co2 || kg === null) return

    if (await onSubmit({ source: name, category, co2Kg: kg })) {
      setSource('')
      setCo2('')
      sourceRef.current?.focus()
    }
  }

  const field = 'mt-1 block w-full rounded-lg border bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600'
  const border = (bad?: string) => (bad ? 'border-red-600' : 'border-slate-300')

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-6">
      <div className="sm:col-span-3">
        <label htmlFor={ids.source} className="text-sm font-medium text-slate-800">Fuente</label>
        <input
          ref={sourceRef}
          id={ids.source}
          value={source}
          onChange={(e) => setSource(e.target.value)}
          aria-invalid={Boolean(errors.source)}
          aria-describedby={errors.source ? `${ids.source}-err` : undefined}
          placeholder="Ej. Flota de reparto"
          className={`${field} ${border(errors.source)}`}
        />
        {errors.source && <p id={`${ids.source}-err`} role="alert" className="mt-1 text-sm text-red-700">{errors.source}</p>}
      </div>

      <div className="sm:col-span-1">
        <label htmlFor={ids.category} className="text-sm font-medium text-slate-800">Categoría</label>
        <select id={ids.category} value={category} onChange={(e) => setCategory(e.target.value as Category)} className={`${field} border-slate-300`}>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div className="sm:col-span-2">
        <label htmlFor={ids.co2} className="text-sm font-medium text-slate-800">CO₂ producido (kg)</label>
        <input
          id={ids.co2}
          inputMode="decimal"
          value={co2}
          onChange={(e) => setCo2(e.target.value)}
          aria-invalid={Boolean(errors.co2)}
          aria-describedby={errors.co2 ? `${ids.co2}-err` : undefined}
          placeholder="0,00"
          className={`${field} ${border(errors.co2)}`}
        />
        {errors.co2 && <p id={`${ids.co2}-err`} role="alert" className="mt-1 text-sm text-red-700">{errors.co2}</p>}
      </div>

      <div className="sm:col-span-6">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 font-semibold text-white hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {saving && <span aria-hidden="true" className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
          {saving ? 'Guardando…' : 'Agregar medición'}
        </button>
      </div>
    </form>
  )
}

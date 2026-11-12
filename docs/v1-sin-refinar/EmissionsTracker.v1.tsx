import { useState } from 'react'
import { useEmissions } from '../hooks/useEmissions'
import type { Category, EmissionsService } from '../types/emission'

export function EmissionsTracker({ service }: { service?: EmissionsService }) {
  const { emissions, loading, error, addEmission } = useEmissions(service)
  const [source, setSource] = useState('')
  const [category, setCategory] = useState('Transporte')
  const [co2, setCo2] = useState('')

  const total = emissions.reduce((sum, e) => sum + e.co2Kg, 0)

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold">Emisiones</h1>
      <p>Total: {total} kg CO2</p>
      {error && <div className="text-red-600">{error}</div>}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          addEmission({ source, category: category as Category, co2Kg: Number(co2) })
          setSource('')
          setCo2('')
        }}
        className="flex gap-2 my-4"
      >
        <input placeholder="Fuente" value={source} onChange={(e) => setSource(e.target.value)} className="border p-2" />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="border p-2">
          <option>Transporte</option>
          <option>Energía</option>
          <option>Residuos</option>
        </select>
        <input placeholder="CO2 (kg)" value={co2} onChange={(e) => setCo2(e.target.value)} className="border p-2" />
        <button className="bg-green-600 text-white px-4">Agregar</button>
      </form>
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div className="grid gap-3">
          {emissions.map((e) => (
            <div key={e.id} className="border rounded p-3">
              <h3 className="font-semibold">{e.source}</h3>
              <span>{e.category}</span>
              <p>{e.co2Kg} kg CO2</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { Emission, EmissionsService, NewEmission } from '../types/emission'
import { useEmissions } from './useEmissions'

const base: Emission = { id: 'a', source: 'Flota', category: 'Transporte', co2Kg: 10, createdAt: '2026-01-01T00:00:00Z' }
const input = (source: string): NewEmission => ({ source, category: 'Energía', co2Kg: 5 })

function fakeService(over: Partial<EmissionsService> = {}): EmissionsService {
  let n = 0
  return {
    list: async () => [base],
    create: async (i) => ({ ...i, id: `n${++n}`, createdAt: '2026-01-02T00:00:00Z' }),
    ...over,
  }
}

describe('useEmissions', () => {
  it('carga las mediciones y apaga loading', async () => {
    const svc = fakeService()
    const { result } = renderHook(() => useEmissions(svc))
    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.emissions).toEqual([base])
  })

  it('expone un mensaje de error si falla la carga', async () => {
    const svc = fakeService({ list: async () => { throw new Error('No se pudieron cargar las mediciones.') } })
    const { result } = renderHook(() => useEmissions(svc))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('No se pudieron cargar las mediciones.')
  })

  it('agrega una medición al inicio de la lista', async () => {
    const svc = fakeService()
    const { result } = renderHook(() => useEmissions(svc))
    await waitFor(() => expect(result.current.loading).toBe(false))
    await act(async () => { await result.current.addEmission(input('Caldera')) })
    expect(result.current.emissions.map((e) => e.source)).toEqual(['Caldera', 'Flota'])
  })

  it('conserva AMBAS mediciones si se agregan dos a la vez', async () => {
    const svc = fakeService()
    const { result } = renderHook(() => useEmissions(svc))
    await waitFor(() => expect(result.current.loading).toBe(false))
    await act(async () => {
      await Promise.all([result.current.addEmission(input('Uno')), result.current.addEmission(input('Dos'))])
    })
    expect(result.current.emissions).toHaveLength(3)
  })

  it('limpia el error tras una inserción exitosa posterior', async () => {
    let fail = true
    const svc = fakeService({
      create: async (i) => {
        if (fail) throw new Error('No se pudo guardar la medición.')
        return { ...i, id: 'ok', createdAt: '2026-01-02T00:00:00Z' }
      },
    })
    const { result } = renderHook(() => useEmissions(svc))
    await waitFor(() => expect(result.current.loading).toBe(false))
    await act(async () => { await result.current.addEmission(input('X')) })
    expect(result.current.error).toBe('No se pudo guardar la medición.')
    fail = false
    await act(async () => { await result.current.addEmission(input('X')) })
    expect(result.current.error).toBeNull()
  })

  it('expone saving=true mientras se guarda', async () => {
    let release!: (e: Emission) => void
    const svc = fakeService({ create: () => new Promise<Emission>((r) => (release = r)) })
    const { result } = renderHook(() => useEmissions(svc))
    await waitFor(() => expect(result.current.loading).toBe(false))
    let pending!: Promise<unknown>
    act(() => { pending = result.current.addEmission(input('Lento')) })
    expect(result.current.saving).toBe(true)
    await act(async () => { release({ ...input('Lento'), id: 'z', createdAt: '2026-01-02T00:00:00Z' }); await pending })
    expect(result.current.saving).toBe(false)
  })
})

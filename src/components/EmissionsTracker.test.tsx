import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Emission, EmissionsService } from '../types/emission'
import { EmissionsTracker } from './EmissionsTracker'

const seed: Emission[] = [
  { id: '1', source: 'Flota de reparto', category: 'Transporte', co2Kg: 1280.5, createdAt: '2026-01-01T00:00:00Z' },
  { id: '2', source: 'Oficina', category: 'Energía', co2Kg: 600, createdAt: '2026-01-02T00:00:00Z' },
]

function svc(over: Partial<EmissionsService> = {}): EmissionsService {
  return {
    list: vi.fn(async () => seed),
    create: vi.fn(async (i) => ({ ...i, id: 'new', createdAt: '2026-01-03T00:00:00Z' })),
    ...over,
  }
}

describe('EmissionsTracker', () => {
  it('muestra tarjetas con fuente, categoría y CO2', async () => {
    render(<EmissionsTracker service={svc()} />)
    const cards = await screen.findAllByRole('article')
    expect(cards).toHaveLength(2)
    expect(within(cards[0]!).getByText('Flota de reparto')).toBeInTheDocument()
    expect(within(cards[0]!).getByText('Transporte')).toBeInTheDocument()
    expect(within(cards[0]!).getByText(/1\.280,5|1,280\.5|1280,5/)).toBeInTheDocument()
  })

  it('anuncia la carga con role="status"', async () => {
    render(<EmissionsTracker service={svc({ list: () => new Promise(() => {}) })} />)
    expect(await screen.findByRole('status')).toHaveTextContent(/cargando/i)
  })

  it('muestra los errores de carga con role="alert"', async () => {
    render(<EmissionsTracker service={svc({ list: async () => { throw new Error('No se pudieron cargar las mediciones.') } })} />)
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudieron cargar las mediciones.')
  })

  it('los campos del formulario tienen etiqueta accesible', async () => {
    render(<EmissionsTracker service={svc()} />)
    await screen.findAllByRole('article')
    expect(screen.getByLabelText(/fuente/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/categoría/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/co₂/i)).toBeInTheDocument()
  })

  it('agrega una medición y limpia el formulario', async () => {
    const user = userEvent.setup()
    const service = svc()
    render(<EmissionsTracker service={service} />)
    await screen.findAllByRole('article')
    await user.type(screen.getByLabelText(/fuente/i), 'Caldera')
    await user.selectOptions(screen.getByLabelText(/categoría/i), 'Residuos')
    await user.type(screen.getByLabelText(/co₂/i), '42')
    await user.click(screen.getByRole('button', { name: /agregar/i }))
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(3))
    expect(service.create).toHaveBeenCalledWith({ source: 'Caldera', category: 'Residuos', co2Kg: 42 })
    expect(screen.getByLabelText(/fuente/i)).toHaveValue('')
  })

  it('valida los datos y NO llama al servicio si son inválidos', async () => {
    const user = userEvent.setup()
    const service = svc()
    render(<EmissionsTracker service={service} />)
    await screen.findAllByRole('article')
    await user.click(screen.getByRole('button', { name: /agregar/i }))
    expect(await screen.findAllByRole('alert')).not.toHaveLength(0)
    await user.type(screen.getByLabelText(/fuente/i), 'Caldera')
    await user.type(screen.getByLabelText(/co₂/i), '-5')
    await user.click(screen.getByRole('button', { name: /agregar/i }))
    expect(service.create).not.toHaveBeenCalled()
  })

  it('evita el doble envío mientras se guarda', async () => {
    const user = userEvent.setup()
    const service = svc({ create: vi.fn(() => new Promise<Emission>(() => {})) })
    render(<EmissionsTracker service={service} />)
    await screen.findAllByRole('article')
    await user.type(screen.getByLabelText(/fuente/i), 'Caldera')
    await user.type(screen.getByLabelText(/co₂/i), '10')
    const btn = screen.getByRole('button', { name: /agregar/i })
    await user.click(btn)
    await user.click(btn)
    expect(service.create).toHaveBeenCalledTimes(1)
  })
})

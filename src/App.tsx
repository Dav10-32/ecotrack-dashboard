import { EmissionsTracker } from './components/EmissionsTracker'
import { isSupabaseConfigured } from './lib/supabase'

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-4">
          <h1 className="text-xl font-bold text-emerald-800">🌱 EcoTrack · Dashboard de Emisiones</h1>
          {!isSupabaseConfigured && (
            <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-800">Modo demo · datos simulados</span>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">
        <EmissionsTracker />
      </main>
    </div>
  )
}

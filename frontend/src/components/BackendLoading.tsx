import { CloudRain } from 'lucide-react'
import type { StartupProgress } from '../hooks/useBackendReady'

export function BackendLoading({ progress }: { progress: StartupProgress }) {
  const { pct, stage } = progress

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center gap-8 max-w-sm w-full">

        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-3 mb-3">
            <CloudRain className="text-blue-400" size={36} />
            <h1 className="text-3xl font-bold text-white">GuardianAI</h1>
          </div>
          <p className="text-slate-400 text-sm">Plataforma de monitoramento climático · Bahia</p>
        </div>

        {/* Progress bar */}
        <div className="w-full space-y-2">
          <div className="flex justify-between text-xs text-slate-400">
            <span className="truncate pr-2">{stage}</span>
            <span className="shrink-0 font-mono">{pct}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <p className="text-slate-600 text-xs text-center">
          Primeira inicialização leva ~3–5 minutos.<br />
          Os dados ficam em memória após isso.
        </p>
      </div>
    </div>
  )
}

import type { RiskLevel } from '../../lib/utils'
import { RISK_TEXT_COLORS } from '../../lib/utils'

interface Props {
  label: string
  value: string | number
  riskLevel?: RiskLevel
  sublabel?: string
}

export function MetricCard({ label, value, riskLevel, sublabel }: Props) {
  const colorClass = riskLevel ? RISK_TEXT_COLORS[riskLevel] : 'text-blue-400'
  return (
    <div className="bg-slate-800 rounded-xl p-5 flex flex-col gap-1">
      <p className="text-slate-400 text-sm">{label}</p>
      <p className={`text-3xl font-bold ${colorClass}`}>{value}</p>
      {sublabel && <p className="text-slate-500 text-xs">{sublabel}</p>}
    </div>
  )
}

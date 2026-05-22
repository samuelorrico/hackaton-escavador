import { Link } from 'react-router-dom'
import { RiskLevelBadge } from './RiskLevelBadge'
import type { StationRanking } from '../../types/api'
import { formatScore } from '../../lib/utils'

interface Props {
  stations: StationRanking[]
}

export function RiskRankingTable({ stations }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-slate-400 border-b border-slate-700">
            <th className="text-left py-2 pr-4">#</th>
            <th className="text-left py-2 pr-4">Estação</th>
            <th className="text-left py-2 pr-4">Cidade</th>
            <th className="text-right py-2 pr-4">Score</th>
            <th className="text-left py-2">Nível</th>
          </tr>
        </thead>
        <tbody>
          {stations.map((s, idx) => (
            <tr key={s.station_id} className="border-b border-slate-800 hover:bg-slate-800 transition-colors">
              <td className="py-2 pr-4 text-slate-500">{idx + 1}</td>
              <td className="py-2 pr-4">
                <Link
                  to={`/stations/${s.station_id}`}
                  className="text-blue-400 hover:text-blue-300 font-medium"
                >
                  {s.station_id}
                </Link>
              </td>
              <td className="py-2 pr-4 text-slate-300">{s.city}</td>
              <td className="py-2 pr-4 text-right font-mono text-white">{formatScore(s.risk_score)}</td>
              <td className="py-2">
                <RiskLevelBadge level={s.risk_level} size="sm" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

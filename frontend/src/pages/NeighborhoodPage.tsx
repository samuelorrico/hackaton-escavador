import { useParams, Link } from 'react-router-dom'
import { useApi } from '../hooks/useApi'
import { Breadcrumb } from '../components/layout/Breadcrumb'
import { RiskLevelBadge } from '../components/ui/RiskLevelBadge'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import type { CityDetail } from '../types/api'
import { formatScore } from '../lib/utils'

const ZONES = ['Zona Norte', 'Zona Sul', 'Zona Centro', 'Zona Leste', 'Zona Oeste']

function assignZone(stationId: string): string {
  const hash = stationId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return ZONES[hash % ZONES.length]
}

export function NeighborhoodPage() {
  const { citySlug, neighborhood } = useParams<{ citySlug: string; neighborhood: string }>()
  const { data: city, loading, error } = useApi<CityDetail>(citySlug ? `/cities/${citySlug}` : null)

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={`Erro: ${error}`} />
  if (!city) return null

  const neighborhoodName = neighborhood?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) ?? 'Zona'
  const zoneStations = city.stations.filter(sid => assignZone(sid) === neighborhoodName)
  const displayStations = zoneStations.length > 0 ? zoneStations : city.stations.slice(0, 3)

  return (
    <div className="space-y-6">
      <Breadcrumb crumbs={[
        { label: 'Bahia', to: '/' },
        { label: 'Cidades', to: '/cities' },
        { label: city.city, to: `/cities/${citySlug}` },
        { label: neighborhoodName },
      ]} />

      <div>
        <h1 className="text-3xl font-bold text-white">{neighborhoodName}</h1>
        <p className="text-slate-400 mt-1">{city.city} · {displayStations.length} estação(ões)</p>
      </div>

      <div className="bg-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-4 mb-2">
          <p className="text-slate-400 text-sm">Score representativo do bairro</p>
          <RiskLevelBadge level={city.dominant_risk_level} size="sm" />
        </div>
        <p className="text-4xl font-bold text-white">{formatScore(city.avg_risk_score)}<span className="text-slate-400 text-lg ml-1">/100</span></p>
      </div>

      <div className="bg-slate-800 rounded-xl p-5">
        <h2 className="text-lg font-semibold text-white mb-4">Estações</h2>
        <div className="space-y-2">
          {displayStations.map(sid => (
            <Link
              key={sid}
              to={`/stations/${sid}`}
              className="flex items-center justify-between bg-slate-700 rounded-lg px-4 py-3 hover:bg-slate-600 transition-colors"
            >
              <span className="text-blue-400 font-medium">{sid}</span>
              <span className="text-slate-400 text-sm">Ver detalhes →</span>
            </Link>
          ))}
        </div>
      </div>

      <Link to={`/cities/${citySlug}`} className="text-slate-400 hover:text-white text-sm">
        ← Voltar para {city.city}
      </Link>
    </div>
  )
}

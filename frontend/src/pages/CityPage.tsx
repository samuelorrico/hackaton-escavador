import { useParams, Link } from 'react-router-dom'
import { MapPin, Building2, TrendingUp } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { Breadcrumb } from '../components/layout/Breadcrumb'
import { RiskLevelBadge } from '../components/ui/RiskLevelBadge'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { Card, SectionHeader } from '../components/ui/Card'
import type { CityDetail, CityListItem } from '../types/api'
import { formatScore } from '../lib/utils'

function CityList() {
  const { data: cities, loading, error } = useApi<CityListItem[]>('/cities')
  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={`Erro: ${error}`} />
  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb crumbs={[{ label: 'Bahia', to: '/' }, { label: 'Cidades' }]} />
        <div className="flex items-center gap-3 mt-2">
          <Building2 size={22} className="text-blue-400" />
          <h1 className="text-2xl font-bold text-white">Cidades da Bahia</h1>
        </div>
        <p className="text-slate-400 text-sm mt-1">{cities?.length ?? 0} cidades monitoradas · estações INMET 2000–2021</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {cities?.map(city => (
          <Link
            key={city.city}
            to={`/cities/${city.city.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-')}`}
          >
            <Card className="hover:bg-slate-700/60 transition-colors h-full">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-white font-semibold">{city.city}</p>
                  <p className="text-slate-500 text-xs">{city.station_count} estação(ões)</p>
                </div>
                <RiskLevelBadge level={city.max_risk_level} size="sm" />
              </div>
              <div className="flex items-center gap-1 text-slate-400 text-xs">
                <TrendingUp size={11} />
                <span>Score médio: <span className="text-white font-mono">{formatScore(city.avg_risk_score)}</span></span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

function CityDetailView({ citySlug }: { citySlug: string }) {
  const { data: city, loading, error } = useApi<CityDetail>(`/cities/${citySlug}`)
  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={`Erro: ${error}`} />
  if (!city) return null

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb crumbs={[
          { label: 'Bahia', to: '/' },
          { label: 'Cidades', to: '/cities' },
          { label: city.city },
        ]} />
        <div className="flex items-center gap-4 mt-2 flex-wrap">
          <h1 className="text-3xl font-bold text-white">{city.city}</h1>
          <RiskLevelBadge level={city.dominant_risk_level} />
        </div>
        <p className="text-slate-400 text-sm mt-1">
          Score médio: <span className="text-white font-mono">{formatScore(city.avg_risk_score)}</span>
          <span className="mx-2 text-slate-600">·</span>
          {city.stations.length} estações
        </p>
      </div>

      <Card accent="red">
        <p className="text-slate-400 text-xs mb-1">Estação mais crítica</p>
        <Link
          to={`/stations/${city.most_critical_station.station_id}`}
          className="text-xl font-bold text-red-400 hover:text-red-300"
        >
          {city.most_critical_station.station_id} — score {formatScore(city.most_critical_station.risk_score)}
        </Link>
      </Card>

      <Card>
        <SectionHeader icon={MapPin} iconColor="text-blue-400" title="Estações" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {city.stations.map(sid => (
            <Link
              key={sid}
              to={`/stations/${sid}`}
              className="bg-slate-700 hover:bg-slate-600 rounded-lg px-3 py-2.5 transition-colors"
            >
              <p className="text-blue-400 font-medium text-sm">{sid}</p>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  )
}

export function CityPage() {
  const { citySlug } = useParams<{ citySlug?: string }>()
  return citySlug ? <CityDetailView citySlug={citySlug} /> : <CityList />
}

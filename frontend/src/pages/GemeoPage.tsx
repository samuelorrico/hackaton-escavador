import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts'
import { GitMerge, Users, TrendingUp, AlertCircle, CheckCircle, ArrowLeft, Droplets, Sun, Mountain, Wind, Cloud } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { InfoTooltip } from '../components/ui/InfoTooltip'
import { Card, PageHeader, SectionHeader } from '../components/ui/Card'
import type { ClusterListItem, ClusterDetail, StationClusterInfo } from '../types/api'

const CLUSTER_COLORS = ['#3b82f6', '#22c55e', '#f97316', '#a855f7', '#ef4444', '#14b8a6']

type ClusterMeta = { Icon: React.ElementType; color: string; desc: string }

const CLUSTER_LABEL_META: Record<string, ClusterMeta> = {
  'Chuvoso costeiro':  { Icon: Droplets, color: 'text-blue-400',   desc: 'Alta precipitação e umidade. Típico do litoral baiano.' },
  'Semiárido quente':  { Icon: Sun,      color: 'text-yellow-400', desc: 'Baixa chuva e altas temperaturas. Região do sertão.' },
  'Chuvoso serrano':   { Icon: Mountain, color: 'text-teal-400',   desc: 'Chuvas frequentes com temperaturas amenas. Chapada e serras.' },
  'Árido seco':        { Icon: Wind,     color: 'text-orange-400', desc: 'Precipitação muito baixa, umidade reduzida. Ambiente seco.' },
  'Tropical moderado': { Icon: Cloud,    color: 'text-slate-300',  desc: 'Clima equilibrado com chuvas e temperatura moderadas.' },
}

function getClusterMeta(label: string): ClusterMeta {
  for (const [key, val] of Object.entries(CLUSTER_LABEL_META)) {
    if (label.startsWith(key)) return val
  }
  return { Icon: GitMerge, color: 'text-slate-400', desc: 'Grupo com perfil climático identificado pelo algoritmo KMeans.' }
}

function DeviationBar({ score }: { score: number | null }) {
  if (score === null) return null
  const pct = score * 100
  const isHigh = score >= 0.66
  const isMid = score >= 0.33
  const color = isHigh ? 'bg-red-500' : isMid ? 'bg-yellow-400' : 'bg-green-500'
  const label = isHigh ? 'Muito divergente do grupo' : isMid ? 'Divergindo do grupo' : 'Típica do grupo'
  const labelColor = isHigh ? 'text-red-400' : isMid ? 'text-yellow-400' : 'text-green-400'
  const desc = isHigh
    ? 'Esta estação está se comportando de forma muito diferente das demais do seu grupo climático.'
    : isMid
    ? 'Há diferenças notáveis entre esta estação e o padrão médio do grupo.'
    : 'Esta estação é muito representativa do seu grupo climático.'

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className={`text-sm font-medium ${labelColor}`}>{label}</span>
        <span className="text-white font-mono font-bold">{pct.toFixed(0)}%</span>
      </div>
      <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-3 ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-slate-400 text-xs">{desc}</p>
    </div>
  )
}

const PROFILE_LABELS: Record<string, string> = {
  avg_rain_1h_mm: 'Chuva média',
  avg_temp_c: 'Temperatura',
  avg_humidity_pct: 'Umidade',
  avg_pressure_mb: 'Pressão',
  avg_wind_gust_ms: 'Vento',
}

function StationClusterView({ stationId }: { stationId: string }) {
  const { data: info, loading, error } = useApi<StationClusterInfo>(`/clusters/station/${stationId}`)
  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={`Erro: ${error}`} />
  if (!info) return null

  const clusterColor = CLUSTER_COLORS[info.climate_cluster % CLUSTER_COLORS.length]

  const radarData = Object.keys(info.profile_comparison.station).map(key => ({
    subject: PROFILE_LABELS[key] ?? key,
    station: info.profile_comparison.station[key] ?? 0,
    cluster: info.profile_comparison.cluster_avg[key] ?? 0,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Estação {stationId}</h1>
        <p className="text-slate-400 mt-1">
          Pertence ao{' '}
          <Link to={`/clusters/${info.climate_cluster}`} className="font-semibold" style={{ color: clusterColor }}>
            Cluster {info.climate_cluster}: {info.cluster_label}
          </Link>
        </p>
      </div>

      {/* Deviation */}
      <Card>
        <SectionHeader
          icon={TrendingUp}
          title="Desvio do grupo"
          tooltip={<InfoTooltip text="Distância euclidiana entre o perfil climático desta estação e o centro do seu grupo. 0% = estação perfeita do grupo; 100% = máximo desvio observado." />}
        />
        <DeviationBar score={info.cluster_deviation_score} />
      </Card>

      {/* Radar chart */}
      {radarData.length > 0 && (
        <Card>
          <SectionHeader
            title="Perfil climático vs grupo"
            tooltip={<InfoTooltip text="Comparação dos valores médios históricos desta estação (azul) com a média do seu grupo climático (laranja). Quanto mais próximas as formas, mais representativa é a estação." />}
          />
          <p className="text-slate-500 text-xs mb-4">Médias históricas normalizadas · valores relativos ao máximo do grupo</p>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#1e293b" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Radar name="Esta estação" dataKey="station" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              <Radar name="Média do grupo" dataKey="cluster" stroke="#f97316" fill="#f97316" fillOpacity={0.1} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }} />
            </RadarChart>
          </ResponsiveContainer>
          <div className="flex gap-6 mt-2 justify-center text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-blue-500 inline-block rounded" /> Esta estação</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-orange-400 inline-block rounded" /> Média do grupo</span>
          </div>
        </Card>
      )}

      {/* Similar stations */}
      {info.similar_stations.length > 0 && (
        <Card>
          <SectionHeader
            icon={Users}
            title="Estações do mesmo grupo"
            tooltip={<InfoTooltip text="Estações com perfil climático histórico similar. Útil para comparar comportamentos entre regiões com mesmas características." />}
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {info.similar_stations.map(s => (
              <Link
                key={s.station_id}
                to={`/clusters/station/${s.station_id}`}
                className="bg-slate-700 hover:bg-slate-600 rounded-lg px-3 py-2.5 transition-colors"
              >
                <p className="text-blue-400 font-medium text-sm">{s.station_id}</p>
                <p className="text-slate-400 text-xs">{s.city}</p>
              </Link>
            ))}
          </div>
        </Card>
      )}

      <Link to={`/stations/${stationId}`} className="flex items-center gap-1 text-slate-400 hover:text-white text-sm">
        <ArrowLeft size={14} /> Voltar para estação {stationId}
      </Link>
    </div>
  )
}

function ClusterDetailView({ clusterId }: { clusterId: number }) {
  const { data: cluster, loading, error } = useApi<ClusterDetail>(`/clusters/${clusterId}`)
  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={`Erro: ${error}`} />
  if (!cluster) return null

  const color = CLUSTER_COLORS[clusterId % CLUSTER_COLORS.length]
  const meta = getClusterMeta(cluster.label)
  const MetaIcon = meta.Icon

  return (
    <div className="space-y-6">
      <div>
        <Link to="/clusters" className="flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-3">
          <ArrowLeft size={14} /> Todos os grupos
        </Link>
        <div className="flex items-center gap-3">
          <MetaIcon size={24} className={meta.color} />
          <h1 className="text-3xl font-bold text-white">{cluster.label}</h1>
        </div>
        <p className="text-slate-400 mt-1">{meta.desc}</p>
        <p className="text-slate-500 text-xs mt-1">{cluster.station_count} estações com perfil climático similar</p>
      </div>

      <Card>
        <SectionHeader
          icon={Users}
          title="Estações do grupo"
          tooltip={<InfoTooltip text="Todas as estações que o algoritmo KMeans classificou neste grupo com base no perfil climático histórico." />}
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {cluster.stations.map(s => (
            <Link
              key={s.station_id}
              to={`/clusters/station/${s.station_id}`}
              className="bg-slate-700 hover:bg-slate-600 rounded-lg px-3 py-2.5 transition-colors"
            >
              <p className="text-blue-400 font-medium text-sm">{s.station_id}</p>
              <p className="text-slate-400 text-xs">{s.city}</p>
              {s.deviation_score !== null && (
                <div className="mt-1.5 h-1 bg-slate-600 rounded-full overflow-hidden">
                  <div
                    className="h-1 rounded-full"
                    style={{
                      width: `${s.deviation_score * 100}%`,
                      background: s.deviation_score > 0.66 ? '#ef4444' : s.deviation_score > 0.33 ? '#facc15' : '#22c55e'
                    }}
                  />
                </div>
              )}
            </Link>
          ))}
        </div>
      </Card>
    </div>
  )
}

function ClusterList() {
  const { data: clusters, loading, error } = useApi<ClusterListItem[]>('/clusters')
  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={`Erro: ${error}`} />

  return (
    <div className="space-y-6">
      <PageHeader
        icon={GitMerge}
        iconColor="text-green-400"
        bgColor="bg-green-500/10"
        borderColor="border-green-500/20"
        title="Gêmeo Climático"
        description="Agrupa as 48 estações da Bahia com base no perfil climático histórico — temperatura, chuva, umidade, pressão e vento médios. Estações no mesmo grupo têm clima similar. O algoritmo KMeans encontrou automaticamente quantos grupos fazem sentido nos dados."
      />

      {/* Concept explanation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card padding="sm">
          <div className="flex items-center gap-2 mb-2">
            <Users size={16} className="text-blue-400" />
            <p className="text-white font-medium text-sm">O que é um grupo?</p>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed">
            Conjunto de estações com histórico climático parecido. Se uma estação do grupo entra em alerta,
            as outras devem ser monitoradas com atenção redobrada.
          </p>
        </Card>
        <Card padding="sm">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={16} className="text-green-400" />
            <p className="text-white font-medium text-sm">Desvio baixo</p>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed">
            Estação se comporta como o esperado para o seu grupo. Útil como referência climática da região.
          </p>
        </Card>
        <Card padding="sm">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={16} className="text-red-400" />
            <p className="text-white font-medium text-sm">Desvio alto</p>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed">
            Estação está se desviando do perfil histórico do grupo — pode indicar mudança climática local ou anomalia.
          </p>
        </Card>
      </div>

      {/* Cluster cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {clusters?.map(c => {
          const meta = getClusterMeta(c.label)
          const MetaIcon = meta.Icon
          return (
            <Link
              key={c.cluster_id}
              to={`/clusters/${c.cluster_id}`}
              className="bg-slate-800/60 hover:bg-slate-700/60 rounded-xl p-5 transition-all hover:scale-[1.01] border border-slate-700 hover:border-slate-600 block"
            >
              <div className="flex items-center gap-3 mb-2">
                <MetaIcon size={16} className={meta.color} />
                <p className="text-white font-semibold text-base">{c.label}</p>
                <span className="text-slate-500 text-xs ml-auto">{c.station_count} estações</span>
              </div>
              <p className="text-slate-400 text-xs mb-3">{meta.desc}</p>
              <div className="flex flex-wrap gap-1.5">
                {c.stations.slice(0, 8).map(s => (
                  <span key={s} className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">{s}</span>
                ))}
                {c.stations.length > 8 && (
                  <span className="text-xs text-slate-500 px-1">+{c.stations.length - 8} mais</span>
                )}
              </div>
              <p className="text-slate-500 text-xs mt-3">Ver estações do grupo</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export function GemeoPage() {
  const { clusterId, stationId } = useParams<{ clusterId?: string; stationId?: string }>()
  if (stationId) return <StationClusterView stationId={stationId} />
  if (clusterId) return <ClusterDetailView clusterId={parseInt(clusterId)} />
  return <ClusterList />
}

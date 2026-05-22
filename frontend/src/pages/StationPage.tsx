import { useParams, Link } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import {
  Droplets, Gauge, Thermometer, Wind, Activity,
  AlertTriangle, TrendingUp, GitMerge, ArrowLeft
} from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { Breadcrumb } from '../components/layout/Breadcrumb'
import { RiskLevelBadge } from '../components/ui/RiskLevelBadge'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { InfoTooltip } from '../components/ui/InfoTooltip'
import { Card, SectionHeader } from '../components/ui/Card'
import type { StationDetail, StationHistory } from '../types/api'
import { formatScore } from '../lib/utils'

const READING_CONFIG = [
  {
    key: 'rain_1h_mm' as const,
    label: 'Chuva 1h',
    unit: 'mm',
    icon: Droplets,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border border-blue-500/20',
    tooltip: 'Precipitação registrada na última hora medida. Valores acima de 10mm/h já indicam chuva intensa; acima de 30mm/h é chuva muito intensa.',
  },
  {
    key: 'pressure_mb' as const,
    label: 'Pressão',
    unit: 'mB',
    icon: Gauge,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border border-purple-500/20',
    tooltip: 'Pressão atmosférica ao nível da estação. Quedas rápidas de pressão indicam chegada de frentes frias ou tempestades. Valor típico: 1013 mB.',
  },
  {
    key: 'air_temp_c' as const,
    label: 'Temperatura',
    unit: '°C',
    icon: Thermometer,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10 border border-orange-500/20',
    tooltip: 'Temperatura do ar (bulbo seco). Variações bruscas combinadas com alta umidade aumentam o risco de tempestades.',
  },
  {
    key: 'humidity_pct' as const,
    label: 'Umidade',
    unit: '%',
    icon: Droplets,
    color: 'text-teal-400',
    bg: 'bg-teal-500/10 border border-teal-500/20',
    tooltip: 'Umidade relativa do ar. Acima de 85% combinada com calor aumenta o desconforto térmico e favorece tempestades.',
  },
  {
    key: 'wind_gust_ms' as const,
    label: 'Rajada de Vento',
    unit: 'm/s',
    icon: Wind,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10 border border-cyan-500/20',
    tooltip: 'Velocidade máxima de rajada de vento. Acima de 15 m/s (54 km/h) é ventania; acima de 25 m/s (90 km/h) é perigoso.',
  },
]

const RISK_EXPLANATION: Record<string, { color: string; gradient: string; text: string; consequences: string[] }> = {
  baixo: {
    color: 'text-green-400', gradient: 'from-green-500/20 to-green-500/5',
    text: 'Condições estáveis. Sem indicadores de risco significativo neste momento.',
    consequences: [],
  },
  médio: {
    color: 'text-yellow-400', gradient: 'from-yellow-500/20 to-yellow-500/5',
    text: 'Atenção recomendada. Um ou mais fatores meteorológicos apresentam valores elevados.',
    consequences: [
      'Possibilidade de chuvas moderadas ou rajadas de vento',
      'Recomendável monitorar a evolução nas próximas horas',
    ],
  },
  alto: {
    color: 'text-orange-400', gradient: 'from-orange-500/20 to-orange-500/5',
    text: 'Situação preocupante. Combinação de fatores indica risco real de evento extremo.',
    consequences: [
      'Risco de alagamentos e enxurradas em áreas baixas',
      'Ventos fortes podem derrubar árvores e estruturas frágeis',
      'Recomendado ativar protocolos de atenção da Defesa Civil',
    ],
  },
  crítico: {
    color: 'text-red-400', gradient: 'from-red-500/20 to-red-500/5',
    text: 'Nível máximo de alerta. Condições similares às piores registradas nesta estação.',
    consequences: [
      'Alto risco de enchentes, deslizamentos e destruição de infraestrutura',
      'Situação comparável a eventos extremos históricos nesta região',
      'Evacuação preventiva de áreas de risco pode ser necessária',
      'Acionar imediatamente protocolos de emergência da Defesa Civil',
    ],
  },
}

const ANOMALY_EXPLANATION: Record<string, { color: string; bg: string; text: string }> = {
  normal:  { color: 'text-slate-300', bg: 'bg-slate-600',   text: 'Leituras dentro do padrão histórico normal desta estação.' },
  atípico: { color: 'text-yellow-300', bg: 'bg-yellow-500/20 border border-yellow-500/30', text: 'Comportamento fora do padrão. A IA detectou uma combinação incomum de variáveis.' },
  extremo: { color: 'text-red-300',    bg: 'bg-red-500/20 border border-red-500/30',    text: 'Evento extremo. Esta leitura está entre as mais incomuns já registradas nesta estação.' },
}

function ReadingCard({ cfg, value }: { cfg: typeof READING_CONFIG[0]; value: number | null }) {
  const Icon = cfg.icon
  return (
    <div className={`${cfg.bg} rounded-xl p-4 space-y-2`}>
      <div className="flex items-center justify-between">
        <Icon size={18} className={cfg.color} />
        <InfoTooltip text={cfg.tooltip} />
      </div>
      <p className="text-slate-400 text-xs">{cfg.label}</p>
      <p className={`font-bold text-2xl ${cfg.color}`}>
        {value !== null ? value.toFixed(1) : '—'}
        <span className="text-slate-500 text-sm ml-1">{cfg.unit}</span>
      </p>
    </div>
  )
}

function RiskScoreRing({ score, level }: { score: number; level: string }) {
  const cfg = RISK_EXPLANATION[level] ?? RISK_EXPLANATION.baixo
  const circumference = 2 * Math.PI * 40
  const offset = circumference - (score / 100) * circumference

  return (
    <div className={`bg-gradient-to-br ${cfg.gradient} rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6`}>
      <div className="relative w-28 h-28 shrink-0">
        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#1e293b" strokeWidth="10" />
          <circle
            cx="50" cy="50" r="40" fill="none"
            stroke={level === 'crítico' ? '#ef4444' : level === 'alto' ? '#f97316' : level === 'médio' ? '#facc15' : '#22c55e'}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold ${cfg.color}`}>{score.toFixed(0)}</span>
          <span className="text-slate-500 text-xs">/100</span>
        </div>
      </div>
      <div className="flex-1 text-center sm:text-left">
        <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
          <p className="text-slate-400 text-sm">Score de Risco</p>
          <InfoTooltip text="Score de 0 a 100 calculado com base em percentis históricos da própria estação. 100 = pior condição já registrada nesta estação." />
        </div>
        <RiskLevelBadge level={level} />
        <p className="text-slate-400 text-sm mt-2">{cfg.text}</p>
        {cfg.consequences.length > 0 && (
          <ul className="mt-3 space-y-1">
            {cfg.consequences.map((c, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-slate-400">
                <span className={`mt-0.5 shrink-0 ${cfg.color}`}>▸</span>
                {c}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export function StationPage() {
  const { stationId } = useParams<{ stationId: string }>()
  const { data: station, loading, error } = useApi<StationDetail>(stationId ? `/stations/${stationId}` : null)
  const { data: history } = useApi<StationHistory[]>(stationId ? `/stations/${stationId}/history?days=30` : null)

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={`Erro: ${error}`} />
  if (!station) return null

  const citySlug = station.city.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-')

  const chartData = history?.slice(-168).map(h => ({
    time: new Date(h.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    risk: h.risk_score,
  })) ?? []

  const anomalyCfg = ANOMALY_EXPLANATION[station.anomaly_label ?? 'normal'] ?? ANOMALY_EXPLANATION.normal

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb crumbs={[
          { label: 'Bahia', to: '/' },
          { label: station.city, to: `/cities/${citySlug}` },
          { label: station.station_id },
        ]} />
        <div className="flex items-center gap-3 flex-wrap mt-2">
          <h1 className="text-3xl font-bold text-white">Estação {station.station_id}</h1>
          <span className="text-slate-400 text-lg">{station.city}</span>
        </div>
        <p className="text-slate-500 text-sm mt-1">Dados históricos INMET · 2000–2021 · última leitura disponível</p>
      </div>

      {/* Risk score ring */}
      <RiskScoreRing score={station.risk_score} level={station.risk_level} />

      {/* Readings */}
      <div>
        <SectionHeader
          icon={Activity}
          title="Leituras Meteorológicas"
          tooltip={<InfoTooltip text="Valores da última leitura registrada nesta estação. Os dados são históricos (até 2021)." />}
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {READING_CONFIG.map(cfg => (
            <ReadingCard
              key={cfg.key}
              cfg={cfg}
              value={station.current_readings[cfg.key] ?? null}
            />
          ))}
        </div>
      </div>

      {/* Anomaly */}
      {station.anomaly_score !== null && (
        <Card className={anomalyCfg.bg}>
          <SectionHeader
            icon={AlertTriangle}
            iconColor={anomalyCfg.color}
            title="Radar de Extremos"
            tooltip={<InfoTooltip text="Algoritmo IsolationForest treinado no histórico desta estação. Detecta leituras que se 'isolam' dos padrões normais. Score 0–1: quanto maior, mais atípico." />}
          />
          <div className="flex items-center gap-6 flex-wrap">
            <div>
              <p className="text-slate-400 text-xs mb-1">Anomaly Score</p>
              <p className={`text-3xl font-bold ${anomalyCfg.color}`}>{station.anomaly_score.toFixed(3)}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs mb-1">Classificação</p>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${anomalyCfg.bg} ${anomalyCfg.color}`}>
                {station.anomaly_label}
              </span>
            </div>
            <p className="text-slate-400 text-sm flex-1">{anomalyCfg.text}</p>
          </div>
        </Card>
      )}

      {/* Risk factors */}
      {station.risk_factors.length > 0 && (
        <Card>
          <SectionHeader
            icon={TrendingUp}
            iconColor="text-blue-400"
            title="Fatores de Risco"
            tooltip={<InfoTooltip text="Os 3 fatores que mais contribuíram para o score de risco atual. O valor mostra a contribuição ponderada de cada um (máx 35 para chuva, 25 para pressão, etc.)." />}
          />
          <div className="space-y-4">
            {station.risk_factors.map(f => (
              <div key={f.factor}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-slate-300 font-medium">{f.label}</span>
                  <span className="text-blue-400 font-mono font-semibold">{f.contribution.toFixed(1)}</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-2 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(f.contribution, 100)}%` }}
                  />
                </div>
                {f.value !== null && (
                  <p className="text-slate-500 text-xs mt-1">
                    Valor atual: <span className="text-slate-400">{f.value.toFixed(2)}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* History chart */}
      {chartData.length > 0 && (
        <Card>
          <SectionHeader
            icon={TrendingUp}
            title="Histórico de Risco — últimos 30 dias"
            tooltip={<InfoTooltip text="Evolução do score de risco ao longo do tempo. Picos indicam períodos de maior instabilidade climática nesta estação." />}
          />
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <defs>
                <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }}
                labelStyle={{ color: '#94a3b8' }}
                itemStyle={{ color: '#fff' }}
                formatter={(v: number) => [v.toFixed(1), 'Risk Score']}
                cursor={{ stroke: '#64748b', strokeWidth: 1 }}
              />
              <Line type="monotone" dataKey="risk" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#fff' }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Cluster link */}
      {station.climate_cluster !== null && (
        <Link to={`/clusters/station/${station.station_id}`}>
          <Card className="hover:bg-slate-700/60 transition-colors group cursor-pointer">
            <div className="flex items-center gap-4">
              <GitMerge size={24} className="text-green-400 shrink-0" />
              <div className="flex-1">
                <p className="text-white font-semibold">Gêmeo Climático</p>
                <p className="text-slate-400 text-sm">
                  Cluster {station.climate_cluster}: <span className="text-green-400">{station.cluster_label}</span>
                </p>
                <p className="text-slate-500 text-xs mt-1">
                  Esta estação compartilha padrão climático com outras estações da Bahia — clique para comparar
                </p>
              </div>
              <ArrowLeft size={16} className="text-slate-400 rotate-180 group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>
        </Link>
      )}

      <Link to={`/cities/${citySlug}`} className="flex items-center gap-1 text-slate-400 hover:text-white text-sm transition-colors">
        <ArrowLeft size={14} /> Voltar para {station.city}
      </Link>
    </div>
  )
}

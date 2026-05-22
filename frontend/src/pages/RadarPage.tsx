import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Radar as RadarIcon, AlertTriangle, CheckCircle, Zap } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { InfoTooltip } from '../components/ui/InfoTooltip'
import { Card, PageHeader, SectionHeader } from '../components/ui/Card'
import type { RadarRankingItem, AnomalyLabel } from '../types/api'

const ANOMALY_CONFIG = {
  normal:  {
    badge: 'bg-slate-600 text-slate-200',
    border: 'border-l-slate-500',
    icon: CheckCircle,
    iconColor: 'text-slate-400',
    label: 'Normal',
    desc: 'Leituras dentro do padrão histórico. Sem anomalia detectada.',
  },
  atípico: {
    badge: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
    border: 'border-l-yellow-500',
    icon: AlertTriangle,
    iconColor: 'text-yellow-400',
    label: 'Atípico',
    desc: 'Comportamento incomum detectado. Combinação de variáveis fora do padrão histórico desta estação.',
  },
  extremo: {
    badge: 'bg-red-500/20 text-red-300 border border-red-500/30',
    border: 'border-l-red-500',
    icon: Zap,
    iconColor: 'text-red-400',
    label: 'Extremo',
    desc: 'Evento raro detectado. Esta leitura está entre os casos mais incomuns já registrados nesta estação.',
  },
}

type Filter = 'todos' | AnomalyLabel

interface StationDetail {
  station_id: string
  current_anomaly_score: number | null
  anomaly_label: string | null
  main_driver: string | null
  history: Array<{ timestamp: string; anomaly_score: number | null }>
}

const DRIVER_LABELS: Record<string, string> = {
  rain_24h_mm: 'Chuva acumulada (24h)',
  pressure_delta_1h: 'Variação de pressão (1h)',
  temp_delta_1h: 'Variação de temperatura (1h)',
  humidity_delta_1h: 'Variação de umidade (1h)',
  rain_zscore: 'Z-score da chuva',
  pressure_zscore: 'Z-score da pressão',
}

export function RadarPage() {
  const [filter, setFilter] = useState<Filter>('todos')
  const [selected, setSelected] = useState<string | null>(null)
  const { data: ranking, loading, error } = useApi<RadarRankingItem[]>('/radar/ranking?limit=48')
  const { data: detail, loading: detailLoading } = useApi<StationDetail>(
    selected ? `/radar/station/${selected}` : null
  )

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={`Erro: ${error}`} />

  const filtered = ranking?.filter(s =>
    filter === 'todos' ? true : s.anomaly_label === filter
  ) ?? []

  const counts = {
    normal:  ranking?.filter(s => s.anomaly_label === 'normal').length ?? 0,
    atípico: ranking?.filter(s => s.anomaly_label === 'atípico').length ?? 0,
    extremo: ranking?.filter(s => s.anomaly_label === 'extremo').length ?? 0,
  }

  const chartData = detail?.history.slice(-72).map(h => ({
    time: new Date(h.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    score: h.anomaly_score,
  })) ?? []

  const selectedCfg = ANOMALY_CONFIG[(detail?.anomaly_label as AnomalyLabel) ?? 'normal']

  return (
    <div className="space-y-6">
      <PageHeader
        icon={RadarIcon}
        iconColor="text-red-400"
        bgColor="bg-red-500/10"
        borderColor="border-red-500/20"
        title="Radar de Extremos"
        description="Monitora o comportamento de cada estação usando IsolationForest — um algoritmo de IA treinado no histórico de 20 anos de cada estação. Quando as condições atuais se isolam dos padrões normais, o algoritmo sinaliza uma anomalia."
      />

      {/* Filter badges with counts */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('todos')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === 'todos' ? 'bg-blue-600 text-white' : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'}`}
        >
          Todas ({ranking?.length ?? 0})
        </button>
        {(['normal', 'atípico', 'extremo'] as AnomalyLabel[]).map(f => {
          const cfg = ANOMALY_CONFIG[f]
          const Icon = cfg.icon
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === f ? cfg.badge : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'
              }`}
            >
              <Icon size={13} />
              {cfg.label} ({counts[f]})
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Station list */}
        <Card>
          <SectionHeader
            title="Estações"
            tooltip={<InfoTooltip text="Ordenadas pelo anomaly score (maior = mais atípico). Clique em uma estação para ver o histórico." />}
          />
          <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1">
            {filtered.map((s, i) => {
              const cfg = ANOMALY_CONFIG[(s.anomaly_label as AnomalyLabel) ?? 'normal']
              const Icon = cfg.icon
              return (
                <button
                  key={s.station_id}
                  onClick={() => setSelected(s.station_id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border-l-2 text-left transition-all ${cfg.border} ${
                    selected === s.station_id ? 'bg-slate-600' : 'bg-slate-800 hover:bg-slate-700'
                  }`}
                >
                  <span className="text-slate-600 text-xs w-4">{i + 1}</span>
                  <Icon size={15} className={cfg.iconColor + ' shrink-0'} />
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/stations/${s.station_id}`}
                      onClick={e => e.stopPropagation()}
                      className="text-blue-400 hover:text-blue-300 font-medium text-sm"
                    >
                      {s.station_id}
                    </Link>
                    <span className="text-slate-500 text-xs ml-2 truncate">{s.city}</span>
                  </div>
                  <span className="font-mono text-white text-sm shrink-0">{s.anomaly_score?.toFixed(3) ?? '—'}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs shrink-0 ${cfg.badge}`}>{cfg.label}</span>
                </button>
              )
            })}
            {filtered.length === 0 && (
              <p className="text-slate-400 text-sm text-center py-8">Nenhuma estação com este filtro</p>
            )}
          </div>
        </Card>

        {/* Detail panel */}
        <Card>
          {selected ? (
            detailLoading ? <LoadingSpinner /> : detail ? (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-white">{detail.station_id}</h2>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm mt-1 ${selectedCfg.badge}`}>
                    <selectedCfg.icon size={13} />
                    {selectedCfg.label}
                  </span>
                </div>

                <div className="bg-slate-700/40 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-slate-400 text-xs">Anomaly Score</p>
                      <p className="text-3xl font-bold text-white">{detail.current_anomaly_score?.toFixed(3) ?? '—'}</p>
                      <p className="text-slate-500 text-xs">0 = totalmente normal · 1 = extremamente atípico</p>
                    </div>
                  </div>
                  <p className="text-slate-300 text-sm">{selectedCfg.desc}</p>
                </div>

                {detail.main_driver && (
                  <div className="bg-slate-700/40 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-slate-400 text-xs">Principal fator da anomalia</p>
                      <InfoTooltip text="A variável meteorológica que mais contribuiu para o score de anomalia. É o que mais se desviou do histórico normal desta estação." />
                    </div>
                    <p className="text-white font-semibold">
                      {DRIVER_LABELS[detail.main_driver] ?? detail.main_driver}
                    </p>
                  </div>
                )}

                {chartData.length > 0 && (
                  <div>
                    <p className="text-slate-400 text-xs mb-3">Histórico do anomaly score</p>
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 10 }} interval={11} />
                        <YAxis domain={[0, 1]} tick={{ fill: '#64748b', fontSize: 10 }} />
                        <Tooltip
                          contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }}
                          itemStyle={{ color: '#fff' }}
                          formatter={(v: number) => [v?.toFixed(3), 'Anomaly Score']}
                          cursor={{ stroke: '#64748b', strokeWidth: 1 }}
                        />
                        <Line type="monotone" dataKey="score" stroke="#ef4444" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#fff' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <Link to={`/stations/${selected}`} className="text-blue-400 hover:text-blue-300 text-sm">
                  Ver análise completa da estação →
                </Link>
              </div>
            ) : null
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center gap-3">
              <RadarIcon size={40} className="text-slate-600" />
              <p className="text-slate-400">Selecione uma estação para ver o histórico de anomalias</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

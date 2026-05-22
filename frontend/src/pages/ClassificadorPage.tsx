import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Cell } from 'recharts'
import { ShieldAlert, ShieldCheck, ShieldOff, Flame } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { RiskLevelBadge } from '../components/ui/RiskLevelBadge'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { InfoTooltip } from '../components/ui/InfoTooltip'
import { Card, PageHeader, SectionHeader } from '../components/ui/Card'
import type { RiskDistribution } from '../types/api'
import type { RiskLevel } from '../lib/utils'

type LevelFilter = 'todos' | RiskLevel

const LEVEL_CONFIG: Record<RiskLevel, { color: string; fill: string; gradient: string; icon: typeof ShieldCheck; label: string; range: string; desc: string; consequences: string[] }> = {
  baixo: {
    color: 'text-green-400', fill: '#22c55e', gradient: 'from-green-500/20', icon: ShieldCheck,
    label: 'Baixo', range: '0–25',
    desc: 'Condições estáveis. Nenhum fator de risco significativo.',
    consequences: [],
  },
  médio: {
    color: 'text-yellow-400', fill: '#facc15', gradient: 'from-yellow-500/20', icon: ShieldAlert,
    label: 'Médio', range: '26–50',
    desc: 'Atenção. Um ou mais fatores apresentam valores elevados.',
    consequences: ['Chuvas moderadas ou rajadas possíveis', 'Monitorar evolução nas próximas horas'],
  },
  alto: {
    color: 'text-orange-400', fill: '#f97316', gradient: 'from-orange-500/20', icon: ShieldAlert,
    label: 'Alto', range: '51–75',
    desc: 'Risco real. Combinação de fatores preocupante.',
    consequences: ['Risco de alagamentos em áreas baixas', 'Ventos podem derrubar estruturas frágeis', 'Ativar atenção da Defesa Civil'],
  },
  crítico: {
    color: 'text-red-400', fill: '#dc2626', gradient: 'from-red-500/20', icon: Flame,
    label: 'Crítico', range: '76–100',
    desc: 'Alerta máximo. Condições próximas do pior já registrado.',
    consequences: ['Alto risco de enchentes e deslizamentos', 'Comparável a eventos extremos históricos', 'Evacuação preventiva pode ser necessária', 'Acionar protocolo de emergência imediatamente'],
  },
}

interface StationRisk {
  station_id: string
  city: string
  risk_score: number
  risk_level: RiskLevel
  risk_factors: Array<{ factor: string; contribution: number; value: number | null; label: string }>
  history: Array<{ timestamp: string; risk_score: number | null; risk_level: string | null }>
}

function ScoreBar({ value, max = 35 }: { value: number; max?: number }) {
  const pct = Math.min((value / max) * 100, 100)
  const color = pct > 80 ? '#ef4444' : pct > 50 ? '#f97316' : '#3b82f6'
  return (
    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
      <div
        className="h-2 rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  )
}

export function ClassificadorPage() {
  const [filter, setFilter] = useState<LevelFilter>('todos')
  const [selected, setSelected] = useState<string | null>(null)
  const { data: dist, loading, error } = useApi<RiskDistribution>('/risk/distribution')
  const { data: stations } = useApi<StationRisk[]>('/dashboard/risk-ranking?limit=100')
  const { data: stationRisk } = useApi<StationRisk>(selected ? `/risk/station/${selected}` : null)

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={`Erro: ${error}`} />

  const distChartData = dist ? (Object.entries(dist) as [RiskLevel, number][]).map(([nivel, count]) => ({
    nivel: LEVEL_CONFIG[nivel]?.label ?? nivel,
    count,
    fill: LEVEL_CONFIG[nivel]?.fill ?? '#64748b',
  })) : []

  const filtered = (stations ?? []).filter(s =>
    filter === 'todos' ? true : s.risk_level === filter
  )

  const histData = stationRisk?.history.slice(-168).map(h => ({
    time: new Date(h.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    risk: h.risk_score,
  })) ?? []

  const selectedLevel = stationRisk?.risk_level ?? 'baixo'
  const selectedCfg = LEVEL_CONFIG[selectedLevel]

  return (
    <div className="space-y-6">
      <PageHeader
        icon={ShieldAlert}
        iconColor="text-orange-400"
        bgColor="bg-orange-500/10"
        borderColor="border-orange-500/20"
        title="Classificador de Risco"
        description="Cada estação recebe um score de 0 a 100 calculado pela comparação das condições atuais com o histórico de 20 anos daquela mesma estação. 100 = pior condição já registrada naquela estação específica."
      />

      {/* Risk levels explanation */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(Object.entries(LEVEL_CONFIG) as [RiskLevel, typeof LEVEL_CONFIG.baixo][]).map(([level, cfg]) => {
          const Icon = cfg.icon
          const count = dist?.[level] ?? 0
          return (
            <div key={level} className={`bg-gradient-to-br ${cfg.gradient} to-transparent border border-slate-700 rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon size={18} className={cfg.color} />
                <span className={`font-semibold ${cfg.color}`}>{cfg.label}</span>
              </div>
              <p className="text-slate-500 text-xs mb-1">Score {cfg.range}</p>
              <p className="text-2xl font-bold text-white">{count} <span className="text-slate-500 text-sm">estações</span></p>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed">{cfg.desc}</p>
              {cfg.consequences.length > 0 && (
                <ul className="mt-2 space-y-0.5">
                  {cfg.consequences.map((c, i) => (
                    <li key={i} className={`text-xs flex items-start gap-1 ${cfg.color} opacity-70`}>
                      <span className="shrink-0">▸</span>{c}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </div>

      {/* Distribution chart */}
      {dist && (
        <Card>
          <SectionHeader
            title="Distribuição por Nível"
            tooltip={<InfoTooltip text="Quantas estações se encontram em cada nível de risco no momento. Idealmente, a maioria deve estar em Baixo ou Médio." />}
          />
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={distChartData} barSize={48}>
              <XAxis dataKey="nivel" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }}
                itemStyle={{ color: '#fff' }}
                formatter={(v: number) => [v, 'estações']}
                cursor={{ stroke: '#64748b', strokeWidth: 1 }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {distChartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('todos')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === 'todos' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
        >
          Todas ({stations?.length ?? 0})
        </button>
        {(Object.entries(LEVEL_CONFIG) as [RiskLevel, typeof LEVEL_CONFIG.baixo][]).map(([level, cfg]) => (
          <button
            key={level}
            onClick={() => setFilter(level)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === level ? `bg-gradient-to-r ${cfg.gradient} to-transparent border border-current ${cfg.color}` : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {cfg.label} ({dist?.[level] ?? 0})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Station list */}
        <Card>
          <SectionHeader title={`Estações (${filtered.length})`} />
          <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
            {filtered.map(s => {
              const cfg = LEVEL_CONFIG[s.risk_level]
              return (
                <button
                  key={s.station_id}
                  onClick={() => setSelected(s.station_id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                    selected === s.station_id ? 'bg-slate-600 ring-1 ring-blue-500' : 'bg-slate-800 hover:bg-slate-700'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/stations/${s.station_id}`}
                      onClick={e => e.stopPropagation()}
                      className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                    >
                      {s.station_id}
                    </Link>
                    <p className="text-slate-500 text-xs truncate">{s.city}</p>
                  </div>
                  <span className={`font-mono font-bold ${cfg.color}`}>{s.risk_score.toFixed(0)}</span>
                  <RiskLevelBadge level={s.risk_level} size="sm" />
                </button>
              )
            })}
          </div>
        </Card>

        {/* Detail panel */}
        <Card>
          {selected && stationRisk ? (
            <div className="space-y-5">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-lg font-semibold text-white">{selected}</h2>
                <RiskLevelBadge level={stationRisk.risk_level} />
              </div>

              <div className={`bg-gradient-to-br ${selectedCfg.gradient} to-transparent rounded-xl p-5 text-center`}>
                <p className={`text-5xl font-bold ${selectedCfg.color}`}>{stationRisk.risk_score.toFixed(0)}</p>
                <p className="text-slate-400 text-sm mt-1">de 100 pontos possíveis</p>
                <p className="text-slate-300 text-xs mt-2">{selectedCfg.desc}</p>
              </div>

              {stationRisk.risk_factors.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <p className="text-slate-400 text-sm font-medium">O que está contribuindo para este score?</p>
                    <InfoTooltip text="Cada fator tem um peso máximo. Chuva 72h: até 35pts. Pressão: até 25pts. Anomalia IA: até 20pts. Umidade: até 10pts. Vento: até 10pts." />
                  </div>
                  <div className="space-y-3">
                    {stationRisk.risk_factors.map(f => (
                      <div key={f.factor}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-300">{f.label}</span>
                          <span className="text-white font-mono">{f.contribution.toFixed(1)} pts</span>
                        </div>
                        <ScoreBar value={f.contribution} />
                        {f.value !== null && (
                          <p className="text-slate-600 text-xs mt-0.5">Valor: {f.value.toFixed(2)}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {histData.length > 0 && (
                <div>
                  <p className="text-slate-400 text-xs mb-3">Evolução do score — últimos 30 dias</p>
                  <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={histData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 10 }} interval={23} />
                      <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }}
                        itemStyle={{ color: '#fff' }}
                        formatter={(v: number) => [v?.toFixed(1), 'Risk Score']}
                        cursor={{ stroke: '#64748b', strokeWidth: 1 }}
                      />
                      <Line type="monotone" dataKey="risk" stroke={selectedCfg.fill} strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#fff' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-16 gap-3 text-center">
              <ShieldAlert size={40} className="text-slate-600" />
              <p className="text-slate-400 text-sm">Selecione uma estação para ver o detalhamento do score</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

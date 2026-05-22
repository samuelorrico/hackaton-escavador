import { Link } from 'react-router-dom'
import { Radar, ShieldAlert, GitMerge, MapPin, AlertOctagon, Building2, Activity, TrendingUp, ArrowRight } from 'lucide-react'
import { useDashboardData } from '../hooks/useDashboardData'
import { RiskRankingTable } from '../components/ui/RiskRankingTable'
import { RiskLevelBadge } from '../components/ui/RiskLevelBadge'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { InfoTooltip } from '../components/ui/InfoTooltip'
import { Card, SectionHeader } from '../components/ui/Card'
import { formatScore } from '../lib/utils'

const RISK_LEVEL_BORDER: Record<string, string> = {
  baixo: 'border-l-green-500', médio: 'border-l-yellow-500',
  alto: 'border-l-orange-500', crítico: 'border-l-red-500',
}

const MODULE_CARDS = [
  {
    to: '/radar', icon: Radar, iconColor: 'text-red-400',
    title: 'Radar de Extremos',
    desc: 'Detecta estações com comportamento fora do padrão histórico usando IA.',
    tag: 'IsolationForest', accent: 'red' as const,
  },
  {
    to: '/risk', icon: ShieldAlert, iconColor: 'text-orange-400',
    title: 'Classificador de Risco',
    desc: 'Score 0–100 comparando condições atuais com o pior histórico da estação.',
    tag: 'Score 0–100', accent: 'orange' as const,
  },
  {
    to: '/clusters', icon: GitMerge, iconColor: 'text-green-400',
    title: 'Gêmeo Climático',
    desc: 'Agrupa estações com perfil similar e detecta desvios do padrão do grupo.',
    tag: 'KMeans', accent: 'green' as const,
  },
]

export function DashboardPage() {
  const { summary, ranking, loading, error } = useDashboardData()

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={`Erro ao carregar dados: ${error}`} />

  const topLevel = summary?.top_risk_station?.risk_level ?? 'baixo'

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3 mb-1">
          <Activity size={22} className="text-blue-400" />
          <h1 className="text-2xl font-bold text-white">Painel Operacional</h1>
        </div>
        <p className="text-slate-400 text-sm">
          Bahia · 48 estações INMET · dados 2000–2021 · scores calculados por IA
        </p>
      </div>

      {/* Summary cards */}
      {summary && (
        <div>
          <SectionHeader title="Visão Geral" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={15} className="text-blue-400" />
                <span className="text-slate-400 text-xs">Estações</span>
                <InfoTooltip text="Estações meteorológicas INMET na Bahia com dados disponíveis." />
              </div>
              <p className="text-3xl font-bold text-white">{summary.total_stations}</p>
            </Card>

            <Card accent="red">
              <div className="flex items-center gap-2 mb-3">
                <AlertOctagon size={15} className="text-red-400" />
                <span className="text-slate-400 text-xs">Críticas</span>
                <InfoTooltip text="Estações com score acima de 75/100. Condições próximas do pior histórico registrado." />
              </div>
              <p className="text-3xl font-bold text-red-400">{summary.critical_stations}</p>
            </Card>

            <Card accent="orange">
              <div className="flex items-center gap-2 mb-3">
                <Building2 size={15} className="text-orange-400" />
                <span className="text-slate-400 text-xs">Cidades em alerta</span>
                <InfoTooltip text="Cidades com ao menos uma estação em nível alto ou crítico." />
              </div>
              <p className="text-3xl font-bold text-orange-400">{summary.cities_with_alert}</p>
            </Card>

            <Card className={`border-l-2 ${RISK_LEVEL_BORDER[topLevel]}`}>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={15} className="text-slate-400" />
                <span className="text-slate-400 text-xs">Score mais alto</span>
                <InfoTooltip text="Estação com maior score de risco. Clique para ver detalhes." />
              </div>
              <p className="text-3xl font-bold text-white">{formatScore(summary.top_risk_station.risk_score)}</p>
              <div className="flex items-center gap-2 mt-1">
                <Link to={`/stations/${summary.top_risk_station.station_id}`} className="text-blue-400 hover:text-blue-300 text-xs font-medium">
                  {summary.top_risk_station.station_id}
                </Link>
                <RiskLevelBadge level={topLevel} size="sm" />
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Modules */}
      <div>
        <SectionHeader title="Módulos de Análise" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {MODULE_CARDS.map(({ to, icon: Icon, iconColor, title, desc, tag, accent }) => (
            <Link key={to} to={to}>
              <Card accent={accent} className="h-full hover:bg-slate-700/60 transition-colors group">
                <div className="flex items-start justify-between mb-3">
                  <Icon size={20} className={iconColor} />
                  <span className="text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded-full border border-slate-600">{tag}</span>
                </div>
                <p className="text-white font-semibold text-sm mb-1">{title}</p>
                <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
                <div className="flex items-center gap-1 mt-3 text-slate-500 text-xs group-hover:text-slate-300 transition-colors">
                  Explorar <ArrowRight size={12} />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Ranking */}
      <div>
        <SectionHeader
          icon={TrendingUp}
          iconColor="text-blue-400"
          title="Top 10 — Ranking de Risco"
          tooltip={<InfoTooltip text="As 10 estações com maior score no momento. Clique para ver análise detalhada." />}
        />
        <Card>
          <RiskRankingTable stations={ranking} />
        </Card>
      </div>
    </div>
  )
}

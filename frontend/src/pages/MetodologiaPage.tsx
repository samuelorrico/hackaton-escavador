import { BookOpen, Radar, ShieldAlert, GitMerge, Database, Users } from 'lucide-react'
import { Card, PageHeader, SectionHeader } from '../components/ui/Card'

export function MetodologiaPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      <PageHeader
        icon={BookOpen}
        iconColor="text-blue-400"
        bgColor="bg-blue-500/10"
        borderColor="border-blue-500/20"
        title="Metodologia"
        description="Como o GuardianAI processa dados e gera inteligência climática — do banco de dados bruto ao painel operacional."
      />

      <div>
        <SectionHeader icon={Database} iconColor="text-slate-400" title="Pipeline de Dados" />
        <Card>
          <div className="font-mono text-sm text-slate-300 space-y-1">
            <p>banco_de_dados.db (5,2M linhas · 48 estações · 2000–2021)</p>
            <p className="text-slate-500 pl-4">↓ leitura com sqlite3 + pandas</p>
            <p>Feature Engineering</p>
            <p className="text-slate-500 pl-4">→ acumulados de chuva (6h/12h/24h/48h/72h)</p>
            <p className="text-slate-500 pl-4">→ deltas de pressão, temperatura, umidade, vento (1h)</p>
            <p className="text-slate-500 pl-4">→ médias móveis 24h</p>
            <p className="text-slate-500 pl-4">→ z-scores por estação</p>
            <p className="text-slate-500 pl-4">↓ cache em parquet (reinicializações rápidas)</p>
            <p>FastAPI (dados em memória) → React frontend</p>
          </div>
        </Card>
      </div>

      <div>
        <SectionHeader title="Módulos de IA" />
        <div className="space-y-3">
          <Card accent="red">
            <div className="flex items-center gap-2 mb-3">
              <Radar size={16} className="text-red-400" />
              <h3 className="text-white font-semibold">Radar de Extremos</h3>
            </div>
            <div className="space-y-1.5 text-sm">
              <p className="text-slate-400">
                <span className="text-slate-300 font-medium">Algoritmo:</span> IsolationForest (sklearn) — um modelo por estação,
                treinado no histórico completo. Detecta leituras que se isolam da nuvem histórica normal.
              </p>
              <p className="text-slate-400">
                <span className="text-slate-300 font-medium">Features:</span> rain_24h, pressure_delta_1h, temp_delta_1h, humidity_delta_1h, rain_zscore, pressure_zscore.
              </p>
              <p className="text-slate-400">
                <span className="text-slate-300 font-medium">Saída:</span> anomaly_score [0,1] · labels: normal / atípico (top 30%) / extremo (top 10%).
              </p>
            </div>
          </Card>

          <Card accent="orange">
            <div className="flex items-center gap-2 mb-3">
              <ShieldAlert size={16} className="text-orange-400" />
              <h3 className="text-white font-semibold">Classificador de Risco</h3>
            </div>
            <div className="space-y-1.5 text-sm">
              <p className="text-slate-400">
                <span className="text-slate-300 font-medium">Algoritmo:</span> Scoring ponderado por percentis históricos da própria estação.
                Calibração relativa — 100 = pior já registrado na estação.
              </p>
              <p className="text-slate-400">
                <span className="text-slate-300 font-medium">Pesos:</span> chuva_72h (35%) · pressão_delta (25%) · anomaly_score (20%) · umidade (10%) · vento (10%).
              </p>
              <p className="text-slate-400">
                <span className="text-slate-300 font-medium">Saída:</span> risk_score [0–100] → baixo / médio / alto / crítico.
              </p>
            </div>
          </Card>

          <Card accent="green">
            <div className="flex items-center gap-2 mb-3">
              <GitMerge size={16} className="text-green-400" />
              <h3 className="text-white font-semibold">Gêmeo Climático</h3>
            </div>
            <div className="space-y-1.5 text-sm">
              <p className="text-slate-400">
                <span className="text-slate-300 font-medium">Algoritmo:</span> KMeans com seleção de K pelo método do cotovelo (elbow, K=2–8).
                Perfil de cada estação = médias históricas de 5 variáveis.
              </p>
              <p className="text-slate-400">
                <span className="text-slate-300 font-medium">Saída:</span> cluster_id · rótulo descritivo · deviation_score [0,1] vs centroide.
              </p>
            </div>
          </Card>
        </div>
      </div>

      <div>
        <SectionHeader icon={Database} iconColor="text-slate-400" title="Banco de Dados" />
        <Card padding="sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 border-b border-slate-700">
                  <th className="text-left py-2 pr-4">Variável</th>
                  <th className="text-left py-2 pr-4">Unidade</th>
                  <th className="text-left py-2">Uso</th>
                </tr>
              </thead>
              <tbody className="text-slate-300">
                {[
                  ['Precipitação horária', 'mm', 'Acumulados de chuva'],
                  ['Temperatura do ar (bulbo seco)', '°C', 'Delta, z-score, clustering'],
                  ['Pressão atmosférica', 'mB', 'Delta de pressão (instabilidade)'],
                  ['Umidade relativa', '%', 'Fator de risco'],
                  ['Rajada máxima de vento', 'm/s', 'Fator de risco'],
                  ['Radiação global', 'W/m²', 'Perfil climático'],
                ].map(([v, u, uso]) => (
                  <tr key={v} className="border-b border-slate-800">
                    <td className="py-2 pr-4">{v}</td>
                    <td className="py-2 pr-4 font-mono">{u}</td>
                    <td className="py-2 text-slate-400">{uso}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-slate-500 text-xs mt-3">Volume: 5,2M leituras · 48 estações INMET Bahia · 2000–2021</p>
        </Card>
      </div>

      <div>
        <SectionHeader icon={Users} iconColor="text-slate-400" title="Impacto Prático" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { actor: 'Defesa Civil', benefit: 'Identifica estações em estado crítico antes de eventos extremos', accent: 'red' as const },
            { actor: 'Gestão Municipal', benefit: 'Compara cidades e prioriza recursos por nível de risco', accent: 'orange' as const },
            { actor: 'Pesquisa Climática', benefit: 'Agrupa estações por perfil climático similar para análise regional', accent: 'green' as const },
          ].map(({ actor, benefit, accent }) => (
            <Card key={actor} accent={accent} padding="sm">
              <p className="text-white font-semibold text-sm mb-1">{actor}</p>
              <p className="text-slate-400 text-xs leading-relaxed">{benefit}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

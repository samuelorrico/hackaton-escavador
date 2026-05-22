export type RiskLevel = 'baixo' | 'médio' | 'alto' | 'crítico'
export type AnomalyLabel = 'normal' | 'atípico' | 'extremo'

export const RISK_COLORS: Record<RiskLevel, string> = {
  baixo: 'bg-green-500',
  médio: 'bg-yellow-400',
  alto: 'bg-orange-500',
  crítico: 'bg-red-600',
}

export const RISK_TEXT_COLORS: Record<RiskLevel, string> = {
  baixo: 'text-green-400',
  médio: 'text-yellow-400',
  alto: 'text-orange-400',
  crítico: 'text-red-400',
}

export const ANOMALY_COLORS: Record<AnomalyLabel, string> = {
  normal: 'bg-gray-400',
  atípico: 'bg-yellow-400',
  extremo: 'bg-red-600',
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/̀-ͯ/g, '')
    .replace(/\s+/g, '-')
}

export function formatScore(score: number): string {
  return score.toFixed(0)
}

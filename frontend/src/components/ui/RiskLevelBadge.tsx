import { RISK_COLORS, type RiskLevel } from '../../lib/utils'

interface Props {
  level: RiskLevel
  size?: 'sm' | 'md'
}

export function RiskLevelBadge({ level, size = 'md' }: Props) {
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
  return (
    <span className={`${RISK_COLORS[level]} ${padding} rounded-full font-semibold text-white capitalize`}>
      {level}
    </span>
  )
}

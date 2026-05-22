import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  /** accent color for left border or header gradient */
  accent?: 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'teal' | 'none'
  /** make card clickable */
  onClick?: () => void
  href?: string
  padding?: 'sm' | 'md'
}

const ACCENT_BORDER: Record<string, string> = {
  red:    'border-l-2 border-l-red-500',
  orange: 'border-l-2 border-l-orange-500',
  yellow: 'border-l-2 border-l-yellow-500',
  green:  'border-l-2 border-l-green-500',
  blue:   'border-l-2 border-l-blue-500',
  purple: 'border-l-2 border-l-purple-500',
  teal:   'border-l-2 border-l-teal-500',
  none:   '',
}

export function Card({ children, className = '', accent = 'none', onClick, padding = 'md' }: CardProps) {
  const base = `bg-slate-800/60 border border-slate-700/50 rounded-xl ${padding === 'sm' ? 'p-4' : 'p-5'}`
  const accentClass = ACCENT_BORDER[accent] ?? ''
  const interactive = onClick ? 'cursor-pointer hover:bg-slate-700/60 transition-colors' : ''
  return (
    <div className={`${base} ${accentClass} ${interactive} ${className}`} onClick={onClick}>
      {children}
    </div>
  )
}

interface PageHeaderProps {
  icon: React.ElementType
  iconColor: string
  bgColor: string
  borderColor: string
  title: string
  description: string
}

export function PageHeader({ icon: Icon, iconColor, bgColor, borderColor, title, description }: PageHeaderProps) {
  return (
    <div className={`${bgColor} ${borderColor} border rounded-2xl p-6`}>
      <div className="flex items-center gap-3 mb-2">
        <Icon size={26} className={iconColor} />
        <h1 className="text-2xl font-bold text-white">{title}</h1>
      </div>
      <p className="text-slate-300 text-sm leading-relaxed">{description}</p>
    </div>
  )
}

interface SectionHeaderProps {
  icon?: React.ElementType
  iconColor?: string
  title: string
  tooltip?: React.ReactNode
}

export function SectionHeader({ icon: Icon, iconColor = 'text-slate-400', title, tooltip }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-2 mb-4">
      {Icon && <Icon size={16} className={iconColor} />}
      <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wide">{title}</h2>
      {tooltip}
    </div>
  )
}

interface FilterBarProps {
  options: { value: string; label: string; count?: number }[]
  active: string
  onChange: (v: string) => void
}

export function FilterBar({ options, active, onChange }: FilterBarProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            active === o.value
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
              : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'
          }`}
        >
          {o.label}{o.count !== undefined ? ` (${o.count})` : ''}
        </button>
      ))}
    </div>
  )
}

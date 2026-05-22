import { Link } from 'react-router-dom'

interface Crumb { label: string; to?: string }
interface Props { crumbs: Crumb[] }

export function Breadcrumb({ crumbs }: Props) {
  return (
    <nav className="flex items-center gap-2 text-sm text-slate-400 mb-4">
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && <span>›</span>}
          {crumb.to ? (
            <Link to={crumb.to} className="hover:text-white transition-colors">
              {crumb.label}
            </Link>
          ) : (
            <span className="text-white">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}

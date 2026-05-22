import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/cities', label: 'Cidades' },
  { to: '/radar', label: 'Radar' },
  { to: '/risk', label: 'Classificador' },
  { to: '/clusters', label: 'Gêmeo' },
  { to: '/methodology', label: 'Metodologia' },
]

export function Navbar() {
  return (
    <nav className="bg-slate-900 border-b border-slate-700 px-6 py-3 flex items-center gap-6">
      <span className="text-white font-bold text-lg mr-4">GuardianAI</span>
      {links.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            isActive
              ? 'text-blue-400 font-medium text-sm'
              : 'text-slate-400 hover:text-white text-sm transition-colors'
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  )
}

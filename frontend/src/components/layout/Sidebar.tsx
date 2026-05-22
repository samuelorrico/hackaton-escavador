import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  MapPin,
  Radar,
  ShieldAlert,
  GitMerge,
  BookOpen,
  CloudRain,
  Menu,
  X,
} from 'lucide-react'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/cities', label: 'Cidades', icon: MapPin },
  { to: '/radar', label: 'Radar de Extremos', icon: Radar },
  { to: '/risk', label: 'Classificador de Risco', icon: ShieldAlert },
  { to: '/clusters', label: 'Gêmeo Climático', icon: GitMerge },
  { to: '/methodology', label: 'Metodologia', icon: BookOpen },
]

function NavItems({ onClose }: { onClose?: () => void }) {
  return (
    <nav className="flex flex-col gap-1 mt-2">
      {links.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-blue-600/20 text-blue-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`
          }
        >
          <Icon size={18} className="shrink-0" />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col h-full">
      <button
        onClick={() => { navigate('/'); onClose?.() }}
        className="flex items-center gap-2 px-3 py-3 mb-2 hover:opacity-80 transition-opacity text-left"
      >
        <CloudRain size={22} className="text-blue-400 shrink-0" />
        <span className="text-white font-bold text-base leading-tight">GuardianAI</span>
      </button>
      <NavItems onClose={onClose} />
      <div className="mt-auto pt-4 border-t border-slate-800">
        <p className="text-slate-600 text-xs px-3">Bahia · 48 estações · 2000–2021</p>
      </div>
    </div>
  )
}

/* Desktop sidebar — always visible on lg+ */
export function DesktopSidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-56 shrink-0 bg-slate-900 border-r border-slate-800 min-h-screen px-3 py-4 sticky top-0 h-screen overflow-y-auto">
      <SidebarContent />
    </aside>
  )
}

/* Mobile topbar + drawer */
export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Topbar */}
      <header className="lg:hidden flex items-center justify-between bg-slate-900 border-b border-slate-800 px-4 py-3 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <CloudRain size={20} className="text-blue-400" />
          <span className="text-white font-bold text-sm">GuardianAI</span>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          aria-label="Abrir menu"
        >
          <Menu size={22} />
        </button>
      </header>

      {/* Backdrop */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`lg:hidden fixed top-0 left-0 h-full w-64 bg-slate-900 border-r border-slate-800 z-50 px-3 py-4 transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex justify-end mb-2">
          <button
            onClick={() => setOpen(false)}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
            aria-label="Fechar menu"
          >
            <X size={20} />
          </button>
        </div>
        <SidebarContent onClose={() => setOpen(false)} />
      </div>
    </>
  )
}

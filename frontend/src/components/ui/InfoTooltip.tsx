import { useState } from 'react'
import { HelpCircle } from 'lucide-react'

interface Props {
  text: string
  size?: number
}

export function InfoTooltip({ text, size = 14 }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <span className="relative inline-flex items-center ml-1">
      <button
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen(v => !v)}
        className="text-slate-500 hover:text-slate-300 transition-colors"
        aria-label="Mais informações"
        type="button"
      >
        <HelpCircle size={size} />
      </button>
      {open && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-56 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-xs text-slate-200 shadow-xl pointer-events-none">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-700" />
        </div>
      )}
    </span>
  )
}

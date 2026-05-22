import { useEffect, useRef, useState } from 'react'

export interface StartupProgress {
  pct: number
  stage: string
  done: boolean
}

export function useBackendReady() {
  const [ready, setReady] = useState(false)
  const [progress, setProgress] = useState<StartupProgress>({ pct: 0, stage: 'Conectando ao servidor...', done: false })
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const activeRef = useRef(true)

  useEffect(() => {
    activeRef.current = true

    async function poll() {
      if (!activeRef.current) return

      try {
        const res = await fetch('/startup-progress', { signal: AbortSignal.timeout(2000) })
        if (!activeRef.current) return

        if (res.ok) {
          const data: StartupProgress = await res.json()
          setProgress(data)
          if (data.done) {
            setReady(true)
            return
          }
          timerRef.current = setTimeout(poll, 1000)
          return
        }
      } catch {
        // backend not reachable yet
      }

      if (!activeRef.current) return
      setProgress(p => ({ ...p, pct: Math.min(p.pct + 1, 9), stage: 'Iniciando servidor...' }))
      timerRef.current = setTimeout(poll, 2000)
    }

    poll()

    return () => {
      activeRef.current = false
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return { ready, progress }
}

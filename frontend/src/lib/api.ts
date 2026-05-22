const BASE_URL = import.meta.env.VITE_API_URL ?? '/api'
const TIMEOUT_MS = 10_000

async function request<T>(path: string): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(`${BASE_URL}${path}`, { signal: controller.signal })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(`API error ${res.status}: ${path}${body ? ` — ${body}` : ''}`)
    }
    return res.json() as Promise<T>
  } finally {
    clearTimeout(timer)
  }
}

export const api = {
  get: <T>(path: string) => request<T>(path),
}

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { DashboardPage } from '../pages/DashboardPage'
import { api } from '../lib/api'

vi.mock('../lib/api')

const mockSummary = {
  total_stations: 48,
  critical_stations: 3,
  high_risk_stations: 7,
  top_risk_station: { station_id: 'A401', risk_score: 88, risk_level: 'crítico' },
  most_anomalous_station: { station_id: 'A402', anomaly_score: 0.92 },
  cities_with_alert: 5,
}

const mockRanking = Array.from({ length: 10 }, (_, i) => ({
  station_id: `A40${i + 1}`,
  city: `Cidade ${i + 1}`,
  risk_score: 90 - i * 5,
  risk_level: i < 3 ? 'crítico' : i < 6 ? 'alto' : 'médio',
  anomaly_score: 0.8 - i * 0.05,
}))

function renderPage() {
  return render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>
  )
}

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(api.get).mockImplementation((path: string) => {
      if (path.includes('/dashboard/summary')) return Promise.resolve(mockSummary) as any
      if (path.includes('/dashboard/risk-ranking')) return Promise.resolve(mockRanking) as any
      return Promise.reject(new Error('unknown path'))
    })
  })

  it('renders 4 metric cards after loading', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText('48')).toBeTruthy())
    expect(screen.getByText(/total.*esta/i)).toBeTruthy()
    expect(screen.getByText(/cr[ií]ticas/i)).toBeTruthy()
    expect(screen.getByText(/cidades/i)).toBeTruthy()
  })

  it('risk ranking has 10 rows', async () => {
    renderPage()
    await waitFor(() => screen.getAllByText('A401'))
    const rows = screen.getAllByRole('row')
    expect(rows.length).toBeGreaterThanOrEqual(10)
  })

  it('ranking row links to station page', async () => {
    renderPage()
    await waitFor(() => screen.getAllByText('A401'))
    const links = screen.getAllByRole('link')
    const stationLink = links.find(l => l.getAttribute('href')?.includes('/stations/A401'))
    expect(stationLink).toBeTruthy()
  })

  it('shows loading state while fetching', () => {
    vi.mocked(api.get).mockImplementation(() => new Promise(() => {}))
    renderPage()
    expect(document.querySelector('.animate-spin')).toBeTruthy()
  })

  it('shows error state on API failure', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('network fail'))
    renderPage()
    await waitFor(() => expect(screen.getByText(/erro/i)).toBeTruthy())
  })
})

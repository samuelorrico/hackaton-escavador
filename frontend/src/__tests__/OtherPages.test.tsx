/**
 * Smoke tests for all pages: renders without crashing and shows key UI elements.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { api } from '../lib/api'

vi.mock('../lib/api')

const mockCity = {
  city: 'Salvador',
  stations: ['A401', 'A402'],
  avg_risk_score: 60,
  dominant_risk_level: 'alto',
  most_critical_station: { station_id: 'A401', risk_score: 80 },
}

const mockStation = {
  station_id: 'A401',
  city: 'Salvador',
  risk_score: 75,
  risk_level: 'alto',
  anomaly_score: 0.6,
  anomaly_label: 'atípico',
  climate_cluster: 1,
  cluster_label: 'Chuvoso costeiro',
  cluster_deviation_score: 0.3,
  current_readings: { rain_1h_mm: 5, pressure_mb: 1012, air_temp_c: 27, humidity_pct: 80, wind_gust_ms: 10 },
  risk_factors: [
    { factor: 'rain_72h_mm', contribution: 30, value: 120, label: 'Chuva acumulada 72h' },
    { factor: 'anomaly_score', contribution: 15, value: 0.6, label: 'Comportamento atípico' },
    { factor: 'humidity_pct', contribution: 8, value: 80, label: 'Umidade do ar' },
  ],
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(api.get).mockImplementation((path: string) => {
    if (path.includes('/cities/salvador')) return Promise.resolve(mockCity) as any
    if (path.includes('/cities')) return Promise.resolve([mockCity]) as any
    if (path.includes('/stations/A401/history')) return Promise.resolve([]) as any
    if (path.includes('/stations/A401')) return Promise.resolve(mockStation) as any
    if (path.includes('/radar/ranking')) return Promise.resolve([{ station_id: 'A401', city: 'Salvador', anomaly_score: 0.8, anomaly_label: 'extremo', main_driver: 'rain_24h_mm', driver_value: 100 }]) as any
    if (path.includes('/risk/distribution')) return Promise.resolve({ baixo: 20, médio: 15, alto: 8, crítico: 3 }) as any
    if (path.includes('/dashboard/risk-ranking')) return Promise.resolve([{ station_id: 'A401', city: 'Salvador', risk_score: 75, risk_level: 'alto', anomaly_score: 0.6 }]) as any
    if (path.includes('/clusters')) return Promise.resolve([{ cluster_id: 0, label: 'Chuvoso', station_count: 5, stations: ['A401'] }]) as any
    return Promise.resolve([]) as any
  })
})

function wrap(element: React.ReactNode, path = '/') {
  return render(<MemoryRouter initialEntries={[path]}>{element}</MemoryRouter>)
}

describe('CityPage list', () => {
  it('renders city list', async () => {
    const { CityPage } = await import('../pages/CityPage')
    wrap(<CityPage />)
    await waitFor(() => expect(screen.getByText('Salvador')).toBeTruthy())
  })
})

describe('CityPage detail', () => {
  it('renders city detail with stations', async () => {
    const { CityPage } = await import('../pages/CityPage')
    render(
      <MemoryRouter initialEntries={['/cities/salvador']}>
        <Routes>
          <Route path="/cities/:citySlug" element={<CityPage />} />
        </Routes>
      </MemoryRouter>
    )
    await waitFor(() => expect(screen.getAllByText('Salvador').length).toBeGreaterThan(0))
    expect(screen.getAllByText('A401').length).toBeGreaterThan(0)
  })
})

describe('StationPage', () => {
  it('renders station with risk score', async () => {
    const { StationPage } = await import('../pages/StationPage')
    render(
      <MemoryRouter initialEntries={['/stations/A401']}>
        <Routes>
          <Route path="/stations/:stationId" element={<StationPage />} />
        </Routes>
      </MemoryRouter>
    )
    await waitFor(() => expect(screen.getAllByText('A401').length).toBeGreaterThan(0))
    expect(screen.getByText('Fatores de Risco')).toBeTruthy()
  })
})

describe('RadarPage', () => {
  it('renders radar ranking', async () => {
    const { RadarPage } = await import('../pages/RadarPage')
    wrap(<RadarPage />)
    await waitFor(() => expect(screen.getByText('Radar de Extremos')).toBeTruthy())
    await waitFor(() => expect(screen.getByText('A401')).toBeTruthy())
  })
})

describe('ClassificadorPage', () => {
  it('renders risk distribution', async () => {
    const { ClassificadorPage } = await import('../pages/ClassificadorPage')
    wrap(<ClassificadorPage />)
    await waitFor(() => expect(screen.getByText('Classificador de Risco')).toBeTruthy())
  })
})

describe('GemeoPage', () => {
  it('renders cluster list', async () => {
    const { GemeoPage } = await import('../pages/GemeoPage')
    wrap(<GemeoPage />)
    await waitFor(() => expect(screen.getByText('Gêmeo Climático')).toBeTruthy())
  })
})

describe('MetodologiaPage', () => {
  it('renders methodology content statically', async () => {
    const { MetodologiaPage } = await import('../pages/MetodologiaPage')
    wrap(<MetodologiaPage />)
    expect(screen.getByText('Metodologia')).toBeTruthy()
    expect(screen.getByText('Radar de Extremos')).toBeTruthy()
    expect(screen.getByText('Classificador de Risco')).toBeTruthy()
    expect(screen.getByText('Gêmeo Climático')).toBeTruthy()
  })
})

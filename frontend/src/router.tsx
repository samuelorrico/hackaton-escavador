import { createBrowserRouter } from 'react-router-dom'
import { DashboardPage } from './pages/DashboardPage'
import { CityPage } from './pages/CityPage'
import { NeighborhoodPage } from './pages/NeighborhoodPage'
import { StationPage } from './pages/StationPage'
import { RadarPage } from './pages/RadarPage'
import { ClassificadorPage } from './pages/ClassificadorPage'
import { GemeoPage } from './pages/GemeoPage'
import { MetodologiaPage } from './pages/MetodologiaPage'
import { DesktopSidebar, MobileNav } from './components/layout/Sidebar'

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 flex">
      <DesktopSidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <MobileNav />
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export const router = createBrowserRouter([
  { path: '/', element: <Layout><DashboardPage /></Layout> },
  { path: '/cities', element: <Layout><CityPage /></Layout> },
  { path: '/cities/:citySlug', element: <Layout><CityPage /></Layout> },
  { path: '/cities/:citySlug/neighborhoods/:neighborhood', element: <Layout><NeighborhoodPage /></Layout> },
  { path: '/stations/:stationId', element: <Layout><StationPage /></Layout> },
  { path: '/radar', element: <Layout><RadarPage /></Layout> },
  { path: '/risk', element: <Layout><ClassificadorPage /></Layout> },
  { path: '/clusters', element: <Layout><GemeoPage /></Layout> },
  { path: '/clusters/:clusterId', element: <Layout><GemeoPage /></Layout> },
  { path: '/clusters/station/:stationId', element: <Layout><GemeoPage /></Layout> },
  { path: '/methodology', element: <Layout><MetodologiaPage /></Layout> },
])

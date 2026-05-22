import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { useBackendReady } from './hooks/useBackendReady'
import { BackendLoading } from './components/BackendLoading'

export default function App() {
  const { ready, progress } = useBackendReady()
  if (!ready) return <BackendLoading progress={progress} />
  return <RouterProvider router={router} />
}

import { useLocation } from 'react-router-dom'

export function useAgentTitle(): string {
  const { pathname } = useLocation()

  if (pathname.startsWith('/pacijenti/') && pathname.length > '/pacijenti/'.length) {
    return 'Agent – Karton'
  }
  if (pathname === '/pacijenti') return 'Agent – Pacijenti'
  if (pathname.startsWith('/posete/')) return 'Agent – Poseta'
  if (pathname === '/planer') return 'Agent – Planer'
  if (pathname === '/podesavanja') return 'Agent – Podešavanja'
  return 'Agent'
}

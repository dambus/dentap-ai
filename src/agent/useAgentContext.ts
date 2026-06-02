import { useLocation } from 'react-router-dom'
import type { AgentContext } from './types'

export function useAgentContext(): AgentContext {
  const { pathname } = useLocation()

  const patientMatch = pathname.match(/^\/pacijenti\/([0-9a-f-]{36})/)
  const visitMatch = pathname.match(/^\/posete\/([0-9a-f-]{36})/)

  if (patientMatch) {
    return { screen: 'pacijent', patientId: patientMatch[1] }
  }
  if (visitMatch) {
    return { screen: 'poseta', visitId: visitMatch[1] }
  }
  if (pathname === '/planer') {
    return {
      screen: 'planer',
      date: new Date().toISOString().split('T')[0],
    }
  }
  if (pathname.startsWith('/pacijenti')) {
    return { screen: 'pacijenti' }
  }
  if (pathname === '/podesavanja') {
    return { screen: 'podesavanja' }
  }
  return { screen: 'general' }
}

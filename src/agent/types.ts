export interface AgentMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface AgentContext {
  screen: 'planer' | 'pacijenti' | 'pacijent' | 'poseta' | 'podesavanja' | 'general'
  patientId?: string
  visitId?: string
  appointmentId?: string
  date?: string
}

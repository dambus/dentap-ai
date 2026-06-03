import { supabase } from '../lib/supabase'
import type { AgentContext } from './types'

interface AgentRequest {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
  context: AgentContext
}

interface AgentResponse {
  response: string
  actions_taken: Array<{ tool: string; summary: string }>
}

// Wrapper koji eksplicitno prosleđuje JWT token.
// supabase.functions.invoke() bi trebalo da ga šalje automatski, ali postoji
// race condition gde session nije syncovan u JS klijentu u trenutku poziva.
// Eksplicitno prosleđivanje eliminišuje tu grešku.
export async function invokeAgent(request: AgentRequest): Promise<AgentResponse> {
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    throw new Error('Nema aktivne sesije. Molimo se ponovo ulogujte.')
  }

  const { data, error } = await supabase.functions.invoke('agent', {
    body: request,
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  })

  if (error) throw error
  if (!data?.response) throw new Error('Agent nije vratio odgovor.')

  return data as AgentResponse
}

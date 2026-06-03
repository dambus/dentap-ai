import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Custom fetch sa 15s timeout-om.
// Supabase JS v2 nema ugrađeni timeout — ako auth refresh HTTP request "visi"
// (Docker pod opterećenjem, network issue), interni _isRefreshing lock ostaje
// zauvek true i SVE naredne DB/auth operacije čekaju beskonačno.
// Sa ovim wrapperom, bilo koji zaglavljeni request se abortuje posle 15s,
// lock se otpušta i zahtevi fail-uju sa jasnom greškom umesto tihog čekanja.
function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 15_000)

  return fetch(input, { ...init, signal: controller.signal }).finally(() =>
    clearTimeout(timer),
  )
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    fetch: fetchWithTimeout,
  },
})

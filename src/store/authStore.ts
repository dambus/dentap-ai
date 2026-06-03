import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Clinic, Profile } from '../types'

interface AuthState {
  user: User | null
  profile: Profile | null
  clinic: Clinic | null
  isLoading: boolean
  isInitialized: boolean
  initialize: () => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  _setFromSession: (user: User | null) => Promise<void>
}

// Modul-level guard — sprečava duplu registraciju listenera.
// React Strict Mode double-invokes effects; bez ovoga onAuthStateChange
// bi se registrovao dvaput, što vodi ka race conditionima i duplim API pozivima.
let _authSubscription: { unsubscribe: () => void } | null = null

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  clinic: null,
  isLoading: false,
  isInitialized: false,

  initialize: async () => {
    // Ako je listener već registrovan (Strict Mode double-invoke), preskoči
    if (_authSubscription) return

    const { data: { session } } = await supabase.auth.getSession()
    await get()._setFromSession(session?.user ?? null)

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        await get()._setFromSession(session?.user ?? null)
      },
    )
    _authSubscription = subscription

    set({ isInitialized: true })
  },

  signIn: async (email, password) => {
    set({ isLoading: true })
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    } finally {
      set({ isLoading: false })
    }
  },

  signOut: async () => {
    _authSubscription?.unsubscribe()
    _authSubscription = null
    await supabase.auth.signOut()
    set({ user: null, profile: null, clinic: null, isInitialized: false })
  },

  _setFromSession: async (user) => {
    if (!user) {
      set({ user: null, profile: null, clinic: null })
      return
    }

    set({ user })

    // Retry do 3 puta sa eksponencijalnim back-off-om.
    // Bez retry-a: ako Supabase Docker kasni pri prvom zahtevu, profile/clinic
    // ostaju null → svi query-i su disabled (enabled: !!clinic?.id = false) →
    // beskonačni spinner bez grešaka u konzoli.
    const clinicId = user.app_metadata?.clinic_id as string | undefined
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const [profileRes, clinicRes] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', user.id).single(),
          clinicId
            ? supabase.from('clinics').select('*').eq('id', clinicId).single()
            : Promise.resolve({ data: null, error: null }),
        ])

        set({
          profile: profileRes.data ?? null,
          clinic: clinicRes.data ?? null,
        })
        return // uspeh, izlazi iz petlje
      } catch {
        if (attempt < 2) {
          // Čekaj 800ms, 1600ms pre sledećeg pokušaja
          await new Promise((r) => setTimeout(r, 800 * (attempt + 1)))
        }
      }
    }
    // Posle 3 neuspela pokušaja: profile/clinic ostaju kao pre
    // (stale vrednosti su bolje od null koji blokira query-e)
  },
}))

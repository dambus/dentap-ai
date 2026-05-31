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

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  clinic: null,
  isLoading: false,
  isInitialized: false,

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    await get()._setFromSession(session?.user ?? null)

    supabase.auth.onAuthStateChange(async (_event, session) => {
      await get()._setFromSession(session?.user ?? null)
    })

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
    await supabase.auth.signOut()
    set({ user: null, profile: null, clinic: null })
  },

  _setFromSession: async (user) => {
    if (!user) {
      set({ user: null, profile: null, clinic: null })
      return
    }

    set({ user })

    try {
      const [profileResult, clinicResult] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase
          .from('clinics')
          .select('*')
          .eq('id', user.app_metadata?.clinic_id)
          .single(),
      ])

      set({
        profile: profileResult.data ?? null,
        clinic: clinicResult.data ?? null,
      })
    } catch {
      // profil ili klinika nisu dostupni — ne blokirati inicijalizaciju
    }
  },
}))

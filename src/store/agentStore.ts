import { create } from 'zustand'
import type { AgentMessage } from '../agent/types'

function id() {
  return Math.random().toString(36).slice(2)
}

interface AgentStore {
  messages: AgentMessage[]
  isTyping: boolean
  // ID poslednjeg pacijenta za koga je proaktivna analiza već pokrenuta
  // (da ne šaljemo duple zahteve ako korisnik navigira napred-nazad)
  lastProactivePatientId: string | null

  addMessage: (msg: Omit<AgentMessage, 'id' | 'timestamp'>) => void
  setMessages: (msgs: AgentMessage[]) => void
  setTyping: (typing: boolean) => void
  setLastProactivePatientId: (id: string | null) => void
  resetConversation: () => void
}

const WELCOME: AgentMessage = {
  id: 'welcome',
  role: 'assistant',
  content: 'Zdravo! Kako mogu da pomognem?',
  timestamp: new Date(),
}

export const useAgentStore = create<AgentStore>((set) => ({
  messages: [WELCOME],
  isTyping: false,
  lastProactivePatientId: null,

  addMessage: (msg) =>
    set((s) => ({
      messages: [...s.messages, { ...msg, id: id(), timestamp: new Date() }],
    })),

  setMessages: (msgs) => set({ messages: msgs }),

  setTyping: (typing) => set({ isTyping: typing }),

  setLastProactivePatientId: (pid) => set({ lastProactivePatientId: pid }),

  resetConversation: () =>
    set({ messages: [{ ...WELCOME, timestamp: new Date() }], isTyping: false }),
}))

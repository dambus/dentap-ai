import { useRef, useEffect, useCallback } from 'react'
import { Bot, ChevronLeft, ChevronRight, Send, Mic, MicOff } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { useAuthStore } from '../../store/authStore'
import { useAgentStore } from '../../store/agentStore'
import { useAgentTitle } from '../../agent/useAgentTitle'
import { useAgentContext } from '../../agent/useAgentContext'
import { useVoiceInput } from '../../agent/useVoiceInput'
import { supabase } from '../../lib/supabase'
import { cn } from '../../lib/utils'
import { useState } from 'react'
import type { AgentMessage } from '../../agent/types'

function generateId() {
  return Math.random().toString(36).slice(2)
}

// --- Typing indicator ---

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 px-4 py-2">
      <div className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center shrink-0">
        <Bot className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
      </div>
      <div className="flex items-center gap-1 px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-2xl rounded-bl-sm">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
            style={{ animationDelay: `${i * 150}ms`, animationDuration: '900ms' }}
          />
        ))}
      </div>
    </div>
  )
}

// --- Pojedinačna poruka ---

function MessageBubble({ message }: { message: AgentMessage }) {
  const isUser = message.role === 'user'

  return (
    <div className={cn('flex items-end gap-2 px-4 py-1', isUser && 'flex-row-reverse')}>
      <div
        className={cn(
          'w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold',
          isUser ? 'bg-teal-600 text-white' : 'bg-teal-100 dark:bg-teal-900/40',
        )}
      >
        {isUser ? 'Vi' : <Bot className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />}
      </div>
      <div
        className={cn(
          'max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap',
          isUser
            ? 'bg-teal-600 text-white rounded-br-sm'
            : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-sm',
        )}
      >
        {message.content}
      </div>
    </div>
  )
}

// --- Chat sadržaj ---

interface AgentChatProps {
  compact?: boolean
}

export function AgentChat({ compact }: AgentChatProps) {
  const profile = useAuthStore((s) => s.profile)
  const context = useAgentContext()
  const isOpen = useUIStore((s) => s.isAgentPanelOpen)

  const { messages, isTyping, lastProactivePatientId, addMessage, setMessages, setTyping, setLastProactivePatientId } =
    useAgentStore()

  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [interimText, setInterimText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // ── Proaktivna analiza: resetuj razgovor i pokreni pregled kad se otvori karton ──
  // VAŽNO: Poziv se odlaže 1.5s da page query-i stignu da se izvrše prvi.
  // Bez kašnjenja, supabase.functions.invoke() i page query-i bi konkurentno
  // triggerisali Supabase JWT refresh → interni lock → svi zahtevi vise.
  useEffect(() => {
    if (
      context.screen !== 'pacijent' ||
      !context.patientId ||
      context.patientId === lastProactivePatientId ||
      !isOpen
    )
      return

    setLastProactivePatientId(context.patientId)
    setMessages([
      {
        id: 'proactive-init',
        role: 'assistant',
        content: `Učitavam pregled pacijenta...`,
        timestamp: new Date(),
      },
    ])

    // Odloži Edge Function poziv da page data učita prvo
    const timer = setTimeout(() => {
      setTyping(true)
      setError(null)

      supabase.functions
        .invoke('agent', {
          body: {
            messages: [
              {
                role: 'user',
                content:
                  'Napravi kratki pregled ovog pacijenta pre pregleda: ' +
                  'istaži medicinska upozorenja i alergije, proveri datum poslednje posete ' +
                  '(ako nije bio duže od 6 meseci predloži kontrolu), i podsetni na sledeću ' +
                  'stavku iz aktivnog plana lečenja ako postoji. Budi koncizan (3–5 rečenica).',
              },
            ],
            context,
          },
        })
        .then(({ data, error: fnError }) => {
          setTyping(false)
          if (fnError || !data?.response) {
            setMessages([
              { id: 'welcome', role: 'assistant', content: `Zdravo${profile ? `, ${profile.first_name}` : ''}! Kako mogu da pomognem?`, timestamp: new Date() },
            ])
            return
          }
          setMessages([{ id: 'proactive', role: 'assistant', content: data.response, timestamp: new Date() }])
        })
        .catch(() => {
          setTyping(false)
          setMessages([
            { id: 'welcome', role: 'assistant', content: `Zdravo${profile ? `, ${profile.first_name}` : ''}! Kako mogu da pomognem?`, timestamp: new Date() },
          ])
        })
    }, 1500)

    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context.patientId, isOpen])

  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text || isTyping) return

    const userMsg: AgentMessage = { id: generateId(), role: 'user', content: text, timestamp: new Date() }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInput('')
    setTyping(true)
    setError(null)

    const history = updatedMessages.map((m) => ({ role: m.role, content: m.content }))

    try {
      const { data, error: fnError } = await supabase.functions.invoke('agent', {
        body: { messages: history, context },
      })
      if (fnError) throw fnError
      addMessage({ role: 'assistant', content: data?.response ?? 'Agent nije vratio odgovor.' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška pri komunikaciji sa agentom.')
    } finally {
      setTyping(false)
    }
  }, [input, isTyping, messages, context, addMessage, setMessages, setTyping])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend],
  )

  const { isListening, isSupported, startListening, stopListening } = useVoiceInput({
    onTranscript: (text) => {
      setInput((prev) => (prev ? `${prev} ${text}` : text))
      setInterimText('')
      inputRef.current?.focus()
    },
    onInterimTranscript: setInterimText,
  })

  const displayInput = isListening && interimText ? interimText : input

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 overflow-y-auto py-3 space-y-1">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isTyping && <TypingIndicator />}
        {error && <p className="px-4 py-2 text-xs text-red-500 dark:text-red-400">{error}</p>}
        <div ref={bottomRef} />
      </div>

      <div className="shrink-0 border-t border-slate-200 dark:border-slate-700 p-3">
        <div className="flex items-end gap-2">
          {isSupported && (
            <button
              onClick={isListening ? stopListening : startListening}
              className={cn(
                'shrink-0 p-2 rounded-lg transition-colors',
                isListening
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 animate-pulse'
                  : 'text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-700',
              )}
              title={isListening ? 'Zaustavi' : 'Govorna poruka (Chrome/Edge)'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}
          <textarea
            ref={inputRef}
            value={displayInput}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? 'Slušam...' : 'Pitajte agenta...'}
            rows={1}
            disabled={isTyping}
            className={cn(
              'flex-1 resize-none rounded-xl border px-3 py-2 text-sm',
              'bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100',
              'border-slate-200 dark:border-slate-600 placeholder:text-slate-400',
              'focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500',
              'max-h-28 overflow-y-auto',
              isListening && 'border-red-300 dark:border-red-700',
            )}
            style={{ lineHeight: '1.4' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className={cn(
              'shrink-0 p-2 rounded-lg transition-colors',
              input.trim() && !isTyping
                ? 'bg-teal-600 text-white hover:bg-teal-700'
                : 'text-slate-300 dark:text-slate-600 cursor-not-allowed',
            )}
            title="Pošalji (Enter)"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className={cn('text-[10px] mt-1.5 text-slate-400 dark:text-slate-600', compact && 'hidden')}>
          Enter — pošalji · Shift+Enter — novi red
          {isSupported && ' · Mikrofon — govorna poruka'}
        </p>
      </div>
    </div>
  )
}

// --- Desktop Agent Panel ---

export function AgentPanel() {
  const isOpen = useUIStore((s) => s.isAgentPanelOpen)
  const toggle = useUIStore((s) => s.toggleAgentPanel)
  const title = useAgentTitle()

  return (
    <div
      className={cn(
        'relative flex flex-col shrink-0 h-screen',
        'bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700',
        'transition-all duration-200',
        isOpen ? 'w-80' : 'w-10',
      )}
    >
      <button
        onClick={toggle}
        className={cn(
          'absolute top-1/2 -translate-y-1/2 -left-3 z-10',
          'flex items-center justify-center w-6 h-6',
          'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full shadow-sm',
          'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors',
        )}
        title={isOpen ? 'Zatvori agent panel' : 'Otvori agent panel'}
      >
        {isOpen ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      {isOpen ? (
        <>
          <div className="flex items-center gap-2 px-4 h-14 border-b border-slate-200 dark:border-slate-700 shrink-0">
            <Bot className="w-4 h-4 text-teal-600 shrink-0" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
              {title}
            </span>
          </div>
          <div className="flex-1 min-h-0">
            <AgentChat />
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center pt-16">
          <Bot className="w-4 h-4 text-slate-300 dark:text-slate-600" />
        </div>
      )}
    </div>
  )
}

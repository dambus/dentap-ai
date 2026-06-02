import { useState, useRef, useEffect, useCallback } from 'react'
import { Bot, ChevronLeft, ChevronRight, Send, Mic, MicOff } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { useAuthStore } from '../../store/authStore'
import { useAgentTitle } from '../../agent/useAgentTitle'
import { useVoiceInput } from '../../agent/useVoiceInput'
import { cn } from '../../lib/utils'
import type { AgentMessage } from '../../agent/types'

// Placeholder odgovor za Task 017 — zameniće se pozivom Edge Function u Task 018
const PLACEHOLDER_RESPONSE =
  'Pozdrav! Backend agenta je u pripremi (Task 018). ' +
  'Uskoro ću moći da odgovaram na pitanja o rasporedu, pacijentima i posetama.'

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
            className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-400 animate-bounce"
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
      {/* Avatar */}
      <div
        className={cn(
          'w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold',
          isUser
            ? 'bg-teal-600 text-white'
            : 'bg-teal-100 dark:bg-teal-900/40',
        )}
      >
        {isUser ? (
          'Vi'
        ) : (
          <Bot className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
        )}
      </div>

      {/* Balon */}
      <div
        className={cn(
          'max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed',
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

// --- Chat sadržaj (deljeno između desktop i mobile panela) ---

interface AgentChatProps {
  compact?: boolean
}

export function AgentChat({ compact }: AgentChatProps) {
  const profile = useAuthStore((s) => s.profile)
  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Zdravo${profile ? `, ${profile.first_name}` : ''}! Kako mogu da pomognem?`,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [interimText, setInterimText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll na novu poruku
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text || isTyping) return

    const userMsg: AgentMessage = {
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    // Task 018: zameni sa pravim Edge Function pozivom
    await new Promise((res) => setTimeout(res, 1400))
    setIsTyping(false)
    setMessages((prev) => [
      ...prev,
      {
        id: generateId(),
        role: 'assistant',
        content: PLACEHOLDER_RESPONSE,
        timestamp: new Date(),
      },
    ])
  }, [input, isTyping])

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
      {/* Lista poruka */}
      <div className="flex-1 overflow-y-auto py-3 space-y-1">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-slate-200 dark:border-slate-700 p-3">
        <div className="flex items-end gap-2">
          {/* Mikrofon */}
          {isSupported && (
            <button
              onClick={isListening ? stopListening : startListening}
              className={cn(
                'shrink-0 p-2 rounded-lg transition-colors',
                isListening
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 animate-pulse'
                  : 'text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-700',
              )}
              title={isListening ? 'Zaustavi snimanje' : 'Govorna poruka (Chrome/Edge)'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}

          {/* Textarea */}
          <textarea
            ref={inputRef}
            value={displayInput}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? 'Slušam...' : 'Pitajte agenta...'}
            rows={1}
            className={cn(
              'flex-1 resize-none rounded-xl border px-3 py-2 text-sm',
              'bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100',
              'border-slate-200 dark:border-slate-600',
              'placeholder:text-slate-400 dark:placeholder:text-slate-500',
              'focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500',
              'max-h-28 overflow-y-auto',
              isListening && 'border-red-300 dark:border-red-700',
            )}
            style={{ lineHeight: '1.4' }}
            disabled={isTyping}
          />

          {/* Pošalji */}
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
      {/* Toggle dugme */}
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
        {isOpen ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>

      {isOpen ? (
        <>
          {/* Header */}
          <div className="flex items-center gap-2 px-4 h-14 border-b border-slate-200 dark:border-slate-700 shrink-0">
            <Bot className="w-4 h-4 text-teal-600 shrink-0" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
              {title}
            </span>
          </div>

          {/* Chat */}
          <div className="flex-1 min-h-0">
            <AgentChat />
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center pt-16 gap-3">
          <Bot className="w-4 h-4 text-slate-300 dark:text-slate-600" />
        </div>
      )}
    </div>
  )
}

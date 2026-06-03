import { useRef, useEffect, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import { useQueryClient } from '@tanstack/react-query'
import { Bot, ChevronLeft, ChevronRight, Send, Mic, MicOff } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { useAuthStore } from '../../store/authStore'
import { useAgentStore } from '../../store/agentStore'
import { useAgentTitle } from '../../agent/useAgentTitle'
import { useAgentContext } from '../../agent/useAgentContext'
import { useVoiceInput } from '../../agent/useVoiceInput'
import { invokeAgent } from '../../agent/invokeAgent'
import { cn } from '../../lib/utils'
import { useState } from 'react'
import type { AgentMessage } from '../../agent/types'

function generateId() {
  return Math.random().toString(36).slice(2)
}

// Mapiranje agent alata → query ključevi koji treba da se invaliduju.
// Prefix matching: ['appointments'] invalidiše sve upite koji počinju sa 'appointments'.
const TOOL_QUERY_KEYS: Record<string, string[][]> = {
  create_appointment:        [['appointments'], ['visits', 'patient']],
  update_appointment_status: [['appointments']],
  update_visit_notes:        [['visit'], ['visits']],
  add_visit_procedure:       [['visit', 'procedures'], ['visit']],
}

function invalidateAfterActions(
  actions: Array<{ tool: string; summary: string }>,
  queryClient: ReturnType<typeof useQueryClient>,
) {
  const keysToInvalidate = new Set<string>()

  for (const action of actions) {
    const keys = TOOL_QUERY_KEYS[action.tool] ?? []
    for (const key of keys) {
      keysToInvalidate.add(JSON.stringify(key))
    }
  }

  for (const keyStr of keysToInvalidate) {
    queryClient.invalidateQueries({ queryKey: JSON.parse(keyStr) })
  }
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
          'max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed',
          isUser
            ? 'bg-teal-600 text-white rounded-br-sm'
            : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-sm',
        )}
      >
        {isUser ? (
          <span className="whitespace-pre-wrap">{message.content}</span>
        ) : (
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
              strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
              ul: ({ children }) => <ul className="list-disc pl-4 mb-1 space-y-0.5">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-4 mb-1 space-y-0.5">{children}</ol>,
              li: ({ children }) => <li>{children}</li>,
              hr: () => <hr className="border-slate-300 dark:border-slate-600 my-2" />,
              code: ({ children }) => (
                <code className="bg-slate-200 dark:bg-slate-600 px-1 rounded text-xs font-mono">
                  {children}
                </code>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
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
  const queryClient = useQueryClient()

  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [interimText, setInterimText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Proaktivna analiza pacijenta je uklonjena — korisnik koji otvori karton
  // već vidi sve podatke u UI, nema potrebe za duplikatom u chatu.

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
      const result = await invokeAgent({ messages: history, context })
      addMessage({ role: 'assistant', content: result.response })
      // Invaliduj query cache za sve entitete koje je agent promenio
      invalidateAfterActions(result.actions_taken, queryClient)
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

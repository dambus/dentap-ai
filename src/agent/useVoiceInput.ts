import { useState, useRef, useCallback } from 'react'

interface UseVoiceInputOptions {
  onTranscript: (text: string) => void
  onInterimTranscript?: (text: string) => void
}

interface UseVoiceInputReturn {
  isListening: boolean
  isSupported: boolean
  startListening: () => void
  stopListening: () => void
}

export function useVoiceInput({
  onTranscript,
  onInterimTranscript,
}: UseVoiceInputOptions): UseVoiceInputReturn {
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  const SpeechRecognitionAPI =
    typeof window !== 'undefined'
      ? (window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null)
      : null

  const isSupported = !!SpeechRecognitionAPI

  const startListening = useCallback(() => {
    if (!SpeechRecognitionAPI || isListening) return

    const recognition = new SpeechRecognitionAPI()
    recognition.lang = 'sr-RS'
    recognition.continuous = false
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    recognition.onstart = () => setIsListening(true)

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.results.length - 1]
      const transcript = result[0].transcript

      if (result.isFinal) {
        onTranscript(transcript)
        onInterimTranscript?.('')
      } else {
        onInterimTranscript?.(transcript)
      }
    }

    recognition.onend = () => {
      setIsListening(false)
      recognitionRef.current = null
    }

    recognition.onerror = () => {
      setIsListening(false)
      recognitionRef.current = null
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [SpeechRecognitionAPI, isListening, onTranscript, onInterimTranscript])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  return { isListening, isSupported, startListening, stopListening }
}

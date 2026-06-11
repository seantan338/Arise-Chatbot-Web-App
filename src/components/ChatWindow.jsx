import { useCallback, useEffect, useRef, useState } from 'react'
import Composer from './Composer.jsx'
import MessageBubble from './MessageBubble.jsx'
import TypingIndicator from './TypingIndicator.jsx'
import WelcomeScreen from './WelcomeScreen.jsx'
import { sendMessage } from '../lib/api.js'
import { getSessionId } from '../lib/session.js'

let uid = 0
const nextId = () => `m${++uid}-${Date.now()}`

export default function ChatWindow({ resetKey }) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef(null)
  const abortRef = useRef(null)

  // Reset conversation when "New chat" bumps resetKey.
  useEffect(() => {
    abortRef.current?.abort()
    setMessages([])
    setLoading(false)
  }, [resetKey])

  // Auto-scroll to the newest message.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => () => abortRef.current?.abort(), [])

  const handleSend = useCallback(
    async (text) => {
      if (loading) return
      const userMsg = { id: nextId(), role: 'user', content: text }
      setMessages((m) => [...m, userMsg])
      setLoading(true)

      const controller = new AbortController()
      abortRef.current = controller

      try {
        const { text: reply } = await sendMessage(text, getSessionId(), controller.signal)
        setMessages((m) => [...m, { id: nextId(), role: 'assistant', content: reply }])
      } catch (err) {
        if (err?.name === 'AbortError') return
        setMessages((m) => [
          ...m,
          {
            id: nextId(),
            role: 'assistant',
            error: true,
            content: err?.message || 'Something went wrong. Please try again.',
          },
        ])
      } finally {
        setLoading(false)
      }
    },
    [loading],
  )

  const empty = messages.length === 0

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-canvas">
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
        {empty ? (
          <WelcomeScreen onPick={handleSend} />
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col gap-4 px-3 py-5 sm:px-4">
            {messages.map((m) => (
              <MessageBubble key={m.id} role={m.role} content={m.content} error={m.error} />
            ))}
            {loading && <TypingIndicator />}
          </div>
        )}
      </div>
      <Composer onSend={handleSend} disabled={loading} />
    </div>
  )
}

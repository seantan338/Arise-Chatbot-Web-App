import { useEffect, useRef, useState } from 'react'

// Auto-growing text input + send button. Enter sends, Shift+Enter newlines.
export default function Composer({ onSend, disabled }) {
  const [value, setValue] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }, [value])

  function submit() {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="border-t border-line bg-surface/80 px-3 py-3 backdrop-blur sm:px-4">
      <div className="mx-auto flex max-w-3xl items-end gap-2">
        <textarea
          ref={ref}
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask about any project — pricing, packages, financing…"
          className="max-h-40 flex-1 resize-none rounded-2xl border border-line bg-canvas px-4 py-3 text-[0.95rem] text-ink outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/25"
        />
        <button
          onClick={submit}
          disabled={disabled || !value.trim()}
          aria-label="Send message"
          className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-teal text-white transition hover:bg-teal-dark disabled:cursor-not-allowed disabled:opacity-40"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2 11 13" />
            <path d="M22 2 15 22l-4-9-9-4 20-7z" />
          </svg>
        </button>
      </div>
      <p className="mx-auto mt-1.5 max-w-3xl px-1 text-center text-[0.7rem] text-muted">
        Verify all figures before sharing with clients · Internal use only
      </p>
    </div>
  )
}

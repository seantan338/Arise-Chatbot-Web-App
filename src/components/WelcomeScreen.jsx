import Logo from './Logo.jsx'
import { config } from '../config.js'

const SUGGESTIONS = [
  { icon: '🏗', text: 'Brief me on KSL Riverhaus' },
  { icon: '💰', text: "What's the sales package for Avenia?" },
  { icon: '📊', text: 'Compare Macrolink Medini vs Isola Coast Phase 2' },
  { icon: '🏦', text: 'Which banks finance Kews Green?' },
]

// Shown when the conversation is empty. Clicking a suggestion sends it.
export default function WelcomeScreen({ onPick }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4 py-10 text-center">
      <Logo className="h-16 w-16" />
      <h2 className="mt-5 font-serif text-2xl text-teal-dark">
        {config.botName}
      </h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
        Your internal assistant for project briefings, pricing, packages and
        financing. Ask in English, Bahasa Malaysia or 中文 — every answer links
        back to its source.
      </p>
      <div className="mt-7 grid w-full max-w-lg grid-cols-1 gap-2.5 sm:grid-cols-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s.text}
            onClick={() => onPick(s.text)}
            className="group flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-left text-sm text-ink shadow-soft transition hover:border-teal hover:shadow-lift"
          >
            <span className="text-lg">{s.icon}</span>
            <span className="leading-snug group-hover:text-teal-dark">{s.text}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

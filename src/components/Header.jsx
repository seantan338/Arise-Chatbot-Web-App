import Logo from './Logo.jsx'
import { config } from '../config.js'

export default function Header({ onNewChat, onSignOut, showSignOut }) {
  return (
    <header className="flex items-center justify-between border-b border-line bg-teal-dark px-4 py-3 text-white sm:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
          <Logo className="h-7 w-7" />
        </div>
        <div className="leading-tight">
          <div className="font-serif text-[1.05rem]">{config.botName}</div>
          <div className="text-[0.68rem] uppercase tracking-wider text-white/55">
            {config.agencyName} · Internal
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={onNewChat}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-white/85 transition hover:bg-white/10 hover:text-white"
          title="Start a new conversation"
        >
          New chat
        </button>
        {showSignOut && (
          <button
            onClick={onSignOut}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
            title="Lock the assistant"
          >
            Lock
          </button>
        )}
      </div>
    </header>
  )
}

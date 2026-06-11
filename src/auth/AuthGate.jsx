import { useState } from 'react'
import Logo from '../components/Logo.jsx'
import { config } from '../config.js'

// Passcode screen shown before the chat loads. Swappable seam: replace the
// onSubmit body with a real login call when moving to per-agent auth.
export default function AuthGate({ onSubmit }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const ok = onSubmit(code)
    if (!ok) {
      setError('Incorrect passcode. Please check with your manager.')
      setCode('')
    }
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-gradient-to-br from-teal-dark via-teal to-accent p-6">
      <div className="w-full max-w-sm animate-fadeUp rounded-2xl bg-surface p-8 shadow-lift">
        <div className="mb-6 flex flex-col items-center text-center">
          <Logo className="h-14 w-14" />
          <h1 className="mt-4 font-serif text-2xl text-teal-dark">{config.agencyName}</h1>
          <p className="mt-1 text-sm text-muted">{config.botName} · Internal Access</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <label htmlFor="passcode" className="block text-sm font-medium text-ink">
            Staff passcode
          </label>
          <input
            id="passcode"
            type="password"
            autoFocus
            autoComplete="off"
            value={code}
            onChange={(e) => {
              setCode(e.target.value)
              setError('')
            }}
            placeholder="Enter passcode"
            className="w-full rounded-lg border border-line bg-canvas px-4 py-3 text-ink outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/30"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-lg bg-teal py-3 font-semibold text-white transition hover:bg-teal-dark active:scale-[.99]"
          >
            Unlock
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted">
          For Arise Real Estate staff only. Do not share this link publicly.
        </p>
      </div>
    </div>
  )
}

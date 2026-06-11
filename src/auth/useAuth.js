import { useCallback, useEffect, useState } from 'react'
import { authEnabled, config } from '../config.js'

// Phase-1 access control: a single shared passcode kept in sessionStorage so
// agents re-authenticate when they fully close the browser. This hook is the
// single seam to replace later with per-agent login (when usage/billing grows):
// swap the `signIn` implementation for a real auth call and keep the same API.

const FLAG = 'arise.authed'

export function useAuth() {
  const [authed, setAuthed] = useState(() => {
    if (!authEnabled) return true
    try {
      return sessionStorage.getItem(FLAG) === '1'
    } catch {
      return false
    }
  })

  useEffect(() => {
    if (!authEnabled) setAuthed(true)
  }, [])

  const signIn = useCallback((code) => {
    if (!authEnabled) {
      setAuthed(true)
      return true
    }
    const ok = code.trim() === config.accessCode
    if (ok) {
      try {
        sessionStorage.setItem(FLAG, '1')
      } catch {
        /* ignore */
      }
      setAuthed(true)
    }
    return ok
  }, [])

  const signOut = useCallback(() => {
    try {
      sessionStorage.removeItem(FLAG)
    } catch {
      /* ignore */
    }
    setAuthed(false)
  }, [])

  return { authed, signIn, signOut, authEnabled }
}

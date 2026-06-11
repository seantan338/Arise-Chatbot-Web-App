// Stable per-browser session id so the n8n Window Buffer Memory can keep
// short-term conversation context per agent. Persisted in localStorage.

const KEY = 'arise.sessionId'

function makeId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'sess-' + Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function getSessionId() {
  try {
    let id = localStorage.getItem(KEY)
    if (!id) {
      id = makeId()
      localStorage.setItem(KEY, id)
    }
    return id
  } catch {
    // localStorage blocked (private mode) — fall back to an ephemeral id.
    return makeId()
  }
}

export function resetSession() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
  return getSessionId()
}

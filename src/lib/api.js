import { config } from '../config.js'

/**
 * Send a message to the Arise n8n "Web Chat" workflow and normalise the reply.
 *
 * The n8n "Respond to Webhook" node returns the AI Agent output. Depending on
 * how the workflow is wired it can come back as:
 *   { output: "..." }            (object — our recommended shape)
 *   [{ output: "..." }]          (array with one item)
 *   { text: "..." } / "..."      (other common shapes)
 * We defensively handle all of them so the UI never shows "[object Object]".
 *
 * @param {string} message    The agent's question.
 * @param {string} sessionId  Stable per-browser id for conversation memory.
 * @param {AbortSignal} [signal]
 * @returns {Promise<{ text: string }>}
 */
export async function sendMessage(message, sessionId, signal) {
  if (!config.webhookUrl) {
    throw new Error(
      'Chatbot is not configured yet. Ask your admin to set VITE_N8N_WEBHOOK_URL.',
    )
  }

  // Guard against a request that hangs forever (e.g. workflow stalled). The AI
  // agent + tool call can legitimately take a while, so allow up to 90s.
  const timeout = AbortSignal.timeout(90_000)
  const composite = signal ? anySignal([signal, timeout]) : timeout

  let res
  try {
    res = await fetch(config.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, sessionId }),
      signal: composite,
    })
  } catch (err) {
    // User navigated / started a new chat — propagate so the caller stays quiet.
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
    if (timeout.aborted) {
      throw new Error('The assistant took too long to respond. Please try again.')
    }
    throw new Error(
      'Could not reach the assistant. Check your connection or that the n8n workflow is active.',
    )
  }

  if (!res.ok) {
    throw new Error(
      `The assistant returned an error (${res.status}). The n8n workflow may be inactive or misconfigured.`,
    )
  }

  const raw = await res.text()
  return { text: extractText(raw) }
}

// Combine multiple AbortSignals into one (uses native AbortSignal.any when
// available, with a small fallback for older mobile browsers).
function anySignal(signals) {
  if (typeof AbortSignal.any === 'function') return AbortSignal.any(signals)
  const controller = new AbortController()
  for (const s of signals) {
    if (s.aborted) {
      controller.abort(s.reason)
      break
    }
    s.addEventListener('abort', () => controller.abort(s.reason), { once: true })
  }
  return controller.signal
}

function extractText(raw) {
  if (!raw) return 'No response.'

  let data
  try {
    data = JSON.parse(raw)
  } catch {
    // Plain text response — return as-is.
    return raw.trim()
  }

  const pick = (obj) => {
    if (obj == null) return ''
    if (typeof obj === 'string') return obj
    if (Array.isArray(obj)) return pick(obj[0])
    return (
      obj.output ??
      obj.text ??
      obj.message ??
      obj.answer ??
      obj.response ??
      obj.reply ??
      ''
    )
  }

  const text = pick(data)
  return (typeof text === 'string' ? text : JSON.stringify(text)).trim() || 'No response.'
}

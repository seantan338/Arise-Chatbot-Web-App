// Centralised runtime configuration, read from Vite env vars (see .env.example).
// Keeping this in one place makes it easy to swap the passcode gate for a
// per-agent login later without hunting through components.

const env = import.meta.env

export const config = {
  webhookUrl: (env.VITE_N8N_WEBHOOK_URL || '').trim(),
  accessCode: (env.VITE_ACCESS_CODE || '').trim(),
  botName: (env.VITE_BOT_NAME || 'Arise PropertyBot').trim(),
  agencyName: (env.VITE_AGENCY_NAME || 'Arise Real Estate').trim(),
}

// Whether the passcode gate should be enforced. If no code is configured we
// fail open (so a misconfigured deploy is still usable internally), but we warn.
export const authEnabled = config.accessCode.length > 0

export function assertConfigured() {
  if (!config.webhookUrl) {
    // eslint-disable-next-line no-console
    console.warn(
      '[Arise] VITE_N8N_WEBHOOK_URL is not set. Copy .env.example to .env and set the n8n webhook URL.',
    )
  }
}

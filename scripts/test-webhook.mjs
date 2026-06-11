#!/usr/bin/env node
/**
 * Quick end-to-end check of the n8n "Arise Chatbot — Web" webhook.
 *
 * Usage:
 *   node scripts/test-webhook.mjs "Brief me on KSL Riverhaus"
 *   WEBHOOK_URL=https://n8n.example.com/webhook/arise-web-chat node scripts/test-webhook.mjs
 *
 * It reads the URL from (in order): WEBHOOK_URL env, VITE_N8N_WEBHOOK_URL env,
 * or a .env file in the project root.
 */
import { readFileSync } from 'node:fs'

function fromEnvFile(key) {
  try {
    const txt = readFileSync(new URL('../.env', import.meta.url), 'utf8')
    const m = txt.match(new RegExp(`^${key}=(.*)$`, 'm'))
    return m ? m[1].trim() : ''
  } catch {
    return ''
  }
}

const url =
  process.env.WEBHOOK_URL ||
  process.env.VITE_N8N_WEBHOOK_URL ||
  fromEnvFile('VITE_N8N_WEBHOOK_URL')

if (!url) {
  console.error(
    'No webhook URL. Set WEBHOOK_URL=... or VITE_N8N_WEBHOOK_URL in .env',
  )
  process.exit(1)
}

const message = process.argv.slice(2).join(' ') || 'Brief me on KSL Riverhaus'
const sessionId = 'cli-test-' + Date.now()

console.log(`→ POST ${url}`)
console.log(`→ message: ${message}\n`)

const started = Date.now()
try {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sessionId }),
  })
  const text = await res.text()
  console.log(`← status ${res.status} in ${Date.now() - started}ms\n`)

  let out = text
  try {
    const data = JSON.parse(text)
    out = data.output ?? data.text ?? JSON.stringify(data, null, 2)
  } catch {
    /* plain text */
  }
  console.log(out)

  const hasLink = /\]\(https?:\/\//.test(out) || /https?:\/\//.test(out)
  console.log(
    '\n' +
      (hasLink
        ? '✓ Reply contains at least one URL/source link.'
        : '⚠ Reply contains NO link — check that the KB records have a "Source:" URL (re-run ingestion with the v3 transform).'),
  )
  process.exit(res.ok ? 0 : 2)
} catch (err) {
  console.error('Request failed:', err.message)
  console.error('Is the workflow active and the URL correct (use the PRODUCTION url)?')
  process.exit(1)
}

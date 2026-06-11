# Arise PropertyBot — Web Chat UI

Internal web chatbot for **Arise Real Estate** agents. It puts a branded,
multilingual chat interface in front of the existing n8n + Pinecone + Gemini
knowledge base — and, unlike the Telegram/WhatsApp bots, it **renders clickable
source links** so every answer points back to where the data came from.

Built with **Vite + React + Tailwind**.

---

## Why this exists — the "no source link" fix

Agents reported the bot never gave a URL pointing to the source of its data.
That was three problems stacked on top of each other:

1. **No URL in the knowledge base.** The ingested project records had no source
   link — only a raw `notion_page_id` in metadata. The model had nothing to cite.
2. **The agent was never told to cite.** The system prompt said "answer only from
   the tool" but never "include a source link."
3. **Formatting destroyed links.** The Telegram bots strip Markdown / escape
   `()[]`, mangling any link the model produced.

This project fixes all three:

| Fix | Where |
| --- | --- |
| Put a clickable **Source URL** into every KB record (+ asset links if present) | `n8n/Arise_Code_Node_Transform_v3_source_url.js` |
| Instruct the agent to **always append a "Sources" section** of Markdown links | system prompt in `n8n/Arise_Chatbot_Web.json` |
| **Render Markdown links** as real clickable anchors (new tab) | `src/components/Markdown.jsx` |

### Chosen citation direction (what to teach agents)

The bot ends every answer with a **Sources** section. By design it cites:

1. **Client-shareable asset links first** — Price List, Floor Plan, Brochure,
   Photos & Video (the things agents actually send to clients).
2. **The internal project record link last**, labelled "internal record".

**We deliberately do NOT "Share to web" the Notion database.** It holds
commission rates, agent notes and sales packages — that must not be exposed on
the open internet. So the Notion page link is an **internal/manager fallback**
that only opens for staff signed in to the Notion workspace; the *useful* links
agents click are the asset links.

> **To populate the asset links:** fill the Price List / Layout Floor Plan /
> Sales Kit / Photo & Video columns in the Notion projects database with public
> URLs (developer price lists, Google Drive folders, brochures). The v3
> transform cites them automatically — no code changes needed.

> **Teach agents this one rule:** *"Every answer ends with Sources. Click the
> Price List / Floor Plan / Brochure links to open and share with clients. The
> '— internal record' link is for managers only."*

---

## Architecture

```
Browser (this app)
   │  POST { message, sessionId }
   ▼
n8n "Arise Chatbot — Web" workflow
   Webhook → Edit Fields → AI Agent ─┬─ Google Gemini (LLM)
                                     ├─ Window Buffer Memory (per sessionId)
                                     └─ Pinecone "search_project_knowledge" tool
   → Respond to Webhook { output }
```

The web UI never talks to Pinecone/Gemini directly — it only calls the n8n
webhook, so all credentials stay inside n8n.

---

## 1. Set up the n8n workflows

Two workflows live in `n8n/`. Import both via **Import from File**:

| File | Purpose | Credentials |
| --- | --- | --- |
| `Arise_Chatbot_Web.json` | The web chat webhook the UI calls | **None to add** — reuses your live Pinecone + Gemini cred IDs |
| `Arise_KB_Ingestion_Web.json` | Refreshes Pinecone from Notion **with source URLs** | Pinecone + Gemini reused; **only the Notion node needs a token** |

**Chatbot (works immediately):**
1. Import `Arise_Chatbot_Web.json`, confirm the Gemini/Pinecone nodes show your
   existing credentials (re-select if your instance differs).
2. **Activate**, then copy the Webhook node's **Production URL**, e.g.
   `https://n8n.yourdomain.com/webhook/arise-web-chat`.

CORS is preset to `*` for easy testing. For production, set the Webhook node's
**Allowed Origins** to your deployed domain.

**Ingestion (one-time, to enable source links):**
1. Import `Arise_KB_Ingestion_Web.json`.
2. On the **Read Notion Project Database** node, create/select a Notion
   credential for the *separate Arise Notion account*: in that workspace make an
   **internal integration**, copy its token, and **share the projects database**
   with the integration. (This is the only credential in the whole project that
   isn't already wired up — because your files only contained a placeholder.)
3. Run it once with **Manual Trigger** (or let the 2 a.m. schedule run). It
   embeds a clickable `Source:` URL into every project record. This Code node
   already contains the v3 transform inline — no copy-paste needed.

## Verify the n8n side

```bash
npm run test:webhook "Brief me on KSL Riverhaus"
```

Reads the URL from `.env` (`VITE_N8N_WEBHOOK_URL`), posts a real message, prints
the reply, and tells you whether it contained a source link.

## 2. Configure & run the UI

```bash
cp .env.example .env       # then edit .env
npm install
npm run dev                # http://localhost:5173
```

`.env` values:

| Var | Purpose |
| --- | --- |
| `VITE_N8N_WEBHOOK_URL` | The webhook Production URL from step 1 |
| `VITE_ACCESS_CODE` | Shared staff passcode (phase-1 gate). Blank = no gate |
| `VITE_BOT_NAME` / `VITE_AGENCY_NAME` | Cosmetic labels |

## 3. Build & deploy

```bash
npm run build              # outputs static files to dist/
```

`dist/` is fully static — deploy it to Zeabur, Netlify, Vercel, Cloudflare
Pages, or any static host. Set the same `VITE_*` env vars in the host's build
settings. Ready-made configs are included:

| Host | File | Notes |
| --- | --- | --- |
| Netlify | `netlify.toml` | Build + SPA redirect preset |
| Vercel | `vercel.json` | Build + SPA rewrite preset |
| Zeabur / any container | `Dockerfile` + `nginx.conf` | Pass `VITE_*` as build args/env |

> Remember `VITE_*` vars are **build-time** for static hosts — set them in the
> host dashboard (or Docker build args), not at runtime.

---

## Access control

Phase 1 is a **shared passcode** (`VITE_ACCESS_CODE`) checked in
`src/auth/useAuth.js`, stored in `sessionStorage`. The whole auth surface is
isolated behind that one hook + `AuthGate.jsx` so it can be swapped for
**per-agent login** later (when usage/billing grows) without touching the chat
code: replace `signIn` with a real auth call and keep the same return shape.

> A browser-side passcode keeps the bot off the open web but is not strong
> security. Pair it with network restrictions (or move to per-agent login) if
> the link will live on the public internet.

---

## Project structure

```
src/
  App.jsx                 # auth gate ↔ chat switch
  config.js               # reads VITE_* env
  auth/                   # useAuth hook + passcode screen (swappable seam)
  lib/
    api.js                # POST to n8n, normalise reply shape
    session.js            # stable per-browser sessionId (memory key)
  components/
    ChatWindow.jsx        # message state, send loop, autoscroll
    Composer.jsx          # auto-growing input
    MessageBubble.jsx     # user vs assistant rendering
    Markdown.jsx          # clickable-link Markdown renderer
    WelcomeScreen.jsx     # empty-state suggestions
    Header.jsx · Logo.jsx · TypingIndicator.jsx
n8n/
  Arise_Chatbot_Web.json                      # web chat webhook workflow (import + activate)
  Arise_KB_Ingestion_Web.json                 # Notion → Pinecone refresh w/ source URLs
  Arise_Code_Node_Transform_v3_source_url.js  # the transform (also embedded in the ingestion wf)
scripts/
  test-webhook.mjs        # `npm run test:webhook` end-to-end check
Dockerfile · nginx.conf · netlify.toml · vercel.json   # deploy presets
```

---

## What you need to do (the only manual steps)

Everything else is wired up. You only have to:

1. **Import + activate** `n8n/Arise_Chatbot_Web.json`; copy its Webhook
   Production URL.
2. **Connect Notion once** in `n8n/Arise_KB_Ingestion_Web.json` (internal
   integration token from the *other* Arise Notion account + share the DB), then
   run it once. _Optional but needed for source links to appear._
3. **Fill the asset-link columns** (Price List / Floor Plan / Sales Kit / Photo
   & Video) in the Notion projects DB with public URLs — these become the links
   agents click. _Ongoing data hygiene, not code._
4. **Configure + deploy the UI**: `cp .env.example .env`, set
   `VITE_N8N_WEBHOOK_URL` and `VITE_ACCESS_CODE`, then `npm run build` and
   deploy `dist/` (or use a deploy preset above).
5. **Set the passcode** (`VITE_ACCESS_CODE`) and share it with staff. Restrict
   the Webhook's **Allowed Origins** to your deployed domain.

Verify anytime with `npm run test:webhook "Brief me on KSL Riverhaus"`.

---

*Internal tool for Arise Real Estate Sdn Bhd (License E(1) 2057). Do not share
the deployed link publicly.*

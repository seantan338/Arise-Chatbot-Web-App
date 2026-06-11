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

> **Note — Notion is in a separate Notion account/workspace.** The auto-derived
> `https://www.notion.so/<pageid>` links only open for staff signed in to that
> workspace. To make them open for everyone, either "Share to web" the Notion
> database, or fill in public asset-link columns (brochure / price list / Drive)
> in Notion — the transform cites those automatically when present.

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

## 1. Set up the n8n workflow

1. In n8n: **Import from File** → `n8n/Arise_Chatbot_Web.json`.
2. Open each credential-bearing node (Gemini chat, Embeddings, Pinecone) and
   confirm the credentials resolved (the file reuses the IDs from your existing
   Smart Bot; re-select them if your instance differs).
3. **Activate** the workflow and copy the **Production URL** from the Webhook
   node, e.g. `https://n8n.yourdomain.com/webhook/arise-web-chat`.
4. (Recommended) Re-run KB ingestion using the v3 transform so records carry a
   `Source:` URL — otherwise answers won't have links to cite.

CORS is preset to `*` on the webhook for easy testing. For production, change
the Webhook node's **Allowed Origins** to your deployed domain.

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
settings.

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
  Arise_Chatbot_Web.json                  # the web webhook workflow
  Arise_Code_Node_Transform_v3_source_url.js  # ingestion w/ source URLs
```

---

*Internal tool for Arise Real Estate Sdn Bhd (License E(1) 2057). Do not share
the deployed link publicly.*

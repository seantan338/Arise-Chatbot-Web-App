# Telegram Bot — sending PDF / images (fix)

The original **Arise Smart Bot** had only one output path
(`AI Agent → Code → Send a text message`), so it could never send a file — at
best it printed a link as text. `Arise_Smart_Bot_with_media.json` adds a media
branch.

## What changed
```
AI Agent ─┬─ Format Text ───────────────→ Send a text message   (unchanged path)
          └─ Extract Files → Download File → Route → Send Photo / Send Document
```

1. **System prompt** now tells the agent: for any asset link in the KB result,
   append a line `FILE: <Label> | <URL>` at the end of its answer.
2. **Extract Files** (Code) parses those `FILE:` lines into one item per file,
   normalises Google Drive share links to a direct-download URL, and tags each as
   `photo` (images) or `document` (PDF/other).
3. **Download File** (HTTP Request) downloads each as binary (`responseFormat:
   file`). Set to *continue on fail* so one bad link never blocks the reply.
4. **Route Photo / Document** (Switch) sends images via **sendPhoto** and
   PDFs/docs via **sendDocument** (binary upload — reliable, unlike asking
   Telegram to fetch a Drive/Notion URL itself).
5. **Format Text** strips the `FILE:` lines from the visible message.

## ⚠️ Data dependency — read this
Files only appear if the **knowledge base record actually contains the URLs**.
Right now the project records have empty asset columns, so:

1. Put public file URLs in the Notion **Price List / Floor Plan / Sales Kit /
   Sales Form / Photo & Video** columns.
2. Re-run ingestion with `Arise_KB_Ingestion_Web.json` (v3 transform) so those
   links land in Pinecone.
3. Then the bot will emit `FILE:` lines and send the actual files.

## How to test
- Import `Arise_Smart_Bot_with_media.json` (imports as a **new** workflow named
  "Arise Smart Bot (PDF/Image enabled)").
- Temporarily put one public PDF/image URL in one project's Price List/Photo
  column, re-ingest, then message the bot about that project.
- ⚠️ Don't run two workflows on the **same Telegram bot token** at once — both
  will poll `getUpdates` and clash. Deactivate the old "Arise Smart Bot" before
  activating this one.

## Notes / limits
- Telegram bot upload limit ≈ 50 MB per file.
- Google Drive **folder** links can't be sent as a file (only individual files);
  those stay as a text link.
- Sending images via `sendDocument` (instead of `sendPhoto`) keeps full
  resolution — useful for floor plans. Swap the Switch routing if you prefer that.

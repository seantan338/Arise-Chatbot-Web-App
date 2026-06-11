// ── Arise PropertyBot — Notion → Pinecone Transform (v3, with Source URL) ──
// Paste this into the Code node (JavaScript mode) that runs AFTER the
// "Read Notion Project Database" node in your KB ingestion workflow.
//
// WHAT'S NEW vs v2:
//   • Derives a clickable Source URL for every project from its Notion page id
//     and writes it BOTH into the embedded text ("Source:" line) AND metadata
//     (`source_url`). This is what lets the chatbot cite where its answer came
//     from. Without a URL in the record, the model has nothing to link to.
//   • Still includes any real asset links (Price List, Floor Plan, Sales Kit,
//     Sales Form, Photo & Video) when those columns are filled in Notion —
//     those get cited too, automatically.
//
// IMPORTANT — Notion lives in a SEPARATE Notion account/workspace:
//   The derived link looks like https://www.notion.so/<pageid>. It will only
//   open for staff who are signed in to (or invited to) that workspace. If you
//   want links that open for everyone, either (a) "Share to web" the database
//   so pages are public, or (b) replace `sourceUrlFor()` below to point at a
//   public mirror (e.g. a Google Drive / brochure URL column).

function getText(prop) {
  if (!prop) return '';
  if (typeof prop === 'string') return prop;
  if (typeof prop === 'number') return String(prop);
  if (prop.type === 'title')        return (prop.title || []).map(t => t.plain_text || '').join('');
  if (prop.type === 'rich_text')    return (prop.rich_text || []).map(t => t.plain_text || '').join('');
  if (prop.type === 'select')       return prop.select?.name || '';
  if (prop.type === 'multi_select') return (prop.multi_select || []).map(s => s.name).join(', ');
  if (prop.type === 'number')       return prop.number != null ? String(prop.number) : '';
  if (prop.type === 'checkbox')     return prop.checkbox ? 'Yes' : 'No';
  if (prop.type === 'url')          return prop.url || '';
  if (prop.type === 'date')         return prop.date?.start || '';
  if (prop.type === 'files')        return (prop.files || []).map(f => f.external?.url || f.file?.url || f.name || '').join(', ');
  if (prop.type === 'formula')      return String(prop.formula?.string || prop.formula?.number || '');
  return '';
}

// Build a Notion page URL from the page id (works across accounts as long as
// the viewer has access to that workspace, or the page is shared to web).
function sourceUrlFor(pageId) {
  if (!pageId) return '';
  return 'https://www.notion.so/' + String(pageId).replace(/-/g, '');
}

const items = $input.all();
const docs = [];

for (const item of items) {
  const p = item.json.properties || item.json;
  const pageId = item.json.id || '';
  const sourceUrl = sourceUrlFor(pageId);

  function get(key) { return getText(p[key]); }

  const name        = item.json.name || get('Name') || get('name');
  const projectName = get('Project Name') || name;
  if (!name && !projectName) continue;

  // Ordered fields for the embedded document body.
  const fields = {
    'Developer':            get('Developer Name'),
    'Description':          get('Title'),
    'Unit Types':           get('Unit Type'),
    'Built-Up Size':        get('Built Up'),
    'Price':                get('Price'),
    'Land Tenure':          get('Land Tenure'),
    'Total Units':          get('Total Unit'),
    'Lot Size':             get('Lot Size'),
    'Total Land Area':      get('Total Land Area'),
    'Facing':               get('Facing'),
    'Car Park':             get('Car Park Level'),
    'Ceiling Height':       get('Ceiling Height'),
    'Maintenance Fee':      get('Maintenance Fee'),
    'Construction Period':  get('Construction Period / Ex...') || get('Construction Period'),
    'Dev Composition':      get('Development Composit...') || get('Development Composition'),
    'Facilities':           get('Facilities'),
    'Fitting & Structure':  get('Fitting & Structure (1)') || get('Fitting & Structure'),
    'USP / Key Points':     get('USP'),
    'Special Package':      get('Special Package'),
    'Sales Package':        get('Sales Package'),
    'Bank / End Financing': get('Bank / EF'),
    'APDL':                 get('APDL'),
    'No Lift':              get('No Lift'),
    'Latest Available Unit':get('Latest Available Unit'),
    'Sales Gallery Hours':  get('Sales Gallery Operating ...') || get('Sales Gallery Operating Hours'),
  };

  // Asset link fields — cited as clickable links when present.
  const assets = {
    'Price List': get('Price List'),
    'Floor Plan': get('Layout Floor Plan') || get('Floor Plan'),
    'Sales Kit':  get('Sales Kit'),
    'Sales Form': get('Sales Form'),
    'Photo & Video': get('Photo & Video'),
  };

  const lines = [`PROJECT: ${projectName}`];
  for (const [label, value] of Object.entries(fields)) {
    if (value && value.trim()) lines.push(`${label}: ${value}`);
  }
  for (const [label, value] of Object.entries(assets)) {
    if (value && value.trim()) lines.push(`${label} Link: ${value.trim()}`);
  }
  // The line the system prompt looks for when citing.
  if (sourceUrl) lines.push(`Source: ${sourceUrl}`);

  docs.push({
    json: {
      pageContent: lines.join('\n'),
      metadata: {
        type: 'new_launch',
        notion_page_id: pageId,
        source_url: sourceUrl,
        project_name: projectName,
        developer: fields['Developer'],
        source: 'notion_project_database',
      },
    },
  });
}

console.log(`Transformed ${docs.length} projects (with source URLs) from Notion`);
return docs;

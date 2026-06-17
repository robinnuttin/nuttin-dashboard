// ─── Obsidian Local REST API Client ───────────────────────────────
// Plugin: https://github.com/coddingtonbear/obsidian-local-rest-api
// Install in Obsidian → Settings → Community Plugins → Local REST API
// Default port: 27123

const OBSIDIAN_BASE = process.env.OBSIDIAN_URL || 'http://localhost:27123'
const OBSIDIAN_KEY  = process.env.OBSIDIAN_API_KEY || ''

function headers() {
  return {
    'Authorization': `Bearer ${OBSIDIAN_KEY}`,
    'Content-Type': 'application/json',
  }
}

// ─── Read a note ──────────────────────────────────────────────────
export async function readNote(path: string): Promise<string> {
  const res = await fetch(`${OBSIDIAN_BASE}/vault/${encodeURIComponent(path)}`, {
    headers: headers(),
  })
  if (!res.ok) throw new Error(`Obsidian read error ${res.status}`)
  return res.text()
}

// ─── Write / create a note ────────────────────────────────────────
export async function writeNote(path: string, content: string): Promise<void> {
  const res = await fetch(`${OBSIDIAN_BASE}/vault/${encodeURIComponent(path)}`, {
    method: 'PUT',
    headers: headers(),
    body: content,
  })
  if (!res.ok) throw new Error(`Obsidian write error ${res.status}`)
}

// ─── Append to a note ─────────────────────────────────────────────
export async function appendNote(path: string, content: string): Promise<void> {
  const res = await fetch(`${OBSIDIAN_BASE}/vault/${encodeURIComponent(path)}`, {
    method: 'PATCH',
    headers: { ...headers(), 'Content-Type': 'text/markdown' },
    body: content,
  })
  if (!res.ok) throw new Error(`Obsidian append error ${res.status}`)
}

// ─── List notes in a folder ───────────────────────────────────────
export async function listNotes(folder = ''): Promise<string[]> {
  const res = await fetch(`${OBSIDIAN_BASE}/vault/${encodeURIComponent(folder)}/`, {
    headers: headers(),
  })
  if (!res.ok) return []
  const data = await res.json()
  return (data.files || []) as string[]
}

// ─── Search notes ─────────────────────────────────────────────────
export async function searchNotes(query: string): Promise<{ filename: string; score: number }[]> {
  const res = await fetch(`${OBSIDIAN_BASE}/search/simple/?query=${encodeURIComponent(query)}&contextLength=100`, {
    headers: headers(),
  })
  if (!res.ok) return []
  const data = await res.json()
  return data as { filename: string; score: number }[]
}

// ─── NuttinOS vault paths ─────────────────────────────────────────
export const VAULT = {
  daily:       (date: string) => `NuttinOS/Daily/${date}.md`,
  journal:     (date: string) => `NuttinOS/Journal/${date}.md`,
  priorities:  (date: string) => `NuttinOS/Priorities/${date}.md`,
  training:    (date: string) => `NuttinOS/Training/${date}.md`,
  nutrition:   (date: string) => `NuttinOS/Nutrition/${date}.md`,
  contacts:    () => 'NuttinOS/CRM/contacts.md',
  financieel:  (month: string) => `NuttinOS/Financial/${month}.md`,
}

// ─── Write daily summary to Obsidian ─────────────────────────────
export async function writeDailySummary(date: string, data: {
  priorities: string[]
  mood: number
  wokeOnTime: boolean
  supplementsTaken: boolean
  trainingDone: boolean
  prayersDone: number
  notes?: string
}): Promise<void> {
  const content = `---
date: ${date}
mood: ${data.mood}
---

# Dagelijks overzicht — ${date}

## Prioriteiten
${data.priorities.map((p, i) => `${i + 1}. ${p}`).join('\n')}

## Check-ins
- Optijd opgestaan: ${data.wokeOnTime ? 'ja' : 'nee'}
- Supplementen: ${data.supplementsTaken ? 'ja' : 'nee'}
- Training: ${data.trainingDone ? 'ja' : 'nee'}
- Gebeden: ${data.prayersDone}/5

${data.notes ? `## Notities\n${data.notes}` : ''}
`
  await writeNote(VAULT.daily(date), content)
}

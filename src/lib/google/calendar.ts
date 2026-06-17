// ─── Google Calendar API Client ───────────────────────────────────
// Uses OAuth2 with refresh token stored in env vars
// Setup: https://developers.google.com/calendar/api/quickstart/nodejs

const GOOGLE_BASE = 'https://www.googleapis.com/calendar/v3'

async function getAccessToken(): Promise<string> {
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN
  const clientId     = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET

  if (!refreshToken || !clientId || !clientSecret) {
    throw new Error('Google OAuth credentials not configured')
  }

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type:    'refresh_token',
      refresh_token: refreshToken,
      client_id:     clientId,
      client_secret: clientSecret,
    }),
  })

  if (!res.ok) throw new Error(`Google token refresh failed: ${res.status}`)
  const data = await res.json()
  return data.access_token
}

export interface GCalEvent {
  id: string
  summary: string
  description?: string
  start: { dateTime?: string; date?: string }
  end:   { dateTime?: string; date?: string }
  attendees?: { email: string; displayName?: string }[]
  htmlLink?: string
}

// ─── List upcoming events ─────────────────────────────────────────
export async function listEvents(
  calendarId = 'primary',
  timeMin?: string,
  timeMax?: string,
  maxResults = 50
): Promise<GCalEvent[]> {
  const token = await getAccessToken()
  const now = timeMin || new Date().toISOString()
  const end = timeMax || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

  const params = new URLSearchParams({
    timeMin: now, timeMax: end,
    maxResults: String(maxResults),
    singleEvents: 'true',
    orderBy: 'startTime',
  })

  const res = await fetch(`${GOOGLE_BASE}/calendars/${encodeURIComponent(calendarId)}/events?${params}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Google Calendar list error: ${res.status}`)
  const data = await res.json()
  return data.items || []
}

// ─── Create event ─────────────────────────────────────────────────
export async function createEvent(
  calendarId = 'primary',
  event: { summary: string; description?: string; start: string; end: string }
): Promise<GCalEvent> {
  const token = await getAccessToken()

  const res = await fetch(`${GOOGLE_BASE}/calendars/${encodeURIComponent(calendarId)}/events`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      summary: event.summary,
      description: event.description,
      start: { dateTime: event.start },
      end:   { dateTime: event.end },
    }),
  })
  if (!res.ok) throw new Error(`Google Calendar create error: ${res.status}`)
  return res.json()
}

export function isConfigured(): boolean {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN)
}

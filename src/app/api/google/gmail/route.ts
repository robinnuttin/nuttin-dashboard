import { NextRequest, NextResponse } from 'next/server'

// ─── Gmail API — parse conversations for tasks ────────────────────
// Uses same OAuth credentials as Calendar

async function getAccessToken(): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type:    'refresh_token',
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN!,
      client_id:     process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  })
  if (!res.ok) throw new Error('Gmail token refresh failed')
  const data = await res.json()
  return data.access_token
}

function isConfigured() {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN)
}

export async function GET(req: NextRequest) {
  if (!isConfigured()) {
    return NextResponse.json({ configured: false })
  }

  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q') || 'is:unread'
  const maxResults = Number(searchParams.get('max') || 10)

  try {
    const token = await getAccessToken()

    // List message IDs
    const listRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=${maxResults}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    if (!listRes.ok) throw new Error(`Gmail list error: ${listRes.status}`)
    const listData = await listRes.json()

    if (!listData.messages?.length) {
      return NextResponse.json({ configured: true, emails: [] })
    }

    // Fetch first 5 messages
    const emails = await Promise.all(
      listData.messages.slice(0, 5).map(async (m: { id: string }) => {
        const msgRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        if (!msgRes.ok) return null
        const msg = await msgRes.json()
        const headers = msg.payload?.headers || []
        return {
          id: m.id,
          from:    headers.find((h: { name: string }) => h.name === 'From')?.value || '',
          subject: headers.find((h: { name: string }) => h.name === 'Subject')?.value || '',
          date:    headers.find((h: { name: string }) => h.name === 'Date')?.value || '',
          snippet: msg.snippet || '',
        }
      })
    )

    return NextResponse.json({ configured: true, emails: emails.filter(Boolean) })
  } catch (err) {
    console.error('Gmail GET error:', err)
    return NextResponse.json({ configured: true, error: String(err), emails: [] })
  }
}

// POST: AI parses an email/conversation and extracts tasks/appointments
export async function POST(req: NextRequest) {
  try {
    const { text, sender } = await req.json()
    if (!text) return NextResponse.json({ error: 'No text provided' }, { status: 400 })

    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) return NextResponse.json({ tasks: [], appointments: [] })

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || '',
        'X-Title': 'Nuttin OS',
      },
      body: JSON.stringify({
        model: 'google/gemma-4-31b-it:free',
        messages: [{
          role: 'user',
          content: `Analyseer dit bericht van ${sender || 'onbekend'} en extraheer taken en afspraken.
Geef ALLEEN een JSON terug:
{"tasks": [{"title":"...","due_date":"YYYY-MM-DD","priority":"high/medium/low"}], "appointments": [{"title":"...","datetime":"YYYY-MM-DDTHH:MM","notes":"..."}]}

Bericht:
${text}`,
        }],
        max_tokens: 300,
        temperature: 0.1,
      }),
    })

    if (!res.ok) return NextResponse.json({ tasks: [], appointments: [] })
    const data = await res.json()
    const content = data.choices?.[0]?.message?.content || '{}'

    try {
      const match = content.match(/\{[\s\S]*\}/)
      if (match) return NextResponse.json(JSON.parse(match[0]))
    } catch { /* fall through */ }

    return NextResponse.json({ tasks: [], appointments: [] })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

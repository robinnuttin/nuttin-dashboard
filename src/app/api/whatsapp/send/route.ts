import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { to, message, bridgeUrl } = await req.json()

    if (!bridgeUrl) {
      return NextResponse.json({ error: 'Bridge URL niet geconfigureerd' }, { status: 400 })
    }
    if (!to || !message) {
      return NextResponse.json({ error: 'Ontbrekend: to en message zijn verplicht' }, { status: 400 })
    }

    // Normalize number: strip +, spaces, dashes
    const normalized = to.replace(/[\s\-+]/g, '')
    const jid = normalized.includes('@') ? normalized : `${normalized}@s.whatsapp.net`

    const res = await fetch(`${bridgeUrl}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: jid, message }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Bridge niet bereikbaar' }))
      return NextResponse.json(err, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('WhatsApp send error:', error)
    return NextResponse.json({ error: 'Kon bericht niet versturen' }, { status: 500 })
  }
}

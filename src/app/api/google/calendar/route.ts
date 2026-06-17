import { NextRequest, NextResponse } from 'next/server'
import { listEvents, createEvent, isConfigured } from '@/lib/google/calendar'

export async function GET(req: NextRequest) {
  if (!isConfigured()) {
    return NextResponse.json({ configured: false, events: [] })
  }

  const { searchParams } = new URL(req.url)
  const timeMin = searchParams.get('timeMin') || undefined
  const timeMax = searchParams.get('timeMax') || undefined

  try {
    const events = await listEvents('primary', timeMin, timeMax)
    return NextResponse.json({ configured: true, events })
  } catch (err) {
    console.error('Google Calendar GET error:', err)
    return NextResponse.json({ configured: true, error: String(err), events: [] })
  }
}

export async function POST(req: NextRequest) {
  if (!isConfigured()) {
    return NextResponse.json({ error: 'Google not configured' }, { status: 503 })
  }

  try {
    const body = await req.json()
    const event = await createEvent('primary', body)
    return NextResponse.json({ event })
  } catch (err) {
    console.error('Google Calendar POST error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

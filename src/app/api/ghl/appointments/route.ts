import { NextRequest, NextResponse } from 'next/server'
import { getAppointments } from '@/lib/ghl/client'

export async function GET(req: NextRequest) {
  if (!process.env.GHL_API_KEY) {
    return NextResponse.json({ error: 'GHL not configured' }, { status: 503 })
  }

  const { searchParams } = new URL(req.url)

  // Default: fetch next 30 days
  const now = new Date()
  const startDate = searchParams.get('startDate') || now.toISOString().split('T')[0]

  const end = new Date(now)
  end.setDate(end.getDate() + 30)
  const endDate = searchParams.get('endDate') || end.toISOString().split('T')[0]

  try {
    const appointments = await getAppointments(startDate, endDate)
    return NextResponse.json({ appointments })
  } catch (error) {
    console.error('GHL appointments GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 502 })
  }
}

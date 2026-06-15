import { NextResponse } from 'next/server'
import { getOpportunities } from '@/lib/ghl/client'

export async function GET() {
  if (!process.env.GHL_API_KEY) {
    return NextResponse.json({ error: 'GHL not configured' }, { status: 503 })
  }

  try {
    const opportunities = await getOpportunities()
    return NextResponse.json({ opportunities })
  } catch (error) {
    console.error('GHL opportunities GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch opportunities' }, { status: 502 })
  }
}

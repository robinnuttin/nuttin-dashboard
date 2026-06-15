import { NextRequest, NextResponse } from 'next/server'

// iOS Shortcuts sends health data to this endpoint
export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const { steps, heart_rate_avg, active_calories, sleep_hours, date } = data

    console.log('Health sync received:', { date, steps, heart_rate_avg, active_calories, sleep_hours })

    // In production: save to Supabase
    // const { error } = await supabase.from('health_sync').insert({ date, steps, heart_rate_avg, active_calories })

    return NextResponse.json({ success: true, received: { date, steps, heart_rate_avg, active_calories, sleep_hours } })
  } catch (error) {
    console.error('Health sync error:', error)
    return NextResponse.json({ error: 'Failed to sync health data' }, { status: 500 })
  }
}

// For testing the endpoint
export async function GET() {
  return NextResponse.json({
    message: 'Health sync endpoint active',
    usage: 'POST with: { steps, heart_rate_avg, active_calories, sleep_hours, date }',
    ios_shortcut_example: {
      url: '/api/health/sync',
      method: 'POST',
      body: { steps: 8234, heart_rate_avg: 68, active_calories: 420, sleep_hours: 7.5, date: '2026-06-15' },
    },
  })
}

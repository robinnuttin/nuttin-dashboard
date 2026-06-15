import { NextResponse } from 'next/server'

// Quick connectivity check — fetch 1 contact to verify key + location work
export async function GET() {
  const apiKey = process.env.GHL_API_KEY
  const locationId = process.env.GHL_LOCATION_ID

  if (!apiKey || !locationId) {
    return NextResponse.json({ configured: false, reason: 'Missing API key or location ID' })
  }

  try {
    const res = await fetch(
      `https://services.leadconnectorhq.com/contacts/?locationId=${locationId}&limit=1`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28',
        },
      }
    )

    if (res.ok) {
      const data = await res.json()
      return NextResponse.json({
        configured: true,
        connected: true,
        contactCount: data.meta?.total || 0,
        locationId,
      })
    }

    const text = await res.text()
    return NextResponse.json({
      configured: true,
      connected: false,
      status: res.status,
      error: text,
    })
  } catch (error) {
    return NextResponse.json({
      configured: true,
      connected: false,
      error: String(error),
    })
  }
}

import { NextRequest, NextResponse } from 'next/server'

// Kortrijk coordinates
const LAT = 50.8280
const LON = 3.2647
const CITY = 'Kortrijk'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
    const [year, month, day] = date.split('-')

    // Aladhan API - completely free, no key needed
    const response = await fetch(
      `https://api.aladhan.com/v1/timings/${day}-${month}-${year}?latitude=${LAT}&longitude=${LON}&method=2`,
      { next: { revalidate: 86400 } } // Cache for 24 hours
    )

    if (!response.ok) {
      throw new Error('Aladhan API failed')
    }

    const data = await response.json()
    const timings = data.data?.timings

    if (!timings) throw new Error('No timings in response')

    return NextResponse.json({
      date,
      city: CITY,
      prayers: {
        fajr: timings.Fajr,
        sunrise: timings.Sunrise,
        dhuhr: timings.Dhuhr,
        asr: timings.Asr,
        maghrib: timings.Maghrib,
        isha: timings.Isha,
      },
    })
  } catch (error) {
    console.error('Prayer times error:', error)
    // Return static fallback times for Kortrijk in June
    return NextResponse.json({
      date: new Date().toISOString().split('T')[0],
      city: CITY,
      prayers: {
        fajr: '04:12',
        sunrise: '05:51',
        dhuhr: '13:29',
        asr: '17:15',
        maghrib: '21:08',
        isha: '22:38',
      },
    })
  }
}

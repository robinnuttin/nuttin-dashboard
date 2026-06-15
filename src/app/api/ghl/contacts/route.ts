import { NextRequest, NextResponse } from 'next/server'
import { getContacts, createContact } from '@/lib/ghl/client'

export async function GET() {
  if (!process.env.GHL_API_KEY) {
    return NextResponse.json({ error: 'GHL not configured' }, { status: 503 })
  }

  try {
    const contacts = await getContacts(50)
    return NextResponse.json({ contacts })
  } catch (error) {
    console.error('GHL contacts GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 502 })
  }
}

export async function POST(req: NextRequest) {
  if (!process.env.GHL_API_KEY) {
    return NextResponse.json({ error: 'GHL not configured' }, { status: 503 })
  }

  try {
    const body = await req.json()
    const contact = await createContact(body)
    return NextResponse.json({ contact })
  } catch (error) {
    console.error('GHL contacts POST error:', error)
    return NextResponse.json({ error: 'Failed to create contact' }, { status: 502 })
  }
}

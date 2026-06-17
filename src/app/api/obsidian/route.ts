import { NextRequest, NextResponse } from 'next/server'
import { readNote, writeNote, appendNote, listNotes, searchNotes, writeDailySummary, VAULT } from '@/lib/obsidian/client'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action')

  try {
    if (action === 'status') {
      // Quick connectivity check
      const notes = await listNotes('NuttinOS')
      return NextResponse.json({ connected: true, noteCount: notes.length })
    }

    if (action === 'read') {
      const path = searchParams.get('path')
      if (!path) return NextResponse.json({ error: 'path required' }, { status: 400 })
      const content = await readNote(path)
      return NextResponse.json({ content })
    }

    if (action === 'list') {
      const folder = searchParams.get('folder') || 'NuttinOS'
      const files = await listNotes(folder)
      return NextResponse.json({ files })
    }

    if (action === 'search') {
      const q = searchParams.get('q') || ''
      const results = await searchNotes(q)
      return NextResponse.json({ results })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err) {
    return NextResponse.json({ connected: false, error: String(err) })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, path, content, date, data } = body

    if (action === 'write' && path && content !== undefined) {
      await writeNote(path, content)
      return NextResponse.json({ ok: true })
    }

    if (action === 'append' && path && content) {
      await appendNote(path, content)
      return NextResponse.json({ ok: true })
    }

    if (action === 'daily' && date && data) {
      await writeDailySummary(date, data)
      return NextResponse.json({ ok: true, path: VAULT.daily(date) })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err) {
    console.error('Obsidian POST error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

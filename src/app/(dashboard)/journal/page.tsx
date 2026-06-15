'use client'
import { useState } from 'react'
import { Card, CardTitle, CardHeader, CardDivider } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea, Input } from '@/components/ui/input'
import { formatDate, getTodayString } from '@/lib/utils'

interface JournalEntry {
  id: string; date: string; content: string; mood: number; tags: string[]
}

const PROMPTS = [
  'Wat is vandaag goed gegaan?',
  'Wat had ik anders kunnen doen?',
  'Waar ben ik dankbaar voor?',
  'Wat leert dit mij?',
  'Wat wil ik morgen anders doen?',
  'Wat is mijn grootste uitdaging nu?',
  'Hoe voel ik mij op dit moment?',
  'Welke actie kan ik morgen ondernemen?',
]

const INITIAL_ENTRIES: JournalEntry[] = [
  { id: '1', date: '2026-06-14', content: 'Goede dag gehad. 80 emails verstuurd, review card sessie in Kortrijk leverde 2 kaarten op. Slaap was beter dan vorige week.', mood: 7, tags: ['business', 'productief'] },
  { id: '2', date: '2026-06-13', content: 'Training ging goed. Push dag, bench press naar 82.5kg gebracht. Voeding was on point vandaag - 218g proteïne. Slaap was slecht, pas om 1u naar bed gegaan. Moet dit aanpakken.', mood: 6, tags: ['training', 'slaap'] },
  { id: '3', date: '2026-06-12', content: 'Meeting met David over B2B leadgen. Veel ideeën uitgewisseld. Zijn de scrapers bijna klaar. Deal proposal verstuurd naar Kapper Steff.', mood: 8, tags: ['business', 'david', 'deals'] },
]

function MoodIcon({ score }: { score: number }) {
  const color = score >= 8 ? 'var(--accent-green-text)' : score >= 6 ? 'var(--accent-blue-text)' : score >= 4 ? 'var(--accent-yellow-text)' : 'var(--accent-red-text)'
  return (
    <div style={{ fontSize: '18px', fontFamily: 'var(--font-mono)', fontWeight: 700, color }}>
      {score}/10
    </div>
  )
}

function MoodSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
      <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginRight: '4px' }}>Mood:</span>
      {[1,2,3,4,5,6,7,8,9,10].map((v) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          style={{
            width: '22px', height: '22px', borderRadius: '4px',
            fontSize: '11px', fontWeight: 600,
            background: value === v ? 'var(--text-primary)' : 'var(--bg-secondary)',
            color: value === v ? 'var(--bg)' : 'var(--text-muted)',
            border: '1px solid var(--border)',
            cursor: 'pointer', transition: 'all 0.1s ease',
          }}
        >
          {v}
        </button>
      ))}
    </div>
  )
}

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>(INITIAL_ENTRIES)
  const [writing, setWriting] = useState(false)
  const [content, setContent] = useState('')
  const [mood, setMood] = useState(7)
  const [tags, setTags] = useState('')
  const [selected, setSelected] = useState<JournalEntry | null>(null)

  const todayEntry = entries.find((e) => e.date === getTodayString())

  const save = () => {
    if (!content.trim()) return
    const entry: JournalEntry = {
      id: Date.now().toString(),
      date: getTodayString(),
      content,
      mood,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
    }
    setEntries((prev) => [entry, ...prev.filter((e) => e.date !== getTodayString())])
    setContent('')
    setMood(7)
    setTags('')
    setWriting(false)
  }

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '4px' }}>Journaling</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Dagelijkse reflectie voor groei en bewustzijn</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
        {/* Write / View */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Today's entry */}
          <Card padding="md">
            <CardHeader
              action={
                !writing && !todayEntry ? (
                  <Button size="sm" variant="primary" onClick={() => setWriting(true)}
                    icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>}
                  >
                    Schrijven
                  </Button>
                ) : todayEntry && !writing ? (
                  <Button size="sm" variant="secondary" onClick={() => { setContent(todayEntry.content); setMood(todayEntry.mood); setWriting(true) }}>
                    Bewerken
                  </Button>
                ) : null
              }
            >
              <CardTitle>Vandaag</CardTitle>
            </CardHeader>

            {writing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Schrijf vrij... Hoe was je dag? Wat heb je geleerd? Hoe voel je je?"
                  style={{ minHeight: '180px' }}
                />
                <MoodSelector value={mood} onChange={setMood} />
                <Input
                  label="Tags (komma-gescheiden)"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="training, business, reflectie..."
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button variant="secondary" onClick={() => setWriting(false)} style={{ flex: 1 }}>Annuleer</Button>
                  <Button variant="primary" onClick={save} disabled={!content.trim()} style={{ flex: 1 }}>Opslaan</Button>
                </div>
              </div>
            ) : todayEntry ? (
              <div>
                <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.7, marginBottom: '12px', whiteSpace: 'pre-wrap' }}>
                  {todayEntry.content}
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <MoodIcon score={todayEntry.mood} />
                  {todayEntry.tags.map((t) => <Badge key={t} variant="muted">{t}</Badge>)}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
                Nog niets geschreven vandaag.
              </div>
            )}
          </Card>

          {/* Reflection prompts */}
          <Card padding="md">
            <CardTitle subtitle="Gebruik deze vragen als inspiratie">Reflectie Vragen</CardTitle>
            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {PROMPTS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => { setContent((c) => c + (c ? '\n\n' : '') + p + '\n'); setWriting(true) }}
                  style={{
                    textAlign: 'left', padding: '8px 12px', borderRadius: 'var(--radius-sm)',
                    fontSize: '13px', color: 'var(--text-secondary)',
                    background: 'transparent', border: '1px solid var(--border)',
                    cursor: 'pointer', transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-secondary)' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
                >
                  {p}
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* History */}
        <div>
          <Card padding="md">
            <CardTitle subtitle={`${entries.length} entries`}>Geschiedenis</CardTitle>
            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  onClick={() => setSelected(selected?.id === entry.id ? null : entry)}
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${selected?.id === entry.id ? 'var(--border-strong)' : 'var(--border)'}`,
                    background: selected?.id === entry.id ? 'var(--bg-secondary)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 500 }}>{formatDate(entry.date)}</span>
                    <MoodIcon score={entry.mood} />
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: selected?.id === entry.id ? undefined : 2, WebkitBoxOrient: 'vertical' }}>
                    {entry.content}
                  </p>
                  {entry.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: '4px', marginTop: '8px', flexWrap: 'wrap' }}>
                      {entry.tags.map((t) => <Badge key={t} variant="muted">{t}</Badge>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

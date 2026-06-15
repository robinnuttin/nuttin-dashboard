'use client'
import { useState, useEffect } from 'react'
import { Card, CardTitle, CardHeader, CardDivider } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useChecklistStore, usePrayerStore, usePrioritiesStore } from '@/stores/app-store'
import { getTodayString, formatTime } from '@/lib/utils'

// ─── Prayer Times ──────────────────────────────────────────────
const STATIC_PRAYER_TIMES = {
  fajr: '04:12',
  sunrise: '05:51',
  dhuhr: '13:29',
  asr: '17:15',
  maghrib: '21:08',
  isha: '22:38',
}

const PRAYERS = [
  { key: 'fajr', label: 'Fajr', arabic: 'الفجر', time: STATIC_PRAYER_TIMES.fajr },
  { key: 'dhuhr', label: 'Dhuhr', arabic: 'الظهر', time: STATIC_PRAYER_TIMES.dhuhr },
  { key: 'asr', label: 'Asr', arabic: 'العصر', time: STATIC_PRAYER_TIMES.asr },
  { key: 'maghrib', label: 'Maghrib', arabic: 'المغرب', time: STATIC_PRAYER_TIMES.maghrib },
  { key: 'isha', label: 'Isha', arabic: 'العشاء', time: STATIC_PRAYER_TIMES.isha },
] as const

function PrayerTracker() {
  const { togglePrayer, getTodayLogs } = usePrayerStore()
  const today = getTodayString()
  const todayLogs = getTodayLogs()
  const now = formatTime(new Date())

  const isPrayerDue = (prayerTime: string) => now >= prayerTime
  const completed = todayLogs.filter((l) => l.completed).length

  return (
    <Card padding="md">
      <CardHeader
        action={<Badge variant={completed === 5 ? 'green' : completed >= 3 ? 'blue' : 'yellow'}>{completed}/5 gebeden</Badge>}
      >
        <CardTitle subtitle="Kortrijk — Juni 2026">Gebedstijden</CardTitle>
      </CardHeader>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {PRAYERS.map((p) => {
          const log = todayLogs.find((l) => l.prayer_name === p.key)
          const done = log?.completed ?? false
          const due = isPrayerDue(p.time)

          return (
            <div
              key={p.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                background: done ? 'var(--accent-green-bg)' : due ? 'var(--bg-secondary)' : 'transparent',
                border: `1px solid ${done ? 'var(--accent-green-text)' : due ? 'var(--border)' : 'transparent'}`,
                transition: 'all 0.2s ease',
                cursor: 'pointer',
              }}
              onClick={() => togglePrayer(today, p.key)}
            >
              {/* Check circle */}
              <div style={{
                width: '22px', height: '22px', borderRadius: '50%',
                border: `2px solid ${done ? 'var(--accent-green-text)' : due ? 'var(--border-strong)' : 'var(--border)'}`,
                background: done ? 'var(--accent-green-text)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'all 0.2s ease',
              }}>
                {done && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: done ? 'var(--accent-green-text)' : 'var(--text-primary)' }}>
                    {p.label}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{p.arabic}</span>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: due && !done ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {p.time}
                </div>
                {!due && (
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Nog niet begonnen</div>
                )}
                {due && done && (
                  <div style={{ fontSize: '10px', color: 'var(--accent-green-text)' }}>Gedaan</div>
                )}
                {due && !done && (
                  <div style={{ fontSize: '10px', color: 'var(--accent-yellow-text)' }}>Nu beschikbaar</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

// ─── Daily Checklist ──────────────────────────────────────────
const CHECKLIST_CATEGORIES = {
  health: { label: 'Gezondheid', color: 'var(--accent-green-text)' },
  business: { label: 'Business', color: 'var(--accent-blue-text)' },
  faith: { label: 'Geloof', color: 'var(--accent-purple-text)' },
  appearance: { label: 'Uiterlijk', color: 'var(--accent-yellow-text)' },
  personal: { label: 'Persoonlijk', color: 'var(--text-secondary)' },
}

function DailyChecklist() {
  const { items, toggle, initToday } = useChecklistStore()
  const today = getTodayString()

  useEffect(() => { initToday() }, [initToday])

  const todayItems = items.filter((i) => i.date === today)
  const done = todayItems.filter((i) => i.completed).length
  const score = todayItems.length > 0 ? Math.round((done / todayItems.length) * 100) : 0

  const byCategory = (todayItems.reduce((acc, item) => {
    const cat = item.category || 'personal'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {} as Record<string, typeof todayItems>))

  return (
    <Card padding="md">
      <CardHeader
        action={
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{
              fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-mono)',
              color: score >= 80 ? 'var(--accent-green-text)' : score >= 60 ? 'var(--accent-blue-text)' : 'var(--accent-yellow-text)'
            }}>
              {score}%
            </span>
          </div>
        }
      >
        <CardTitle subtitle={`${done}/${todayItems.length} afgevinkt`}>Dagelijkse Checklist</CardTitle>
      </CardHeader>

      <Progress value={done} max={todayItems.length} height={3} color="auto" />

      <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {Object.entries(byCategory).map(([cat, catItems]) => (
          <div key={cat}>
            <div style={{
              fontSize: '10px', fontWeight: 600, letterSpacing: '0.06em',
              textTransform: 'uppercase', color: CHECKLIST_CATEGORIES[cat as keyof typeof CHECKLIST_CATEGORIES]?.color || 'var(--text-muted)',
              marginBottom: '6px',
            }}>
              {CHECKLIST_CATEGORIES[cat as keyof typeof CHECKLIST_CATEGORIES]?.label || cat}
            </div>
            {catItems.map((item) => (
              <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0', cursor: 'pointer', borderBottom: '1px solid var(--border)' }}>
                <div
                  onClick={() => toggle(item.id)}
                  style={{
                    width: '16px', height: '16px', borderRadius: '4px',
                    border: `1.5px solid ${item.completed ? 'var(--accent-green-text)' : 'var(--border)'}`,
                    background: item.completed ? 'var(--accent-green-bg)' : 'transparent',
                    flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s ease', cursor: 'pointer',
                  }}
                >
                  {item.completed && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green-text)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                </div>
                <span style={{
                  fontSize: '13px',
                  color: item.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                  textDecoration: item.completed ? 'line-through' : 'none',
                  transition: 'all 0.15s ease',
                  flex: 1,
                }}>
                  {item.item}
                </span>
              </label>
            ))}
          </div>
        ))}
      </div>
    </Card>
  )
}

// ─── Top 3 Priorities ─────────────────────────────────────────
function PrioritiesCard() {
  const { setToday, getToday } = usePrioritiesStore()
  const priorities = getToday()
  const [editing, setEditing] = useState(!priorities)
  const [p1, setP1] = useState(priorities?.priority_1 || '')
  const [p2, setP2] = useState(priorities?.priority_2 || '')
  const [p3, setP3] = useState(priorities?.priority_3 || '')

  const save = () => {
    if (!p1) return
    setToday(p1, p2, p3)
    setEditing(false)
  }

  return (
    <Card padding="md">
      <CardHeader
        action={
          <Button size="sm" variant="ghost" onClick={() => setEditing(!editing)}>
            {editing ? 'Annuleer' : 'Bewerken'}
          </Button>
        }
      >
        <CardTitle subtitle="Stel elke avond in voor de volgende dag">Top 3 Prioriteiten</CardTitle>
      </CardHeader>

      {editing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Input label="Prioriteit 1 (Meest belangrijk)" value={p1} onChange={(e) => setP1(e.target.value)} placeholder="Grootste impact vandaag..." />
          <Input label="Prioriteit 2" value={p2} onChange={(e) => setP2(e.target.value)} placeholder="Tweede focus..." />
          <Input label="Prioriteit 3" value={p3} onChange={(e) => setP3(e.target.value)} placeholder="Derde focus..." />
          <Button variant="primary" onClick={save} disabled={!p1}>Opslaan</Button>
          <div style={{ padding: '10px 12px', background: 'var(--accent-blue-bg)', borderRadius: 'var(--radius-sm)', fontSize: '12px', color: 'var(--accent-blue-text)' }}>
            Tip: Je krijgt elke avond om 21:00 een WhatsApp-bericht om dit in te stellen.
            Antwoord: "prioriteiten: 1. X 2. Y 3. Z"
          </div>
        </div>
      ) : priorities ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
          {[priorities.priority_1, priorities.priority_2, priorities.priority_3].filter(Boolean).map((p, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{
                width: '24px', height: '24px', borderRadius: 'var(--radius-sm)',
                background: 'var(--text-primary)', color: 'var(--bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-mono)',
                flexShrink: 0,
              }}>
                {i + 1}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.5, paddingTop: '2px' }}>{p}</div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
          Nog geen prioriteiten voor vandaag.
        </div>
      )}
    </Card>
  )
}

// ─── Screen Time Strategy ─────────────────────────────────────
function ScreenTimeCard() {
  const [weekGoal] = useState(180) // minutes per day
  const [currentUsage] = useState(265)

  const weeklyPlan = [
    { week: 'Week 1', goal: 5 * 60, strategy: 'Telefoon weg na 22:00 — lad op in andere kamer' },
    { week: 'Week 2', goal: 4.5 * 60, strategy: 'Schermen dimmen na 21:00, grayscale aanzetten' },
    { week: 'Week 3', goal: 4 * 60, strategy: 'App-timers instellen (social: max 30 min)' },
    { week: 'Week 4', goal: 3.5 * 60, strategy: 'Telefoon-vrije ochtend (eerste 60 min van dag)' },
  ]

  return (
    <Card padding="md">
      <CardHeader
        action={
          <Badge variant={currentUsage <= weekGoal ? 'green' : currentUsage <= weekGoal * 1.2 ? 'yellow' : 'red'}>
            {Math.floor(currentUsage / 60)}u{currentUsage % 60}m vandaag
          </Badge>
        }
      >
        <CardTitle subtitle="Graduele afbouwstrategie">Schermtijd</CardTitle>
      </CardHeader>

      <div style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
          <span>Huidig: {Math.floor(currentUsage / 60)}u{currentUsage % 60}m</span>
          <span>Doel: {Math.floor(weekGoal / 60)}u</span>
        </div>
        <Progress value={weekGoal} max={currentUsage} height={4} color="var(--accent-green-text)" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {weeklyPlan.map((w, i) => (
          <div key={i} style={{ padding: '10px 12px', background: i === 0 ? 'var(--bg-hover)' : 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: `1px solid ${i === 0 ? 'var(--border-strong)' : 'var(--border)'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: i === 0 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                {w.week} {i === 0 && <span style={{ color: 'var(--accent-green-text)' }}>← Nu</span>}
              </span>
              <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>Max {Math.floor(w.goal / 60)}u/dag</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{w.strategy}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '12px', padding: '10px 12px', background: 'var(--accent-purple-bg)', borderRadius: 'var(--radius-sm)' }}>
        <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--accent-purple-text)', marginBottom: '4px' }}>Psychologische tip</div>
        <div style={{ fontSize: '12px', color: 'var(--accent-purple-text)' }}>
          Vervang de trigger, niet de gewoonte. Leg een boek naast je bed i.p.v. je telefoon.
          Gebruik grayscale modus na 20u — content ziet er minder aantrekkelijk uit.
        </div>
      </div>
    </Card>
  )
}

// ─── Main Daily Page ──────────────────────────────────────────
export default function DailyPage() {
  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '4px' }}>Dagelijks</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Checklist, gebeden, prioriteiten & routines</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <PrioritiesCard />
          <DailyChecklist />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <PrayerTracker />
          <ScreenTimeCard />
        </div>
      </div>
    </div>
  )
}

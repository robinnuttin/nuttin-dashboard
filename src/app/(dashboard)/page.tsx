'use client'
import { useEffect } from 'react'
import { Card, CardTitle, CardHeader, CardDivider } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useChecklistStore, usePrioritiesStore, usePrayerStore, useBodyStatsStore } from '@/stores/app-store'
import { getTodayString, getDayOfWeek, getTodayWorkout, formatCurrency } from '@/lib/utils'
import Link from 'next/link'

// ─── Stat Widget ──────────────────────────────────────────────
function StatWidget({
  label,
  value,
  sub,
  variant = 'default',
  href,
}: {
  label: string
  value: string
  sub?: string
  variant?: 'default' | 'green' | 'blue' | 'yellow' | 'red'
  href?: string
}) {
  const content = (
    <Card hover={!!href} padding="md">
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
        {label}
      </div>
      <div style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-primary)', lineHeight: 1 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{sub}</div>
      )}
    </Card>
  )

  if (href) return <Link href={href} style={{ textDecoration: 'none' }}>{content}</Link>
  return content
}

// ─── Prayer Widget ────────────────────────────────────────────
function PrayerWidget() {
  const { logs, togglePrayer, getTodayLogs } = usePrayerStore()
  const today = getTodayString()
  const todayLogs = getTodayLogs()
  const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const
  const prayerLabels = { fajr: 'Fajr', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha' }

  const completed = todayLogs.filter((l) => l.completed).length

  return (
    <Card padding="md">
      <CardHeader
        action={
          <Badge variant={completed === 5 ? 'green' : completed >= 3 ? 'blue' : 'yellow'}>
            {completed}/5
          </Badge>
        }
      >
        <CardTitle>Gebeden</CardTitle>
      </CardHeader>
      <div style={{ display: 'flex', gap: '6px' }}>
        {prayers.map((p) => {
          const log = todayLogs.find((l) => l.prayer_name === p)
          const done = log?.completed ?? false
          return (
            <button
              key={p}
              onClick={() => togglePrayer(today, p)}
              style={{
                flex: 1,
                padding: '8px 4px',
                borderRadius: 'var(--radius-sm)',
                border: `1px solid ${done ? 'var(--accent-green-text)' : 'var(--border)'}`,
                background: done ? 'var(--accent-green-bg)' : 'var(--bg-secondary)',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ fontSize: '10px', color: done ? 'var(--accent-green-text)' : 'var(--text-muted)', fontWeight: 500 }}>
                {prayerLabels[p]}
              </div>
              {done && (
                <div style={{ color: 'var(--accent-green-text)', fontSize: '12px', marginTop: '2px' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline' }}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </Card>
  )
}

// ─── Priorities Widget ────────────────────────────────────────
function PrioritiesWidget() {
  const { getToday } = usePrioritiesStore()
  const priorities = getToday()

  return (
    <Card padding="md">
      <CardHeader
        action={
          <Link href="/daily" style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none' }}>
            Bewerken
          </Link>
        }
      >
        <CardTitle>Top 3 Prioriteiten</CardTitle>
      </CardHeader>
      {priorities ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[priorities.priority_1, priorities.priority_2, priorities.priority_3].filter(Boolean).map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <span
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  flexShrink: 0,
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {i + 1}
              </span>
              <span style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5 }}>{p}</span>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>
          Nog geen prioriteiten ingesteld.
          <br />
          <Link href="/daily" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
            Stel ze nu in
          </Link>
        </div>
      )}
    </Card>
  )
}

// ─── Daily Checklist Preview ──────────────────────────────────
function ChecklistPreview() {
  const { items, toggle, initToday } = useChecklistStore()
  const today = getTodayString()

  useEffect(() => { initToday() }, [initToday])

  const todayItems = items.filter((i) => i.date === today).slice(0, 6)
  const done = todayItems.filter((i) => i.completed).length

  return (
    <Card padding="md">
      <CardHeader
        action={
          <Link href="/daily" style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none' }}>
            Alles zien
          </Link>
        }
      >
        <CardTitle>Checklist</CardTitle>
      </CardHeader>
      <Progress value={done} max={todayItems.length} height={3} color="var(--accent-green-text)" />
      <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {todayItems.map((item) => (
          <label
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              padding: '4px 0',
            }}
          >
            <div
              onClick={() => toggle(item.id)}
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '4px',
                border: `1.5px solid ${item.completed ? 'var(--accent-green-text)' : 'var(--border)'}`,
                background: item.completed ? 'var(--accent-green-bg)' : 'transparent',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
                cursor: 'pointer',
              }}
            >
              {item.completed && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green-text)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
            <span
              style={{
                fontSize: '13px',
                color: item.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                textDecoration: item.completed ? 'line-through' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              {item.item}
            </span>
          </label>
        ))}
      </div>
    </Card>
  )
}

// ─── Financial Summary ─────────────────────────────────────────
function FinancialSummary() {
  const dealsWon = 2
  const dealsTarget = 6
  const revenueNet = 4000
  const revenueTarget = 10000
  const reviewCards = 8
  const pct = Math.round((revenueNet / revenueTarget) * 100)

  return (
    <Card padding="md">
      <CardHeader
        action={
          <Link href="/financial" style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none' }}>
            Details
          </Link>
        }
      >
        <CardTitle>Financieel Overzicht</CardTitle>
      </CardHeader>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
        <span style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.03em' }}>
          {formatCurrency(revenueNet)}
        </span>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>/ {formatCurrency(revenueTarget)} doel</span>
      </div>

      <Progress value={revenueNet} max={revenueTarget} height={4} color="auto" showValue />

      <CardDivider />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>Deals</div>
          <div style={{ fontSize: '16px', fontWeight: 600 }}>{dealsWon}<span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>/{dealsTarget}</span></div>
        </div>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>Review Cards</div>
          <div style={{ fontSize: '16px', fontWeight: 600 }}>{reviewCards}</div>
        </div>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>Voortgang</div>
          <div style={{ fontSize: '16px', fontWeight: 600 }}>{pct}%</div>
        </div>
      </div>
    </Card>
  )
}

// ─── Today's Training ─────────────────────────────────────────
function TodayTraining() {
  const workout = getTodayWorkout()
  const day = getDayOfWeek()
  const isCardio = workout === 'Cardio'
  const isRest = workout === 'Rust'

  const workoutColors: Record<string, string> = {
    Push: 'blue',
    Pull: 'purple',
    Legs: 'green',
    'Upper Body': 'yellow',
    Cardio: 'orange',
    Rust: 'muted',
  }

  return (
    <Card padding="md" hover>
      <Link href="/training" style={{ textDecoration: 'none' }}>
        <CardTitle>Vandaag — {day}</CardTitle>
        <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              background: isRest ? 'var(--bg-secondary)' : 'var(--bg-hover)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {isCardio ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-orange-text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            ) : isRest ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6.5 6.5h11" /><path d="M17.5 17.5h-11" />
                <path d="M4 9.5v5" /><path d="M20 9.5v5" />
                <path d="M2 11.5v1" /><path d="M22 11.5v1" />
              </svg>
            )}
          </div>
          <div>
            <div style={{ fontSize: '17px', fontWeight: 600, letterSpacing: '-0.02em' }}>{workout}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {isRest ? 'Hersteldag' : isCardio ? 'Hardlopen' : 'Krachtraining'}
            </div>
          </div>
          <Badge variant={workoutColors[workout] as 'blue' | 'purple' | 'green' | 'yellow' | 'orange' | 'muted'} className="ml-auto">
            {workout}
          </Badge>
        </div>
      </Link>
    </Card>
  )
}

// ─── Health Snapshot ──────────────────────────────────────────
function HealthSnapshot() {
  const latestStats = useBodyStatsStore((s) => s.latestStats)()

  return (
    <Card padding="md">
      <CardHeader
        action={
          <Link href="/health" style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none' }}>
            Details
          </Link>
        }
      >
        <CardTitle>Lichaam</CardTitle>
      </CardHeader>
      {latestStats ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>Gewicht</div>
            <div style={{ fontSize: '18px', fontWeight: 700 }}>{latestStats.weight_kg}<span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--text-muted)' }}>kg</span></div>
            <div style={{ fontSize: '11px', color: 'var(--accent-green-text)' }}>Doel: 91-92kg</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>Vetpercentage</div>
            <div style={{ fontSize: '18px', fontWeight: 700 }}>{latestStats.body_fat_pct}<span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--text-muted)' }}>%</span></div>
            <div style={{ fontSize: '11px', color: 'var(--accent-yellow-text)' }}>Doel: 10-12%</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>Spiermassa</div>
            <div style={{ fontSize: '18px', fontWeight: 700 }}>{latestStats.muscle_mass_kg || '—'}<span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--text-muted)' }}>kg</span></div>
          </div>
        </div>
      ) : (
        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Geen data — weeg jezelf in</div>
      )}
    </Card>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────
export default function DashboardPage() {
  return (
    <div className="animate-fade-in">
      {/* Greeting */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '4px' }}>
          Goeiemorgen
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          Hier is je overzicht van vandaag.
        </p>
      </div>

      {/* Top stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '16px' }}>
        <StatWidget label="Netto verdiend" value="€4.000" sub="Doel: €10.000" href="/financial" />
        <StatWidget label="Deals gesloten" value="2/6" sub="3 in pipeline" href="/financial" />
        <StatWidget label="Review cards" value="8" sub="€600 bruto" href="/financial" />
        <StatWidget label="Discipline score" value="78%" sub="Vandaag" href="/daily" />
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <PrioritiesWidget />
          <ChecklistPreview />
          <PrayerWidget />
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <FinancialSummary />
          <TodayTraining />
          <HealthSnapshot />
        </div>
      </div>
    </div>
  )
}

'use client'
import { useState, useMemo } from 'react'
import { useDailyStore, usePrayerStore } from '@/stores/app-store'
import type { PrayerName, DayRecord } from '@/stores/app-store'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns'
import { nl } from 'date-fns/locale'

// ─── Helpers ───────────────────────────────────────────────────
function toYMD(d: Date): string {
  return format(d, 'yyyy-MM-dd')
}

function getDayScore(rec: DayRecord | undefined): number {
  if (!rec) return 0
  let s = 0
  if (rec.wokeOnTime) s++
  if (rec.sleptOnTime) s++
  if (rec.supplementsTaken) s++
  if (rec.trainingDone) s++
  if ((rec.prayersDone ?? 0) >= 3) s++
  return s
}

function scoreColor(score: number): string {
  if (score >= 4) return 'var(--accent-green-text)'
  if (score >= 2) return 'var(--accent-yellow-text)'
  if (score >= 1) return 'var(--accent-red-text)'
  return 'transparent'
}

const WEEK_LABELS = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo']
const MONTH_NAMES = ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December']
const PRAYER_NAMES: PrayerName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']

// ─── Score dot ─────────────────────────────────────────────────
function ScoreDot({ score, size = 7 }: { score: number; size?: number }) {
  const color = scoreColor(score)
  return (
    <span style={{
      display: 'inline-block', width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: color === 'transparent' ? 'transparent' : color,
      border: color === 'transparent' ? '1px solid var(--border)' : 'none',
    }} />
  )
}

// ─── Week strip ────────────────────────────────────────────────
function WeekStrip({ selectedDate, onSelect }: { selectedDate: string; onSelect: (ymd: string) => void }) {
  const records = useDailyStore((s) => s.records)
  const today = toYMD(new Date())
  const anchor = new Date(selectedDate)

  // Mon–Sun week containing anchor
  const weekStart = startOfWeek(anchor, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    return d
  })

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4,
      background: 'var(--surface)', borderRadius: 'var(--radius-md)',
      padding: '12px 8px', border: '1px solid var(--border)',
    }}>
      {weekDays.map((d, i) => {
        const ymd = toYMD(d)
        const isSelected = ymd === selectedDate
        const isToday = ymd === today
        const score = getDayScore(records[ymd])

        return (
          <button key={ymd} onClick={() => onSelect(ymd)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            padding: '8px 4px', borderRadius: 'var(--radius-sm)',
            border: isSelected ? '2px solid var(--accent-green-text)' : isToday ? '2px solid var(--border-strong)' : '2px solid transparent',
            background: isSelected ? 'var(--accent-green-bg)' : 'transparent',
            cursor: 'pointer', transition: 'all 0.15s ease',
          }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{WEEK_LABELS[i]}</span>
            <span style={{
              fontSize: 15, fontWeight: isToday ? 700 : 500,
              color: isSelected ? 'var(--accent-green-text)' : isToday ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}>
              {d.getDate()}
            </span>
            <ScoreDot score={score} size={7} />
          </button>
        )
      })}
    </div>
  )
}

// ─── Month calendar ────────────────────────────────────────────
function MonthCalendar({ selectedDate, onSelect }: { selectedDate: string; onSelect: (ymd: string) => void }) {
  const records = useDailyStore((s) => s.records)
  const today = toYMD(new Date())
  const anchor = new Date(selectedDate)
  const [viewYear, setViewYear] = useState(anchor.getFullYear())
  const [viewMonth, setViewMonth] = useState(anchor.getMonth())

  const grid = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1)
    const last = new Date(viewYear, viewMonth + 1, 0)
    const padStart = (first.getDay() + 6) % 7
    const cells: (Date | null)[] = Array(padStart).fill(null)
    for (let d = 1; d <= last.getDate(); d++) cells.push(new Date(viewYear, viewMonth, d))
    while (cells.length % 7 !== 0) cells.push(null)
    return cells
  }, [viewYear, viewMonth])

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1) }
    else setViewMonth((m) => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1) }
    else setViewMonth((m) => m + 1)
  }

  return (
    <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', padding: '16px 12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <button onClick={prevMonth} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '4px 10px', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 14 }}>
          {'<'}
        </button>
        <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 15 }}>
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button onClick={nextMonth} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '4px 10px', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 14 }}>
          {'>'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
        {WEEK_LABELS.map((l) => (
          <div key={l} style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, padding: '2px 0' }}>{l}</div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {grid.map((d, idx) => {
          if (!d) return <div key={`p-${idx}`} />
          const ymd = toYMD(d)
          const isSelected = ymd === selectedDate
          const isToday = ymd === today
          const score = getDayScore(records[ymd])
          const dotColor = scoreColor(score)

          return (
            <button key={ymd} onClick={() => onSelect(ymd)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
              padding: '6px 2px', borderRadius: 'var(--radius-sm)',
              border: isSelected ? '2px solid var(--accent-green-text)' : isToday ? '2px solid var(--border-strong)' : '2px solid transparent',
              background: isSelected ? 'var(--accent-green-bg)' : 'transparent',
              cursor: 'pointer', minWidth: 0,
            }}>
              <span style={{
                fontSize: 13, fontWeight: isToday ? 700 : 400, lineHeight: 1,
                color: isSelected ? 'var(--accent-green-text)' : isToday ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}>
                {d.getDate()}
              </span>
              <span style={{
                width: 6, height: 6, borderRadius: '50%', display: 'inline-block', flexShrink: 0,
                background: dotColor === 'transparent' ? 'transparent' : dotColor,
                border: dotColor === 'transparent' ? '1px solid var(--border)' : 'none',
              }} />
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Checkbox row ──────────────────────────────────────────────
type ToggleField = 'wokeOnTime' | 'sleptOnTime' | 'supplementsTaken' | 'trainingDone' | 'sauna' | 'journaled'

function CheckRow({ label, checked, onToggle, color = 'green' }: {
  label: string; checked: boolean; onToggle: () => void; color?: 'green' | 'blue'
}) {
  const bgVar = color === 'blue' ? 'var(--accent-blue-bg)' : 'var(--accent-green-bg)'
  const textVar = color === 'blue' ? 'var(--accent-blue-text)' : 'var(--accent-green-text)'

  return (
    <div onClick={onToggle} style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 14px', borderRadius: 'var(--radius-sm)',
      background: checked ? bgVar : 'var(--bg-secondary)',
      border: `1px solid ${checked ? textVar : 'var(--border)'}`,
      transition: 'all 0.15s ease', cursor: 'pointer',
    }}>
      <div style={{
        width: 22, height: 22, borderRadius: 6, flexShrink: 0,
        border: `2px solid ${checked ? textVar : 'var(--border-strong)'}`,
        background: checked ? textVar : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.15s ease',
      }}>
        {checked && (
          <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
            <path d="M1 4L4.5 7.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span style={{
        fontSize: 14, flex: 1,
        color: checked ? textVar : 'var(--text-primary)',
        fontWeight: checked ? 600 : 400,
        textDecoration: checked ? 'line-through' : 'none',
        textDecorationColor: 'var(--text-muted)',
      }}>
        {label}
      </span>
    </div>
  )
}

// ─── Prayer buttons ────────────────────────────────────────────
function PrayerButtons({ ymd }: { ymd: string }) {
  const toggle = usePrayerStore((s) => s.toggle)
  const getDay = usePrayerStore((s) => s.getDay)
  const getCount = usePrayerStore((s) => s.getCount)
  const prayerDay = getDay(ymd)
  const count = getCount(ymd)

  return (
    <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>Gebeden gedaan</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: count === 5 ? 'var(--accent-green-text)' : count >= 3 ? 'var(--accent-yellow-text)' : 'var(--text-muted)' }}>
          {count}/5
        </span>
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {PRAYER_NAMES.map((name) => {
          const done = prayerDay[name]
          return (
            <button key={name} onClick={() => toggle(ymd, name)} style={{
              padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer',
              border: done ? 'none' : '1.5px solid var(--border-strong)',
              background: done ? 'var(--accent-green-bg)' : 'transparent',
              color: done ? 'var(--accent-green-text)' : 'var(--text-secondary)',
              transition: 'all 0.15s ease',
            }}>
              {name}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Daily checklist ───────────────────────────────────────────
function DailyChecks({ ymd }: { ymd: string }) {
  const records = useDailyStore((s) => s.records)
  const toggle = useDailyStore((s) => s.toggle)
  const getOrCreate = useDailyStore((s) => s.getOrCreate)
  const rec = records[ymd] || getOrCreate(ymd)

  const date = new Date(ymd)
  const dow = date.getDay()
  const isSaunaDay = dow === 2 || dow === 4 || dow === 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <CheckRow label="Optijd opgestaan (voor 08:30)" checked={!!rec?.wokeOnTime} onToggle={() => toggle(ymd, 'wokeOnTime')} />
      <CheckRow label="Optijd gaan slapen (voor 23:00)" checked={!!rec?.sleptOnTime} onToggle={() => toggle(ymd, 'sleptOnTime')} />
      <CheckRow label="Supplementen genomen" checked={!!rec?.supplementsTaken} onToggle={() => toggle(ymd, 'supplementsTaken')} />
      <CheckRow label="Training gevolgd" checked={!!rec?.trainingDone} onToggle={() => toggle(ymd, 'trainingDone')} />
      {(isSaunaDay || !!rec?.sauna) && (
        <CheckRow label="Sauna (Di/Do/Zo)" checked={!!rec?.sauna} onToggle={() => toggle(ymd, 'sauna')} color="blue" />
      )}
      <PrayerButtons ymd={ymd} />
    </div>
  )
}

// ─── Top 3 priorities ──────────────────────────────────────────
function Top3Prioriteiten({ ymd }: { ymd: string }) {
  const records = useDailyStore((s) => s.records)
  const getOrCreate = useDailyStore((s) => s.getOrCreate)
  const setPriorities = useDailyStore((s) => s.setPriorities)
  const update = useDailyStore((s) => s.update)
  const rec = records[ymd] || getOrCreate(ymd)
  const priorities = rec.priorities.length > 0 ? rec.priorities : ['', '', '']
  const done = rec.prioritiesDone

  function handleTextChange(i: number, text: string) {
    const next = [...priorities]
    next[i] = text
    // Keep done state, just update text
    update(ymd, { priorities: next })
  }

  function handleToggleDone(i: number) {
    const nextDone = [...(done.length > 0 ? done : [false, false, false])]
    while (nextDone.length < priorities.length) nextDone.push(false)
    nextDone[i] = !nextDone[i]
    update(ymd, { prioritiesDone: nextDone })
  }

  return (
    <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', padding: '16px' }}>
      <h2 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
        Top 3 prioriteiten
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
        {[0, 1, 2].map((i) => {
          const isDone = done[i] ?? false
          const text = priorities[i] ?? ''
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              background: isDone ? 'var(--accent-green-bg)' : 'var(--bg-secondary)',
              border: `1px solid ${isDone ? 'var(--accent-green-text)' : 'var(--border)'}`,
              transition: 'all 0.15s ease',
            }}>
              <button onClick={() => handleToggleDone(i)} style={{
                width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                border: `2px solid ${isDone ? 'var(--accent-green-text)' : 'var(--border-strong)'}`,
                background: isDone ? 'var(--accent-green-text)' : 'transparent',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}>
                {isDone && (
                  <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                    <path d="M1 4L4.5 7.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
              <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, minWidth: 16, flexShrink: 0 }}>{i + 1}.</span>
              <input
                type="text"
                value={text}
                onChange={(e) => handleTextChange(i, e.target.value)}
                placeholder={`Prioriteit ${i + 1}...`}
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 14,
                  color: isDone ? 'var(--accent-green-text)' : 'var(--text-primary)',
                  textDecoration: isDone ? 'line-through' : 'none',
                  textDecorationColor: 'var(--text-muted)', fontFamily: 'inherit',
                }}
              />
            </div>
          )
        })}
      </div>
      <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--accent-green-bg)', border: '1px solid var(--accent-green-text)' }}>
        <p style={{ margin: 0, fontSize: 12, color: 'var(--accent-green-text)', lineHeight: 1.5 }}>
          <strong>WhatsApp-tip:</strong> Stuur "prioriteiten: taak1, taak2, taak3" om je prioriteiten in te stellen.
        </p>
      </div>
    </div>
  )
}

// ─── Month progress bars ────────────────────────────────────────
function MaandOverzicht() {
  const records = useDailyStore((s) => s.records)
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()

  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  // Group days by ISO week
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const weekMap: Map<string, Date[]> = new Map()
  for (const d of days) {
    const weekKey = format(startOfWeek(d, { weekStartsOn: 1 }), 'yyyy-MM-dd')
    if (!weekMap.has(weekKey)) weekMap.set(weekKey, [])
    weekMap.get(weekKey)!.push(d)
  }

  const weeks = Array.from(weekMap.entries()).map(([key, weekDays], wi) => ({
    label: `Week ${wi + 1}`,
    dates: weekDays.map(toYMD),
  }))

  return (
    <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', padding: '16px' }}>
      <h2 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
        Maand overzicht — {MONTH_NAMES[month]}
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {weeks.map((week) => {
          const maxScore = week.dates.length * 5
          const totalScore = week.dates.reduce((sum, ymd) => sum + getDayScore(records[ymd]), 0)
          const pct = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0
          const barColor = pct >= 80 ? 'var(--accent-green-text)' : pct >= 50 ? 'var(--accent-yellow-text)' : 'var(--accent-red-text)'

          return (
            <div key={week.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{week.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: barColor }}>{pct}%</span>
              </div>
              <div style={{ height: 8, borderRadius: 4, background: 'var(--bg-secondary)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 4, transition: 'width 0.4s ease' }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Page ───────────────────────────────────────────────────────
export default function DailyPage() {
  const [selectedDate, setSelectedDate] = useState(toYMD(new Date()))

  const dayLabel = format(new Date(selectedDate), 'EEEE d MMMM', { locale: nl })
  const todayStr = toYMD(new Date())
  const isToday = selectedDate === todayStr

  return (
    <div className="animate-fade-in" style={{ maxWidth: 520, margin: '0 auto', padding: '0 0 40px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>Dagelijks</h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
          {dayLabel}{isToday ? ' — vandaag' : ''}
        </p>
      </div>

      <WeekStrip selectedDate={selectedDate} onSelect={setSelectedDate} />

      <MonthCalendar selectedDate={selectedDate} onSelect={setSelectedDate} />

      <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', padding: '16px' }}>
        <h2 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Dagelijkse taken</h2>
        <DailyChecks ymd={selectedDate} />
      </div>

      <Top3Prioriteiten ymd={selectedDate} />

      <MaandOverzicht />
    </div>
  )
}

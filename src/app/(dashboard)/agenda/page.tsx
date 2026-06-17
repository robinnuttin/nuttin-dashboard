'use client'
import { useState, useEffect } from 'react'
import { Card, CardTitle, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAgendaStore, type AppEntry } from '@/stores/app-store'
import type { FollowUp } from '@/types'

// ─── Constants ────────────────────────────────────────────────
const TYPE_META: Record<AppEntry['type'], { label: string; badge: 'blue' | 'green' | 'purple' | 'yellow' | 'orange' | 'muted'; bg: string; text: string }> = {
  sales:       { label: 'Salesgesprek',   badge: 'blue',   bg: 'var(--accent-blue-bg)',   text: 'var(--accent-blue-text)' },
  review_card: { label: 'Review Cards',   badge: 'green',  bg: 'var(--accent-green-bg)',  text: 'var(--accent-green-text)' },
  david:       { label: 'David — Startup',badge: 'purple', bg: 'var(--accent-purple-bg)', text: 'var(--accent-purple-text)' },
  job:         { label: 'Sollicitatie',   badge: 'yellow', bg: 'var(--accent-yellow-bg)', text: 'var(--accent-yellow-text)' },
  sauna:       { label: 'Sauna',          badge: 'orange', bg: 'var(--accent-orange-bg)', text: 'var(--accent-orange-text)' },
  personal:    { label: 'Persoonlijk',    badge: 'muted',  bg: 'var(--bg-secondary)',     text: 'var(--text-secondary)' },
  family:      { label: 'Familie',        badge: 'purple', bg: 'var(--accent-purple-bg)', text: 'var(--accent-purple-text)' },
  other:       { label: 'Overig',         badge: 'muted',  bg: 'var(--bg-secondary)',     text: 'var(--text-secondary)' },
}

const DOW_NL = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za']
const MONTH_NL = ['Januari','Februari','Maart','April','Mei','Juni','Juli','Augustus','September','Oktober','November','December']

const MOCK_FOLLOW_UPS: FollowUp[] = [
  { id: '1', contact_name: 'Stefan Vermeersch', contact_phone: '+32 478 123 456', follow_up_date: '2026-06-16T09:00:00', reason: 'Bevestig afspraak. Stuur locatie door.', completed: false, priority: 'high' },
  { id: '2', contact_name: 'Resto De Hoorn', follow_up_date: '2026-06-17T10:00:00', reason: 'Eerste website oplevering — vraag feedback', completed: false, priority: 'medium' },
  { id: '3', contact_name: 'Tandarts Peeters', contact_phone: '+32 456 789 012', follow_up_date: '2026-06-18T14:00:00', reason: 'Cold lead — follow-up e-mail versturen', completed: false, priority: 'low' },
  { id: '4', contact_name: 'Immo Leclercq', follow_up_date: '2026-06-15T11:00:00', reason: 'Factuur sturen voor CRM project', completed: false, priority: 'high' },
]

const SEED_ENTRIES: AppEntry[] = [
  { id: 's1', title: 'Salesgesprek Kapper Steff', start: '2026-06-16T10:00', end: '2026-06-16T11:00', type: 'sales', contact: 'Stefan Vermeersch', phone: '+32 478 123 456', notes: 'Website voorstel €3500. Portfolio meenemen.', source: 'manual' },
  { id: 's2', title: 'Review Cards Sessie Gent', start: '2026-06-17T13:00', end: '2026-06-17T17:00', type: 'review_card', contact: 'Gent centrum', notes: '4 uur rondgaan. Doel: min 5 kaarten.', source: 'manual' },
  { id: 's3', title: 'Meeting David — B2B Lead Gen', start: '2026-06-18T14:00', end: '2026-06-18T15:30', type: 'david', contact: 'David', notes: 'Status scrapers bespreken. Pricing model finaliseren.', source: 'manual' },
  { id: 's4', title: 'Salesgesprek CRM Bouwbedrijf Declercq', start: '2026-06-19T11:00', end: '2026-06-19T12:00', type: 'sales', contact: 'Tom Declercq', phone: '+32 479 987 654', notes: 'CRM demo voorbereiden. Budget: €4200 bruto.', source: 'manual' },
  { id: 's5', title: 'Sollicitatiegesprek', start: '2026-06-20T09:00', end: '2026-06-20T10:00', type: 'job', contact: 'HR Manager', notes: '20u/week job. CV meenemen.', source: 'manual' },
]

// ─── Helpers ──────────────────────────────────────────────────
function toYMD(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getWeekDates(anchor: Date): Date[] {
  const dow = (anchor.getDay() + 6) % 7
  const mon = new Date(anchor)
  mon.setDate(anchor.getDate() - dow)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mon)
    d.setDate(mon.getDate() + i)
    return d
  })
}

function getMonthGrid(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1)
  const startDow = (first.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (Date | null)[] = Array(startDow).fill(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

function fmtTime(iso: string): string {
  const t = iso.slice(11, 16)
  return t || '--:--'
}

function fmtDateShort(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('nl-BE', { day: '2-digit', month: 'short' })
}

function fmtDateTimeNl(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('nl-BE', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

// ─── Appointment Card (List) ───────────────────────────────────
function EntryCard({ entry, onRemove }: { entry: AppEntry; onRemove: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false)
  const meta = TYPE_META[entry.type] || TYPE_META.other
  const now = new Date()
  const isPast = new Date(entry.end) < now
  const isToday = entry.start.startsWith(toYMD(now))

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      style={{
        padding: '12px 14px', borderRadius: 'var(--radius-md)',
        border: `1px solid ${isToday ? meta.text : 'var(--border)'}`,
        background: isToday ? meta.bg : 'transparent',
        cursor: 'pointer', transition: 'all 0.15s ease',
        opacity: isPast ? 0.6 : 1, marginBottom: '6px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ flexShrink: 0, textAlign: 'center', minWidth: '44px' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{fmtDateShort(entry.start)}</div>
          <div style={{ fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: isToday ? meta.text : 'var(--text-primary)' }}>{fmtTime(entry.start)}</div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '2px' }}>{entry.title}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{entry.contact || ''}</div>
        </div>
        <Badge variant={meta.badge}>{meta.label}</Badge>
      </div>

      {expanded && (
        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
          {entry.notes && <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '6px' }}>{entry.notes}</div>}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {entry.phone && (
              <a href={`tel:${entry.phone}`} onClick={(e) => e.stopPropagation()} style={{ fontSize: '12px', color: 'var(--accent-blue-text)', textDecoration: 'none' }}>{entry.phone}</a>
            )}
            <div style={{ flex: 1 }} />
            <button onClick={(e) => { e.stopPropagation(); onRemove(entry.id) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-red-text)', fontSize: '12px' }}>Verwijderen</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Week View ────────────────────────────────────────────────
function WeekView({ anchor, entries }: { anchor: Date; entries: AppEntry[] }) {
  const days = getWeekDates(anchor)
  const todayStr = toYMD(new Date())
  const hours = Array.from({ length: 15 }, (_, i) => i + 7)

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ minWidth: '600px' }}>
        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: '44px repeat(7, 1fr)', borderBottom: '1px solid var(--border)', marginBottom: '0' }}>
          <div />
          {days.map((d) => {
            const ymd = toYMD(d)
            const isToday = ymd === todayStr
            return (
              <div key={ymd} style={{ textAlign: 'center', padding: '6px 2px', background: isToday ? 'var(--accent-blue-bg)' : 'transparent' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{DOW_NL[d.getDay()]}</div>
                <div style={{ fontSize: '16px', fontWeight: isToday ? 700 : 500, color: isToday ? 'var(--accent-blue-text)' : 'var(--text-primary)' }}>{d.getDate()}</div>
              </div>
            )
          })}
        </div>

        {/* Time rows */}
        {hours.map((h) => (
          <div key={h} style={{ display: 'grid', gridTemplateColumns: '44px repeat(7, 1fr)', minHeight: '40px', borderBottom: '1px solid rgba(128,128,128,0.08)' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', paddingTop: '4px', paddingRight: '4px', textAlign: 'right' }}>{String(h).padStart(2, '0')}:00</div>
            {days.map((d) => {
              const ymd = toYMD(d)
              const dayEntries = entries.filter((e) => {
                if (!e.start.startsWith(ymd)) return false
                const startH = parseInt(e.start.slice(11, 13), 10)
                return startH === h
              })
              return (
                <div key={ymd} style={{ borderLeft: '1px solid rgba(128,128,128,0.08)', padding: '2px' }}>
                  {dayEntries.map((e) => {
                    const meta = TYPE_META[e.type] || TYPE_META.other
                    return (
                      <div key={e.id} style={{
                        fontSize: '10px', padding: '2px 4px', borderRadius: '3px',
                        background: meta.bg, color: meta.text,
                        borderLeft: `2px solid ${meta.text}`,
                        marginBottom: '1px', lineHeight: 1.3, cursor: 'default',
                      }}>
                        <div style={{ fontWeight: 600 }}>{fmtTime(e.start)}</div>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</div>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Month Mini Calendar ───────────────────────────────────────
function MonthCalendar({ year, month, entries, onSelect }: { year: number; month: number; entries: AppEntry[]; onSelect: (d: Date) => void }) {
  const cells = getMonthGrid(year, month)
  const todayStr = toYMD(new Date())

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '4px' }}>
        {['Ma','Di','Wo','Do','Vr','Za','Zo'].map((d) => (
          <div key={d} style={{ textAlign: 'center', fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>{d}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
        {cells.map((cell, i) => {
          if (!cell) return <div key={i} />
          const ymd = toYMD(cell)
          const isToday = ymd === todayStr
          const hasEvents = entries.some((e) => e.start.startsWith(ymd))
          return (
            <div
              key={ymd}
              onClick={() => onSelect(cell)}
              style={{
                textAlign: 'center', padding: '4px 2px', borderRadius: '4px',
                cursor: 'pointer', position: 'relative',
                background: isToday ? 'var(--accent-blue-text)' : 'transparent',
                color: isToday ? 'var(--bg)' : 'var(--text-primary)',
                fontSize: '12px', fontWeight: isToday ? 700 : 400,
                transition: 'background 0.1s ease',
              }}
            >
              {cell.getDate()}
              {hasEvents && !isToday && (
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent-blue-text)', margin: '1px auto 0' }} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Add Entry Form ────────────────────────────────────────────
function AddEntryForm({ onClose }: { onClose: () => void }) {
  const add = useAgendaStore((s) => s.add)
  const [form, setForm] = useState({
    title: '', start: '', end: '', type: 'sales' as AppEntry['type'],
    contact: '', phone: '', notes: '',
  })

  const submit = () => {
    if (!form.title || !form.start) return
    add({
      id: Date.now().toString(),
      title: form.title,
      start: form.start,
      end: form.end || form.start,
      type: form.type,
      contact: form.contact || undefined,
      phone: form.phone || undefined,
      notes: form.notes || undefined,
      source: 'manual',
    })
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onClick={onClose}>
      <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px', width: '100%', maxWidth: '440px' }}
        onClick={(e) => e.stopPropagation()}>
        <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Afspraak toevoegen</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Input label="Titel" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Salesgesprek Klant X" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <Input label="Start" type="datetime-local" value={form.start} onChange={(e) => setForm(f => ({ ...f, start: e.target.value }))} />
            <Input label="Einde" type="datetime-local" value={form.end} onChange={(e) => setForm(f => ({ ...f, end: e.target.value }))} />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Type</label>
            <select value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value as AppEntry['type'] }))}
              style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '13px', padding: '8px 10px', outline: 'none' }}>
              {(Object.keys(TYPE_META) as AppEntry['type'][]).map((t) => (
                <option key={t} value={t}>{TYPE_META[t].label}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <Input label="Contact" value={form.contact} onChange={(e) => setForm(f => ({ ...f, contact: e.target.value }))} placeholder="Naam" />
            <Input label="Telefoon" value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+32 4xx" />
          </div>
          <Input label="Notities" value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Voorbereiding, locatie..." />
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <Button variant="secondary" onClick={onClose} style={{ flex: 1 }}>Annuleer</Button>
            <Button variant="primary" onClick={submit} disabled={!form.title || !form.start} style={{ flex: 1 }}>Toevoegen</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Follow-up Card ───────────────────────────────────────────
function FollowUpCard({ fu, onToggle }: { fu: FollowUp; onToggle: (id: string) => void }) {
  const isPast = new Date() > new Date(fu.follow_up_date)
  const colors = { high: 'red', medium: 'yellow', low: 'muted' } as const
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid var(--border)', opacity: fu.completed ? 0.5 : 1 }}>
      <div onClick={() => onToggle(fu.id)} style={{
        width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
        border: `2px solid ${fu.completed ? 'var(--accent-green-text)' : isPast ? 'var(--accent-red-text)' : 'var(--border)'}`,
        background: fu.completed ? 'var(--accent-green-text)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
      }}>
        {fu.completed && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '13px', fontWeight: 500, textDecoration: fu.completed ? 'line-through' : 'none' }}>{fu.contact_name}</div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{fu.reason}</div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: '11px', color: isPast && !fu.completed ? 'var(--accent-red-text)' : 'var(--text-muted)', marginBottom: '2px' }}>
          {fmtDateTimeNl(fu.follow_up_date)}
        </div>
        <Badge variant={colors[fu.priority]}>{fu.priority === 'high' ? 'Urgent' : fu.priority === 'medium' ? 'Medium' : 'Laag'}</Badge>
      </div>
    </div>
  )
}

// ─── Main ──────────────────────────────────────────────────────
export default function AgendaPage() {
  const { entries, add, remove, getRange } = useAgendaStore()
  const [tab, setTab] = useState<'list' | 'week' | 'maand' | 'followup'>('list')
  const [showAdd, setShowAdd] = useState(false)
  const [followUps, setFollowUps] = useState<FollowUp[]>(MOCK_FOLLOW_UPS)
  const [ghlStatus, setGhlStatus] = useState<'loading' | 'connected' | 'disconnected'>('loading')
  const [contactCount, setContactCount] = useState(0)

  // Calendar navigation
  const today = new Date()
  const [calAnchor, setCalAnchor] = useState(today)
  const [calMonth, setCalMonth] = useState(today.getMonth())
  const [calYear, setCalYear] = useState(today.getFullYear())

  // Seed on first load
  useEffect(() => {
    if (entries.length === 0) {
      SEED_ENTRIES.forEach((e) => add(e))
    }
    // GHL status
    fetch('/api/ghl/status')
      .then((r) => r.json())
      .then((d) => { setGhlStatus(d.connected ? 'connected' : 'disconnected'); setContactCount(d.contactCount || 0) })
      .catch(() => setGhlStatus('disconnected'))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const now = new Date()
  const upcoming = [...entries]
    .filter((e) => new Date(e.end) >= now)
    .sort((a, b) => a.start.localeCompare(b.start))
  const past = [...entries]
    .filter((e) => new Date(e.end) < now)
    .sort((a, b) => b.start.localeCompare(a.start))
  const pendingFollowUps = followUps.filter((f) => !f.completed)

  const weekDates = getWeekDates(calAnchor)
  const weekStart = toYMD(weekDates[0])
  const weekEnd = toYMD(weekDates[6])
  const weekEntries = getRange(weekStart, weekEnd)
  const monthEntries = getRange(
    `${calYear}-${String(calMonth + 1).padStart(2, '0')}-01`,
    `${calYear}-${String(calMonth + 1).padStart(2, '0')}-31`
  )

  const shiftWeek = (dir: -1 | 1) => {
    const d = new Date(calAnchor)
    d.setDate(d.getDate() + dir * 7)
    setCalAnchor(d)
  }

  const shiftMonth = (dir: -1 | 1) => {
    let m = calMonth + dir
    let y = calYear
    if (m < 0) { m = 11; y-- }
    if (m > 11) { m = 0; y++ }
    setCalMonth(m)
    setCalYear(y)
  }

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '4px' }}>Agenda</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            {upcoming.length} komende · {pendingFollowUps.length} follow-ups open
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowAdd(true)}
          icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>}
        >Toevoegen</Button>
      </div>

      {/* GHL status */}
      {ghlStatus === 'connected' && (
        <div style={{ marginBottom: '12px', padding: '10px 14px', background: 'var(--accent-green-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent-green-text)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green-text)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          <span style={{ fontSize: '12px', color: 'var(--accent-green-text)' }}>GoHighLevel verbonden · {contactCount} contacten</span>
        </div>
      )}
      {ghlStatus === 'disconnected' && (
        <div style={{ marginBottom: '12px', padding: '10px 14px', background: 'var(--accent-blue-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent-blue-text)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue-text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span style={{ fontSize: '12px', color: 'var(--accent-blue-text)', flex: 1 }}>GoHighLevel niet verbonden — voorbeelddata getoond.</span>
          <a href="/settings" style={{ fontSize: '12px', color: 'var(--accent-blue-text)', fontWeight: 600, textDecoration: 'none' }}>Instellen</a>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '12px', borderBottom: '1px solid var(--border)' }}>
        {([
          { key: 'list',    label: `Lijst (${upcoming.length})` },
          { key: 'week',    label: 'Week' },
          { key: 'maand',   label: 'Maand' },
          { key: 'followup',label: `Follow-ups (${pendingFollowUps.length})` },
        ] as const).map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '8px 14px', fontSize: '13px',
            fontWeight: tab === t.key ? 500 : 400,
            color: tab === t.key ? 'var(--text-primary)' : 'var(--text-muted)',
            background: 'none', border: 'none',
            borderBottom: `2px solid ${tab === t.key ? 'var(--text-primary)' : 'transparent'}`,
            cursor: 'pointer', marginBottom: '-1px',
          }}>{t.label}</button>
        ))}
      </div>

      {/* ─── List ─────────────────────────────────────────── */}
      {tab === 'list' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
          <Card padding="md">
            <CardTitle>Komende afspraken</CardTitle>
            <div style={{ marginTop: '12px' }}>
              {upcoming.length === 0
                ? <p style={{ fontSize: '13px', color: 'var(--text-muted)', padding: '16px 0', textAlign: 'center' }}>Geen komende afspraken</p>
                : upcoming.map((e) => <EntryCard key={e.id} entry={e} onRemove={remove} />)}
            </div>
          </Card>
          {past.length > 0 && (
            <Card padding="md">
              <CardTitle subtitle="Vorige afspraken">Historie</CardTitle>
              <div style={{ marginTop: '12px' }}>
                {past.slice(0, 5).map((e) => <EntryCard key={e.id} entry={e} onRemove={remove} />)}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ─── Week ─────────────────────────────────────────── */}
      {tab === 'week' && (
        <Card padding="md">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <button onClick={() => shiftWeek(-1)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '4px 8px', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '13px' }}>‹</button>
            <span style={{ fontSize: '13px', fontWeight: 500 }}>
              {weekDates[0].getDate()} — {weekDates[6].getDate()} {MONTH_NL[weekDates[6].getMonth()]} {weekDates[6].getFullYear()}
            </span>
            <button onClick={() => shiftWeek(1)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '4px 8px', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '13px' }}>›</button>
            <button onClick={() => setCalAnchor(new Date())} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '4px 8px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '12px' }}>Vandaag</button>
          </div>
          <WeekView anchor={calAnchor} entries={weekEntries} />
          {weekEntries.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', padding: '24px 0' }}>Geen afspraken deze week</p>
          )}
        </Card>
      )}

      {/* ─── Maand ────────────────────────────────────────── */}
      {tab === 'maand' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
          <Card padding="md">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <button onClick={() => shiftMonth(-1)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '4px 8px', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '13px' }}>‹</button>
              <span style={{ fontSize: '14px', fontWeight: 600, flex: 1, textAlign: 'center' }}>{MONTH_NL[calMonth]} {calYear}</span>
              <button onClick={() => shiftMonth(1)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '4px 8px', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '13px' }}>›</button>
            </div>
            <MonthCalendar year={calYear} month={calMonth} entries={monthEntries} onSelect={(d) => { setCalAnchor(d); setTab('week') }} />
          </Card>
          <Card padding="md">
            <CardTitle subtitle={`${MONTH_NL[calMonth]} ${calYear}`}>Afspraken deze maand</CardTitle>
            <div style={{ marginTop: '12px' }}>
              {monthEntries.length === 0
                ? <p style={{ fontSize: '13px', color: 'var(--text-muted)', padding: '16px 0', textAlign: 'center' }}>Geen afspraken</p>
                : [...monthEntries].sort((a, b) => a.start.localeCompare(b.start)).map((e) => <EntryCard key={e.id} entry={e} onRemove={remove} />)}
            </div>
          </Card>
        </div>
      )}

      {/* ─── Follow-ups ───────────────────────────────────── */}
      {tab === 'followup' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
          <Card padding="md">
            <CardHeader action={<Badge variant={pendingFollowUps.length > 0 ? 'red' : 'green'}>{pendingFollowUps.length} open</Badge>}>
              <CardTitle>Follow-ups</CardTitle>
            </CardHeader>
            <div style={{ marginTop: '12px' }}>
              {followUps.map((fu) => (
                <FollowUpCard key={fu.id} fu={fu} onToggle={(id) => setFollowUps((p) => p.map((f) => f.id === id ? { ...f, completed: !f.completed } : f))} />
              ))}
            </div>
          </Card>

          <Card padding="md">
            <CardTitle subtitle="Herinnerd via WhatsApp">Automatische Meldingen</CardTitle>
            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { label: '1 dag voor afspraak', desc: 'WhatsApp melding met details', active: true },
                { label: '1 uur voor afspraak', desc: 'Herinnering en contactinfo', active: true },
                { label: 'Follow-up reminder', desc: 'Dagelijkse check openstaande acties', active: false },
              ].map((n) => (
                <div key={n.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 500 }}>{n.label}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{n.desc}</div>
                  </div>
                  <Badge variant={n.active ? 'green' : 'muted'}>{n.active ? 'Actief' : 'Inactief'}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {showAdd && <AddEntryForm onClose={() => setShowAdd(false)} />}
    </div>
  )
}

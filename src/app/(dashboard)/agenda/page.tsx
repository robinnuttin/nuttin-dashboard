'use client'
import { useState, useEffect } from 'react'
import { Card, CardTitle, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatTime, formatDateTime } from '@/lib/utils'
import type { Appointment, FollowUp } from '@/types'

const APPOINTMENT_COLORS: Record<string, { bg: string; text: string; badge: 'blue' | 'green' | 'purple' | 'yellow' | 'orange' | 'muted' }> = {
  sales_meeting: { bg: 'var(--accent-blue-bg)', text: 'var(--accent-blue-text)', badge: 'blue' },
  review_card_session: { bg: 'var(--accent-green-bg)', text: 'var(--accent-green-text)', badge: 'green' },
  david_meeting: { bg: 'var(--accent-purple-bg)', text: 'var(--accent-purple-text)', badge: 'purple' },
  job_interview: { bg: 'var(--accent-yellow-bg)', text: 'var(--accent-yellow-text)', badge: 'yellow' },
  other: { bg: 'var(--bg-secondary)', text: 'var(--text-secondary)', badge: 'muted' },
}

const TYPE_LABELS: Record<string, string> = {
  sales_meeting: 'Salesgesprek',
  review_card_session: 'Review Cards Sessie',
  david_meeting: 'David — Startup',
  job_interview: 'Sollicitatiegesprek',
  other: 'Overig',
}

const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: '1', title: 'Salesgesprek Kapper Steff', start_time: '2026-06-16T10:00:00', end_time: '2026-06-16T11:00:00',
    contact_name: 'Stefan Vermeersch', contact_phone: '+32 478 123 456', type: 'sales_meeting',
    notes: 'Website voorstel €3500. Voorbereiding: portfolio meenemen.', location: 'Kortrijk',
  },
  {
    id: '2', title: 'Review Cards Sessie Gent', start_time: '2026-06-17T13:00:00', end_time: '2026-06-17T17:00:00',
    contact_name: 'Gent centrum', type: 'review_card_session',
    notes: '4 uur rondgaan in Gent centrum. Doel: min 5 kaarten verkopen.', location: 'Gent',
  },
  {
    id: '3', title: 'Meeting David — B2B Lead Gen', start_time: '2026-06-18T14:00:00', end_time: '2026-06-18T15:30:00',
    contact_name: 'David', type: 'david_meeting',
    notes: 'Status scrapers bespreken. Pricing model finaliseren. Eerste klanten prospect.', location: 'Online / Kortrijk',
  },
  {
    id: '4', title: 'Salesgesprek CRM Bouwbedrijf Declercq', start_time: '2026-06-19T11:00:00', end_time: '2026-06-19T12:00:00',
    contact_name: 'Tom Declercq', contact_phone: '+32 479 987 654', type: 'sales_meeting',
    notes: 'CRM demo voorbereiden. Budget: €4200 bruto.', location: 'Kortrijk',
  },
  {
    id: '5', title: 'Sollicitatiegesprek', start_time: '2026-06-20T09:00:00', end_time: '2026-06-20T10:00:00',
    contact_name: 'HR Manager', type: 'job_interview',
    notes: '20u/week job. CV meenemen.', location: 'TBD',
  },
]

const MOCK_FOLLOW_UPS: FollowUp[] = [
  { id: '1', contact_name: 'Stefan Vermeersch', contact_phone: '+32 478 123 456', follow_up_date: '2026-06-16T09:00:00', reason: 'Bevestig afspraak van morgen. Stuur locatie door.', completed: false, priority: 'high' },
  { id: '2', contact_name: 'Resto De Hoorn (gewonnen deal)', follow_up_date: '2026-06-17T10:00:00', reason: 'Eerste website oplevering — vraag feedback', completed: false, priority: 'medium' },
  { id: '3', contact_name: 'Tandarts Peeters', contact_phone: '+32 456 789 012', follow_up_date: '2026-06-18T14:00:00', reason: 'Cold lead — follow-up e-mail versturen', completed: false, priority: 'low' },
  { id: '4', contact_name: 'Immo Leclercq (gewonnen deal)', follow_up_date: '2026-06-15T11:00:00', reason: 'Factuur sturen voor CRM project', completed: false, priority: 'high' },
]

// ─── Map GHL appointment to internal format ────────────────────
function mapGHLAppointment(ghl: {
  id: string
  title?: string
  startTime: string
  endTime?: string
  notes?: string
  status?: string
  contact?: { name?: string; email?: string; phone?: string }
}): Appointment {
  const title = (ghl.title || 'Afspraak').toLowerCase()
  let type: Appointment['type'] = 'other'
  if (title.includes('sales') || title.includes('gesprek') || title.includes('voorstel')) type = 'sales_meeting'
  else if (title.includes('review') || title.includes('kaart')) type = 'review_card_session'
  else if (title.includes('david')) type = 'david_meeting'
  else if (title.includes('sollicit') || title.includes('interview')) type = 'job_interview'

  return {
    id: ghl.id,
    title: ghl.title || 'Afspraak',
    start_time: ghl.startTime,
    end_time: ghl.endTime || ghl.startTime,
    contact_name: ghl.contact?.name || 'Onbekend',
    contact_phone: ghl.contact?.phone,
    type,
    notes: ghl.notes,
    location: undefined,
  }
}

// ─── Appointment Card ─────────────────────────────────────────
function AppointmentCard({ apt }: { apt: Appointment }) {
  const [expanded, setExpanded] = useState(false)
  const colors = APPOINTMENT_COLORS[apt.type] || APPOINTMENT_COLORS.other
  const start = new Date(apt.start_time)
  const end = new Date(apt.end_time)
  const isPast = new Date() > end
  const isToday = new Date().toDateString() === start.toDateString()

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      style={{
        padding: '12px 14px',
        borderRadius: 'var(--radius-md)',
        border: `1px solid ${isToday ? colors.text : 'var(--border)'}`,
        background: isToday ? colors.bg : 'transparent',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        opacity: isPast ? 0.6 : 1,
        marginBottom: '6px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ flexShrink: 0, textAlign: 'center', minWidth: '44px' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            {start.toLocaleDateString('nl-BE', { day: '2-digit', month: 'short' })}
          </div>
          <div style={{ fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: isToday ? colors.text : 'var(--text-primary)' }}>
            {formatTime(start)}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
            {apt.title}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {apt.contact_name}{apt.location ? ` · ${apt.location}` : ''}
          </div>
        </div>

        <Badge variant={colors.badge}>{TYPE_LABELS[apt.type] || 'Overig'}</Badge>
      </div>

      {expanded && (apt.notes || apt.contact_phone) && (
        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
          {apt.notes && <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{apt.notes}</div>}
          {apt.contact_phone && (
            <a href={`tel:${apt.contact_phone}`} onClick={(e) => e.stopPropagation()} style={{ fontSize: '12px', color: 'var(--accent-blue-text)', marginTop: '6px', display: 'block', textDecoration: 'none' }}>
              {apt.contact_phone}
            </a>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Follow-up Card ───────────────────────────────────────────
function FollowUpCard({ fu, onComplete }: { fu: FollowUp; onComplete: (id: string) => void }) {
  const colors = { high: 'red', medium: 'yellow', low: 'muted' } as const
  const isPast = new Date() > new Date(fu.follow_up_date)

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '10px 0', borderBottom: '1px solid var(--border)',
      opacity: fu.completed ? 0.5 : 1,
    }}>
      <div
        onClick={() => onComplete(fu.id)}
        style={{
          width: '18px', height: '18px', borderRadius: '50%',
          border: `2px solid ${fu.completed ? 'var(--accent-green-text)' : isPast && !fu.completed ? 'var(--accent-red-text)' : 'var(--border)'}`,
          background: fu.completed ? 'var(--accent-green-text)' : 'transparent',
          flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'all 0.15s ease',
        }}
      >
        {fu.completed && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '13px', fontWeight: 500, textDecoration: fu.completed ? 'line-through' : 'none', color: fu.completed ? 'var(--text-muted)' : 'var(--text-primary)' }}>
          {fu.contact_name}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{fu.reason}</div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: isPast && !fu.completed ? 'var(--accent-red-text)' : 'var(--text-muted)' }}>
          {formatDateTime(fu.follow_up_date)}
        </div>
        <Badge variant={colors[fu.priority]}>{fu.priority === 'high' ? 'Urgent' : fu.priority === 'medium' ? 'Medium' : 'Laag'}</Badge>
      </div>
    </div>
  )
}

// ─── Main Agenda Page ─────────────────────────────────────────
export default function AgendaPage() {
  const [followUps, setFollowUps] = useState<FollowUp[]>(MOCK_FOLLOW_UPS)
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS)
  const [tab, setTab] = useState<'upcoming' | 'followup'>('upcoming')
  const [ghlStatus, setGhlStatus] = useState<'loading' | 'connected' | 'disconnected'>('loading')
  const [contactCount, setContactCount] = useState(0)

  useEffect(() => {
    // Check GHL connection status
    fetch('/api/ghl/status')
      .then((r) => r.json())
      .then((data) => {
        if (data.connected) {
          setGhlStatus('connected')
          setContactCount(data.contactCount || 0)
        } else {
          setGhlStatus('disconnected')
        }
      })
      .catch(() => setGhlStatus('disconnected'))

    // Try to fetch live appointments
    fetch('/api/ghl/appointments')
      .then((r) => r.json())
      .then((data) => {
        if (data.appointments && data.appointments.length > 0) {
          setAppointments(data.appointments.map(mapGHLAppointment))
        }
        // If empty or error, keep mock data
      })
      .catch(() => {
        // Keep mock data
      })
  }, [])

  const complete = (id: string) => {
    setFollowUps((prev) => prev.map((f) => f.id === id ? { ...f, completed: !f.completed } : f))
  }

  const upcoming = appointments
    .filter((a) => new Date(a.start_time) >= new Date())
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
  const past = appointments.filter((a) => new Date(a.start_time) < new Date())
  const pendingFollowUps = followUps.filter((f) => !f.completed)

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '4px' }}>Agenda</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          {upcoming.length} komende afspraken · {pendingFollowUps.length} follow-ups te doen
        </p>
      </div>

      {/* GHL Status Banner */}
      {ghlStatus === 'connected' ? (
        <div style={{ marginBottom: '12px', padding: '10px 14px', background: 'var(--accent-green-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent-green-text)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green-text)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          <span style={{ fontSize: '12px', color: 'var(--accent-green-text)' }}>
            GoHighLevel verbonden · {contactCount} contacten gesynchroniseerd
          </span>
        </div>
      ) : ghlStatus === 'disconnected' ? (
        <div style={{ marginBottom: '12px', padding: '10px 14px', background: 'var(--accent-blue-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent-blue-text)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue-text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span style={{ fontSize: '12px', color: 'var(--accent-blue-text)', flex: 1 }}>
            GoHighLevel niet verbonden — voorbeelddata getoond.
          </span>
          <a href="/settings" style={{ fontSize: '12px', color: 'var(--accent-blue-text)', fontWeight: 600, textDecoration: 'none' }}>Instellen</a>
        </div>
      ) : null}

      <div style={{ display: 'flex', gap: '4px', marginBottom: '12px', borderBottom: '1px solid var(--border)' }}>
        {[
          { key: 'upcoming', label: `Komende (${upcoming.length})` },
          { key: 'followup', label: `Follow-ups (${pendingFollowUps.length})` },
        ].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key as 'upcoming' | 'followup')} style={{
            padding: '8px 14px', fontSize: '13px',
            fontWeight: tab === t.key ? 500 : 400,
            color: tab === t.key ? 'var(--text-primary)' : 'var(--text-muted)',
            background: 'none', border: 'none',
            borderBottom: `2px solid ${tab === t.key ? 'var(--text-primary)' : 'transparent'}`,
            cursor: 'pointer', marginBottom: '-1px',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'upcoming' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
          <Card padding="md">
            <CardTitle>Komende afspraken</CardTitle>
            <div style={{ marginTop: '12px' }}>
              {upcoming.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', padding: '16px 0', textAlign: 'center' }}>Geen komende afspraken</p>
              ) : upcoming.map((apt) => <AppointmentCard key={apt.id} apt={apt} />)}
            </div>
          </Card>
          <Card padding="md">
            <CardTitle subtitle="Vorige afspraken">Historie</CardTitle>
            <div style={{ marginTop: '12px' }}>
              {past.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', padding: '16px 0', textAlign: 'center' }}>Geen afspraken in het verleden</p>
              ) : past.map((apt) => <AppointmentCard key={apt.id} apt={apt} />)}
            </div>
          </Card>
        </div>
      )}

      {tab === 'followup' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
          <Card padding="md">
            <CardHeader action={<Badge variant={pendingFollowUps.length > 0 ? 'red' : 'green'}>{pendingFollowUps.length} openstaand</Badge>}>
              <CardTitle>Follow-ups</CardTitle>
            </CardHeader>
            {followUps.map((fu) => <FollowUpCard key={fu.id} fu={fu} onComplete={complete} />)}
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
    </div>
  )
}

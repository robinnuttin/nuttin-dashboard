'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  useDailyStore, usePrayerStore, useFinancialStore,
  useTrainingStore, useBodyStore, useSupplementsStore,
  useNutritionStore,
} from '@/stores/app-store'

const todayKey = () => new Date().toISOString().split('T')[0]

// ─── Greeting based on time ──────────────────────────────────
const getGreeting = () => {
  const h = new Date().getHours()
  if (h < 6)  return 'Goedenacht'
  if (h < 12) return 'Goedemorgen'
  if (h < 18) return 'Goedemiddag'
  return 'Goedenavond'
}

// ─── Section wrapper ─────────────────────────────────────────
function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', padding: '0 2px' }}>
        <h2 className="text-caption">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

// ─── Stat card ───────────────────────────────────────────────
function StatCard({ label, value, sub, color, href }: { label: string; value: string; sub?: string; color?: string; href?: string }) {
  const inner = (
    <div
      style={{
        background: 'var(--bg-secondary)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '14px 16px',
        transition: 'box-shadow 0.2s, border-color 0.2s', cursor: href ? 'pointer' : 'default',
      }}
      onMouseEnter={(e) => { if (href) { e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)'; e.currentTarget.style.borderColor = 'var(--border-strong)' } }}
      onMouseLeave={(e) => { if (href) { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--border)' } }}
    >
      <div className="text-caption" style={{ marginBottom: '6px' }}>{label}</div>
      <div className="text-tabular" style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1, color: color || 'var(--text-primary)' }}>{value}</div>
      {sub && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '5px' }}>{sub}</div>}
    </div>
  )
  return href ? <Link href={href} style={{ textDecoration: 'none' }}>{inner}</Link> : inner
}

// ─── Check row ───────────────────────────────────────────────
function CheckRow({ label, done, onToggle }: { label: string; done: boolean; onToggle: () => void }) {
  return (
    <div className={`check-row${done ? ' done' : ''}`} onClick={onToggle}>
      <div style={{
        width: '18px', height: '18px', borderRadius: '5px',
        border: `2px solid ${done ? 'var(--accent-green-text)' : 'var(--border-strong)'}`,
        background: done ? 'var(--accent-green-text)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        transition: 'all 0.15s',
      }}>
        {done && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--text-inverse)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
      </div>
      <span style={{ fontSize: '13px', flex: 1, textDecoration: done ? 'line-through' : 'none', color: done ? 'var(--text-muted)' : 'var(--text-primary)' }}>{label}</span>
    </div>
  )
}

// ─── Prayer widget ───────────────────────────────────────────
type PrayerName = 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha'
const PRAYERS: PrayerName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']

function PrayerWidget() {
  const { toggle, getDay } = usePrayerStore()
  const [times, setTimes] = useState<Record<string, string>>({})
  const dt = todayKey()
  const done = getDay(dt)
  const count = PRAYERS.filter((p) => done[p]).length

  useEffect(() => {
    fetch('/api/prayer').then((r) => r.json()).then((d) => d.prayers && setTimes(d.prayers)).catch(() => {})
  }, [])

  const timeMap: Record<PrayerName, string> = {
    Fajr: times.fajr || '', Dhuhr: times.dhuhr || '', Asr: times.asr || '',
    Maghrib: times.maghrib || '', Isha: times.isha || '',
  }

  return (
    <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <span style={{ fontSize: '13px', fontWeight: 600 }}>Gebeden</span>
        <span className="text-tabular" style={{ fontSize: '12px', color: count === 5 ? 'var(--accent-green-text)' : 'var(--text-muted)' }}>{count}/5</span>
      </div>
      <div style={{ display: 'flex', gap: '6px' }}>
        {PRAYERS.map((p) => (
          <button
            key={p}
            onClick={() => toggle(dt, p)}
            style={{
              flex: 1, padding: '8px 4px', borderRadius: 'var(--radius-sm)',
              border: `1px solid ${done[p] ? 'var(--accent-green-border)' : 'var(--border)'}`,
              background: done[p] ? 'var(--accent-green-bg)' : 'transparent',
              color: done[p] ? 'var(--accent-green-text)' : 'var(--text-muted)',
              fontSize: '10px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
            }}
          >
            <span>{p}</span>
            {timeMap[p] && <span style={{ fontSize: '9px', opacity: 0.8 }}>{timeMap[p]}</span>}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Priority widget ─────────────────────────────────────────
function PriorityWidget() {
  const { records, setPriorities } = useDailyStore()
  const dt = todayKey()
  const rec = records[dt]
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(['', '', ''])
  const priorities = rec?.priorities || []

  const save = () => {
    setPriorities(dt, draft.filter(Boolean))
    setEditing(false)
  }

  if (editing) {
    return (
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '10px' }}>Top 3 voor vandaag</div>
        {[0, 1, 2].map((i) => (
          <input
            key={i} className="inp" placeholder={`Prioriteit ${i + 1}`}
            value={draft[i]} onChange={(e) => { const n = [...draft]; n[i] = e.target.value; setDraft(n) }}
            style={{ marginBottom: '6px' }}
          />
        ))}
        <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
          <button onClick={save} style={{ flex: 1, padding: '8px', background: 'var(--text-primary)', color: 'var(--text-inverse)', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>Opslaan</button>
          <button onClick={() => setEditing(false)} style={{ padding: '8px 14px', background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '13px', cursor: 'pointer', color: 'var(--text-muted)' }}>Annuleer</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: priorities.length ? '10px' : 0 }}>
        <span style={{ fontSize: '13px', fontWeight: 600 }}>Top 3 vandaag</span>
        <button onClick={() => { setDraft(priorities.length ? [...priorities, '', ''].slice(0, 3) : ['', '', '']); setEditing(true) }} style={{ fontSize: '12px', color: 'var(--accent-blue-text)', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
          {priorities.length ? 'Bewerken' : 'Instellen'}
        </button>
      </div>
      {priorities.length === 0 ? (
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, marginTop: '6px' }}>Stel je top 3 prioriteiten in voor vandaag.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {priorities.map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px' }}>
              <span style={{ width: '20px', height: '20px', borderRadius: '6px', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, flexShrink: 0, color: 'var(--text-muted)' }}>{i + 1}</span>
              <span style={{ color: 'var(--text-primary)', lineHeight: 1.5 }}>{p}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Nutrition mini ──────────────────────────────────────────
function NutritionMini() {
  const nutr = useNutritionStore()
  const totals = nutr.getTotals(todayKey())
  const macros = [
    { label: 'Kcal', val: totals.calories, goal: 2700, color: 'var(--accent-blue-text)' },
    { label: 'Proteïne', val: totals.protein_g, goal: 210, unit: 'g', color: 'var(--accent-purple-text)' },
    { label: 'Koolhydraten', val: totals.carbs_g, goal: 270, unit: 'g', color: 'var(--accent-orange-text)' },
  ]

  return (
    <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <span style={{ fontSize: '13px', fontWeight: 600 }}>Voeding</span>
        <Link href="/nutrition" style={{ fontSize: '12px', color: 'var(--accent-blue-text)' }}>Loggen</Link>
      </div>
      {totals.calories === 0 ? (
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>Nog niets gelogd vandaag.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {macros.map(({ label, val, goal, unit, color }) => (
            <div key={label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                <span className="text-tabular" style={{ color: 'var(--text-muted)' }}>
                  {Math.round(val)}/{goal}{unit || ''}
                </span>
              </div>
              <div className="prog-track">
                <div className="prog-fill" style={{ width: `${Math.min(100, (val / goal) * 100)}%`, background: val >= goal * 0.9 ? 'var(--accent-green-text)' : color }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main dashboard ──────────────────────────────────────────
export default function DashboardPage() {
  const daily = useDailyStore()
  const fin = useFinancialStore()
  const train = useTrainingStore()
  const body = useBodyStore()
  const supp = useSupplementsStore()
  const prayer = usePrayerStore()

  const dt = todayKey()
  const rec = daily.records[dt] || daily.getOrCreate(dt)
  const latest = body.latest()
  const pCount = prayer.getCount(dt)
  const monthlyIncome = fin.getMonthlyIncome()

  const planDays: (keyof typeof train.plan)[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
  const todayPlan = train.plan[planDays[new Date().getDay()]]
  const isSaunaDag = [2, 4, 0].includes(new Date().getDay())
  const activeSupps = supp.supplements.filter((s) => s.active)

  const toggle = (field: Parameters<typeof daily.toggle>[1]) => daily.toggle(dt, field)

  const now = new Date()
  const dayName = now.toLocaleDateString('nl-BE', { weekday: 'long' })
  const dayNum = now.getDate()
  const monthName = now.toLocaleDateString('nl-BE', { month: 'long' })

  return (
    <div className="animate-fade-in" style={{ maxWidth: '720px' }}>

      {/* Hero greeting */}
      <div style={{ marginBottom: '28px' }}>
        <h1 className="text-display" style={{ marginBottom: '4px' }}>
          {getGreeting()}, Robin
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          {dayName} {dayNum} {monthName} · {pCount}/5 gebeden
        </p>
      </div>

      {/* Quick stats */}
      <Section title="Overzicht">
        <div className="stat-grid">
          <StatCard label="Cash" value={`€${fin.cashBalance.toLocaleString('nl-BE')}`} href="/financial" />
          <StatCard
            label="Inkomen"
            value={`€${monthlyIncome.toLocaleString('nl-BE')}`}
            sub={`Doel: €${fin.monthlyGoal.toLocaleString('nl-BE')}`}
            href="/financial"
            color={monthlyIncome >= fin.monthlyGoal ? 'var(--accent-green-text)' : undefined}
          />
          {latest && <StatCard label="Gewicht" value={`${latest.weight_kg}kg`} sub={latest.body_fat_pct ? `${latest.body_fat_pct}% vet` : undefined} href="/health" />}
          <StatCard label="Training" value={todayPlan} sub={isSaunaDag ? 'Sauna dag' : undefined} href="/training" />
        </div>
      </Section>

      {/* Morning routine */}
      <Section
        title="Dagchecklist"
        action={<Link href="/daily" style={{ fontSize: '12px', color: 'var(--accent-blue-text)' }}>Alles bekijken</Link>}
      >
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '6px 4px' }}>
          <CheckRow label="Optijd opgestaan (voor 08:30)" done={rec.wokeOnTime} onToggle={() => toggle('wokeOnTime')} />
          <CheckRow label="Supplementen genomen" done={rec.supplementsTaken} onToggle={() => toggle('supplementsTaken')} />
          <CheckRow label="Training gedaan" done={rec.trainingDone} onToggle={() => toggle('trainingDone')} />
          <CheckRow label="Optijd gaan slapen (voor 23:00)" done={rec.sleptOnTime} onToggle={() => toggle('sleptOnTime')} />
          {isSaunaDag && <CheckRow label="Sauna (din/don/zon)" done={rec.sauna} onToggle={() => toggle('sauna')} />}
        </div>
      </Section>

      {/* Focus & Faith */}
      <Section title="Focus & Geloof">
        <div className="card-grid">
          <PriorityWidget />
          <PrayerWidget />
        </div>
      </Section>

      {/* Track */}
      <Section title="Tracking">
        <div className="card-grid">
          <NutritionMini />

          {/* Supplements */}
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600 }}>Supplementen</span>
              <Link href="/health" style={{ fontSize: '12px', color: 'var(--accent-blue-text)' }}>Beheren</Link>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {activeSupps.map((s) => (
                <span key={s.id} style={{
                  padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 500,
                  background: 'var(--accent-green-bg)', color: 'var(--accent-green-text)',
                  border: '1px solid var(--accent-green-border)',
                }}>
                  {s.name} {s.dose}
                </span>
              ))}
              {activeSupps.length === 0 && <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>Geen actieve supplementen</p>}
            </div>
          </div>
        </div>
      </Section>

      {/* Financial */}
      <Section
        title="Financieel"
        action={<Link href="/financial" style={{ fontSize: '12px', color: 'var(--accent-blue-text)' }}>Details</Link>}
      >
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Maandinkomen</span>
            <span className="text-tabular" style={{ fontWeight: 500 }}>€{monthlyIncome.toLocaleString('nl-BE')} / €{fin.monthlyGoal.toLocaleString('nl-BE')}</span>
          </div>
          <div className="prog-track" style={{ height: '6px' }}>
            <div className="prog-fill" style={{ width: `${Math.min(100, (monthlyIncome / Math.max(fin.monthlyGoal, 1)) * 100)}%`, background: monthlyIncome >= fin.monthlyGoal ? 'var(--accent-green-text)' : 'var(--accent-blue-text)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <span>{fin.deals.filter((d) => d.stage === 'won').length} deals gewonnen</span>
            <span>€{Math.round(fin.getMonthlyExpenses())}/mnd kosten</span>
          </div>
        </div>
      </Section>
    </div>
  )
}

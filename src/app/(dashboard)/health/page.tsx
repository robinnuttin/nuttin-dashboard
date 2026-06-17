'use client'
import { useState } from 'react'
import { Card, CardTitle, CardHeader, CardDivider } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useBodyStore } from '@/stores/app-store'
import { estimateMuscleMass, formatDate, getTodayString } from '@/lib/utils'

const HEIGHT = 1.91

// ─── Body Composition Card ────────────────────────────────────
function BodyCompositionCard() {
  const { measurements, add, latest } = useBodyStore()
  const [open, setOpen] = useState(false)
  const [weight, setWeight] = useState('')
  const [fat, setFat] = useState('')

  const latestMeasurement = latest()
  const bodyFat = latestMeasurement?.body_fat_pct ?? 18
  const muscleMass = latestMeasurement ? estimateMuscleMass(latestMeasurement.weight_kg, bodyFat) : null

  const weightProgress = latestMeasurement ? ((latestMeasurement.weight_kg - 87) / (92 - 87)) * 100 : 0
  const fatProgress = ((20 - bodyFat) / (20 - 12)) * 100

  const addStats = () => {
    if (!weight) return
    add({
      date: getTodayString(),
      weight_kg: Number(weight),
      body_fat_pct: Number(fat) || 18,
    })
    setOpen(false)
    setWeight('')
    setFat('')
  }

  return (
    <Card padding="lg">
      <CardHeader
        action={
          <Button size="sm" variant="secondary" onClick={() => setOpen(!open)}
            icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>}
          >
            Meten
          </Button>
        }
      >
        <CardTitle>Lichaamsamenstelling</CardTitle>
      </CardHeader>

      {open && (
        <div style={{ marginBottom: '16px', padding: '14px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
          <Input label="Gewicht (kg)" type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="87.5" style={{ width: '120px' }} />
          <Input label="Vetpercentage (%)" type="number" value={fat} onChange={(e) => setFat(e.target.value)} placeholder="18" style={{ width: '140px' }} />
          <Button variant="primary" size="md" onClick={addStats}>Opslaan</Button>
        </div>
      )}

      {latestMeasurement ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>Gewicht</div>
              <div style={{ fontSize: '32px', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1 }}>
                {latestMeasurement.weight_kg}<span style={{ fontSize: '16px', fontWeight: 400, color: 'var(--text-muted)' }}>kg</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--accent-blue-text)', marginTop: '4px' }}>Doel: 91-92 kg</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>Vetpercentage</div>
              <div style={{ fontSize: '32px', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1 }}>
                {bodyFat}<span style={{ fontSize: '16px', fontWeight: 400, color: 'var(--text-muted)' }}>%</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--accent-yellow-text)', marginTop: '4px' }}>Doel: 10-12%</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>Spiermassa</div>
              <div style={{ fontSize: '32px', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1 }}>
                {muscleMass}<span style={{ fontSize: '16px', fontWeight: 400, color: 'var(--text-muted)' }}>kg</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--accent-green-text)', marginTop: '4px' }}>Lean mass</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Progress label="Gewicht naar 92 kg" value={Math.max(weightProgress, 0)} max={100} height={4} color="var(--accent-blue-text)" showValue />
            <Progress label="Vetpercentage naar 12%" value={Math.max(fatProgress, 0)} max={100} height={4} color="var(--accent-yellow-text)" showValue />
          </div>

          <CardDivider />

          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Meetgeschiedenis</div>
          {measurements.slice(0, 5).map((m) => (
            <div key={m.date} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{formatDate(m.date)}</span>
              <span style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 500 }}>{m.weight_kg} kg</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{m.body_fat_pct ?? '—'}% vet</span>
              <span style={{ fontSize: '12px', color: 'var(--accent-green-text)' }}>{estimateMuscleMass(m.weight_kg, m.body_fat_pct ?? 18)}kg lean</span>
            </div>
          ))}
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
          Voeg je eerste meting toe om te beginnen.
        </div>
      )}
    </Card>
  )
}

// ─── Supplement Tracker ────────────────────────────────────────
const SUPPLEMENTS = [
  { name: 'Creatine', dose: '5g', timing: 'Ochtend' },
  { name: 'Vitamine D', dose: '4000 IU', timing: 'Ochtend (met vet)' },
  { name: 'Magnesium', dose: '400mg', timing: 'Voor slapen' },
  { name: 'Zink', dose: '15mg', timing: 'Voor slapen (niet met calcium)' },
  { name: 'Vitamine B12', dose: '1000mcg', timing: 'Ochtend' },
  { name: 'Calcium', dose: '500mg', timing: 'Los van zink' },
]

function SupplementTracker() {
  const [taken, setTaken] = useState<Record<string, boolean>>({})
  const doneCount = Object.values(taken).filter(Boolean).length

  return (
    <Card padding="md">
      <CardHeader
        action={<Badge variant={doneCount === SUPPLEMENTS.length ? 'green' : 'blue'}>{doneCount}/{SUPPLEMENTS.length}</Badge>}
      >
        <CardTitle>Supplementen</CardTitle>
      </CardHeader>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {SUPPLEMENTS.map((s) => (
          <label
            key={s.name}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
          >
            <div
              onClick={() => setTaken((t) => ({ ...t, [s.name]: !t[s.name] }))}
              style={{
                width: '16px', height: '16px', borderRadius: '4px',
                border: `1.5px solid ${taken[s.name] ? 'var(--accent-green-text)' : 'var(--border)'}`,
                background: taken[s.name] ? 'var(--accent-green-bg)' : 'transparent',
                flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s ease', cursor: 'pointer',
              }}
            >
              {taken[s.name] && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green-text)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 500, color: taken[s.name] ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: taken[s.name] ? 'line-through' : 'none' }}>
                {s.name} <span style={{ fontWeight: 400, fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{s.dose}</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.timing}</div>
            </div>
          </label>
        ))}
      </div>
    </Card>
  )
}

// ─── Testosterone Score ────────────────────────────────────────
function TestosteroneScore() {
  const bodyFat = useBodyStore((s) => s.latest)()?.body_fat_pct ?? 18
  const score = Math.round(
    (bodyFat <= 15 ? 30 : bodyFat <= 18 ? 20 : 10) +
    25 + 20 + 5
  )

  const factors = [
    { label: 'Slaap (8u doel)', score: 6, max: 10, tip: 'Slaap voor 23u' },
    { label: 'Vetpercentage', score: bodyFat <= 15 ? 9 : bodyFat <= 18 ? 7 : 5, max: 10, tip: bodyFat > 15 ? 'Verlaag naar <15%' : 'Goed niveau' },
    { label: 'Krachtraining', score: 8, max: 10, tip: '4x per week trainen' },
    { label: 'Zink & Magnesium', score: 7, max: 10, tip: 'Dagelijks nemen' },
    { label: 'Vitamine D', score: 7, max: 10, tip: '4000 IU per dag' },
    { label: 'Stressniveau', score: 6, max: 10, tip: 'Meditatie / wandelen' },
  ]

  return (
    <Card padding="md">
      <CardHeader action={
        <div style={{ fontSize: '24px', fontWeight: 700, color: score >= 70 ? 'var(--accent-green-text)' : 'var(--accent-yellow-text)' }}>
          {score}<span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--text-muted)' }}>/100</span>
        </div>
      }>
        <CardTitle subtitle="Evidence-based optimalisatie">Testosteron Support</CardTitle>
      </CardHeader>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {factors.map((f) => (
          <div key={f.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{f.label}</span>
              <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{f.score}/{f.max}</span>
            </div>
            <Progress value={f.score} max={f.max} height={3} color={f.score >= 8 ? 'var(--accent-green-text)' : f.score >= 6 ? 'var(--accent-blue-text)' : 'var(--accent-yellow-text)'} />
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{f.tip}</div>
          </div>
        ))}
      </div>
    </Card>
  )
}

// ─── Appearance Tracker ────────────────────────────────────────
const APPEARANCE_TASKS = [
  { id: 'whitening', name: 'White strips', frequency: 'Elke 1-2 dagen' },
  { id: 'jaw', name: 'Kaakspier oefeningen', frequency: 'Dagelijks, 2x 5 min' },
  { id: 'facial', name: 'Gezichtsoefeningen', frequency: 'Dagelijks' },
  { id: 'pelvic', name: 'Bekkenoefeningen', frequency: '2x per week' },
  { id: 'skincare', name: 'Huidverzorging routine', frequency: 'Ochtend & avond' },
]

function AppearanceTracker() {
  const [done, setDone] = useState<Record<string, boolean>>({})
  const doneCount = Object.values(done).filter(Boolean).length

  return (
    <Card padding="md">
      <CardHeader action={<Badge variant="blue">{doneCount}/{APPEARANCE_TASKS.length}</Badge>}>
        <CardTitle>Uiterlijk & Verzorging</CardTitle>
      </CardHeader>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {APPEARANCE_TASKS.map((t) => (
          <label key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}>
            <div
              onClick={() => setDone((d) => ({ ...d, [t.id]: !d[t.id] }))}
              style={{
                width: '16px', height: '16px', borderRadius: '4px',
                border: `1.5px solid ${done[t.id] ? 'var(--accent-green-text)' : 'var(--border)'}`,
                background: done[t.id] ? 'var(--accent-green-bg)' : 'transparent',
                flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s ease', cursor: 'pointer',
              }}
            >
              {done[t.id] && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green-text)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 500, color: done[t.id] ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: done[t.id] ? 'line-through' : 'none' }}>
                {t.name}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.frequency}</div>
            </div>
          </label>
        ))}
      </div>

      <div style={{ marginTop: '14px', padding: '12px', background: 'var(--accent-blue-bg)', borderRadius: 'var(--radius-sm)' }}>
        <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--accent-blue-text)', marginBottom: '6px' }}>
          Tips voor face definition
        </div>
        <ul style={{ fontSize: '12px', color: 'var(--accent-blue-text)', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <li>Vetpercentage verlagen = dunnere huid in gezicht</li>
          <li>Kaakspier oefeningen: mastic gum kauwen</li>
          <li>Lage zoutinname = minder waterretentie</li>
          <li>Goede slaap = minder puffiness</li>
        </ul>
      </div>
    </Card>
  )
}

// ─── Sleep Overview ────────────────────────────────────────────
function SleepCard() {
  const sleepData = [
    { date: '10 jun', hours: 7.5 },
    { date: '11 jun', hours: 8 },
    { date: '12 jun', hours: 6.5 },
    { date: '13 jun', hours: 8 },
    { date: '14 jun', hours: 7 },
    { date: '15 jun', hours: 8.5 },
  ]
  const avg = sleepData.reduce((s, d) => s + d.hours, 0) / sleepData.length

  return (
    <Card padding="md">
      <CardHeader action={<Badge variant={avg >= 8 ? 'green' : avg >= 7 ? 'blue' : 'red'}>{avg.toFixed(1)}u gem.</Badge>}>
        <CardTitle subtitle="Doel: 8u, in bed voor 23u-00u, wakker 8u-8u30">Slaap</CardTitle>
      </CardHeader>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '60px', marginBottom: '8px' }}>
        {sleepData.map((d) => (
          <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div
              style={{
                width: '100%',
                height: `${(d.hours / 10) * 60}px`,
                background: d.hours >= 8 ? 'var(--accent-green-text)' : d.hours >= 7 ? 'var(--accent-blue-text)' : 'var(--accent-red-text)',
                borderRadius: '2px',
                opacity: 0.8,
              }}
            />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '4px' }}>
        {sleepData.map((d) => (
          <div key={d.date} style={{ flex: 1, textAlign: 'center', fontSize: '10px', color: 'var(--text-muted)' }}>
            {d.hours}u
          </div>
        ))}
      </div>
      <CardDivider />
      <div style={{ padding: '10px', background: 'var(--accent-yellow-bg)', borderRadius: 'var(--radius-sm)' }}>
        <div style={{ fontSize: '12px', color: 'var(--accent-yellow-text)', fontWeight: 500 }}>Slaapstrategie</div>
        <ul style={{ fontSize: '12px', color: 'var(--accent-yellow-text)', paddingLeft: '14px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <li>Telefoon weg na 22:00 (gradueel)</li>
          <li>Magnesium 30 min voor slapen</li>
          <li>Kamer koel (18-19°C)</li>
          <li>Schermen dimmen na 21:00</li>
        </ul>
      </div>
    </Card>
  )
}

// ─── Main Health Page ─────────────────────────────────────────
export default function HealthPage() {
  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '4px' }}>Gezondheid</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>87kg → 91-92kg · 19% → 10-12% vet · 1m91</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <BodyCompositionCard />
          <SleepCard />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <SupplementTracker />
          <TestosteroneScore />
          <AppearanceTracker />
        </div>
      </div>
    </div>
  )
}

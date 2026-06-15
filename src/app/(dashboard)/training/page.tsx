'use client'
import { useState } from 'react'
import { Card, CardTitle, CardHeader, CardDivider } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getTodayWorkout, getDayOfWeek, getTodayString } from '@/lib/utils'

const WEEKLY_SCHEDULE = [
  { day: 'Maandag', workout: 'Push', exercises: ['Bench Press', 'Incline Dumbbell Press', 'Lateral Raises', 'Tricep Dips', 'Cable Crossover'], muscles: 'Borst · Schouders · Triceps' },
  { day: 'Dinsdag', workout: 'Pull', exercises: ['Deadlift', 'Pull-ups', 'Barbell Row', 'Face Pulls', 'Bicep Curls'], muscles: 'Rug · Biceps · Trapezius' },
  { day: 'Woensdag', workout: 'Cardio', exercises: ['7-10 km lopen (Zone 2-3)'], muscles: 'Cardiovasculair' },
  { day: 'Donderdag', workout: 'Legs', exercises: ['Squat', 'Romanian Deadlift', 'Leg Press', 'Bulgarian Split Squat', 'Leg Curl'], muscles: 'Quads · Hamstrings · Glutes' },
  { day: 'Vrijdag', workout: 'Upper Body', exercises: ['Overhead Press', 'Weighted Pull-ups', 'Cable Row', 'Arnold Press', 'Skull Crushers'], muscles: 'Full upper body' },
  { day: 'Zaterdag', workout: 'Cardio', exercises: ['4-5 km lopen OF Zone 2 cycling'], muscles: 'Cardiovasculair' },
  { day: 'Zondag', workout: 'Rust', exercises: ['Wandelen (optioneel)', 'Stretching', 'Foam Rolling'], muscles: 'Herstel' },
]

const WORKOUT_COLORS: Record<string, string> = {
  Push: 'blue',
  Pull: 'purple',
  Cardio: 'orange',
  Legs: 'green',
  'Upper Body': 'yellow',
  Rust: 'muted',
}

// ─── Weekly Schedule ──────────────────────────────────────────
function WeeklySchedule() {
  const todayWorkout = getTodayWorkout()
  const todayDay = getDayOfWeek()

  return (
    <Card padding="md">
      <CardTitle>Weekschema</CardTitle>
      <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {WEEKLY_SCHEDULE.map((d) => {
          const isToday = d.day === todayDay
          return (
            <div
              key={d.day}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px',
                borderRadius: 'var(--radius-sm)',
                background: isToday ? 'var(--bg-hover)' : 'transparent',
                border: `1px solid ${isToday ? 'var(--border-strong)' : 'transparent'}`,
              }}
            >
              <div style={{ width: '80px', fontSize: '12px', fontWeight: isToday ? 600 : 400, color: isToday ? 'var(--text-primary)' : 'var(--text-muted)', flexShrink: 0 }}>
                {d.day}
              </div>
              <Badge variant={WORKOUT_COLORS[d.workout] as 'blue' | 'purple' | 'orange' | 'green' | 'yellow' | 'muted'}>
                {d.workout}
              </Badge>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', flex: 1 }}>{d.muscles}</div>
              {isToday && <span style={{ fontSize: '11px', color: 'var(--accent-green-text)', fontWeight: 500 }}>Vandaag</span>}
            </div>
          )
        })}
      </div>
    </Card>
  )
}

// ─── Today's Workout Logger ───────────────────────────────────
interface SetLog {
  exercise: string
  sets: { weight: string; reps: string; done: boolean }[]
}

function WorkoutLogger() {
  const todayWorkout = getTodayWorkout()
  const todaySchedule = WEEKLY_SCHEDULE.find((d) => d.day === getDayOfWeek())
  const [started, setStarted] = useState(false)
  const [sets, setSets] = useState<SetLog[]>(
    (todaySchedule?.exercises || []).map((ex) => ({
      exercise: ex,
      sets: [
        { weight: '', reps: '', done: false },
        { weight: '', reps: '', done: false },
        { weight: '', reps: '', done: false },
        { weight: '', reps: '', done: false },
      ],
    }))
  )
  const [timer, setTimer] = useState(0)

  const isCardio = todayWorkout === 'Cardio'
  const isRest = todayWorkout === 'Rust'

  const completedSets = sets.flatMap((s) => s.sets).filter((s) => s.done).length
  const totalSets = sets.flatMap((s) => s.sets).length

  const toggleSet = (exIdx: number, setIdx: number) => {
    setSets((prev) =>
      prev.map((ex, i) =>
        i === exIdx
          ? {
              ...ex,
              sets: ex.sets.map((s, j) =>
                j === setIdx ? { ...s, done: !s.done } : s
              ),
            }
          : ex
      )
    )
  }

  const updateSet = (exIdx: number, setIdx: number, field: 'weight' | 'reps', val: string) => {
    setSets((prev) =>
      prev.map((ex, i) =>
        i === exIdx
          ? { ...ex, sets: ex.sets.map((s, j) => (j === setIdx ? { ...s, [field]: val } : s)) }
          : ex
      )
    )
  }

  if (isRest) {
    return (
      <Card padding="md">
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline' }}>
              <path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
            </svg>
          </div>
          <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '6px' }}>Rustdag</div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Focus op herstel, slaap en voeding.</div>
        </div>
      </Card>
    )
  }

  return (
    <Card padding="md">
      <CardHeader
        action={
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {started && <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{completedSets}/{totalSets} sets</span>}
            <Button
              size="sm"
              variant={started ? 'secondary' : 'primary'}
              onClick={() => setStarted(!started)}
            >
              {started ? 'Pauzeren' : 'Training starten'}
            </Button>
          </div>
        }
      >
        <CardTitle subtitle={todaySchedule?.muscles}>{todayWorkout} — Vandaag</CardTitle>
      </CardHeader>

      {started && (
        <>
          <Progress value={completedSets} max={totalSets} height={3} color="var(--accent-green-text)" />
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {sets.map((ex, exIdx) => (
              <div key={ex.exercise}>
                <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>
                  {ex.exercise}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {ex.sets.map((s, setIdx) => (
                    <div key={setIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', width: '40px', fontFamily: 'var(--font-mono)' }}>
                        Set {setIdx + 1}
                      </span>
                      <Input
                        type="number"
                        value={s.weight}
                        onChange={(e) => updateSet(exIdx, setIdx, 'weight', e.target.value)}
                        placeholder="kg"
                        suffix="kg"
                        style={{ width: '80px' }}
                      />
                      <Input
                        type="number"
                        value={s.reps}
                        onChange={(e) => updateSet(exIdx, setIdx, 'reps', e.target.value)}
                        placeholder="reps"
                        suffix="×"
                        style={{ width: '80px' }}
                      />
                      <div
                        onClick={() => toggleSet(exIdx, setIdx)}
                        style={{
                          width: '28px', height: '28px', borderRadius: 'var(--radius-sm)',
                          border: `1.5px solid ${s.done ? 'var(--accent-green-text)' : 'var(--border)'}`,
                          background: s.done ? 'var(--accent-green-bg)' : 'transparent',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {s.done && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green-text)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {!started && (
        <div style={{ marginTop: '12px' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px' }}>Oefeningen van vandaag:</div>
          {todaySchedule?.exercises.map((ex, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', width: '20px' }}>{i + 1}</span>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{ex}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

// ─── Cardio Tracker ───────────────────────────────────────────
function CardioTracker() {
  const cardioData = [
    { date: '12 jun', type: 'long_run', distance: 8.2, duration: 52, hr: 155 },
    { date: '10 jun', type: 'short_run', distance: 4.5, duration: 26, hr: 162 },
    { date: '7 jun', type: 'long_run', distance: 7.8, duration: 48, hr: 158 },
    { date: '5 jun', type: 'zone2', distance: 5, duration: 35, hr: 140 },
  ]
  const weeklyKm = cardioData.slice(0, 2).reduce((s, d) => s + d.distance, 0)

  return (
    <Card padding="md">
      <CardHeader action={<Badge variant="orange">{weeklyKm.toFixed(1)} km deze week</Badge>}>
        <CardTitle subtitle="3x per week cardio">Cardio</CardTitle>
      </CardHeader>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '14px' }}>
        {[
          { label: 'Lange run', sub: '7-10 km (woe)', color: 'var(--accent-blue-text)' },
          { label: 'Korte run', sub: '4-5 km (zat)', color: 'var(--accent-green-text)' },
          { label: 'Zone 2', sub: 'Extra cardio', color: 'var(--accent-yellow-text)' },
        ].map((c) => (
          <div key={c.label} style={{ padding: '10px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '12px', fontWeight: 500, color: c.color }}>{c.label}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{c.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Recente sessies</div>
      {cardioData.map((d, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: 500 }}>
              {d.type === 'long_run' ? 'Lange run' : d.type === 'short_run' ? 'Korte run' : 'Zone 2'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{d.date}</div>
          </div>
          <div style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{d.distance} km</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{d.duration} min</div>
          <div style={{ fontSize: '12px', color: 'var(--accent-red-text)' }}>{d.hr} bpm</div>
        </div>
      ))}
    </Card>
  )
}

// ─── Progressive Overload ─────────────────────────────────────
function ProgressiveOverload() {
  const exercises = [
    { name: 'Bench Press', lastWeight: 82.5, lastReps: 8, trend: '+2.5kg' },
    { name: 'Squat', lastWeight: 100, lastReps: 6, trend: '+5kg' },
    { name: 'Deadlift', lastWeight: 120, lastReps: 5, trend: '+2.5kg' },
    { name: 'Overhead Press', lastWeight: 55, lastReps: 8, trend: '+2.5kg' },
    { name: 'Pull-ups', lastWeight: 0, lastReps: 10, trend: '+2 reps' },
  ]

  return (
    <Card padding="md">
      <CardTitle subtitle="Progressive overload tracking">Krachtontwikkeling</CardTitle>
      <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {exercises.map((ex) => (
          <div key={ex.name} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
            <div style={{ flex: 1, fontSize: '13px', fontWeight: 500 }}>{ex.name}</div>
            <div style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
              {ex.lastWeight > 0 ? `${ex.lastWeight}kg` : 'BW'} × {ex.lastReps}
            </div>
            <Badge variant="green">{ex.trend}</Badge>
          </div>
        ))}
      </div>
    </Card>
  )
}

// ─── Main Training Page ───────────────────────────────────────
export default function TrainingPage() {
  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '4px' }}>Training</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Vandaag: <strong style={{ color: 'var(--text-primary)' }}>{getTodayWorkout()}</strong> — {getDayOfWeek()}</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <WorkoutLogger />
          <CardioTracker />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <WeeklySchedule />
          <ProgressiveOverload />
        </div>
      </div>
    </div>
  )
}

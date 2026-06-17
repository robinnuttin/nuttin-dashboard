'use client'
import { useState } from 'react'
import { Card, CardTitle, CardDivider } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { useTrainingStore, type WorkoutLog, type WorkoutExercise, type MuscleGroup } from '@/stores/app-store'

// ─── Constants ────────────────────────────────────────────────
type Tab = 'vandaag' | 'log' | 'schema'
type WorkoutType = 'Push' | 'Pull' | 'Legs' | 'Upper' | 'Cardio' | 'Rest' | 'Custom'
type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

const DAYS: { key: DayKey; label: string }[] = [
  { key: 'mon', label: 'Maandag' }, { key: 'tue', label: 'Dinsdag' },
  { key: 'wed', label: 'Woensdag' }, { key: 'thu', label: 'Donderdag' },
  { key: 'fri', label: 'Vrijdag' }, { key: 'sat', label: 'Zaterdag' },
  { key: 'sun', label: 'Zondag' },
]
const WORKOUT_TYPES: WorkoutType[] = ['Push', 'Pull', 'Legs', 'Upper', 'Cardio', 'Rest']
const LOG_TYPES: WorkoutType[] = ['Push', 'Pull', 'Legs', 'Upper', 'Cardio', 'Custom']

const ALL_MUSCLES: MuscleGroup[] = ['chest','back','shoulders','biceps','triceps','legs','glutes','core','cardio']
const MUSCLE_NL: Record<MuscleGroup, string> = {
  chest: 'Chest', back: 'Back', shoulders: 'Shoulders', biceps: 'Biceps',
  triceps: 'Triceps', legs: 'Legs', glutes: 'Glutes', core: 'Core', cardio: 'Cardio',
}
const SESSION_MUSCLES: Record<string, MuscleGroup[]> = {
  Push: ['chest','shoulders','triceps'], Pull: ['back','biceps','shoulders'],
  Legs: ['legs','glutes','core'], Upper: ['chest','back','shoulders','biceps','triceps'],
  Cardio: ['cardio','legs'],
}
const EXERCISE_PRESETS: Record<string, { name: string; muscleGroups: MuscleGroup[] }[]> = {
  Push: [{ name: 'Bench Press', muscleGroups: ['chest','triceps','shoulders'] }, { name: 'Overhead Press', muscleGroups: ['shoulders','triceps'] }, { name: 'Dips', muscleGroups: ['chest','triceps'] }],
  Pull: [{ name: 'Pull-ups', muscleGroups: ['back','biceps'] }, { name: 'Barbell Row', muscleGroups: ['back','biceps'] }, { name: 'Face Pulls', muscleGroups: ['shoulders','back'] }],
  Legs: [{ name: 'Squat', muscleGroups: ['legs','glutes'] }, { name: 'Romanian Deadlift', muscleGroups: ['legs','glutes'] }, { name: 'Leg Press', muscleGroups: ['legs'] }],
  Upper: [{ name: 'Bench Press', muscleGroups: ['chest','triceps'] }, { name: 'Barbell Row', muscleGroups: ['back','biceps'] }, { name: 'Overhead Press', muscleGroups: ['shoulders','triceps'] }],
  Cardio: [{ name: 'Lopen', muscleGroups: ['cardio'] }],
}

// ─── Local form type ──────────────────────────────────────────
interface ExerciseRow {
  id: string; name: string; muscleGroups: MuscleGroup[]
  sets: { weight: string; reps: string }[]
}

function mkId() { return Date.now().toString() + Math.random().toString(36).slice(2) }
function mkExercise(name = '', muscleGroups: MuscleGroup[] = []): ExerciseRow {
  return { id: mkId(), name, muscleGroups, sets: [{ weight: '', reps: '' }] }
}
function presetsForType(type: WorkoutType): ExerciseRow[] {
  const presets = EXERCISE_PRESETS[type]
  return presets ? presets.map((p) => mkExercise(p.name, p.muscleGroups)) : [mkExercise()]
}

function todayDayKey(): DayKey {
  return (['sun','mon','tue','wed','thu','fri','sat'] as DayKey[])[new Date().getDay()]
}
function isSaunaDay() { const d = new Date().getDay(); return d === 2 || d === 4 || d === 0 }

// Recovery color
function recoveryColor(days: number | null) {
  if (days === null) return 'var(--text-muted)'
  if (days < 2) return 'var(--accent-red-text)'
  if (days < 4) return 'var(--accent-yellow-text)'
  return 'var(--accent-green-text)'
}
function recoveryLabel(days: number | null) {
  if (days === null) return 'Nooit'
  if (days === 0) return 'Vandaag'
  if (days === 1) return '1 dag'
  return `${days}d`
}

// ─── Tab bar ──────────────────────────────────────────────────
function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  const tabs: { key: Tab; label: string }[] = [
    { key: 'vandaag', label: 'Vandaag' },
    { key: 'log', label: 'Log Workout' },
    { key: 'schema', label: 'Schema' },
  ]
  return (
    <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', borderBottom: '1px solid var(--border)' }}>
      {tabs.map((t) => (
        <button key={t.key} onClick={() => onChange(t.key)} style={{
          padding: '8px 14px', fontSize: '13px',
          fontWeight: active === t.key ? 500 : 400,
          color: active === t.key ? 'var(--text-primary)' : 'var(--text-muted)',
          background: 'none', border: 'none',
          borderBottom: `2px solid ${active === t.key ? 'var(--text-primary)' : 'transparent'}`,
          cursor: 'pointer', marginBottom: '-1px', transition: 'color 0.15s ease',
        }}>{t.label}</button>
      ))}
    </div>
  )
}

// ─── Vandaag Tab ──────────────────────────────────────────────
function VandaagTab() {
  const getLastWorked = useTrainingStore((s) => s.getLastWorked)
  const plan = useTrainingStore((s) => s.plan)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResponse, setAiResponse] = useState<string | null>(null)

  const today = todayDayKey()
  const todayType = plan[today] || 'Rest'
  const muscles = SESSION_MUSCLES[todayType] || []
  const sauna = isSaunaDay()

  const lastWorked = getLastWorked()
  const recovery = ALL_MUSCLES.map((m) => {
    const last = lastWorked[m]
    const days = last ? Math.floor((Date.now() - new Date(last).getTime()) / 86400000) : null
    return { muscle: m, days }
  })

  const askAI = async () => {
    setAiLoading(true)
    setAiResponse(null)
    const ctx = recovery.map((r) => `${MUSCLE_NL[r.muscle]}: ${recoveryLabel(r.days)}`).join(', ')
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `Vandaag is een ${todayType} dag. Herstelstatus spieren: ${ctx}. Geef concrete, bondige oefensuggesties in het Nederlands.` }),
      })
      const data = await res.json()
      setAiResponse(data.response || data.message || 'Geen antwoord ontvangen.')
    } catch { setAiResponse('Fout bij AI verbinding.') }
    setAiLoading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Today card */}
      <Card padding="md">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>Vandaag</div>
            <div style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>{todayType}</div>
          </div>
          {sauna && <Badge variant="orange">Sauna dag</Badge>}
        </div>
        {muscles.length > 0 && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {muscles.map((m) => <Badge key={m} variant="blue">{MUSCLE_NL[m]}</Badge>)}
          </div>
        )}
      </Card>

      {/* Muscle recovery grid */}
      <Card padding="md">
        <CardTitle subtitle="Tijd sinds laatste training per spiergroep">Spierherstel</CardTitle>
        <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          {recovery.map(({ muscle, days }) => {
            const color = recoveryColor(days)
            return (
              <div key={muscle} style={{
                textAlign: 'center', padding: '10px 6px', borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-secondary)', borderTop: `3px solid ${color}`,
              }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>{MUSCLE_NL[muscle]}</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color }}>{recoveryLabel(days)}</div>
              </div>
            )
          })}
        </div>
        <div style={{ display: 'flex', gap: '12px', marginTop: '10px', flexWrap: 'wrap' }}>
          {[
            { color: 'var(--accent-red-text)', label: '< 2 dagen' },
            { color: 'var(--accent-yellow-text)', label: '2-3 dagen' },
            { color: 'var(--accent-green-text)', label: '4+ dagen' },
            { color: 'var(--text-muted)', label: 'Nooit' },
          ].map((i) => (
            <div key={i.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: i.color, display: 'inline-block', flexShrink: 0 }} />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{i.label}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* AI suggest */}
      <Card padding="md">
        <CardTitle subtitle="Gepersonaliseerde suggestie op basis van herstel">AI Coach</CardTitle>
        <div style={{ marginTop: '10px' }}>
          <Button variant="secondary" size="md" onClick={askAI} disabled={aiLoading}>
            {aiLoading ? 'AI denkt na...' : 'Suggestie voor vandaag'}
          </Button>
          {aiResponse && (
            <div className="animate-fade-in" style={{ marginTop: '12px', fontSize: '13px', lineHeight: 1.7, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
              {aiResponse}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

// ─── Exercise Card ────────────────────────────────────────────
function ExerciseCard({
  ex, onNameChange, onToggleMuscle, onAddSet, onRemoveSet, onSetChange, onRemove, canRemove,
}: {
  ex: ExerciseRow
  onNameChange: (v: string) => void
  onToggleMuscle: (m: MuscleGroup) => void
  onAddSet: () => void
  onRemoveSet: (i: number) => void
  onSetChange: (i: number, field: 'weight' | 'reps', v: string) => void
  onRemove: () => void
  canRemove: boolean
}) {
  return (
    <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          type="text" value={ex.name} placeholder="Oefening naam"
          onChange={(e) => onNameChange(e.target.value)}
          style={{ flex: 1, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '13px', padding: '8px 10px', outline: 'none' }}
        />
        {canRemove && (
          <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-red-text)', fontSize: '18px', lineHeight: 1, padding: '4px' }}>×</button>
        )}
      </div>

      {/* Muscle chips */}
      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
        {ALL_MUSCLES.map((m) => {
          const active = ex.muscleGroups.includes(m)
          return (
            <button key={m} onClick={() => onToggleMuscle(m)} style={{
              padding: '2px 8px', borderRadius: '999px', border: `1px solid ${active ? 'var(--accent-blue-text)' : 'var(--border)'}`,
              background: active ? 'var(--accent-blue-bg)' : 'transparent',
              color: active ? 'var(--accent-blue-text)' : 'var(--text-muted)',
              fontSize: '11px', fontWeight: active ? 600 : 400, cursor: 'pointer',
            }}>{MUSCLE_NL[m]}</button>
          )
        })}
      </div>

      {/* Sets */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 24px', gap: '6px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Gewicht (kg)</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Reps</div>
          <div />
        </div>
        {ex.sets.map((set, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 24px', gap: '6px', alignItems: 'center' }}>
            <input type="number" min="0" value={set.weight} placeholder="0" onChange={(e) => onSetChange(i, 'weight', e.target.value)}
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '13px', padding: '6px 8px', outline: 'none', width: '100%', boxSizing: 'border-box' }} />
            <input type="number" min="0" value={set.reps} placeholder="0" onChange={(e) => onSetChange(i, 'reps', e.target.value)}
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '13px', padding: '6px 8px', outline: 'none', width: '100%', boxSizing: 'border-box' }} />
            <button onClick={() => onRemoveSet(i)} disabled={ex.sets.length <= 1} style={{ background: 'none', border: 'none', cursor: ex.sets.length <= 1 ? 'not-allowed' : 'pointer', color: ex.sets.length <= 1 ? 'var(--border)' : 'var(--accent-red-text)', fontSize: '16px', lineHeight: 1, padding: 0 }}>−</button>
          </div>
        ))}
        <button onClick={onAddSet} style={{ padding: '5px', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '12px' }}>
          + Set toevoegen
        </button>
      </div>
    </div>
  )
}

// ─── Log Tab ──────────────────────────────────────────────────
function LogTab() {
  const addLog = useTrainingStore((s) => s.addLog)
  const logs = useTrainingStore((s) => s.logs)
  const [workoutType, setWorkoutType] = useState<WorkoutType>('Push')
  const [exercises, setExercises] = useState<ExerciseRow[]>(() => presetsForType('Push'))
  const [durationMin, setDurationMin] = useState('')
  const [notes, setNotes] = useState('')
  const [saved, setSaved] = useState(false)

  const changeType = (t: WorkoutType) => { setWorkoutType(t); setExercises(presetsForType(t)); setSaved(false) }
  const addEx = () => setExercises((p) => [...p, mkExercise()])
  const removeEx = (id: string) => setExercises((p) => p.filter((e) => e.id !== id))
  const nameChange = (id: string, v: string) => setExercises((p) => p.map((e) => e.id === id ? { ...e, name: v } : e))
  const toggleMuscle = (id: string, m: MuscleGroup) => setExercises((p) => p.map((e) => {
    if (e.id !== id) return e
    const has = e.muscleGroups.includes(m)
    return { ...e, muscleGroups: has ? e.muscleGroups.filter((x) => x !== m) : [...e.muscleGroups, m] }
  }))
  const addSet = (id: string) => setExercises((p) => p.map((e) => e.id === id ? { ...e, sets: [...e.sets, { weight: '', reps: '' }] } : e))
  const removeSet = (id: string, i: number) => setExercises((p) => p.map((e) => e.id === id ? { ...e, sets: e.sets.filter((_, j) => j !== i) } : e))
  const setChange = (id: string, i: number, field: 'weight' | 'reps', v: string) => setExercises((p) => p.map((e) =>
    e.id !== id ? e : { ...e, sets: e.sets.map((s, j) => j === i ? { ...s, [field]: v } : s) }
  ))

  const save = () => {
    const exPayload: WorkoutExercise[] = exercises
      .filter((e) => e.name.trim())
      .map((e) => ({
        name: e.name.trim(),
        muscleGroups: e.muscleGroups,
        sets: e.sets
          .filter((s) => s.weight || s.reps)
          .map((s) => ({ weight: parseFloat(s.weight) || 0, reps: parseInt(s.reps, 10) || 0, completed: true })),
      }))
    const log: WorkoutLog = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      type: workoutType,
      exercises: exPayload,
      durationMin: parseInt(durationMin, 10) || undefined,
      notes: notes.trim() || undefined,
    }
    addLog(log)
    setSaved(true)
    setNotes('')
    setDurationMin('')
    setTimeout(() => setSaved(false), 2500)
  }

  const recent = [...logs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Type selector */}
      <Card padding="md">
        <CardTitle>Type</CardTitle>
        <div style={{ marginTop: '10px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {LOG_TYPES.map((t) => (
            <button key={t} onClick={() => changeType(t)} style={{
              padding: '6px 12px', borderRadius: '999px', border: `1px solid ${workoutType === t ? 'var(--text-primary)' : 'var(--border)'}`,
              background: workoutType === t ? 'var(--text-primary)' : 'transparent',
              color: workoutType === t ? 'var(--bg)' : 'var(--text-muted)',
              fontSize: '12px', fontWeight: workoutType === t ? 600 : 400, cursor: 'pointer', transition: 'all 0.1s',
            }}>{t}</button>
          ))}
        </div>
      </Card>

      {/* Exercises */}
      <Card padding="md">
        <CardTitle>Oefeningen</CardTitle>
        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {exercises.map((ex) => (
            <ExerciseCard key={ex.id} ex={ex}
              onNameChange={(v) => nameChange(ex.id, v)}
              onToggleMuscle={(m) => toggleMuscle(ex.id, m)}
              onAddSet={() => addSet(ex.id)}
              onRemoveSet={(i) => removeSet(ex.id, i)}
              onSetChange={(i, f, v) => setChange(ex.id, i, f, v)}
              onRemove={() => removeEx(ex.id)}
              canRemove={exercises.length > 1}
            />
          ))}
          <button onClick={addEx} style={{ padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '13px' }}>
            + Oefening toevoegen
          </button>
        </div>
      </Card>

      {/* Duration + Notes */}
      <Card padding="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Input label="Duur (minuten)" type="number" value={durationMin} onChange={(e) => setDurationMin(e.target.value)} placeholder="45" />
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Notities</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Hoe was de training?"
              style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '13px', padding: '8px 10px', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
          </div>
          <Button variant={saved ? 'secondary' : 'primary'} size="md" onClick={save}>
            {saved ? 'Opgeslagen!' : 'Workout opslaan'}
          </Button>
        </div>
      </Card>

      {/* Recent logs */}
      {recent.length > 0 && (
        <Card padding="md">
          <CardTitle subtitle="Laatste 5 workouts">Recente workouts</CardTitle>
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recent.map((log) => (
              <div key={log.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>{log.type}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{log.date}{log.durationMin ? ` · ${log.durationMin} min` : ''}</span>
                </div>
                {log.exercises?.length > 0 && (
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    {log.exercises.map((ex, i) => <Badge key={i} variant="muted">{ex.name}</Badge>)}
                  </div>
                )}
                {log.notes && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{log.notes}</div>}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

// ─── Schema Tab ───────────────────────────────────────────────
function SchemaTab() {
  const plan = useTrainingStore((s) => s.plan)
  const setPlan = useTrainingStore((s) => s.setPlan)
  const [local, setLocal] = useState<Record<DayKey, string>>(() => ({ ...plan }))
  const [saved, setSaved] = useState(false)

  const save = () => { setPlan(local as typeof plan); setSaved(true); setTimeout(() => setSaved(false), 2000) }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Card padding="md">
        <CardTitle subtitle="Kies per dag je trainingstype">Weekschema</CardTitle>
        <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {DAYS.map(({ key, label }) => {
            const type = local[key] || 'Rest'
            const muscles = SESSION_MUSCLES[type] || []
            return (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ minWidth: '90px', fontSize: '13px', fontWeight: 500 }}>{label}</div>
                <select value={type} onChange={(e) => setLocal(l => ({ ...l, [key]: e.target.value }))}
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '13px', padding: '5px 8px', outline: 'none', cursor: 'pointer' }}>
                  {WORKOUT_TYPES.map((wt) => <option key={wt} value={wt}>{wt}</option>)}
                </select>
                <div style={{ flex: 1, display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {muscles.map((m) => <Badge key={m} variant="muted">{MUSCLE_NL[m]}</Badge>)}
                  {muscles.length === 0 && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Rustdag</span>}
                </div>
              </div>
            )
          })}
        </div>
        <div style={{ marginTop: '12px' }}>
          <Button variant={saved ? 'secondary' : 'primary'} size="md" onClick={save}>
            {saved ? 'Opgeslagen!' : 'Schema opslaan'}
          </Button>
        </div>
      </Card>

      {/* Volume progress per muscle */}
      <Card padding="md">
        <CardTitle subtitle="Sets per spiergroep deze week">Weekvolume</CardTitle>
        <div style={{ marginTop: '12px' }}>
          {(() => {
            const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1)
            const weekStr = weekStart.toISOString().split('T')[0]
            return null; weekStr; // placeholder
          })()}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {ALL_MUSCLES.filter(m => m !== 'cardio').map((m) => {
              // Count scheduled sessions this week targeting this muscle
              const count = Object.values(local).filter((t) => (SESSION_MUSCLES[t] || []).includes(m)).length
              return (
                <div key={m}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{MUSCLE_NL[m]}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{count}/3</span>
                  </div>
                  <Progress value={count} max={3} height={4} color={count >= 2 ? 'var(--accent-green-text)' : count === 1 ? 'var(--accent-yellow-text)' : 'var(--accent-red-text)'} />
                </div>
              )
            })}
          </div>
        </div>
      </Card>
    </div>
  )
}

// ─── Main ──────────────────────────────────────────────────────
export default function TrainingPage() {
  const [tab, setTab] = useState<Tab>('vandaag')
  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '4px' }}>Training</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Weekschema, workout log en AI suggesties</p>
      </div>
      <TabBar active={tab} onChange={setTab} />
      {tab === 'vandaag' && <VandaagTab />}
      {tab === 'log' && <LogTab />}
      {tab === 'schema' && <SchemaTab />}
    </div>
  )
}

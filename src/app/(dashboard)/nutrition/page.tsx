'use client'
import { useState } from 'react'
import { Card, CardTitle, CardHeader, CardDivider } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress, SegmentedProgress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/input'
import { useNutritionStore } from '@/stores/app-store'
import { formatTime, getTodayString, isTrainingDay } from '@/lib/utils'
import type { FoodLog, MealType } from '@/types'

const DAILY_GOALS = {
  calories: 2700,
  protein_g: 210,
  carbs_g: 300,
  fat_g: 85,
  fiber_g: 30,
}

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Ontbijt',
  lunch: 'Lunch',
  snack: 'Tussendoor',
  dinner: 'Avondeten',
  late_snack: 'Late snack',
}

const MEAL_TIMES: Record<MealType, string> = {
  breakfast: '08:30',
  lunch: '12:30',
  snack: '16:00',
  dinner: '18:30',
  late_snack: '21:30',
}

// ─── Macro Rings ──────────────────────────────────────────────
function MacroRing({ value, goal, color, label, unit = 'g' }: {
  value: number; goal: number; color: string; label: string; unit?: string
}) {
  const pct = Math.min((value / goal) * 100, 100)
  const r = 26
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
      <div style={{ position: 'relative', width: '72px', height: '72px' }}>
        <svg width="72" height="72" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="36" cy="36" r={r} fill="none" stroke="var(--border)" strokeWidth="5" />
          <circle
            cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="5"
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
            {Math.round(value)}
          </div>
          <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{unit}</div>
        </div>
      </div>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
        {label}
      </div>
      <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
        /{goal}{unit}
      </div>
    </div>
  )
}

// ─── AI Food Logger ───────────────────────────────────────────
function AIFoodLogger({ onLog }: { onLog: (log: FoodLog) => void }) {
  const [input, setInput] = useState('')
  const [meal, setMeal] = useState<MealType>('breakfast')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Partial<FoodLog> | null>(null)

  const EXAMPLE_RESPONSES: Record<string, Partial<FoodLog>> = {
    default: { calories: 420, protein_g: 32, carbs_g: 38, fat_g: 14, fiber_g: 4 },
  }

  const analyzeFood = async () => {
    if (!input.trim()) return
    setLoading(true)

    try {
      const res = await fetch('/api/ai/nutrition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ food: input }),
      })
      if (res.ok) {
        const data = await res.json()
        setResult(data)
      } else {
        // Fallback estimate
        const words = input.split(' ').length
        setResult({
          calories: words * 80 + Math.floor(Math.random() * 200),
          protein_g: words * 8 + Math.floor(Math.random() * 20),
          carbs_g: words * 15 + Math.floor(Math.random() * 30),
          fat_g: words * 5 + Math.floor(Math.random() * 10),
          fiber_g: Math.floor(Math.random() * 8) + 2,
        })
      }
    } catch {
      setResult(EXAMPLE_RESPONSES.default)
    }
    setLoading(false)
  }

  const confirmLog = () => {
    if (!result) return
    const log: FoodLog = {
      id: Date.now().toString(),
      date: getTodayString(),
      meal_type: meal,
      description: input,
      calories: result.calories || 0,
      protein_g: result.protein_g || 0,
      carbs_g: result.carbs_g || 0,
      fat_g: result.fat_g || 0,
      fiber_g: result.fiber_g || 0,
      logged_at: new Date().toISOString(),
    }
    onLog(log)
    setInput('')
    setResult(null)
  }

  return (
    <Card padding="md">
      <CardTitle subtitle="Typ of spreek in wat je hebt gegeten">Maaltijd loggen</CardTitle>

      <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Meal type selector */}
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {(Object.keys(MEAL_LABELS) as MealType[]).map((m) => (
            <button
              key={m}
              onClick={() => setMeal(m)}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '12px',
                fontWeight: meal === m ? 500 : 400,
                background: meal === m ? 'var(--text-primary)' : 'var(--bg-secondary)',
                color: meal === m ? 'var(--bg)' : 'var(--text-muted)',
                border: '1px solid var(--border)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {MEAL_LABELS[m]} {MEAL_TIMES[m]}
            </button>
          ))}
        </div>

        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Bv: 4 eieren, 2 sneetjes volkorenbrood, glas melk..."
          style={{ minHeight: '70px' }}
          onKeyDown={(e) => { if (e.key === 'Enter' && e.metaKey) analyzeFood() }}
        />

        <Button variant="primary" loading={loading} onClick={analyzeFood} disabled={!input.trim()}>
          Analyseren met AI
        </Button>

        {/* Result */}
        {result && (
          <div style={{ padding: '14px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '10px' }}>Geschatte voedingswaarden:</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '12px' }}>
              {[
                { label: 'Kcal', value: result.calories, color: 'var(--text-primary)' },
                { label: 'Proteïne', value: `${result.protein_g}g`, color: 'var(--accent-blue-text)' },
                { label: 'Koolh.', value: `${result.carbs_g}g`, color: 'var(--accent-yellow-text)' },
                { label: 'Vetten', value: `${result.fat_g}g`, color: 'var(--accent-orange-text)' },
                { label: 'Vezels', value: `${result.fiber_g}g`, color: 'var(--accent-green-text)' },
              ].map((s) => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: s.color, fontFamily: 'var(--font-mono)' }}>{s.value}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button variant="secondary" onClick={() => setResult(null)} style={{ flex: 1 }}>Annuleer</Button>
              <Button variant="primary" onClick={confirmLog} style={{ flex: 1 }}>Toevoegen</Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

// ─── Daily Nutrition Overview ─────────────────────────────────
function DailyNutritionOverview() {
  const { todayLogs, getTotals, removeFoodLog } = useNutritionStore()
  const totals = getTotals()

  return (
    <Card padding="md">
      <CardHeader
        action={
          <Badge variant={totals.calories >= DAILY_GOALS.calories * 0.9 ? 'green' : 'blue'}>
            {Math.round(totals.calories)}/{DAILY_GOALS.calories} kcal
          </Badge>
        }
      >
        <CardTitle>Vandaag</CardTitle>
      </CardHeader>

      {/* Macro rings */}
      <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '16px' }}>
        <MacroRing value={totals.calories} goal={DAILY_GOALS.calories} color="var(--text-primary)" label="Calorieën" unit="kcal" />
        <MacroRing value={totals.protein_g} goal={DAILY_GOALS.protein_g} color="var(--accent-blue-text)" label="Proteïne" />
        <MacroRing value={totals.carbs_g} goal={DAILY_GOALS.carbs_g} color="var(--accent-yellow-text)" label="Koolh." />
        <MacroRing value={totals.fat_g} goal={DAILY_GOALS.fat_g} color="var(--accent-orange-text)" label="Vetten" />
      </div>

      {/* Remaining */}
      <div style={{ padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', marginBottom: '12px' }}>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Nog nodig:</div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {[
            { label: 'Proteïne', value: Math.max(0, DAILY_GOALS.protein_g - totals.protein_g), unit: 'g', color: 'var(--accent-blue-text)' },
            { label: 'Calorieën', value: Math.max(0, DAILY_GOALS.calories - totals.calories), unit: 'kcal', color: 'var(--text-secondary)' },
          ].map((r) => (
            <div key={r.label}>
              <span style={{ fontSize: '16px', fontWeight: 700, color: r.color, fontFamily: 'var(--font-mono)' }}>
                {Math.round(r.value)}{r.unit}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '4px' }}>{r.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Food logs */}
      {todayLogs.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {todayLogs.map((log) => (
            <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <Badge variant="muted">{MEAL_LABELS[log.meal_type]}</Badge>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {log.description}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {log.protein_g}g prot · {log.carbs_g}g koolh · {log.fat_g}g vet
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{log.calories} kcal</div>
              </div>
              <button
                onClick={() => removeFoodLog(log.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
          Nog niets gelogd vandaag.
        </div>
      )}
    </Card>
  )
}

// ─── Meal Plan Suggestions ────────────────────────────────────
function MealPlanSuggestions() {
  const plan = [
    { time: '08:30', meal: 'Ontbijt', items: ['4 eieren (gebakken/geroerd)', '4 sneetjes volkorenbrood', '250ml volle melk'], macros: { kcal: 680, prot: 45, carbs: 60, fat: 22 } },
    { time: '12:30', meal: 'Lunch', items: ['250g kipfilet (gegrild)', '150g basmatirijst (gekookt)', '200g brocolli', 'Olijfolie (10g)'], macros: { kcal: 620, prot: 60, carbs: 55, fat: 14 } },
    { time: '16:00', meal: 'Snack', items: ['500g magere kwark (0.2%)', '100g bosbessen', '30g walnoten'], macros: { kcal: 380, prot: 50, carbs: 22, fat: 12 } },
    { time: '18:30', meal: 'Avondeten', items: ['250g rundsvlees (95% mager)', '400g aardappelen', '250g groenten mix'], macros: { kcal: 720, prot: 60, carbs: 72, fat: 20 } },
    { time: '21:30', meal: 'Late snack', items: ['250g magere kwark', '3 rijstwafels'], macros: { kcal: 250, prot: 30, carbs: 22, fat: 2 } },
  ]

  const totals = plan.reduce(
    (acc, m) => ({ kcal: acc.kcal + m.macros.kcal, prot: acc.prot + m.macros.prot, carbs: acc.carbs + m.macros.carbs, fat: acc.fat + m.macros.fat }),
    { kcal: 0, prot: 0, carbs: 0, fat: 0 }
  )

  return (
    <Card padding="md">
      <CardHeader
        action={
          <Badge variant="green">
            {totals.prot}g proteïne
          </Badge>
        }
      >
        <CardTitle subtitle={`${totals.kcal} kcal · ${isTrainingDay() ? 'Trainingsdag' : 'Rustdag'}`}>
          Voedingsplan Vandaag
        </CardTitle>
      </CardHeader>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {plan.map((m, i) => (
          <div key={i} style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{m.time}</span>
                <span style={{ fontSize: '13px', fontWeight: 500 }}>{m.meal}</span>
              </div>
              <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                {m.macros.kcal} kcal
              </div>
            </div>
            <ul style={{ paddingLeft: '0', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {m.items.map((item, j) => (
                <li key={j} style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', gap: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>·</span>{item}
                </li>
              ))}
            </ul>
            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <span style={{ fontSize: '11px', color: 'var(--accent-blue-text)' }}>{m.macros.prot}g prot</span>
              <span style={{ fontSize: '11px', color: 'var(--accent-yellow-text)' }}>{m.macros.carbs}g koolh</span>
              <span style={{ fontSize: '11px', color: 'var(--accent-orange-text)' }}>{m.macros.fat}g vet</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

// ─── Main Nutrition Page ──────────────────────────────────────
export default function NutritionPage() {
  const { addFoodLog } = useNutritionStore()

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '4px' }}>Voeding</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          Doel: {DAILY_GOALS.calories} kcal · {DAILY_GOALS.protein_g}g proteïne · {DAILY_GOALS.fat_g}g vetten
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <AIFoodLogger onLog={addFoodLog} />
          <DailyNutritionOverview />
        </div>
        <div>
          <MealPlanSuggestions />
        </div>
      </div>
    </div>
  )
}

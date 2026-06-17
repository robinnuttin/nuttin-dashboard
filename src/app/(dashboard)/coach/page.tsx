'use client'
import { useState, useRef, useEffect } from 'react'
import { useCoachStore, useSupplementsStore, useTrainingStore, useDailyStore } from '@/stores/app-store'
import type { CoachMessage } from '@/stores/app-store'

// ─── AI action types the coach can execute ────────────────────────
type ActionType = 'supplement_toggle' | 'supplement_update' | 'training_plan' | 'priority_set' | 'note'

function applyAction(
  action: { type: ActionType; payload: Record<string, unknown> },
  supplementStore: ReturnType<typeof useSupplementsStore.getState>,
  trainingStore: ReturnType<typeof useTrainingStore.getState>,
  dailyStore: ReturnType<typeof useDailyStore.getState>,
  today: string
) {
  if (action.type === 'supplement_toggle' && action.payload.id) {
    supplementStore.toggle(action.payload.id as string)
  }
  if (action.type === 'supplement_update' && action.payload.id) {
    supplementStore.update(action.payload.id as string, action.payload as Record<string, unknown> & { id: string })
  }
  if (action.type === 'training_plan' && action.payload.plan) {
    trainingStore.setPlan(action.payload.plan as Parameters<typeof trainingStore.setPlan>[0])
  }
  if (action.type === 'priority_set' && action.payload.priorities) {
    dailyStore.setPriorities(today, action.payload.priorities as string[])
  }
}

// ─── Build system context ─────────────────────────────────────────
function buildContext(
  supplements: ReturnType<typeof useSupplementsStore.getState>,
  training: ReturnType<typeof useTrainingStore.getState>,
  daily: ReturnType<typeof useDailyStore.getState>,
  today: string
): string {
  const supsActive = supplements.supplements.filter((s) => s.active).map((s) => `${s.name} ${s.dose} (${s.timing})`).join(', ')
  const supsInactive = supplements.supplements.filter((s) => !s.active).map((s) => s.name).join(', ')
  const plan = training.plan
  const planStr = `ma:${plan.mon} di:${plan.tue} wo:${plan.wed} do:${plan.thu} vr:${plan.fri} za:${plan.sat} zo:${plan.sun}`
  const rec = daily.records[today]
  const prio = rec?.priorities?.join(', ') || 'geen'
  const lastWorked = training.getLastWorked()
  const muscleStr = Object.entries(lastWorked).map(([m, d]) => `${m}:${d ? d : 'nooit'}`).join(' ')

  return `Je bent een persoonlijke AI coach voor Robin (Nuttin). Spreek Nederlands.

PERSOONLIJK PROFIEL:
- Doel: 87kg → 91-92kg, vetpercentage van 19% naar 10-12%
- Caloriedoel: 2600-2800 kcal/dag, 200-220g proteïne
- Gelovig moslim (5 gebeden/dag)
- Financieel doel: €10.000 netto/maand
- Locatie: Kortrijk, België

ACTIEVE SUPPLEMENTEN: ${supsActive}
INACTIEVE SUPPLEMENTEN: ${supsInactive}

TRAININGSSCHEMA: ${planStr}
SPIERHERSTEL (laatste training): ${muscleStr}

VANDAAG (${today}):
- Prioriteiten: ${prio}
- Opgestaan op tijd: ${rec?.wokeOnTime ? 'ja' : 'nee'}
- Supplementen genomen: ${rec?.supplementsTaken ? 'ja' : 'nee'}
- Gebeden: ${rec?.prayersDone || 0}/5

JE KUNT ACTIES UITVOEREN:
Als de gebruiker wil dat je iets aanpast (supplement aan/uitzetten, trainingsschema wijzigen, prioriteiten instellen), antwoord dan normaal én voeg aan het einde van je bericht een JSON-blok toe:
\`\`\`actions
[{"type":"supplement_toggle","payload":{"id":"vitd"},"description":"Vitamine D3 uitgeschakeld"},...]
\`\`\`

Actietypes:
- supplement_toggle: {"id": "supplement_id"}
- supplement_update: {"id": "...", "dose": "...", "timing": "...", "active": true/false}
- training_plan: {"plan": {"mon":"Push","tue":"Pull","wed":"Legs","thu":"Rest","fri":"Upper","sat":"Cardio","sun":"Rest"}}
- priority_set: {"priorities": ["taak1","taak2","taak3"]}

Supplement IDs: creatine, vitd, magnesium, zinc, b12, calcium, omega3

Wees direct, to the point, eerlijk. Geen sugarcoating. Geef concrete acties.`
}

// ─── Parse actions from AI response ───────────────────────────────
function parseActions(content: string): { type: ActionType; payload: Record<string, unknown>; description: string }[] {
  const match = content.match(/```actions\s*([\s\S]*?)```/)
  if (!match) return []
  try {
    return JSON.parse(match[1])
  } catch {
    return []
  }
}

function stripActions(content: string): string {
  return content.replace(/```actions[\s\S]*?```/g, '').trim()
}

// ─── Message bubble ───────────────────────────────────────────────
function Bubble({ msg }: { msg: CoachMessage }) {
  const isUser = msg.role === 'user'
  const clean = stripActions(msg.content)

  return (
    <div style={{
      display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: '10px', gap: '8px', alignItems: 'flex-end',
    }}>
      {!isUser && (
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent-blue-bg)', border: '1px solid var(--accent-blue-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 12, color: 'var(--accent-blue-text)', fontWeight: 700 }}>
          AI
        </div>
      )}
      <div style={{
        maxWidth: '78%', padding: '10px 14px',
        borderRadius: isUser ? '14px 14px 4px 14px' : '4px 14px 14px 14px',
        background: isUser ? 'var(--text-primary)' : 'var(--surface)',
        color: isUser ? 'var(--text-inverse)' : 'var(--text-primary)',
        border: isUser ? 'none' : '1px solid var(--border)',
        fontSize: 14, lineHeight: 1.55, whiteSpace: 'pre-wrap',
      }}>
        {clean}
        {msg.actions && msg.actions.length > 0 && (
          <div style={{ marginTop: 10, paddingTop: 8, borderTop: `1px solid ${isUser ? 'rgba(255,255,255,0.2)' : 'var(--border)'}` }}>
            {msg.actions.map((a, i) => (
              <div key={i} style={{ fontSize: 12, color: isUser ? 'rgba(255,255,255,0.7)' : 'var(--accent-green-text)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                {a.description}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Quick actions ────────────────────────────────────────────────
const QUICK_PROMPTS = [
  'Wat zijn mijn 3 prioriteiten voor vandaag?',
  'Welke spieren moet ik vandaag trainen?',
  'Welke supplementen moet ik nu nemen?',
  'Geef me een financieel advies',
  'Hoe staat het met mijn doelen?',
  'Zet Vitamine D3 uit',
]

// ─── Main component ───────────────────────────────────────────────
export default function CoachPage() {
  const coachStore = useCoachStore()
  const supplementStore = useSupplementsStore()
  const trainingStore = useTrainingStore()
  const dailyStore = useDailyStore()

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [coachStore.messages, loading])

  const send = async (text: string) => {
    const q = text.trim()
    if (!q || loading) return
    setInput('')
    setError('')

    const userMsg: CoachMessage = {
      id: Date.now().toString(), role: 'user', content: q,
      timestamp: new Date().toISOString(),
    }
    coachStore.addMessage(userMsg)
    setLoading(true)

    try {
      const systemPrompt = buildContext(supplementStore, trainingStore, dailyStore, today)
      const history = coachStore.messages.slice(-10).map((m) => ({ role: m.role, content: m.content }))

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: systemPrompt,
          messages: [...history, { role: 'user', content: q }],
        }),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const rawContent = data.content || 'Geen antwoord ontvangen.'

      // Parse and apply actions
      const actions = parseActions(rawContent)
      if (actions.length > 0) {
        for (const action of actions) {
          applyAction(
            action as { type: ActionType; payload: Record<string, unknown> },
            supplementStore,
            trainingStore,
            dailyStore,
            today
          )
        }
      }

      const aiMsg: CoachMessage = {
        id: (Date.now() + 1).toString(), role: 'assistant',
        content: rawContent, timestamp: new Date().toISOString(),
        actions: actions.length > 0 ? actions : undefined,
      }
      coachStore.addMessage(aiMsg)
    } catch (err) {
      setError('AI tijdelijk niet beschikbaar. Probeer opnieuw.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in" style={{ height: 'calc(100vh - var(--header-h) - 32px)', display: 'flex', flexDirection: 'column', maxHeight: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 2 }}>AI Coach</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
              Vraag advies, verander supplementen, pas je schema aan
            </p>
          </div>
          {coachStore.messages.length > 0 && (
            <button
              onClick={() => coachStore.clearHistory()}
              style={{ fontSize: 12, color: 'var(--text-muted)', background: 'none', border: 'none', padding: '4px 8px' }}
            >
              Wis gesprek
            </button>
          )}
        </div>
      </div>

      {/* Chat area */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '4px 0 12px',
        display: 'flex', flexDirection: 'column',
      }}>
        {coachStore.messages.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 8, padding: '40px 0' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--accent-blue-bg)', border: '1px solid var(--accent-blue-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: 'var(--accent-blue-text)' }}>
              AI
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', maxWidth: 280 }}>
              Stel een vraag of gebruik een snelkoppeling hieronder
            </p>
          </div>
        ) : (
          <>
            {coachStore.messages.map((msg) => <Bubble key={msg.id} msg={msg} />)}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent-blue-bg)', border: '1px solid var(--accent-blue-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--accent-blue-text)', fontWeight: 700 }}>AI</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[0,1,2].map((i) => (
                    <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-muted)', animation: `pulse-dot 1.2s ease ${i * 0.2}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
        {error && (
          <div style={{ padding: '10px 14px', background: 'var(--accent-red-bg)', border: '1px solid var(--accent-red-border)', borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--accent-red-text)', marginBottom: 10 }}>
            {error}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      {coachStore.messages.length === 0 && (
        <div style={{ marginBottom: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => send(p)}
              disabled={loading}
              style={{
                padding: '6px 12px', fontSize: 12, borderRadius: 99,
                border: '1px solid var(--border)', background: 'var(--surface)',
                color: 'var(--text-secondary)', cursor: 'pointer',
                transition: 'all 0.12s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{
        display: 'flex', gap: 8, padding: '12px', marginBottom: 0,
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
      }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) } }}
          placeholder="Stel een vraag... (bv. 'Zet Magnesium uit' of 'Welke spieren moet ik trainen?')"
          rows={2}
          style={{
            flex: 1, resize: 'none', padding: '8px 10px',
            background: 'transparent', border: 'none', outline: 'none',
            color: 'var(--text-primary)', fontSize: 14, lineHeight: 1.5,
            fontFamily: 'inherit',
          }}
        />
        <button
          onClick={() => send(input)}
          disabled={loading || !input.trim()}
          style={{
            width: 36, height: 36, borderRadius: 'var(--radius-md)', flexShrink: 0,
            background: loading || !input.trim() ? 'var(--bg-tertiary)' : 'var(--text-primary)',
            color: loading || !input.trim() ? 'var(--text-muted)' : 'var(--text-inverse)',
            border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s ease', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            alignSelf: 'flex-end',
          }}
        >
          {loading ? (
            <div className="animate-spin" style={{ width: 14, height: 14, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%' }} />
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          )}
        </button>
      </div>

      <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 6 }}>
        Gratis AI via OpenRouter · Enter om te sturen
      </p>

      <style>{`@keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.3;transform:scale(0.7)} }`}</style>
    </div>
  )
}

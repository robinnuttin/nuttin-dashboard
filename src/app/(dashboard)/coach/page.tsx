'use client'
import { useState, useRef, useEffect } from 'react'
import { Card, CardTitle, CardDivider } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import type { ChatMessage } from '@/types'

const SYSTEM_CONTEXT = `Je bent een persoonlijke AI coach voor een 20-jarige man, 1m91, 87kg, vetpercentage ~19%.

Zijn doelen:
- FINANCIEEL: 5-6 deals sluiten (websites/CRM à €3900 bruto, €2000 netto), review cards verkopen (€75/€175), doel €10.000 netto in 1-2 maanden
- LICHAAM: Van 87kg naar 91-92kg bij 10-12% vetpercentage via bulk-recomp
- TRAINING: Push/Pull/Legs/Upper/Cardio schema, 3x cardio per week
- VOEDING: 2600-2800 kcal, 200-220g proteïne per dag
- SLAAP: 8u slaap, in bed voor 23u, wakker 8u-8u30
- SUPPLEMENTEN: Creatine 5g, Vit D, Magnesium, Zink, B12
- GELOOF: 5 gebeden per dag
- SCHERMTIJD: Gradueel afbouwen
- BIJBAANTJE: 20u/week job zoeken als extra zekerheid

Geef altijd bondige, directe, actionable adviezen in het Nederlands. Focus op de GROOTSTE hefboom die het meeste resultaat oplevert. Overwelm niet met informatie. Gebruik evidence-based aanbevelingen. Wees eerlijk en realistisch.`

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    role: 'assistant',
    content: `Goed, laten we aan de slag gaan. Ik ben je persoonlijke coach.

**Prioriteiten voor vandaag:**
1. E-mailcampagne — je zit op 1.247 van 2.000 emails. Stuur er vandaag 100 bij.
2. Proteïne — zorg dat je vandaag 200g+ haalt. Voeg kwark of kipfilet toe.
3. Slaap — je slaapt gemiddeld 7.2u. Ga vanavond voor 23:00 naar bed.

Wat wil je bespreken? Ik kan je helpen met business strategie, voeding, training, schermtijd, of algemene coaching.`,
    timestamp: new Date().toISOString(),
  },
]

// ─── Quick Actions ────────────────────────────────────────────
const QUICK_ACTIONS = [
  'Analyseer mijn dag',
  'Wat moet ik vandaag eten?',
  'Welke deals moet ik opvolgen?',
  'Geef me een motivatie boost',
  'Hoeveel review cards moet ik nog verkopen?',
  'Beste volgende actie voor €10k doel?',
]

// ─── Message Bubble ───────────────────────────────────────────
function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user'

  // Simple markdown-like rendering
  const renderContent = (text: string) => {
    const lines = text.split('\n')
    return lines.map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <strong key={i} style={{ display: 'block', color: 'var(--text-primary)', marginTop: '4px' }}>{line.slice(2, -2)}</strong>
      }
      if (line.match(/^\d\./)) {
        return <div key={i} style={{ paddingLeft: '4px', marginTop: '2px' }}>{line}</div>
      }
      if (line.startsWith('- ')) {
        return <div key={i} style={{ paddingLeft: '8px', marginTop: '2px' }}>· {line.slice(2)}</div>
      }
      return <span key={i}>{line}{i < lines.length - 1 ? '\n' : ''}</span>
    })
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: '12px',
      }}
      className="animate-fade-in"
    >
      {!isUser && (
        <div style={{
          width: '28px', height: '28px', borderRadius: '50%',
          background: 'var(--text-primary)', color: 'var(--bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '12px', fontWeight: 700, flexShrink: 0, marginRight: '8px', marginTop: '2px',
        }}>
          N
        </div>
      )}
      <div
        style={{
          maxWidth: '80%',
          padding: '10px 14px',
          borderRadius: isUser ? '12px 12px 2px 12px' : '2px 12px 12px 12px',
          background: isUser ? 'var(--text-primary)' : 'var(--bg-secondary)',
          color: isUser ? 'var(--bg)' : 'var(--text-primary)',
          border: isUser ? 'none' : '1px solid var(--border)',
          fontSize: '13px',
          lineHeight: 1.6,
          whiteSpace: 'pre-line',
        }}
      >
        {renderContent(msg.content)}
      </div>
    </div>
  )
}

// ─── Daily Analysis ───────────────────────────────────────────
function DailyAnalysis() {
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<{
    good: string; improve: string; priority: string; score: number
  } | null>(null)

  const generate = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 1500))
    setAnalysis({
      score: 74,
      good: 'Je hebt 3 van de 5 gebeden gedaan en je proteïne is op 78% van het doel. De review card sessie gisteren leverde €250 op.',
      improve: 'Je slaap was gisteren maar 6.5 uur — dit remt spierherstel en testosteron. Ook de e-mailcampagne stagneert: 0 emails gisteren.',
      priority: 'Stuur vandaag minimum 80 e-mails én ga voor 23:00 naar bed. Dit heeft meer impact dan extra training.',
    })
    setLoading(false)
  }

  return (
    <Card padding="md">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <CardTitle subtitle="AI analyse van jouw dag">Dagelijkse Review</CardTitle>
        <Button size="sm" variant="secondary" loading={loading} onClick={generate}>
          Analyseer
        </Button>
      </div>

      {analysis ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '28px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: analysis.score >= 75 ? 'var(--accent-green-text)' : 'var(--accent-yellow-text)' }}>
              {analysis.score}
            </span>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>/ 100 discipline score</span>
          </div>
          {[
            { label: 'Wat goed ging', content: analysis.good, bg: 'var(--accent-green-bg)', color: 'var(--accent-green-text)', icon: '✓' },
            { label: 'Wat beter kan', content: analysis.improve, bg: 'var(--accent-yellow-bg)', color: 'var(--accent-yellow-text)', icon: '!' },
            { label: 'Grootste prioriteit morgen', content: analysis.priority, bg: 'var(--accent-blue-bg)', color: 'var(--accent-blue-text)', icon: '↑' },
          ].map((item) => (
            <div key={item.label} style={{ padding: '12px', background: item.bg, borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: item.color, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {item.label}
              </div>
              <div style={{ fontSize: '13px', color: item.color, lineHeight: 1.5 }}>{item.content}</div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
          Klik op "Analyseer" voor je dagelijkse AI review.
          <br />De coach analyseert je voeding, slaap, training en business voortgang.
        </div>
      )}
    </Card>
  )
}

// ─── Main Coach Page ──────────────────────────────────────────
export default function CoachPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (text?: string) => {
    const msg = text || input
    if (!msg.trim()) return

    const userMsg: ChatMessage = { role: 'user', content: msg, timestamp: new Date().toISOString() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          system: SYSTEM_CONTEXT,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setMessages((prev) => [...prev, { role: 'assistant', content: data.content, timestamp: new Date().toISOString() }])
      } else {
        // Fallback response
        setMessages((prev) => [...prev, {
          role: 'assistant',
          content: 'Ik kan je vraag nu niet verwerken (API niet geconfigureerd). Voeg je OpenRouter API key toe in de instellingen.',
          timestamp: new Date().toISOString(),
        }])
      }
    } catch {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'Er is een fout opgetreden. Controleer je API key in de instellingen.',
        timestamp: new Date().toISOString(),
      }])
    }
    setLoading(false)
  }

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '4px' }}>AI Coach</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Jouw persoonlijke coach — financiën, training, voeding, mindset</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
        {/* Chat */}
        <div>
          <Card padding="none" style={{ display: 'flex', flexDirection: 'column', height: '600px' }}>
            {/* Chat header */}
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: 'var(--text-primary)', color: 'var(--bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '14px', fontWeight: 700,
              }}>N</div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>Nuttin Coach</div>
                <div style={{ fontSize: '11px', color: 'var(--accent-green-text)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', background: 'var(--accent-green-text)', borderRadius: '50%', display: 'inline-block' }} />
                  Online
                </div>
              </div>
              <Badge variant="muted" className="ml-auto">OpenRouter</Badge>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
              {messages.map((m, i) => <MessageBubble key={i} msg={m} />)}
              {loading && (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  <div style={{ display: 'flex', gap: '3px' }}>
                    {[0, 1, 2].map((i) => (
                      <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-muted)', animation: `pulse 1.4s ease ${i * 0.2}s infinite` }} />
                    ))}
                  </div>
                  Aan het denken...
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick actions */}
            <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border)', display: 'flex', gap: '4px', overflowX: 'auto' }}>
              {QUICK_ACTIONS.slice(0, 3).map((a) => (
                <button
                  key={a}
                  onClick={() => send(a)}
                  style={{
                    padding: '4px 10px', borderRadius: 'var(--radius-full)',
                    fontSize: '11px', border: '1px solid var(--border)',
                    background: 'var(--bg-secondary)', color: 'var(--text-secondary)',
                    cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                  }}
                >
                  {a}
                </button>
              ))}
            </div>

            {/* Input */}
            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px' }}>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                placeholder="Stel een vraag..."
                style={{ minHeight: '36px', height: '36px', resize: 'none', flex: 1 }}
              />
              <Button variant="primary" onClick={() => send()} disabled={!input.trim() || loading} size="md">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </Button>
            </div>
          </Card>
        </div>

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <DailyAnalysis />

          {/* Quick actions full list */}
          <Card padding="md">
            <CardTitle>Snelle vragen</CardTitle>
            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {QUICK_ACTIONS.map((a) => (
                <button
                  key={a}
                  onClick={() => send(a)}
                  style={{
                    textAlign: 'left', padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '13px', color: 'var(--text-secondary)',
                    background: 'transparent', border: '1px solid var(--border)',
                    cursor: 'pointer', transition: 'all 0.15s ease',
                    display: 'flex', alignItems: 'center', gap: '8px',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-secondary)' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                  {a}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

'use client'
import { useState } from 'react'
import { Card, CardTitle, CardHeader, CardDivider } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency, formatDate, DEAL_STAGE_LABELS } from '@/lib/utils'
import type { Deal, ReviewCard } from '@/types'

const GOAL_NET = 10000

// ─── Mock data ────────────────────────────────────────────────
const INITIAL_DEALS: Deal[] = [
  { id: '1', title: 'Website Resto De Hoorn', client: 'De Hoorn', value_gross: 3900, value_net: 2000, stage: 'won', created_at: '2026-06-01', type: 'website' },
  { id: '2', title: 'Custom CRM Immo Leclercq', client: 'Immo Leclercq', value_gross: 3900, value_net: 2000, stage: 'won', created_at: '2026-06-05', type: 'crm' },
  { id: '3', title: 'Website Kapper Steff', client: 'Kapper Steff', value_gross: 3500, value_net: 1800, stage: 'proposal', created_at: '2026-06-10', type: 'website' },
  { id: '4', title: 'CRM Bouwbedrijf Declercq', client: 'Declercq Build', value_gross: 4200, value_net: 2100, stage: 'appointment', created_at: '2026-06-12', type: 'crm' },
  { id: '5', title: 'Website Tandarts Peeters', client: 'Dr. Peeters', value_gross: 3900, value_net: 2000, stage: 'lead', created_at: '2026-06-13', type: 'website' },
  { id: '6', title: 'CRM Reisagentschap Horizon', client: 'Horizon Travel', value_gross: 4500, value_net: 2200, stage: 'lead', created_at: '2026-06-14', type: 'crm' },
]

const INITIAL_CARDS: ReviewCard[] = [
  { id: '1', business_name: 'Brasserie Central', package_type: 'basic', price: 75, sold_at: '2026-06-03', location: 'Kortrijk' },
  { id: '2', business_name: 'Bloemenwinkel Flora', package_type: 'premium', price: 175, sold_at: '2026-06-03', location: 'Kortrijk' },
  { id: '3', business_name: 'Bakkerij Van Den Berg', package_type: 'basic', price: 75, sold_at: '2026-06-05', location: 'Kortrijk' },
  { id: '4', business_name: 'Bakkerij Van Den Berg', package_type: 'basic', price: 50, second_card: true, sold_at: '2026-06-05', location: 'Kortrijk', notes: '2e kaart' },
  { id: '5', business_name: 'Frituur De Koekpan', package_type: 'premium', price: 175, sold_at: '2026-06-10', location: 'Gent' },
  { id: '6', business_name: 'Kledingzaak Mode X', package_type: 'basic', price: 75, sold_at: '2026-06-10', location: 'Gent' },
  { id: '7', business_name: 'Pizzeria Napoli', package_type: 'basic', price: 75, sold_at: '2026-06-12', location: 'Kortrijk' },
  { id: '8', business_name: 'Nagelstudio Elle', package_type: 'premium', price: 175, sold_at: '2026-06-13', location: 'Kortrijk' },
]

const STAGE_ORDER = ['lead', 'appointment', 'proposal', 'negotiation', 'won', 'lost']
const STAGE_COLORS: Record<string, 'default' | 'green' | 'blue' | 'yellow' | 'red' | 'purple' | 'orange' | 'muted'> = {
  lead: 'muted',
  appointment: 'blue',
  proposal: 'yellow',
  negotiation: 'orange',
  won: 'green',
  lost: 'red',
}

// ─── Deal Row ─────────────────────────────────────────────────
function DealRow({ deal, onStageChange }: { deal: Deal; onStageChange: (id: string, stage: Deal['stage']) => void }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 0',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '2px' }}>
          {deal.title}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          {deal.client} · {formatDate(deal.created_at)}
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
          {formatCurrency(deal.value_net)} netto
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          {formatCurrency(deal.value_gross)} bruto
        </div>
      </div>
      <div style={{ flexShrink: 0 }}>
        <select
          value={deal.stage}
          onChange={(e) => onStageChange(deal.id, e.target.value as Deal['stage'])}
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-secondary)',
            fontSize: '12px',
            padding: '4px 8px',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          {STAGE_ORDER.map((s) => (
            <option key={s} value={s}>{DEAL_STAGE_LABELS[s]}</option>
          ))}
        </select>
      </div>
    </div>
  )
}

// ─── Add Deal Modal ───────────────────────────────────────────
function AddDealForm({ onAdd }: { onAdd: (deal: Deal) => void }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ title: '', client: '', value_gross: '', value_net: '', type: 'website' })

  const submit = () => {
    if (!form.title || !form.client) return
    onAdd({
      id: Date.now().toString(),
      title: form.title,
      client: form.client,
      value_gross: Number(form.value_gross) || 3900,
      value_net: Number(form.value_net) || 2000,
      stage: 'lead',
      created_at: new Date().toISOString(),
      type: form.type as Deal['type'],
    })
    setForm({ title: '', client: '', value_gross: '', value_net: '', type: 'website' })
    setOpen(false)
  }

  return (
    <>
      <Button variant="primary" size="sm" onClick={() => setOpen(true)}
        icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>}
      >
        Deal toevoegen
      </Button>

      {open && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px',
        }} onClick={() => setOpen(false)}>
          <div style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            width: '100%',
            maxWidth: '420px',
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Nieuwe deal</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Input label="Titel" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Website Klant X" />
              <Input label="Klant" value={form.client} onChange={(e) => setForm(f => ({ ...f, client: e.target.value }))} placeholder="Bedrijfsnaam" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <Input label="Bruto (€)" type="number" value={form.value_gross} onChange={(e) => setForm(f => ({ ...f, value_gross: e.target.value }))} placeholder="3900" />
                <Input label="Netto (€)" type="number" value={form.value_net} onChange={(e) => setForm(f => ({ ...f, value_net: e.target.value }))} placeholder="2000" />
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <Button variant="secondary" onClick={() => setOpen(false)} style={{ flex: 1 }}>Annuleer</Button>
                <Button variant="primary" onClick={submit} style={{ flex: 1 }}>Toevoegen</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ─── Main Financial Page ──────────────────────────────────────
export default function FinancialPage() {
  const [deals, setDeals] = useState<Deal[]>(INITIAL_DEALS)
  const [tab, setTab] = useState<'deals' | 'cards' | 'overview'>('overview')

  const wonDeals = deals.filter((d) => d.stage === 'won')
  const pipelineDeals = deals.filter((d) => !['won', 'lost'].includes(d.stage))
  const revenueNet = wonDeals.reduce((s, d) => s + d.value_net, 0)
  const revenueGross = wonDeals.reduce((s, d) => s + d.value_gross, 0)
  const cardRevenue = INITIAL_CARDS.reduce((s, c) => s + c.price, 0)
  const totalNet = revenueNet + cardRevenue
  const pct = Math.min((totalNet / GOAL_NET) * 100, 100)

  const updateStage = (id: string, stage: Deal['stage']) => {
    setDeals((prev) => prev.map((d) => (d.id === id ? { ...d, stage } : d)))
  }

  const addDeal = (deal: Deal) => setDeals((prev) => [deal, ...prev])

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '4px' }}>
          Financieel
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          Doel: {formatCurrency(GOAL_NET)} netto in 1-2 maanden
        </p>
      </div>

      {/* Revenue hero */}
      <Card padding="lg" className="mb-3 stagger-1 animate-fade-in">
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
              Totaal netto verdiend
            </div>
            <div style={{ fontSize: '36px', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1 }}>
              {formatCurrency(totalNet)}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {formatCurrency(revenueNet)} deals · {formatCurrency(cardRevenue)} review cards
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: pct >= 90 ? 'var(--accent-green-text)' : pct >= 50 ? 'var(--accent-blue-text)' : 'var(--accent-yellow-text)' }}>
              {Math.round(pct)}%
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>van doel</div>
          </div>
        </div>
        <Progress value={totalNet} max={GOAL_NET} height={6} color="auto" animated />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginTop: '16px' }}>
          {[
            { label: 'Deals gewonnen', value: `${wonDeals.length}/${deals.filter(d => d.stage !== 'lost').length}` },
            { label: 'Pipeline waarde', value: formatCurrency(pipelineDeals.reduce((s, d) => s + d.value_net, 0)) },
            { label: 'Review cards', value: `${INITIAL_CARDS.length} verkocht` },
            { label: 'Resterend', value: formatCurrency(Math.max(GOAL_NET - totalNet, 0)) },
          ].map((s) => (
            <div key={s.label}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>{s.label}</div>
              <div style={{ fontSize: '14px', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{s.value}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '0' }}>
        {(['overview', 'deals', 'cards'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '8px 14px',
              fontSize: '13px',
              fontWeight: tab === t ? 500 : 400,
              color: tab === t ? 'var(--text-primary)' : 'var(--text-muted)',
              background: 'none',
              border: 'none',
              borderBottom: `2px solid ${tab === t ? 'var(--text-primary)' : 'transparent'}`,
              cursor: 'pointer',
              marginBottom: '-1px',
              transition: 'color 0.15s ease',
            }}
          >
            {t === 'overview' ? 'Overzicht' : t === 'deals' ? 'Deals' : 'Review Cards'}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        {tab === 'deals' && <AddDealForm onAdd={addDeal} />}
      </div>

      {/* Tab content */}
      {tab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
          {/* Email campaign */}
          <Card padding="md" className="stagger-2 animate-fade-in">
            <CardTitle subtitle="E-mailcampagne conversie">Campagne Funnel</CardTitle>
            <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'E-mails verstuurd', value: 1247, total: 2000, color: 'var(--accent-blue-text)' },
                { label: 'Afspraken', value: 12, total: 30, color: 'var(--accent-purple-text)' },
                { label: 'Deals gesloten', value: wonDeals.length, total: 6, color: 'var(--accent-green-text)' },
              ].map((item) => (
                <div key={item.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item.label}</span>
                    <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: item.color }}>
                      {item.value}/{item.total}
                    </span>
                  </div>
                  <Progress value={item.value} max={item.total} height={3} color={item.color} />
                </div>
              ))}
            </div>
          </Card>

          {/* Review card stats */}
          <Card padding="md" className="stagger-3 animate-fade-in">
            <CardTitle subtitle="2x per week, 4 uur per sessie">Review Cards</CardTitle>
            <div style={{ marginTop: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                {[
                  { label: 'Pakket 1 (€75)', value: INITIAL_CARDS.filter(c => c.package_type === 'basic' && !c.second_card).length },
                  { label: 'Pakket 2 (€175)', value: INITIAL_CARDS.filter(c => c.package_type === 'premium').length },
                  { label: '2e kaart (€50)', value: INITIAL_CARDS.filter(c => c.second_card).length },
                  { label: 'Totaal bruto', value: formatCurrency(cardRevenue) },
                ].map((s) => (
                  <div key={s.label}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>{s.label}</div>
                    <div style={{ fontSize: '16px', fontWeight: 600 }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Vaste kosten */}
          <Card padding="md" className="stagger-4 animate-fade-in">
            <CardTitle subtitle="Maandelijks">Vaste kosten</CardTitle>
            <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { name: 'GoHighLevel', amount: 300, due: '1 juli' },
                { name: 'Hosting (Vercel)', amount: 0, due: 'Gratis' },
              ].map((cost) => (
                <div key={cost.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{cost.name}</span>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-mono)', color: cost.amount > 0 ? 'var(--accent-red-text)' : 'var(--accent-green-text)' }}>
                      {cost.amount > 0 ? `-${formatCurrency(cost.amount)}` : 'Gratis'}
                    </span>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{cost.due}</div>
                  </div>
                </div>
              ))}
              <CardDivider />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 500 }}>Totaal per maand</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-red-text)' }}>-€300</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {tab === 'deals' && (
        <Card padding="md" className="animate-fade-in">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
            {deals.length} deals · {wonDeals.length} gewonnen · {pipelineDeals.length} in pipeline
          </div>
          {deals.map((deal) => (
            <DealRow key={deal.id} deal={deal} onStageChange={updateStage} />
          ))}
        </Card>
      )}

      {tab === 'cards' && (
        <Card padding="md" className="animate-fade-in">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
            {INITIAL_CARDS.length} kaarten · {formatCurrency(cardRevenue)} totaal
          </div>
          {INITIAL_CARDS.map((card) => (
            <div
              key={card.id}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid var(--border)' }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 500 }}>{card.business_name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {formatDate(card.sold_at)} · {card.location}
                  {card.second_card && ' · 2e kaart'}
                </div>
              </div>
              <Badge variant={card.package_type === 'premium' ? 'purple' : 'blue'}>
                {card.package_type === 'premium' ? 'Pakket 2' : 'Pakket 1'}
              </Badge>
              <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-green-text)' }}>
                +{formatCurrency(card.price)}
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}

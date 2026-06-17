'use client'
import { useState, useEffect } from 'react'
import { Card, CardTitle, CardDivider } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useFinancialStore, type Deal, type RecurringCost, type IncomeEntry } from '@/stores/app-store'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'

// ─── Constants ────────────────────────────────────────────────
const STAGE_LABELS: Record<string, string> = {
  lead: 'Lead', contact: 'Contact', proposal: 'Voorstel',
  negotiation: 'Onderhandeling', won: 'Gewonnen', lost: 'Verloren',
}
const STAGE_CHART_COLORS: Record<string, string> = {
  lead: '#64748B', contact: '#3B82F6', proposal: '#EAB308',
  negotiation: '#F97316', won: '#22C55E', lost: '#EF4444',
}
const STAGE_ORDER = ['lead', 'contact', 'proposal', 'negotiation', 'won', 'lost'] as const

const REVIEW_CARDS = [
  { id: '1', business_name: 'Brasserie Central', package_type: 'basic', price: 75, sold_at: '2026-06-03', location: 'Kortrijk' },
  { id: '2', business_name: 'Bloemenwinkel Flora', package_type: 'premium', price: 175, sold_at: '2026-06-03', location: 'Kortrijk' },
  { id: '3', business_name: 'Bakkerij Van Den Berg', package_type: 'basic', price: 75, sold_at: '2026-06-05', location: 'Kortrijk' },
  { id: '4', business_name: 'Bakkerij Van Den Berg', package_type: 'basic', price: 50, second_card: true, sold_at: '2026-06-05', location: 'Kortrijk' },
  { id: '5', business_name: 'Frituur De Koekpan', package_type: 'premium', price: 175, sold_at: '2026-06-10', location: 'Gent' },
  { id: '6', business_name: 'Kledingzaak Mode X', package_type: 'basic', price: 75, sold_at: '2026-06-10', location: 'Gent' },
  { id: '7', business_name: 'Pizzeria Napoli', package_type: 'basic', price: 75, sold_at: '2026-06-12', location: 'Kortrijk' },
  { id: '8', business_name: 'Nagelstudio Elle', package_type: 'premium', price: 175, sold_at: '2026-06-13', location: 'Kortrijk' },
]

const SEED_DEALS: Deal[] = [
  { id: 'd1', name: 'Website Resto De Hoorn', contact: 'De Hoorn', value_bruto: 3900, value_netto: 2000, stage: 'won', created_at: '2026-06-01', type: 'website' },
  { id: 'd2', name: 'Custom CRM Immo Leclercq', contact: 'Immo Leclercq', value_bruto: 3900, value_netto: 2000, stage: 'won', created_at: '2026-06-05', type: 'crm' },
  { id: 'd3', name: 'Website Kapper Steff', contact: 'Kapper Steff', value_bruto: 3500, value_netto: 1800, stage: 'proposal', created_at: '2026-06-10', type: 'website' },
  { id: 'd4', name: 'CRM Bouwbedrijf Declercq', contact: 'Declercq Build', value_bruto: 4200, value_netto: 2100, stage: 'contact', created_at: '2026-06-12', type: 'crm' },
  { id: 'd5', name: 'Website Tandarts Peeters', contact: 'Dr. Peeters', value_bruto: 3900, value_netto: 2000, stage: 'lead', created_at: '2026-06-13', type: 'website' },
  { id: 'd6', name: 'CRM Reisagentschap Horizon', contact: 'Horizon Travel', value_bruto: 4500, value_netto: 2200, stage: 'lead', created_at: '2026-06-14', type: 'crm' },
]

const SEED_COSTS: RecurringCost[] = [
  { id: 'rc1', name: 'GoHighLevel', amount: 300, frequency: 'monthly', category: 'software', next_due: '2026-07-01' },
  { id: 'rc2', name: 'Hosting (Vercel)', amount: 0, frequency: 'monthly', category: 'software', next_due: '' },
]

// ─── Deal Row ─────────────────────────────────────────────────
function DealRow({ deal }: { deal: Deal }) {
  const updateDeal = useFinancialStore((s) => s.updateDeal)
  const removeDeal = useFinancialStore((s) => s.removeDeal)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '2px' }}>{deal.name}</div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          {deal.contact} · {formatDate(deal.created_at)}{' '}
          <Badge variant={deal.type === 'crm' ? 'blue' : 'purple'}>
            {deal.type === 'crm' ? 'CRM' : deal.type === 'website' ? 'Website' : 'Overig'}
          </Badge>
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{formatCurrency(deal.value_netto)}</div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{formatCurrency(deal.value_bruto)} bruto</div>
      </div>
      <select
        value={deal.stage}
        onChange={(e) => updateDeal(deal.id, { stage: e.target.value as Deal['stage'] })}
        style={{
          background: 'var(--bg-secondary)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)',
          fontSize: '12px', padding: '4px 6px', cursor: 'pointer', outline: 'none', flexShrink: 0,
        }}
      >
        {STAGE_ORDER.map((s) => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
      </select>
      <button
        onClick={() => removeDeal(deal.id)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '18px', lineHeight: 1, flexShrink: 0 }}
      >×</button>
    </div>
  )
}

// ─── Add Deal Form ─────────────────────────────────────────────
function AddDealForm() {
  const addDeal = useFinancialStore((s) => s.addDeal)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', contact: '', value_bruto: '', value_netto: '', type: 'website' as Deal['type'] })

  const submit = () => {
    if (!form.name || !form.contact) return
    addDeal({
      id: Date.now().toString(),
      name: form.name, contact: form.contact,
      value_bruto: Number(form.value_bruto) || 3900,
      value_netto: Number(form.value_netto) || 2000,
      stage: 'lead', type: form.type,
      created_at: new Date().toISOString().split('T')[0],
    })
    setForm({ name: '', contact: '', value_bruto: '', value_netto: '', type: 'website' })
    setOpen(false)
  }

  return (
    <>
      <Button variant="primary" size="sm" onClick={() => setOpen(true)}
        icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>}
      >Deal toevoegen</Button>

      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
          onClick={() => setOpen(false)}>
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px', width: '100%', maxWidth: '420px' }}
            onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Nieuwe deal</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Input label="Naam" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Website Klant X" />
              <Input label="Contact" value={form.contact} onChange={(e) => setForm(f => ({ ...f, contact: e.target.value }))} placeholder="Bedrijfsnaam" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <Input label="Bruto (€)" type="number" value={form.value_bruto} onChange={(e) => setForm(f => ({ ...f, value_bruto: e.target.value }))} placeholder="3900" />
                <Input label="Netto (€)" type="number" value={form.value_netto} onChange={(e) => setForm(f => ({ ...f, value_netto: e.target.value }))} placeholder="2000" />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Type</label>
                <select value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value as Deal['type'] }))}
                  style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '13px', padding: '8px 10px', outline: 'none' }}>
                  <option value="website">Website</option>
                  <option value="crm">CRM</option>
                  <option value="review_card">Review Card</option>
                  <option value="other">Overig</option>
                </select>
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

// ─── Main ──────────────────────────────────────────────────────
export default function FinancialPage() {
  const {
    deals, recurringCosts, income, cashBalance, monthlyGoal,
    addDeal, addRecurringCost, removeRecurringCost,
    addIncome, setCashBalance, setMonthlyGoal,
    getMonthlyExpenses, getMonthlyIncome,
  } = useFinancialStore()

  const [tab, setTab] = useState<'overview' | 'deals' | 'kosten' | 'inkomen'>('overview')

  // Seed initial data on first load
  useEffect(() => {
    if (deals.length === 0) {
      SEED_DEALS.forEach((d) => addDeal(d))
    }
    if (recurringCosts.length === 0) {
      SEED_COSTS.forEach((c) => addRecurringCost(c))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const wonDeals = deals.filter((d) => d.stage === 'won')
  const pipelineDeals = deals.filter((d) => !['won', 'lost'].includes(d.stage))
  const dealsNetRevenue = wonDeals.reduce((s, d) => s + d.value_netto, 0)
  const cardRevenue = REVIEW_CARDS.reduce((s, c) => s + c.price, 0)
  const totalNet = dealsNetRevenue + cardRevenue + income.reduce((s, e) => s + e.amount, 0)
  const monthlyExpenses = getMonthlyExpenses()
  const pct = Math.min((totalNet / monthlyGoal) * 100, 100)

  const pipelineData = STAGE_ORDER.slice(0, -1).map((stage) => ({
    stage: STAGE_LABELS[stage],
    count: deals.filter((d) => d.stage === stage).length,
    value: deals.filter((d) => d.stage === stage).reduce((s, d) => s + d.value_netto, 0),
    color: STAGE_CHART_COLORS[stage],
  }))

  // ─── Kosten tab state ─────────────────────────────────────
  const [costForm, setCostForm] = useState({ name: '', amount: '', frequency: 'monthly' as RecurringCost['frequency'], category: 'software' })
  const addCost = () => {
    if (!costForm.name || !costForm.amount) return
    addRecurringCost({ id: Date.now().toString(), name: costForm.name, amount: Number(costForm.amount), frequency: costForm.frequency, category: costForm.category })
    setCostForm({ name: '', amount: '', frequency: 'monthly', category: 'software' })
  }

  // ─── Inkomen tab state ────────────────────────────────────
  const [incomeForm, setIncomeForm] = useState({ amount: '', source: '', description: '' })
  const [cashInput, setCashInput] = useState(String(cashBalance))
  const addIncomeEntry = () => {
    if (!incomeForm.amount) return
    addIncome({ id: Date.now().toString(), date: new Date().toISOString().split('T')[0], amount: Number(incomeForm.amount), source: incomeForm.source || 'Overig', description: incomeForm.description })
    setIncomeForm({ amount: '', source: '', description: '' })
  }

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '4px' }}>Financieel</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Doel: {formatCurrency(monthlyGoal)} netto — {Math.round(pct)}% bereikt</p>
      </div>

      {/* Hero */}
      <Card padding="lg" style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>Totaal netto verdiend</div>
            <div style={{ fontSize: '36px', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1 }}>{formatCurrency(totalNet)}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {formatCurrency(dealsNetRevenue)} deals · {formatCurrency(cardRevenue)} review cards
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: pct >= 90 ? 'var(--accent-green-text)' : pct >= 50 ? 'var(--accent-blue-text)' : 'var(--accent-yellow-text)' }}>
              {Math.round(pct)}%
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>van €{(monthlyGoal / 1000).toFixed(0)}k doel</div>
          </div>
        </div>
        <Progress value={totalNet} max={monthlyGoal} height={6} color="auto" animated />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginTop: '16px' }}>
          {[
            { label: 'Deals gewonnen', value: `${wonDeals.length}/${deals.filter(d => d.stage !== 'lost').length}` },
            { label: 'Pipeline', value: formatCurrency(pipelineDeals.reduce((s, d) => s + d.value_netto, 0)) },
            { label: 'Vaste kosten', value: `-${formatCurrency(monthlyExpenses)}` },
            { label: 'Resterend', value: formatCurrency(Math.max(monthlyGoal - totalNet, 0)) },
          ].map((s) => (
            <div key={s.label}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>{s.label}</div>
              <div style={{ fontSize: '14px', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{s.value}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '12px', borderBottom: '1px solid var(--border)' }}>
        {(['overview', 'deals', 'kosten', 'inkomen'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '8px 14px', fontSize: '13px',
            fontWeight: tab === t ? 500 : 400,
            color: tab === t ? 'var(--text-primary)' : 'var(--text-muted)',
            background: 'none', border: 'none',
            borderBottom: `2px solid ${tab === t ? 'var(--text-primary)' : 'transparent'}`,
            cursor: 'pointer', marginBottom: '-1px', transition: 'color 0.15s ease',
          }}>
            {{ overview: 'Overzicht', deals: 'Deals', kosten: 'Kosten', inkomen: 'Inkomen' }[t]}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        {tab === 'deals' && <AddDealForm />}
      </div>

      {/* ─── Overzicht ──────────────────────────────────────── */}
      {tab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
          {/* Pipeline funnel chart */}
          <Card padding="md">
            <CardTitle subtitle="Netto waarde per fase">Pipeline Funnel</CardTitle>
            <div style={{ marginTop: '14px', height: '180px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipelineData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
                  <XAxis dataKey="stage" tick={{ fontSize: 10, fill: '#888' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#888' }} tickFormatter={(v) => `€${(v/1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '12px' }}
                    formatter={(value) => [formatCurrency(Number(value)), 'Netto']}
                  />
                  <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                    {pipelineData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Review cards */}
          <Card padding="md">
            <CardTitle subtitle="2x per week · 4 uur per sessie">Review Cards</CardTitle>
            <div style={{ marginTop: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                {[
                  { label: 'Pakket 1 (€75)', value: REVIEW_CARDS.filter(c => c.package_type === 'basic' && !c.second_card).length },
                  { label: 'Pakket 2 (€175)', value: REVIEW_CARDS.filter(c => c.package_type === 'premium').length },
                  { label: '2e kaart (€50)', value: REVIEW_CARDS.filter(c => c.second_card).length },
                  { label: 'Totaal', value: formatCurrency(cardRevenue) },
                ].map((s) => (
                  <div key={s.label}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>{s.label}</div>
                    <div style={{ fontSize: '16px', fontWeight: 600 }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* E-mail campagne */}
          <Card padding="md">
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
                    <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: item.color }}>{item.value}/{item.total}</span>
                  </div>
                  <Progress value={item.value} max={item.total} height={3} color={item.color} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ─── Deals ──────────────────────────────────────────── */}
      {tab === 'deals' && (
        <Card padding="md">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
            {deals.length} deals · {wonDeals.length} gewonnen · {pipelineDeals.length} in pipeline
          </div>
          {deals.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
              Nog geen deals — voeg er een toe via de knop hierboven.
            </div>
          )}
          {deals.map((deal) => <DealRow key={deal.id} deal={deal} />)}
        </Card>
      )}

      {/* ─── Kosten ─────────────────────────────────────────── */}
      {tab === 'kosten' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Card padding="md">
            <CardTitle subtitle={`€${monthlyExpenses.toFixed(0)}/maand totaal`}>Vaste Kosten</CardTitle>
            <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recurringCosts.length === 0 && (
                <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Nog geen kosten.</div>
              )}
              {recurringCosts.map((cost) => (
                <div key={cost.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 500 }}>{cost.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {cost.frequency === 'monthly' ? 'Maandelijks' : cost.frequency === 'weekly' ? 'Wekelijks' : 'Jaarlijks'}
                      {cost.next_due && ` · ${cost.next_due}`}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: cost.amount > 0 ? 'var(--accent-red-text)' : 'var(--accent-green-text)' }}>
                      {cost.amount > 0 ? `-${formatCurrency(cost.amount)}` : 'Gratis'}
                    </span>
                    <button onClick={() => removeRecurringCost(cost.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '16px' }}>×</button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card padding="md">
            <CardTitle>Kost toevoegen</CardTitle>
            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <Input label="Naam" value={costForm.name} onChange={(e) => setCostForm(f => ({ ...f, name: e.target.value }))} placeholder="GoHighLevel" />
                <Input label="Bedrag (€)" type="number" value={costForm.amount} onChange={(e) => setCostForm(f => ({ ...f, amount: e.target.value }))} placeholder="300" />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Frequentie</label>
                <select value={costForm.frequency} onChange={(e) => setCostForm(f => ({ ...f, frequency: e.target.value as RecurringCost['frequency'] }))}
                  style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '13px', padding: '8px 10px', outline: 'none' }}>
                  <option value="monthly">Maandelijks</option>
                  <option value="weekly">Wekelijks</option>
                  <option value="yearly">Jaarlijks</option>
                </select>
              </div>
              <Button variant="primary" size="md" onClick={addCost} disabled={!costForm.name || !costForm.amount}>Toevoegen</Button>
            </div>
          </Card>
        </div>
      )}

      {/* ─── Inkomen ────────────────────────────────────────── */}
      {tab === 'inkomen' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Cash balance */}
          <Card padding="md">
            <CardTitle subtitle="Huidige kas">Cash Balans</CardTitle>
            <div style={{ marginTop: '12px', display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
              <Input
                label="Kas (€)"
                type="number"
                value={cashInput}
                onChange={(e) => setCashInput(e.target.value)}
                style={{ flex: 1 }}
              />
              <Button variant="primary" size="md" onClick={() => setCashBalance(Number(cashInput))}>Opslaan</Button>
            </div>
            <div style={{ marginTop: '8px', fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-green-text)' }}>
              {formatCurrency(cashBalance)}
            </div>
          </Card>

          {/* Income entries */}
          <Card padding="md">
            <CardTitle subtitle="Inkomsten loggen">Inkomen Toevoegen</CardTitle>
            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <Input label="Bedrag (€)" type="number" value={incomeForm.amount} onChange={(e) => setIncomeForm(f => ({ ...f, amount: e.target.value }))} placeholder="350" />
                <Input label="Bron" value={incomeForm.source} onChange={(e) => setIncomeForm(f => ({ ...f, source: e.target.value }))} placeholder="Review cards" />
              </div>
              <Input label="Omschrijving" value={incomeForm.description} onChange={(e) => setIncomeForm(f => ({ ...f, description: e.target.value }))} placeholder="8 review cards Kortrijk" />
              <Button variant="primary" size="md" onClick={addIncomeEntry} disabled={!incomeForm.amount}>Toevoegen</Button>
            </div>
          </Card>

          {/* Income list */}
          {income.length > 0 && (
            <Card padding="md">
              <CardTitle subtitle={`${income.length} inkomsten · ${formatCurrency(income.reduce((s, e) => s + e.amount, 0))} totaal`}>Inkomen Log</CardTitle>
              <div style={{ marginTop: '12px' }}>
                {income.map((entry) => (
                  <div key={entry.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 500 }}>{entry.source}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{entry.description} · {formatDate(entry.date)}</div>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-green-text)' }}>
                      +{formatCurrency(entry.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

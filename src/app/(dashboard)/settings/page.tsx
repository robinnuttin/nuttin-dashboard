'use client'
import { useState, useEffect } from 'react'
import { Card, CardTitle, CardHeader, CardDivider } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useThemeStore } from '@/stores/app-store'

interface ApiKey {
  key: string; label: string; description: string; placeholder: string; status: 'connected' | 'missing' | 'optional'
}

const API_KEYS: ApiKey[] = [
  { key: 'openrouter', label: 'OpenRouter API Key', description: 'AI coach (gratis modellen). Haal op via openrouter.ai/keys', placeholder: 'sk-or-...', status: 'missing' },
  { key: 'ghl_api', label: 'GoHighLevel API Key', description: 'CRM integratie voor contacten en agenda', placeholder: 'eyJ...', status: 'missing' },
  { key: 'ghl_location', label: 'GoHighLevel Location ID', description: 'Jouw locatie ID in GoHighLevel dashboard', placeholder: 'abc123...', status: 'missing' },
  { key: 'obsidian_key', label: 'Obsidian API Key', description: 'Local REST API plugin token (localhost:27123). Instellingen → Local REST API', placeholder: 'xxxxxx', status: 'optional' },
  { key: 'google_client_id', label: 'Google Client ID', description: 'Voor Google Calendar & Gmail sync. Via console.cloud.google.com', placeholder: 'xxx.apps.googleusercontent.com', status: 'optional' },
]

function ApiKeyInput({ apiKey }: { apiKey: ApiKey }) {
  const [value, setValue] = useState('')
  const [saved, setSaved] = useState(false)
  const [visible, setVisible] = useState(false)

  const save = () => {
    if (!value) return
    // In production: store securely via API route, not localStorage
    localStorage.setItem(`api_${apiKey.key}`, value)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '2px' }}>{apiKey.label}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{apiKey.description}</div>
        </div>
        <Badge variant={apiKey.status === 'connected' ? 'green' : apiKey.status === 'missing' ? 'red' : 'muted'}>
          {apiKey.status === 'connected' ? 'Verbonden' : apiKey.status === 'missing' ? 'Vereist' : 'Optioneel'}
        </Badge>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <Input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={apiKey.placeholder}
          suffix={
            <button onClick={() => setVisible(!visible)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '12px' }}>
              {visible ? 'Verbergen' : 'Tonen'}
            </button>
          }
          style={{ flex: 1 }}
        />
        <Button size="md" variant={saved ? 'secondary' : 'primary'} onClick={save} disabled={!value}>
          {saved ? 'Opgeslagen' : 'Opslaan'}
        </Button>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const { theme, toggleTheme } = useThemeStore()
  const [ghlInfo, setGhlInfo] = useState<{ connected: boolean; contactCount?: number } | null>(null)
  const [renderUrl, setRenderUrl] = useState('')
  const [waBridgeStatus, setWaBridgeStatus] = useState<'unknown' | 'connected' | 'awaiting_scan' | 'starting'>('unknown')

  useEffect(() => {
    fetch('/api/ghl/status')
      .then((r) => r.json())
      .then((d) => setGhlInfo({ connected: d.connected, contactCount: d.contactCount }))
      .catch(() => setGhlInfo({ connected: false }))
    const saved = localStorage.getItem('wa_bridge_url')
    if (saved) setRenderUrl(saved)
  }, [])

  const checkBridgeStatus = async (url: string) => {
    try {
      const r = await fetch(`${url}/status`)
      const d = await r.json()
      setWaBridgeStatus(d.connected ? 'connected' : d.hasQR ? 'awaiting_scan' : 'starting')
    } catch { setWaBridgeStatus('unknown') }
  }

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '4px' }}>Instellingen</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>API keys, integraties en voorkeuren</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* API Keys */}
          <Card padding="md">
            <CardTitle subtitle="Bewaar je API keys veilig">API Keys & Integraties</CardTitle>
            <div style={{ marginTop: '4px' }}>
              {API_KEYS.map((k) => <ApiKeyInput key={k.key} apiKey={k} />)}
            </div>
          </Card>

          {/* GHL Status */}
          {ghlInfo && (
            <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', background: ghlInfo.connected ? 'var(--accent-green-bg)' : 'var(--bg-secondary)', border: `1px solid ${ghlInfo.connected ? 'var(--accent-green-text)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ghlInfo.connected ? 'var(--accent-green-text)' : 'var(--text-muted)'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {ghlInfo.connected ? <polyline points="20 6 9 17 4 12"/> : <circle cx="12" cy="12" r="10"/>}
              </svg>
              <span style={{ fontSize: '12px', color: ghlInfo.connected ? 'var(--accent-green-text)' : 'var(--text-muted)', flex: 1 }}>
                {ghlInfo.connected
                  ? `GoHighLevel verbonden · ${ghlInfo.contactCount || 0} contacten`
                  : 'GoHighLevel niet verbonden — voeg API key toe hierboven'}
              </span>
              {ghlInfo.connected && (
                <a href="/agenda" style={{ fontSize: '12px', color: 'var(--accent-green-text)', fontWeight: 600, textDecoration: 'none' }}>Agenda</a>
              )}
            </div>
          )}

          {/* WhatsApp */}
          <Card padding="md">
            <CardHeader action={
              <Badge variant={waBridgeStatus === 'connected' ? 'green' : waBridgeStatus === 'awaiting_scan' ? 'yellow' : 'muted'}>
                {waBridgeStatus === 'connected' ? 'Verbonden' : waBridgeStatus === 'awaiting_scan' ? 'Scan QR' : 'Niet verbonden'}
              </Badge>
            }>
              <CardTitle>WhatsApp Bot</CardTitle>
            </CardHeader>

            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: 1.6 }}>
              Vul je Render URL in en klik QR Scannen.
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input
                className="inp"
                placeholder="https://nuttin-whatsapp-bridge.onrender.com"
                value={renderUrl}
                onChange={(e) => setRenderUrl(e.target.value)}
                onBlur={() => { if (renderUrl) { localStorage.setItem('wa_bridge_url', renderUrl); checkBridgeStatus(renderUrl) } }}
                style={{ flex: 1, fontSize: '12px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              <Button
                variant="primary"
                size="md"
                onClick={() => { if (renderUrl) window.open(`${renderUrl}/qr`, '_blank') }}
                disabled={!renderUrl}
              >
                QR Scannen
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => renderUrl && checkBridgeStatus(renderUrl)}
                disabled={!renderUrl}
              >
                Status check
              </Button>
            </div>

            <div style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, marginBottom: '6px' }}>Render omgevingsvariabelen:</div>
              {[
                ['NUTTIN_WEBHOOK_URL', typeof window !== 'undefined' ? window.location.origin + '/api/whatsapp/webhook' : ''],
                ['MY_WA_NUMBER', '32456559189'],
              ].map(([k, v]) => (
                <div key={k} style={{ marginBottom: '4px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', minWidth: '160px' }}>{k}</span>
                  <span
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--accent-blue-text)', cursor: 'pointer' }}
                    onClick={() => navigator.clipboard.writeText(v)}
                    title="Klik om te kopiëren"
                  >{v || '…'} <span style={{ opacity: 0.5 }}>⎘</span></span>
                </div>
              ))}
            </div>

            <CardDivider />
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '5px', marginTop: '8px' }}>Commando&apos;s:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {[['prioriteiten: 1. X 2. Y','Top 3'],['gewicht: 87.5','Gewicht'],['gegeten: 4 eieren','Maaltijd'],['cash: 350','Inkomen'],['status','Overzicht']].map(([cmd, desc]) => (
                <div key={cmd} style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '12px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--accent-blue-text)', background: 'var(--accent-blue-bg)', padding: '2px 6px', borderRadius: '4px', flexShrink: 0 }}>{cmd}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{desc}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Theme */}
          <Card padding="md">
            <CardTitle>Weergave</CardTitle>
            <div style={{ marginTop: '14px', display: 'flex', gap: '8px' }}>
              {(['light', 'dark'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => theme !== t && toggleTheme()}
                  style={{
                    flex: 1, padding: '12px', borderRadius: 'var(--radius-md)',
                    border: `2px solid ${theme === t ? 'var(--text-primary)' : 'var(--border)'}`,
                    background: t === 'light' ? '#FBFBFA' : '#0C0C0C',
                    cursor: 'pointer', transition: 'all 0.15s ease',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                  }}
                >
                  <div style={{ width: '100%', height: '40px', borderRadius: '4px', background: t === 'light' ? '#fff' : '#1C1C1C', border: `1px solid ${t === 'light' ? '#E3E3E0' : '#2C2C2C'}` }} />
                  <span style={{ fontSize: '12px', fontWeight: 500, color: t === 'light' ? '#111' : '#EEE' }}>
                    {t === 'light' ? 'Licht' : 'Donker'}
                  </span>
                  {theme === t && (
                    <span style={{ fontSize: '10px', color: t === 'light' ? '#346538' : '#7EC87A' }}>Actief</span>
                  )}
                </button>
              ))}
            </div>
          </Card>

          {/* Apple Watch / iOS Shortcuts */}
          <Card padding="md">
            <CardTitle subtitle="Sync gezondheidsdata zonder App Store">Apple Watch Koppeling</CardTitle>
            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Setup via iOS Shortcuts:</div>
                <ol style={{ fontSize: '12px', color: 'var(--text-muted)', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <li>Open Shortcuts app op iPhone</li>
                  <li>Nieuwe shortcut: "Sync Gezondheid"</li>
                  <li>Voeg toe: "Gezondheidsdatabase" → Stappen, Slaap, Hartslag lezen</li>
                  <li>Voeg toe: "URL ophalen" → POST naar:</li>
                </ol>
                <div style={{ marginTop: '8px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent-blue-text)', background: 'var(--accent-blue-bg)', padding: '8px', borderRadius: '4px', wordBreak: 'break-all' }}>
                  {typeof window !== 'undefined' ? window.location.origin : 'https://jouw-app.vercel.app'}/api/health/sync
                </div>
                <li style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px', listStyle: 'decimal', paddingLeft: '16px' }}>
                  Stel in als dagelijkse automatisering om 07:30
                </li>
              </div>
              <Button variant="secondary" size="sm" onClick={() => window.open('shortcuts://create', '_blank')}>
                Shortcuts openen
              </Button>
            </div>
          </Card>

          {/* Obsidian */}
          <Card padding="md">
            <CardTitle subtitle="Vault synchronisatie voor AI geheugen">Obsidian Koppeling</CardTitle>
            <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Installeer de <strong>Local REST API plugin</strong> in Obsidian.
              De app schrijft dan automatisch je journaling, prioriteiten en AI analyses naar je vault.
            </div>
            <div style={{ marginTop: '10px' }}>
              <Input label="Vault pad (lokaal)" placeholder="/Users/jij/Obsidian/NuttinOS" />
            </div>
            <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
              Plugin URL: http://localhost:27123 (default)
            </div>
          </Card>

          {/* iPhone installatie */}
          <Card padding="md">
            <CardTitle subtitle="Voeg toe aan beginscherm zonder App Store">iPhone Installatie</CardTitle>
            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <ol style={{ fontSize: '13px', color: 'var(--text-secondary)', paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li>Open <strong>Safari</strong> op iPhone (niet Chrome)</li>
                <li>Ga naar <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent-blue-text)' }}>nuttin-dashboard.vercel.app</span></li>
                <li>Tik op het <strong>Deel icoon</strong> (vierkant met pijl omhoog)</li>
                <li>Scroll naar beneden → <strong>"Zet op beginscherm"</strong></li>
                <li>Geef de naam <strong>"Nuttin OS"</strong> en tik "Voeg toe"</li>
              </ol>
              <div style={{ padding: '10px 12px', background: 'var(--accent-green-bg)', borderRadius: 'var(--radius-sm)', fontSize: '12px', color: 'var(--accent-green-text)' }}>
                De app werkt nu als een native app op je iPhone, inclusief fullscreen modus.
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

'use client'
import { getDayOfWeek, formatDate } from '@/lib/utils'
import { usePathname } from 'next/navigation'

interface HeaderProps {
  onMenuClick: () => void
}

const pageTitles: Record<string, string> = {
  '/': 'Vandaag',
  '/daily': 'Checklist',
  '/agenda': 'Agenda',
  '/training': 'Training',
  '/nutrition': 'Voeding',
  '/health': 'Gezondheid',
  '/financial': 'Financieel',
  '/coach': 'AI Coach',
  '/journal': 'Journal',
  '/settings': 'Instellingen',
}

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname()
  const today = new Date()
  const day = getDayOfWeek()
  const date = formatDate(today)
  const title = pageTitles[pathname] || ''

  return (
    <header
      style={{
        height: 'var(--header-h)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        position: 'sticky',
        top: 0,
        background: 'var(--bg)',
        zIndex: 30,
        gap: '12px',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Mobile menu */}
      <button
        onClick={onMenuClick}
        className="md:hidden"
        style={{
          color: 'var(--text-muted)',
          padding: '6px',
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
          borderRadius: 'var(--radius-sm)',
        }}
        aria-label="Menu openen"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Page title */}
      <h1 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
        {title}
      </h1>

      <div style={{ flex: 1 }} />

      {/* Date */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>{day}</span>
        <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'var(--border-strong)' }} />
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>{date}</span>
      </div>
    </header>
  )
}

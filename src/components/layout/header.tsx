'use client'
import { getDayOfWeek, formatDate } from '@/lib/utils'

interface HeaderProps {
  onMenuClick: () => void
  title?: string
}

export function Header({ onMenuClick, title }: HeaderProps) {
  const today = new Date()
  const day = getDayOfWeek()
  const date = formatDate(today)

  return (
    <header
      style={{
        height: 'var(--header-height)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        position: 'sticky',
        top: 0,
        background: 'var(--bg)',
        zIndex: 30,
        gap: '12px',
      }}
    >
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="md:hidden"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-muted)',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
        }}
        aria-label="Menu openen"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Title / breadcrumb */}
      {title && (
        <h1 style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
          {title}
        </h1>
      )}

      <div style={{ flex: 1 }} />

      {/* Date info */}
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
          {day}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{date}</div>
      </div>
    </header>
  )
}

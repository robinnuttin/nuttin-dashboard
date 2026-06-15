'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useThemeStore } from '@/stores/app-store'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  badge?: string | number
}

const navItems: NavItem[] = [
  {
    href: '/',
    label: 'Dashboard',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: '/financial',
    label: 'Financieel',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    href: '/health',
    label: 'Gezondheid',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    href: '/training',
    label: 'Training',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6.5 6.5h11" /><path d="M17.5 17.5h-11" />
        <path d="M4 9.5v5" /><path d="M20 9.5v5" />
        <path d="M2 11.5v1" /><path d="M22 11.5v1" />
      </svg>
    ),
  },
  {
    href: '/nutrition',
    label: 'Voeding',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
        <line x1="6" y1="1" x2="6" y2="4" />
        <line x1="10" y1="1" x2="10" y2="4" />
        <line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    ),
  },
  {
    href: '/daily',
    label: 'Dagelijks',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    href: '/agenda',
    label: 'Agenda',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    href: '/coach',
    label: 'AI Coach',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    href: '/journal',
    label: 'Journaling',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    href: '/settings',
    label: 'Instellingen',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { theme, toggleTheme } = useThemeStore()

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full z-50 flex flex-col',
          'md:translate-x-0 md:z-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
        style={{
          width: 'var(--sidebar-width)',
          background: 'var(--bg)',
          borderRight: '1px solid var(--border)',
          transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: '16px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '26px',
                height: '26px',
                background: 'var(--text-primary)',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ color: 'var(--bg)', fontSize: '13px', fontWeight: 700 }}>N</span>
            </div>
            <span style={{ fontWeight: 600, fontSize: '14px' }}>Nuttin OS</span>
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '4px',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
            }}
            title={theme === 'dark' ? 'Licht thema' : 'Donker thema'}
          >
            {theme === 'dark' ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '9px',
                  padding: '7px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                  fontWeight: isActive ? 500 : 400,
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  background: isActive ? 'var(--bg-hover)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'background 0.1s ease, color 0.1s ease',
                  marginBottom: '1px',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    ;(e.currentTarget as HTMLAnchorElement).style.background = 'var(--bg-secondary)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    ;(e.currentTarget as HTMLAnchorElement).style.background = 'transparent'
                  }
                }}
              >
                <span style={{ opacity: isActive ? 1 : 0.6, flexShrink: 0 }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    style={{
                      fontSize: '11px',
                      background: 'var(--text-primary)',
                      color: 'var(--bg)',
                      borderRadius: '9999px',
                      padding: '0 6px',
                      minWidth: '18px',
                      textAlign: 'center',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div
          style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--border)',
          }}
        >
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Doel: €10.000 in 2 maanden
          </div>
          <div
            style={{
              marginTop: '6px',
              height: '3px',
              background: 'var(--border)',
              borderRadius: '9999px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: '22%',
                background: 'var(--accent-green-text)',
                borderRadius: '9999px',
                transition: 'width 0.5s ease',
              }}
            />
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '4px',
              fontSize: '11px',
              color: 'var(--text-muted)',
            }}
          >
            <span>€2.200 verdiend</span>
            <span>22%</span>
          </div>
        </div>
      </aside>
    </>
  )
}

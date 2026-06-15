'use client'
import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'green' | 'blue' | 'yellow' | 'red' | 'purple' | 'orange' | 'muted'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md'
}

const variantStyles: Record<BadgeVariant, string> = {
  default: '',
  green: '',
  blue: '',
  yellow: '',
  red: '',
  purple: '',
  orange: '',
  muted: '',
}

export function Badge({ variant = 'default', children, className, size = 'sm' }: BadgeProps) {
  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: '9999px',
    fontWeight: 500,
    letterSpacing: '0.03em',
    fontSize: size === 'sm' ? '11px' : '12px',
    padding: size === 'sm' ? '2px 8px' : '3px 10px',
    lineHeight: 1.5,
  }

  const variantInlineStyles: Record<BadgeVariant, React.CSSProperties> = {
    default: { background: 'var(--bg-secondary)', color: 'var(--text-secondary)' },
    green: { background: 'var(--accent-green-bg)', color: 'var(--accent-green-text)' },
    blue: { background: 'var(--accent-blue-bg)', color: 'var(--accent-blue-text)' },
    yellow: { background: 'var(--accent-yellow-bg)', color: 'var(--accent-yellow-text)' },
    red: { background: 'var(--accent-red-bg)', color: 'var(--accent-red-text)' },
    purple: { background: 'var(--accent-purple-bg)', color: 'var(--accent-purple-text)' },
    orange: { background: 'var(--accent-orange-bg)', color: 'var(--accent-orange-text)' },
    muted: { background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)' },
  }

  return (
    <span
      style={{ ...baseStyle, ...variantInlineStyles[variant] }}
      className={cn(className)}
    >
      {children}
    </span>
  )
}

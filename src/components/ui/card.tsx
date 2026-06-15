'use client'
import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function Card({ children, className, style, onClick, hover = false, padding = 'md' }: CardProps) {
  const paddingMap = { none: '', sm: 'p-3', md: 'p-4', lg: 'p-6' }

  return (
    <div
      onClick={onClick}
      className={cn(
        paddingMap[padding],
        onClick || hover ? 'cursor-pointer' : '',
        className
      )}
      style={{
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
        ...style,
      }}
      onMouseEnter={
        hover || onClick
          ? (e) => {
              ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-sm)'
              ;(e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-strong)'
            }
          : undefined
      }
      onMouseLeave={
        hover || onClick
          ? (e) => {
              ;(e.currentTarget as HTMLDivElement).style.boxShadow = ''
              ;(e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'
            }
          : undefined
      }
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: React.ReactNode
  className?: string
  action?: React.ReactNode
}

export function CardHeader({ children, className, action }: CardHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between mb-4', className)}>
      <div>{children}</div>
      {action && <div className="ml-3 flex-shrink-0">{action}</div>}
    </div>
  )
}

interface CardTitleProps {
  children: React.ReactNode
  className?: string
  subtitle?: string
}

export function CardTitle({ children, className, subtitle }: CardTitleProps) {
  return (
    <div className={className}>
      <h3
        style={{
          fontSize: '13px',
          fontWeight: 500,
          color: 'var(--text-muted)',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          marginBottom: subtitle ? '2px' : '0',
        }}
      >
        {children}
      </h3>
      {subtitle && (
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
          {subtitle}
        </p>
      )}
    </div>
  )
}

export function CardDivider() {
  return <div style={{ height: '1px', background: 'var(--border)', margin: '12px 0' }} />
}

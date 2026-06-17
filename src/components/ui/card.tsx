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
  const paddingMap = { none: '', sm: 'p-3', md: 'p-4 md:p-5', lg: 'p-5 md:p-6' }

  return (
    <div
      onClick={onClick}
      className={cn(
        'transition-shadow',
        paddingMap[padding],
        onClick || hover ? 'cursor-pointer' : '',
        className
      )}
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        ...(onClick || hover ? {} : {}),
        ...style,
      }}
      onMouseEnter={
        hover || onClick
          ? (e) => {
              e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)'
              e.currentTarget.style.borderColor = 'var(--border-strong)'
            }
          : undefined
      }
      onMouseLeave={
        hover || onClick
          ? (e) => {
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.borderColor = 'var(--border)'
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
      <div className="min-w-0 flex-1">{children}</div>
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
      <h3 className="text-caption" style={{ marginBottom: subtitle ? '2px' : '0' }}>
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
  return <div style={{ height: '1px', background: 'var(--border)', margin: '14px 0' }} />
}

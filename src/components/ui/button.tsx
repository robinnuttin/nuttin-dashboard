'use client'
import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: React.ReactNode
  iconRight?: React.ReactNode
}

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: 'var(--text-primary)',
    color: 'var(--bg)',
    border: '1px solid transparent',
  },
  secondary: {
    background: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: '1px solid transparent',
  },
  danger: {
    background: 'var(--accent-red-bg)',
    color: 'var(--accent-red-text)',
    border: '1px solid transparent',
  },
}

const sizeStyles: Record<ButtonSize, { padding: string; fontSize: string; height: string }> = {
  sm: { padding: '0 10px', fontSize: '12px', height: '28px' },
  md: { padding: '0 14px', fontSize: '13px', height: '34px' },
  lg: { padding: '0 20px', fontSize: '14px', height: '40px' },
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', size = 'md', loading, icon, iconRight, children, className, style, disabled, ...props }, ref) => {
    const s = sizeStyles[size]

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn('cursor-pointer select-none', className)}
        style={{
          ...variantStyles[variant],
          ...s,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          borderRadius: 'var(--radius-sm)',
          fontWeight: 500,
          fontFamily: 'var(--font-sans)',
          transition: 'opacity 0.15s ease, transform 0.1s ease',
          opacity: disabled || loading ? 0.5 : 1,
          cursor: disabled || loading ? 'not-allowed' : 'pointer',
          whiteSpace: 'nowrap',
          ...style,
        }}
        onMouseDown={(e) => {
          if (!disabled && !loading) {
            ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.97)'
          }
          props.onMouseDown?.(e)
        }}
        onMouseUp={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.transform = ''
          props.onMouseUp?.(e)
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.transform = ''
          props.onMouseLeave?.(e)
        }}
        {...props}
      >
        {loading ? <Spinner size={size === 'sm' ? 12 : 14} /> : icon}
        {children}
        {!loading && iconRight}
      </button>
    )
  }
)
Button.displayName = 'Button'

function Spinner({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className="animate-spin"
      style={{ flexShrink: 0 }}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.25" />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

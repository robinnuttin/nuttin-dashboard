'use client'
import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
  suffix?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, suffix, className, style, ...props }, ref) => {
    return (
      <div className={cn('flex flex-col gap-1', className)}>
        {label && (
          <label
            style={{
              fontSize: '12px',
              fontWeight: 500,
              color: 'var(--text-muted)',
              letterSpacing: '0.03em',
              textTransform: 'uppercase',
            }}
          >
            {label}
          </label>
        )}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          {icon && (
            <span
              style={{
                position: 'absolute',
                left: '10px',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                pointerEvents: 'none',
              }}
            >
              {icon}
            </span>
          )}
          <input
            ref={ref}
            style={{
              width: '100%',
              height: '34px',
              padding: icon ? '0 10px 0 34px' : suffix ? '0 36px 0 10px' : '0 10px',
              background: 'var(--bg-secondary)',
              border: `1px solid ${error ? 'var(--accent-red-text)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              fontFamily: 'var(--font-sans)',
              outline: 'none',
              transition: 'border-color 0.15s ease',
              ...style,
            }}
            onFocus={(e) => {
              ;(e.currentTarget as HTMLInputElement).style.borderColor = 'var(--border-focus)'
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              ;(e.currentTarget as HTMLInputElement).style.borderColor = error
                ? 'var(--accent-red-text)'
                : 'var(--border)'
              props.onBlur?.(e)
            }}
            {...props}
          />
          {suffix && (
            <span
              style={{
                position: 'absolute',
                right: '10px',
                color: 'var(--text-muted)',
                fontSize: '12px',
              }}
            >
              {suffix}
            </span>
          )}
        </div>
        {error && (
          <span style={{ fontSize: '12px', color: 'var(--accent-red-text)' }}>{error}</span>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, style, ...props }, ref) => {
    return (
      <div className={cn('flex flex-col gap-1', className)}>
        {label && (
          <label
            style={{
              fontSize: '12px',
              fontWeight: 500,
              color: 'var(--text-muted)',
              letterSpacing: '0.03em',
              textTransform: 'uppercase',
            }}
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          style={{
            width: '100%',
            padding: '10px',
            background: 'var(--bg-secondary)',
            border: `1px solid ${error ? 'var(--accent-red-text)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-primary)',
            fontSize: '13px',
            fontFamily: 'var(--font-sans)',
            outline: 'none',
            resize: 'vertical',
            minHeight: '80px',
            lineHeight: 1.6,
            transition: 'border-color 0.15s ease',
            ...style,
          }}
          onFocus={(e) => {
            ;(e.currentTarget as HTMLTextAreaElement).style.borderColor = 'var(--border-focus)'
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            ;(e.currentTarget as HTMLTextAreaElement).style.borderColor = error
              ? 'var(--accent-red-text)'
              : 'var(--border)'
            props.onBlur?.(e)
          }}
          {...props}
        />
        {error && (
          <span style={{ fontSize: '12px', color: 'var(--accent-red-text)' }}>{error}</span>
        )}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'

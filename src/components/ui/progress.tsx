'use client'
import { cn } from '@/lib/utils'

interface ProgressProps {
  value: number // 0-100
  max?: number
  color?: string
  height?: number
  animated?: boolean
  className?: string
  label?: string
  showValue?: boolean
}

export function Progress({
  value,
  max = 100,
  color = 'var(--text-primary)',
  height = 4,
  animated = true,
  className,
  label,
  showValue = false,
}: ProgressProps) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100)

  const getColor = () => {
    if (color !== 'auto') return color
    if (pct >= 90) return 'var(--accent-green-text)'
    if (pct >= 60) return 'var(--accent-blue-text)'
    if (pct >= 30) return 'var(--accent-yellow-text)'
    return 'var(--accent-red-text)'
  }

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div
          className="flex justify-between items-center mb-1.5"
          style={{ fontSize: '12px', color: 'var(--text-muted)' }}
        >
          {label && <span>{label}</span>}
          {showValue && (
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
              {Math.round(pct)}%
            </span>
          )}
        </div>
      )}
      <div
        style={{
          width: '100%',
          height: `${height}px`,
          background: 'var(--border)',
          borderRadius: '9999px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: getColor(),
            borderRadius: '9999px',
            transition: animated ? 'width 0.5s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
          }}
        />
      </div>
    </div>
  )
}

// ─── Multi-segment progress (for macros) ──────────────────────
interface SegmentedProgressProps {
  segments: { value: number; color: string; label?: string }[]
  total: number
  height?: number
  className?: string
}

export function SegmentedProgress({ segments, total, height = 6, className }: SegmentedProgressProps) {
  return (
    <div
      className={cn('flex rounded-full overflow-hidden', className)}
      style={{ height: `${height}px`, background: 'var(--border)', gap: '1px' }}
    >
      {segments.map((seg, i) => {
        const pct = Math.min((seg.value / total) * 100, 100)
        return (
          <div
            key={i}
            style={{
              width: `${pct}%`,
              background: seg.color,
              transition: 'width 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
              minWidth: pct > 0 ? '2px' : '0',
            }}
          />
        )
      })}
    </div>
  )
}

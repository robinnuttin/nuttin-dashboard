import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns'
import { nl } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Date utils ────────────────────────────────────────────────
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  if (isToday(d)) return 'Vandaag'
  if (isYesterday(d)) return 'Gisteren'
  return format(d, 'd MMM yyyy', { locale: nl })
}

export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'HH:mm')
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'd MMM, HH:mm', { locale: nl })
}

export function timeAgo(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return formatDistanceToNow(d, { addSuffix: true, locale: nl })
}

export function getTodayString(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function getDayOfWeek(): string {
  const days = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag']
  return days[new Date().getDay()]
}

// ─── Number utils ──────────────────────────────────────────────
export function formatCurrency(amount: number, currency = '€'): string {
  return `${currency}${amount.toLocaleString('nl-BE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export function formatPercent(value: number, total: number): number {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

export function clampPercent(value: number): number {
  return Math.min(Math.max(value, 0), 100)
}

// ─── Color utils ───────────────────────────────────────────────
export function getProgressColor(pct: number): string {
  if (pct >= 90) return 'var(--accent-green-text)'
  if (pct >= 60) return 'var(--accent-blue-text)'
  if (pct >= 30) return 'var(--accent-yellow-text)'
  return 'var(--accent-red-text)'
}

export function getBadgeVariant(value: number, target: number): 'green' | 'blue' | 'yellow' | 'red' {
  const pct = formatPercent(value, target)
  if (pct >= 90) return 'green'
  if (pct >= 60) return 'blue'
  if (pct >= 30) return 'yellow'
  return 'red'
}

// ─── BMI / body utils ─────────────────────────────────────────
export function estimateBMI(weight: number, height = 1.91): number {
  return Math.round((weight / (height * height)) * 10) / 10
}

export function estimateMuscleMass(weight: number, bodyFatPct: number): number {
  return Math.round((weight * (1 - bodyFatPct / 100)) * 10) / 10
}

// ─── Nutrition utils ──────────────────────────────────────────
export function getNutritionGoals(isTrainingDay: boolean) {
  return {
    target_calories: isTrainingDay ? 2800 : 2600,
    target_protein: 210,
    target_carbs: isTrainingDay ? 320 : 280,
    target_fat: 85,
  }
}

// ─── Training utils ───────────────────────────────────────────
const TRAINING_SCHEDULE: Record<number, string> = {
  1: 'Push', // Monday
  2: 'Pull', // Tuesday
  3: 'Cardio', // Wednesday
  4: 'Legs', // Thursday
  5: 'Upper Body', // Friday
  6: 'Cardio', // Saturday
  0: 'Rust', // Sunday
}

export function getTodayWorkout(): string {
  return TRAINING_SCHEDULE[new Date().getDay()] || 'Rust'
}

export function isTrainingDay(): boolean {
  const day = new Date().getDay()
  return day !== 0 && day !== 3 && day !== 6 // not sunday, not cardio days
}

// ─── Local storage (with SSR guard) ───────────────────────────
export function getLocalStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : fallback
  } catch {
    return fallback
  }
}

export function setLocalStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(value))
}

// ─── Deal stage labels ─────────────────────────────────────────
export const DEAL_STAGE_LABELS: Record<string, string> = {
  lead: 'Lead',
  appointment: 'Afspraak',
  proposal: 'Voorstel',
  negotiation: 'Onderhandeling',
  won: 'Gewonnen',
  lost: 'Verloren',
}

export const DEAL_STAGE_COLORS: Record<string, string> = {
  lead: 'var(--accent-blue-text)',
  appointment: 'var(--accent-purple-text)',
  proposal: 'var(--accent-yellow-text)',
  negotiation: 'var(--accent-orange-text)',
  won: 'var(--accent-green-text)',
  lost: 'var(--accent-red-text)',
}

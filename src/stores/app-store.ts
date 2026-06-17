import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ─── Theme ────────────────────────────────────────────────────────
interface ThemeStore {
  theme: 'dark' | 'light'
  toggleTheme: () => void
  setTheme: (t: 'dark' | 'light') => void
}
export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'dark',
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      setTheme: (t) => set({ theme: t }),
    }),
    { name: 'theme' }
  )
)

// ─── Supplements ─────────────────────────────────────────────────
export interface Supplement {
  id: string
  name: string
  dose: string
  timing: string
  active: boolean
  notes?: string
}
interface SupplementsStore {
  supplements: Supplement[]
  toggle: (id: string) => void
  update: (id: string, patch: Partial<Supplement>) => void
  add: (s: Supplement) => void
  remove: (id: string) => void
  setAll: (supplements: Supplement[]) => void
}
export const useSupplementsStore = create<SupplementsStore>()(
  persist(
    (set) => ({
      supplements: [
        { id: 'creatine',  name: 'Creatine',    dose: '5g',     timing: 'morning',      active: true },
        { id: 'vitd',      name: 'Vitamine D3', dose: '2000IU', timing: 'morning',      active: true },
        { id: 'magnesium', name: 'Magnesium',   dose: '400mg',  timing: 'evening',      active: true },
        { id: 'zinc',      name: 'Zink',        dose: '25mg',   timing: 'evening',      active: true },
        { id: 'b12',       name: 'B12',         dose: '1000mcg',timing: 'morning',      active: true },
        { id: 'calcium',   name: 'Calcium',     dose: '500mg',  timing: 'evening',      active: false },
        { id: 'omega3',    name: 'Omega-3',     dose: '2g',     timing: 'post-workout', active: false },
      ],
      toggle: (id) => set((s) => ({ supplements: s.supplements.map((x) => x.id === id ? { ...x, active: !x.active } : x) })),
      update: (id, patch) => set((s) => ({ supplements: s.supplements.map((x) => x.id === id ? { ...x, ...patch } : x) })),
      add: (sup) => set((s) => ({ supplements: [...s.supplements, sup] })),
      remove: (id) => set((s) => ({ supplements: s.supplements.filter((x) => x.id !== id) })),
      setAll: (supplements) => set({ supplements }),
    }),
    { name: 'supplements' }
  )
)

// ─── Training ─────────────────────────────────────────────────────
export type MuscleGroup = 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps' | 'legs' | 'glutes' | 'core' | 'cardio'
export interface WorkoutSet { weight: number; reps: number; completed: boolean }
export interface WorkoutExercise { name: string; muscleGroups: MuscleGroup[]; sets: WorkoutSet[] }
export interface WorkoutLog {
  id: string
  date: string
  type: string
  exercises: WorkoutExercise[]
  notes?: string
  durationMin?: number
}
export interface TrainingPlan {
  mon: string; tue: string; wed: string; thu: string; fri: string; sat: string; sun: string
}
interface TrainingStore {
  plan: TrainingPlan
  logs: WorkoutLog[]
  setPlan: (p: TrainingPlan) => void
  addLog: (log: WorkoutLog) => void
  getLastWorked: () => Record<MuscleGroup, string | null>
}
export const useTrainingStore = create<TrainingStore>()(
  persist(
    (set, get) => ({
      plan: { mon: 'Push', tue: 'Pull', wed: 'Legs', thu: 'Rest', fri: 'Upper', sat: 'Cardio', sun: 'Rest' },
      logs: [],
      setPlan: (p) => set({ plan: p }),
      addLog: (log) => set((s) => ({ logs: [log, ...s.logs].slice(0, 90) })),
      getLastWorked: () => {
        const result: Record<MuscleGroup, string | null> = {
          chest: null, back: null, shoulders: null, biceps: null,
          triceps: null, legs: null, glutes: null, core: null, cardio: null,
        }
        for (const log of get().logs) {
          for (const ex of log.exercises) {
            for (const mg of (ex.muscleGroups || [])) {
              if (!result[mg]) result[mg] = log.date
            }
          }
        }
        return result
      },
    }),
    { name: 'training-v2' }
  )
)

// ─── Nutrition ────────────────────────────────────────────────────
export interface FoodEntry {
  id: string; time: string; description: string
  calories: number; protein_g: number; carbs_g: number; fat_g: number; fiber_g: number
}
export interface NutritionGoal { calories: number; protein_g: number; carbs_g: number; fat_g: number }
interface NutritionStore {
  days: Record<string, { entries: FoodEntry[]; goal: NutritionGoal }>
  addEntry: (date: string, entry: FoodEntry) => void
  removeEntry: (date: string, id: string) => void
  getTotals: (date: string) => NutritionGoal
  getEntries: (date: string) => FoodEntry[]
}
export const useNutritionStore = create<NutritionStore>()(
  persist(
    (set, get) => ({
      days: {},
      addEntry: (date, entry) => set((s) => {
        const day = s.days[date] || { entries: [], goal: { calories: 2700, protein_g: 210, carbs_g: 270, fat_g: 80 } }
        return { days: { ...s.days, [date]: { ...day, entries: [...day.entries, entry] } } }
      }),
      removeEntry: (date, id) => set((s) => {
        const day = s.days[date]; if (!day) return s
        return { days: { ...s.days, [date]: { ...day, entries: day.entries.filter((e) => e.id !== id) } } }
      }),
      getTotals: (date) => {
        const day = get().days[date]
        if (!day) return { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
        return day.entries.reduce((a, e) => ({
          calories: a.calories + e.calories, protein_g: a.protein_g + e.protein_g,
          carbs_g: a.carbs_g + e.carbs_g, fat_g: a.fat_g + e.fat_g,
        }), { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 })
      },
      getEntries: (date) => get().days[date]?.entries || [],
    }),
    { name: 'nutrition-v2' }
  )
)

// ─── Daily record ─────────────────────────────────────────────────
export interface DayRecord {
  date: string
  wokeOnTime: boolean
  sleptOnTime: boolean
  supplementsTaken: boolean
  trainingDone: boolean
  prayersDone: number
  sauna: boolean
  journaled: boolean
  priorities: string[]
  prioritiesDone: boolean[]
  mood: number
  notes: string
}
interface DailyStore {
  records: Record<string, DayRecord>
  getOrCreate: (date: string) => DayRecord
  update: (date: string, patch: Partial<DayRecord>) => void
  toggle: (date: string, field: keyof Pick<DayRecord, 'wokeOnTime' | 'sleptOnTime' | 'supplementsTaken' | 'trainingDone' | 'sauna' | 'journaled'>) => void
  setPriorities: (date: string, p: string[]) => void
}
export const useDailyStore = create<DailyStore>()(
  persist(
    (set, get) => ({
      records: {},
      getOrCreate: (date) => {
        if (get().records[date]) return get().records[date]
        const r: DayRecord = { date, wokeOnTime: false, sleptOnTime: false, supplementsTaken: false, trainingDone: false, prayersDone: 0, sauna: false, journaled: false, priorities: [], prioritiesDone: [], mood: 5, notes: '' }
        set((s) => ({ records: { ...s.records, [date]: r } }))
        return r
      },
      update: (date, patch) => set((s) => {
        const rec = s.records[date] || get().getOrCreate(date)
        return { records: { ...s.records, [date]: { ...rec, ...patch } } }
      }),
      toggle: (date, field) => set((s) => {
        const rec = s.records[date] || get().getOrCreate(date)
        return { records: { ...s.records, [date]: { ...rec, [field]: !rec[field as keyof DayRecord] } } }
      }),
      setPriorities: (date, p) => set((s) => {
        const rec = s.records[date] || get().getOrCreate(date)
        return { records: { ...s.records, [date]: { ...rec, priorities: p, prioritiesDone: p.map(() => false) } } }
      }),
    }),
    { name: 'daily-v2' }
  )
)

// ─── Prayer ───────────────────────────────────────────────────────
export type PrayerName = 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha'
type PrayerDay = Record<PrayerName, boolean>
interface PrayerStore {
  done: Record<string, PrayerDay>
  toggle: (date: string, prayer: PrayerName) => void
  getCount: (date: string) => number
  getDay: (date: string) => PrayerDay
}
export const usePrayerStore = create<PrayerStore>()(
  persist(
    (set, get) => ({
      done: {},
      toggle: (date, prayer) => set((s) => {
        const day = s.done[date] || { Fajr: false, Dhuhr: false, Asr: false, Maghrib: false, Isha: false }
        return { done: { ...s.done, [date]: { ...day, [prayer]: !day[prayer] } } }
      }),
      getCount: (date) => {
        const day = get().done[date]; if (!day) return 0
        return Object.values(day).filter(Boolean).length
      },
      getDay: (date) => get().done[date] || { Fajr: false, Dhuhr: false, Asr: false, Maghrib: false, Isha: false },
    }),
    { name: 'prayer-v2' }
  )
)

// ─── Financial ────────────────────────────────────────────────────
export interface Deal {
  id: string; name: string; contact: string
  value_bruto: number; value_netto: number
  stage: 'lead' | 'contact' | 'proposal' | 'negotiation' | 'won' | 'lost'
  type: 'website' | 'crm' | 'review_card' | 'other'
  notes?: string; created_at: string; closed_at?: string
}
export interface RecurringCost {
  id: string; name: string; amount: number
  frequency: 'monthly' | 'weekly' | 'yearly'
  category: string; next_due?: string
}
export interface FutureCost {
  id: string; name: string; amount: number; due_date: string; category: string; paid: boolean
}
export interface IncomeEntry {
  id: string; date: string; amount: number; source: string; description: string
}
interface FinancialStore {
  deals: Deal[]
  recurringCosts: RecurringCost[]
  futureCosts: FutureCost[]
  income: IncomeEntry[]
  cashBalance: number
  monthlyGoal: number
  addDeal: (d: Deal) => void
  updateDeal: (id: string, patch: Partial<Deal>) => void
  removeDeal: (id: string) => void
  addRecurringCost: (c: RecurringCost) => void
  removeRecurringCost: (id: string) => void
  addFutureCost: (c: FutureCost) => void
  markFutureCostPaid: (id: string) => void
  removeFutureCost: (id: string) => void
  addIncome: (e: IncomeEntry) => void
  setCashBalance: (n: number) => void
  setMonthlyGoal: (n: number) => void
  getMonthlyExpenses: () => number
  getMonthlyIncome: () => number
}
export const useFinancialStore = create<FinancialStore>()(
  persist(
    (set, get) => ({
      deals: [], recurringCosts: [], futureCosts: [], income: [],
      cashBalance: 0, monthlyGoal: 2000,
      addDeal: (d) => set((s) => ({ deals: [d, ...s.deals] })),
      updateDeal: (id, patch) => set((s) => ({ deals: s.deals.map((d) => d.id === id ? { ...d, ...patch } : d) })),
      removeDeal: (id) => set((s) => ({ deals: s.deals.filter((d) => d.id !== id) })),
      addRecurringCost: (c) => set((s) => ({ recurringCosts: [...s.recurringCosts, c] })),
      removeRecurringCost: (id) => set((s) => ({ recurringCosts: s.recurringCosts.filter((c) => c.id !== id) })),
      addFutureCost: (c) => set((s) => ({ futureCosts: [...s.futureCosts, c] })),
      markFutureCostPaid: (id) => set((s) => ({ futureCosts: s.futureCosts.map((c) => c.id === id ? { ...c, paid: true } : c) })),
      removeFutureCost: (id) => set((s) => ({ futureCosts: s.futureCosts.filter((c) => c.id !== id) })),
      addIncome: (e) => set((s) => ({ income: [e, ...s.income] })),
      setCashBalance: (n) => set({ cashBalance: n }),
      setMonthlyGoal: (n) => set({ monthlyGoal: n }),
      getMonthlyExpenses: () => get().recurringCosts.reduce((sum, c) => {
        if (c.frequency === 'monthly') return sum + c.amount
        if (c.frequency === 'weekly') return sum + c.amount * 4.33
        if (c.frequency === 'yearly') return sum + c.amount / 12
        return sum
      }, 0),
      getMonthlyIncome: () => {
        const now = new Date()
        const m = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
        return get().income.filter((e) => e.date.startsWith(m)).reduce((s, e) => s + e.amount, 0)
      },
    }),
    { name: 'financial-v2' }
  )
)

// ─── Journal ──────────────────────────────────────────────────────
export interface JournalEntry { date: string; content: string; mood: number; aiSummary?: string }
interface JournalStore {
  entries: Record<string, JournalEntry>
  save: (date: string, e: JournalEntry) => void
  get: (date: string) => JournalEntry | null
}
export const useJournalStore = create<JournalStore>()(
  persist(
    (set, get) => ({
      entries: {},
      save: (date, e) => set((s) => ({ entries: { ...s.entries, [date]: e } })),
      get: (date) => get().entries[date] || null,
    }),
    { name: 'journal-v2' }
  )
)

// ─── Body stats ───────────────────────────────────────────────────
export interface BodyMeasurement { date: string; weight_kg: number; body_fat_pct?: number; notes?: string }
interface BodyStore {
  measurements: BodyMeasurement[]
  add: (m: BodyMeasurement) => void
  latest: () => BodyMeasurement | null
}
export const useBodyStore = create<BodyStore>()(
  persist(
    (set, get) => ({
      measurements: [],
      add: (m) => set((s) => ({ measurements: [m, ...s.measurements].slice(0, 365) })),
      latest: () => get().measurements[0] || null,
    }),
    { name: 'body-v2' }
  )
)

// ─── AI Coach ─────────────────────────────────────────────────────
export interface CoachMessage {
  id: string; role: 'user' | 'assistant'; content: string; timestamp: string
  actions?: { type: string; description: string; payload: Record<string, unknown> }[]
}
interface CoachStore {
  messages: CoachMessage[]
  addMessage: (m: CoachMessage) => void
  clearHistory: () => void
}
export const useCoachStore = create<CoachStore>()(
  persist(
    (set) => ({
      messages: [],
      addMessage: (m) => set((s) => ({ messages: [...s.messages, m].slice(-100) })),
      clearHistory: () => set({ messages: [] }),
    }),
    { name: 'coach-v2' }
  )
)

// ─── Agenda ───────────────────────────────────────────────────────
export interface AppEntry {
  id: string; title: string; start: string; end: string
  type: 'sales' | 'review_card' | 'david' | 'job' | 'personal' | 'family' | 'sauna' | 'other'
  contact?: string; phone?: string; notes?: string
  source: 'manual' | 'ghl' | 'google' | 'whatsapp'
  followUpDone?: boolean
}
interface AgendaStore {
  entries: AppEntry[]
  add: (e: AppEntry) => void
  update: (id: string, patch: Partial<AppEntry>) => void
  remove: (id: string) => void
  getDay: (date: string) => AppEntry[]
  getRange: (start: string, end: string) => AppEntry[]
}
export const useAgendaStore = create<AgendaStore>()(
  persist(
    (set, get) => ({
      entries: [],
      add: (e) => set((s) => ({ entries: [...s.entries, e] })),
      update: (id, patch) => set((s) => ({ entries: s.entries.map((e) => e.id === id ? { ...e, ...patch } : e) })),
      remove: (id) => set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),
      getDay: (date) => get().entries.filter((e) => e.start.startsWith(date)),
      getRange: (start, end) => get().entries.filter((e) => e.start >= start && e.start <= end + 'T23:59'),
    }),
    { name: 'agenda-v2' }
  )
)

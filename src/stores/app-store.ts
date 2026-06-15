'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { BodyStats, FoodLog, DailyPriorities, ChecklistItem, PrayerLog } from '@/types'
import { getTodayString } from '@/lib/utils'

// ─── Theme Store ──────────────────────────────────────────────
interface ThemeStore {
  theme: 'light' | 'dark'
  toggleTheme: () => void
  setTheme: (t: 'light' | 'dark') => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'dark',
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'theme' }
  )
)

// ─── Body Stats Store ─────────────────────────────────────────
interface BodyStatsStore {
  entries: BodyStats[]
  addEntry: (entry: BodyStats) => void
  latestStats: () => BodyStats | null
}

export const useBodyStatsStore = create<BodyStatsStore>()(
  persist(
    (set, get) => ({
      entries: [
        {
          id: '1',
          date: getTodayString(),
          weight_kg: 87,
          body_fat_pct: 19,
          muscle_mass_kg: 70.5,
          notes: 'Startmeting',
        },
      ],
      addEntry: (entry) => set((s) => ({ entries: [entry, ...s.entries] })),
      latestStats: () => {
        const e = get().entries
        return e.length > 0 ? e[0] : null
      },
    }),
    { name: 'body-stats' }
  )
)

// ─── Nutrition Store ──────────────────────────────────────────
interface NutritionStore {
  todayLogs: FoodLog[]
  addFoodLog: (log: FoodLog) => void
  removeFoodLog: (id: string) => void
  clearToday: () => void
  getTotals: () => { calories: number; protein_g: number; carbs_g: number; fat_g: number; fiber_g: number }
}

export const useNutritionStore = create<NutritionStore>()(
  persist(
    (set, get) => ({
      todayLogs: [],
      addFoodLog: (log) => set((s) => ({ todayLogs: [...s.todayLogs, log] })),
      removeFoodLog: (id) => set((s) => ({ todayLogs: s.todayLogs.filter((l) => l.id !== id) })),
      clearToday: () => set({ todayLogs: [] }),
      getTotals: () => {
        const logs = get().todayLogs
        return logs.reduce(
          (acc, l) => ({
            calories: acc.calories + l.calories,
            protein_g: acc.protein_g + l.protein_g,
            carbs_g: acc.carbs_g + l.carbs_g,
            fat_g: acc.fat_g + l.fat_g,
            fiber_g: acc.fiber_g + l.fiber_g,
          }),
          { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 }
        )
      },
    }),
    { name: 'nutrition' }
  )
)

// ─── Checklist Store ──────────────────────────────────────────
interface ChecklistStore {
  items: ChecklistItem[]
  initToday: () => void
  toggle: (id: string) => void
}

const DEFAULT_CHECKLIST_ITEMS = [
  { item: 'Naar gym geweest', category: 'health' as const },
  { item: 'Supplementen genomen', category: 'health' as const },
  { item: 'Creatine 5g', category: 'health' as const },
  { item: 'Magnesium voor slapen', category: 'health' as const },
  { item: 'Voldoende water (3L)', category: 'health' as const },
  { item: 'White strips gedaan', category: 'appearance' as const },
  { item: 'Gezichtsoefeningen', category: 'appearance' as const },
  { item: '3 prioriteiten morgen ingevoerd', category: 'personal' as const },
  { item: 'Journaling', category: 'personal' as const },
  { item: 'E-mails verstuurd (campagne)', category: 'business' as const },
  { item: 'Sollicitaties bijgehouden', category: 'business' as const },
  { item: 'Schermtijd onder controle', category: 'personal' as const },
]

export const useChecklistStore = create<ChecklistStore>()(
  persist(
    (set, get) => ({
      items: [],
      initToday: () => {
        const today = getTodayString()
        const existing = get().items.filter((i) => i.date === today)
        if (existing.length > 0) return
        const newItems: ChecklistItem[] = DEFAULT_CHECKLIST_ITEMS.map((d, idx) => ({
          id: `${today}-${idx}`,
          date: today,
          item: d.item,
          category: d.category,
          completed: false,
        }))
        set((s) => ({ items: [...newItems, ...s.items.filter((i) => i.date !== today)] }))
      },
      toggle: (id) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.id === id
              ? { ...i, completed: !i.completed, completed_at: !i.completed ? new Date().toISOString() : undefined }
              : i
          ),
        })),
    }),
    { name: 'checklist' }
  )
)

// ─── Prayer Store ─────────────────────────────────────────────
interface PrayerStore {
  logs: PrayerLog[]
  togglePrayer: (date: string, prayer: string) => void
  getTodayLogs: () => PrayerLog[]
}

export const usePrayerStore = create<PrayerStore>()(
  persist(
    (set, get) => ({
      logs: [],
      togglePrayer: (date, prayer_name) => {
        const logs = get().logs
        const existing = logs.find((l) => l.date === date && l.prayer_name === prayer_name)
        if (existing) {
          set((s) => ({
            logs: s.logs.map((l) =>
              l.date === date && l.prayer_name === prayer_name
                ? { ...l, completed: !l.completed }
                : l
            ),
          }))
        } else {
          set((s) => ({
            logs: [
              ...s.logs,
              {
                id: `${date}-${prayer_name}`,
                date,
                prayer_name: prayer_name as PrayerLog['prayer_name'],
                completed: true,
                time_completed: new Date().toISOString(),
              },
            ],
          }))
        }
      },
      getTodayLogs: () => {
        const today = getTodayString()
        return get().logs.filter((l) => l.date === today)
      },
    }),
    { name: 'prayer' }
  )
)

// ─── Priorities Store ─────────────────────────────────────────
interface PrioritiesStore {
  priorities: DailyPriorities[]
  setToday: (p1: string, p2: string, p3: string) => void
  getToday: () => DailyPriorities | null
}

export const usePrioritiesStore = create<PrioritiesStore>()(
  persist(
    (set, get) => ({
      priorities: [],
      setToday: (p1, p2, p3) => {
        const today = getTodayString()
        const entry: DailyPriorities = {
          id: today,
          date: today,
          priority_1: p1,
          priority_2: p2,
          priority_3: p3,
          set_via_whatsapp: false,
        }
        set((s) => ({
          priorities: [entry, ...s.priorities.filter((p) => p.date !== today)],
        }))
      },
      getToday: () => {
        const today = getTodayString()
        return get().priorities.find((p) => p.date === today) || null
      },
    }),
    { name: 'priorities' }
  )
)

// ─── Financial Store ──────────────────────────────────────────
interface FinancialStore {
  balance: number
  updateBalance: (amount: number) => void
}

export const useFinancialStore = create<FinancialStore>()(
  persist(
    (set) => ({
      balance: 0,
      updateBalance: (amount) => set({ balance: amount }),
    }),
    { name: 'financial' }
  )
)

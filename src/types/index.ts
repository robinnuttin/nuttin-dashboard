// ─── Financial Types ───────────────────────────────────────────
export type DealStage = 'lead' | 'appointment' | 'proposal' | 'negotiation' | 'won' | 'lost'

export interface Deal {
  id: string
  title: string
  client: string
  value_gross: number
  value_net: number
  stage: DealStage
  created_at: string
  closed_at?: string
  notes?: string
  type: 'crm' | 'website' | 'other'
}

export interface EmailCampaign {
  id: string
  name: string
  emails_sent: number
  total_emails: number
  appointments: number
  deals_closed: number
  date: string
}

export type ReviewCardPackage = 'basic' | 'premium'

export interface ReviewCard {
  id: string
  business_name: string
  package_type: ReviewCardPackage
  price: number
  second_card?: boolean
  sold_at: string
  location: string
  notes?: string
}

export interface Transaction {
  id: string
  type: 'income' | 'expense'
  amount_gross: number
  amount_net: number
  description: string
  category: string
  date: string
  source: 'deal' | 'review_card' | 'job' | 'inboedel' | 'b2b' | 'other'
}

export interface FixedCost {
  id: string
  name: string
  amount: number
  frequency: 'monthly' | 'yearly' | 'weekly'
  category: string
  next_due: string
}

// ─── Health Types ───────────────────────────────────────────────
export interface BodyStats {
  id: string
  date: string
  weight_kg: number
  body_fat_pct: number
  muscle_mass_kg?: number
  notes?: string
}

export interface SleepLog {
  id: string
  date: string
  sleep_time: string
  wake_time: string
  duration_hours: number
  quality_score: number // 1-10
  notes?: string
}

export interface HealthSync {
  id: string
  date: string
  steps: number
  heart_rate_avg?: number
  active_calories?: number
  source: 'apple_watch' | 'manual' | 'shortcut'
}

// ─── Training Types ─────────────────────────────────────────────
export type WorkoutType = 'push' | 'pull' | 'legs' | 'upper' | 'cardio' | 'rest'

export interface Workout {
  id: string
  date: string
  type: WorkoutType
  duration_min?: number
  notes?: string
  sets: WorkoutSet[]
}

export interface WorkoutSet {
  id: string
  workout_id: string
  exercise: string
  weight_kg: number
  reps: number
  set_number: number
}

export type CardioType = 'long_run' | 'short_run' | 'zone2' | 'interval'

export interface CardioSession {
  id: string
  date: string
  type: CardioType
  distance_km: number
  duration_min: number
  avg_heart_rate?: number
}

// ─── Nutrition Types ────────────────────────────────────────────
export type MealType = 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'late_snack'

export interface FoodLog {
  id: string
  date: string
  meal_type: MealType
  description: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  fiber_g: number
  logged_at: string
}

export interface DailyNutritionGoal {
  target_calories: number
  target_protein: number
  target_carbs: number
  target_fat: number
}

export interface NutritionSummary {
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  fiber_g: number
  goal: DailyNutritionGoal
}

// ─── Supplement Types ───────────────────────────────────────────
export interface SupplementLog {
  id: string
  date: string
  supplement: string
  taken: boolean
  taken_at?: string
}

// ─── Daily / Checklist Types ────────────────────────────────────
export interface ChecklistItem {
  id: string
  date: string
  item: string
  category: 'health' | 'business' | 'faith' | 'appearance' | 'personal'
  completed: boolean
  completed_at?: string
}

export interface PrayerLog {
  id: string
  date: string
  prayer_name: PrayerName
  completed: boolean
  time_completed?: string
}

export type PrayerName = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'

export interface PrayerTimes {
  fajr: string
  sunrise: string
  dhuhr: string
  asr: string
  maghrib: string
  isha: string
}

export interface DailyPriorities {
  id: string
  date: string
  priority_1: string
  priority_2: string
  priority_3: string
  set_via_whatsapp: boolean
}

export interface JournalEntry {
  id: string
  date: string
  content: string
  mood: number // 1-10
  tags: string[]
}

// ─── Agenda / CRM Types ─────────────────────────────────────────
export type AppointmentType = 'sales_meeting' | 'review_card_session' | 'david_meeting' | 'job_interview' | 'other'

export interface Appointment {
  id: string
  ghl_id?: string
  title: string
  start_time: string
  end_time: string
  contact_name: string
  contact_phone?: string
  type: AppointmentType
  notes?: string
  location?: string
}

export interface FollowUp {
  id: string
  contact_name: string
  contact_phone?: string
  follow_up_date: string
  reason: string
  completed: boolean
  ghl_id?: string
  priority: 'high' | 'medium' | 'low'
}

// ─── AI Types ───────────────────────────────────────────────────
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: string
}

export interface DailyAnalysis {
  id: string
  date: string
  what_went_well: string
  what_to_improve: string
  top_priority: string
  score: number // 1-100
  full_analysis: string
}

// ─── Appearance Types ───────────────────────────────────────────
export interface AppearanceTask {
  id: string
  name: string
  description?: string
  frequency_days: number
  last_done?: string
  next_due: string
  category: 'teeth' | 'face' | 'body' | 'grooming'
}

// ─── Dashboard Summary ──────────────────────────────────────────
export interface DashboardSummary {
  financial: {
    deals_won: number
    deals_pipeline: number
    revenue_gross: number
    revenue_net: number
    goal_progress_pct: number
    review_cards_sold: number
    review_cards_revenue: number
  }
  health: {
    weight_kg: number
    body_fat_pct: number
    avg_sleep_hours: number
    steps_today: number
    training_streak: number
    discipline_score: number
  }
  today: {
    checklist_completed: number
    checklist_total: number
    prayers_completed: number
    nutrition_calories: number
    priorities: string[]
    appointments_today: number
  }
}

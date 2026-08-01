// Mirrors supabase/schema.sql — keep in sync when the schema changes.

export type PaymentStatus = 'pending' | 'partially_paid' | 'paid'
export type AdjustmentType = 'none' | 'deduction' | 'bonus'
export type AttachmentType = 'ECG' | 'Echo' | 'CXR' | 'CT' | 'MRI' | 'Angio' | 'Lab' | 'Other'
export type AsaClass = 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI'
export type EntryMode = 'quick' | 'advanced'

export interface Profile {
  id: string
  full_name: string | null
  email: string | null
  avatar_url: string | null
  specialty: string | null
  theme_preference: 'light' | 'dark' | 'system'
}

export interface Facility {
  id: string
  owner_id: string
  name: string
  default_deduction_percentage: number
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Patient {
  id: string
  owner_id: string
  full_name: string
  file_number: string
  notes: string | null
  created_at: string
  updated_at: string
}

export interface ClinicalTag {
  id: string
  owner_id: string
  label: string
  is_high_risk: boolean
  is_default: boolean
}

export interface Case {
  id: string
  owner_id: string
  patient_id: string | null
  patient_full_name: string
  file_number: string
  case_date: string
  facility_id: string | null
  procedure_name: string
  surgeon: string | null
  diagnosis: string | null
  medical_history: string | null
  asa: AsaClass | null
  airway: string | null
  anesthesia_type: string | null
  notes: string | null
  complications: string | null
  tags: string[]
  research_labels: string[]
  is_high_risk: boolean
  high_risk_reasons: string[]
  revenue: number | null
  entry_mode: EntryMode
  completion_score: number
  created_at: string
  updated_at: string
  // joined
  facility?: Pick<Facility, 'id' | 'name'> | null
}

export interface CaseRevenue {
  id: string
  owner_id: string
  case_id: string
  basic_fee: number
  adjustment_type: AdjustmentType
  adjustment_percentage: number
  final_revenue: number
  payment_status: PaymentStatus
  amount_paid: number
  paid_at: string | null
}

export interface Attachment {
  id: string
  owner_id: string
  case_id: string
  type: AttachmentType
  storage_path: string
  file_name: string
  clinically_important_finding: string
  created_at: string
}

export interface ResearchCollection {
  id: string
  owner_id: string
  name: string
  description: string | null
  filters: ResearchFilters
  is_default: boolean
}

export interface ResearchFilters {
  facility_id?: string
  surgeon?: string
  procedure_contains?: string
  specialty?: string
  asa?: AsaClass[]
  diagnosis_contains?: string
  medical_history_contains?: string
  anesthesia_type?: string
  complications_contains?: string
  tags?: string[]
  high_risk_only?: boolean
  date_from?: string
  date_to?: string
}

export const ASA_OPTIONS: AsaClass[] = ['I', 'II', 'III', 'IV', 'V', 'VI']

export const ANESTHESIA_OPTIONS = [
  'General', 'Spinal', 'Epidural', 'CSE', 'MAC', 'Sedation', 'Regional', 'Local',
]

export const ATTACHMENT_TYPES: AttachmentType[] = [
  'ECG', 'Echo', 'CXR', 'CT', 'MRI', 'Angio', 'Lab', 'Other',
]

export const DEFAULT_CLINICAL_TAGS = [
  'Cardiac Patient',
  'Cardiac Patient For Non Cardiac Surgery',
  'Pulmonary Hypertension',
  'CKD',
  'ESRD',
  'Pregnancy',
  'Pediatric',
  'Neonate',
  'Difficult Airway',
]

export const DEFAULT_HIGH_RISK_LABELS = [
  'Cardiac High Risk',
  'Pulmonary High Risk',
  'Infectious Risk',
  'Difficult Airway',
]

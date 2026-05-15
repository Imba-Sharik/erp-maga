export type ProjectStatus = 'confirmed' | 'signed' | 'expenses'

export type ProjectBackOrigin = {
  to: string
  label: string
}

/** Воронка до мероприятия (формы и канбан «Проекты»). */
export type PreprojectStage = 'plum_request' | 'first_contact' | 'calc_ready' | 'signed' | 'ready'

/**
 * Этапы закрытия после проведения (канбан «Закрытие»).
 * По API `feedback_received` не показывается — при маппинге сразу приводится к `data_confirmed`.
 */
export type ClosingStage =
  | 'event_held'
  | 'expenses_entered'
  | 'documents_confirmed'
  | 'data_confirmed'
  | 'bonus_calculated'
  | 'bonus_approved'
  | 'closed'

export type ProjectStage = PreprojectStage | ClosingStage

export interface Project {
  id: string
  title: string
  date: string
  status: ProjectStatus
  stage: ProjectStage
  city: string
  loft: string
  hall: string
  manager: string
  type: string
  company: string
  phone: string
  email: string
  plumCardUrl: string
  lastUpdate: string
}

export type ContractType = 'with_vat' | 'without_vat'
export type ContactChannel = 'messenger' | 'phone' | 'email' | 'meeting'
export type PlumStatus = 'pending' | 'confirmed'

export interface StageFormData {
  client?: string
  phone?: string
  email?: string
  contactPerson?: string
  createdAt?: string

  contactComment?: string
  contactChannel?: ContactChannel
  contactedAt?: string

  calcComment?: string

  contractType?: ContractType
  contractNumber?: string
  contractDate?: string
  legalEntity?: string
  contractComment?: string
}

export interface StageHistoryEntry {
  stage: ProjectStage
  enteredAt: string
  managerName: string
  data: Partial<StageFormData>
}

export interface ProjectFinance {
  sales: number | null
  expenses: number | null
  bonuses: number | null
  netProfit: number | null
}

export interface ProjectDetail extends Project {
  enteredSystemAt: string
  history: StageHistoryEntry[]
  plumId: string
  plumStatus: PlumStatus
  plumComment?: string
  plumSyncedAt?: string
  clientCompany: string
  clientStatus: PlumStatus
  finance: ProjectFinance
}

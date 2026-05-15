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

export type StageFunnel = 'pre_project' | 'closing'

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
export type ContactChannel = 'messenger' | 'phone' | 'meeting'
export type PlumStatus = 'pending' | 'confirmed'

export type DocumentStatus = 'present' | 'absent' | 'not_required'
export type EventReadiness = 'ready' | 'not_ready'

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

  // event_held
  postEventComment?: string
  eventDate?: string
  closingFunnelEnteredAt?: string
  eventReadiness?: EventReadiness

  // documents_confirmed
  projectDocsStatus?: DocumentStatus
  projectDocsConfirmedAt?: string
  projectDocsConfirmedBy?: string
  subleaseDocsStatus?: DocumentStatus
  subleaseDocsConfirmedAt?: string
  subleaseDocsConfirmedBy?: string
  staffReceiptsStatus?: DocumentStatus
  staffReceiptsConfirmedAt?: string
  staffReceiptsConfirmedBy?: string

  // data_confirmed
  dataConfirmedStatus?: string
  dataConfirmedAt?: string
  dataConfirmedBy?: string

  // bonus_approved
  totalBonus?: string
  bonusApprovedAt?: string
  bonusApprovedBy?: string

  // closed
  closedAt?: string
  leadManager?: string

  // expenses_entered totals
  expensesMainTotal?: string
  expensesBacklineTotal?: string
  expensesProjectTotal?: string

  // bonus_calculated totals
  netProfitTotal?: string
  calculatedBonus?: string
  bonusCalculatedAt?: string

  // ready (sales) totals
  salesMainTotal?: string
  salesBacklineTotal?: string
  salesProjectTotal?: string
  taxRate?: string
  taxAmount?: string
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

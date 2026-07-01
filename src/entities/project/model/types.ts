import type { ProjectArticles } from '@/entities/project-article'
import type { StageDocumentFile } from '@/entities/project-document'
import type { StageDocumentType } from '@/entities/stage-document-file'

export type ProjectBackOrigin = {
  to: string
  label: string
}

/** Воронка до мероприятия (формы и канбан «Проекты»). */
export type PreprojectStage =
  | 'plum_request'
  | 'primary_contact_done'
  | 'calculation_prepared'
  | 'contract_signed'
  | 'ready_to_event'

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

/** Проект перемещён в «Вне контура MAG». */
export type OutsideMagStage = 'out_of_mag_scope'

/** Проект перемещён в архив. */
export type ArchivedStage = 'archived'

export type ProjectStage = PreprojectStage | ClosingStage | OutsideMagStage | ArchivedStage

export type StageFunnel = 'pre_project' | 'closing'

/** Финансовые итоги проекта (могут отсутствовать в списке до нужного этапа). */
export interface ProjectEconomics {
  salesProjectTotal: number | null
  netProfitTotal: number | null
  bonusCalculatedTotal: number | null
  bonusApprovedTotal: number | null
}

/** Вспомогательный менеджер проекта (ERP-189): получает право редактирования, без ответственности. */
export interface ProjectAssistantManager {
  /** id менеджера строкой — как `ManagerSelectOption.id`. */
  id: string
  fullName: string
}

export interface Project {
  id: string
  title: string
  date: string
  stage: ProjectStage
  city: string
  loft: string
  hall: string
  /**
   * Компактная подпись залов (несколько `halls[]` в API). UI может показать её
   * вместо пары «loft · hall», если задана.
   */
  hallLoft?: string
  /** Имя ВЕДУЩЕГО менеджера (`mag_manager.full_name`). */
  manager: string
  /**
   * id ведущего менеджера (`mag_manager.id` строкой, как `ManagerSelectOption.id`).
   * `null`, если проект в пуле. ERP-189.
   */
  leadManagerId?: string | null
  /** Вспомогательные менеджеры проекта (ERP-189): `id` — user id, `fullName` — имя. */
  assistantManagers?: ProjectAssistantManager[]
  /**
   * Менеджер может «Взять проект» из пула (`can_claim`): он привязан к залу,
   * а `mag_manager` пуст. Источник — `ProjectManagerAccess` на бэке.
   */
  canClaim: boolean
  /** Текущий пользователь ведёт проект (`can_edit`): владелец-менеджер или lead. */
  canEdit: boolean
  /** Пользователь видит проект, но не ведёт его (`is_read_only`): пул или чужой claim. */
  isReadOnly: boolean
  type: string
  company: string
  phone: string
  email: string
  plumCardUrl: string
  /** Проект синхронизирован из Plum (`is_from_plum` в API). */
  isFromPlum: boolean
  /** Числовой код статуса мероприятия в Plum (`plum_event_status`). */
  plumEventStatus: number | null
  /** Человекочитаемый статус мероприятия в Plum (`plum_event_status_label`). */
  plumEventStatusLabel: string | null
  /** ISO-datetime последнего обновления проекта. */
  updatedAt: string
  /** ISO-datetime создания проекта в системе («появление в системе»). */
  createdAt: string
  /** Последняя активная стадия до перевода в «Вне контура» (если есть в API). */
  lastActiveStage?: ProjectStage
  /** Метаданные перевода во «Вне контура MAG» (список out-of-mag). */
  outsideMag?: {
    reason: string | null
    transferredAt: string | null
    transferredBy: string | null
  }
  economics?: ProjectEconomics
  /** ISO-datetime архивации проекта. */
  archivedAt?: string
  /** ISO-datetime подтверждения документов бухгалтером (этап documents_confirmed). */
  documentsConfirmedAt?: string
}

export type ContractType = 'with_vat' | 'without_vat'
export type ContactChannel = 'messenger' | 'phone' | 'meeting'
export type PlumStatus = 'pending' | 'confirmed'

export type DocumentStatus = 'present' | 're_requested' | 'not_required'
export type EventReadiness = 'ready' | 'not_ready'

export interface StageFormData {
  clientCompany?: string
  phone?: string
  email?: string
  contactPerson?: string
  createdAt?: string
  /** Комментарий менеджера MAG на этапе plum_request (не plum_comment). */
  magComment?: string

  contactComment?: string
  contactChannel?: ContactChannel
  contactedAt?: string

  calcComment?: string
  /** Имя файла сметы (этап calculation_prepared). Пока демо — файл не уходит на бэк. */
  estimateFileName?: string

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
  projectDocsFileName?: string
  subleaseDocsFileName?: string
  staffReceiptsFileName?: string
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

/** Снимок этапа из detail-схемы — гидрирует пройденные этапы при загрузке проекта. */
export interface StageSnapshot {
  /** Когда проект попал на этап. */
  enteredAt?: string
  /** Кто перевёл проект на этап. */
  enteredBy?: string
  /** Значения полей этапа. */
  values: Partial<StageFormData>
}

export interface ProjectDetail extends Project {
  /**
   * Пер-блочные права правки от бэка (`can_edit_*`, источник — PipelineCapabilities,
   * отдаются в pipeline-state `GET /projects/{id}/pipeline/`, а не в ProjectDetail).
   * Единственный источник правды «можно ли править блок сейчас» (текущий или
   * пройденный): учитывает роль, стадию, владельца, archived/out_of_mag, `event_date`
   * и т.п. Фронт ими гейтит кнопку «Редактировать» вместо своей матрицы.
   * `canEditClient` — блок «Заявка из PLUM» (mag_comment). `canEditPrimaryContact` и
   * `canEditCalculation` — правка руководителем задним числом (ERP-198).
   */
  canEditClient: boolean
  canEditContract: boolean
  canEditSales: boolean
  canEditExpenses: boolean
  canEditPrimaryContact: boolean
  canEditCalculation: boolean
  enteredSystemAt: string
  history: StageHistoryEntry[]
  /** Проект синхронизирован из Plum (`is_from_plum` в API). */
  isFromPlum: boolean
  plumId: string
  plumStatus: PlumStatus
  plumComment?: string
  plumSyncedAt?: string
  /** Менеджер PLUM (`plum_lofthall_manager` в API). */
  plumLofthallManager?: string
  clientCompany: string
  /**
   * Контактное лицо клиента. Приоритет: отредактированное `contact_person`,
   * иначе значение из Plum (`plum_contact_person`).
   */
  contactPerson: string
  clientStatus: PlumStatus
  finance: ProjectFinance
  /** Снимки пройденных этапов с бэка — для гидрации `useStageFlow` после перезагрузки. */
  stageSnapshots?: Partial<Record<ProjectStage, StageSnapshot>>
  /** Финансовые статьи проекта с бэка (этапы ready/expenses/bonus). */
  articles?: ProjectArticles
  /** Процент налога с бэка. */
  taxRate?: number
  /** Метаданные закрывающих документов (имя, URL, кто/когда загрузил). */
  documentFiles?: Partial<Record<StageDocumentType, StageDocumentFile>>
}

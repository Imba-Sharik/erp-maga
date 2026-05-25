import { formatDistanceToNow, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'

import type { OutOfMagProject } from '@/shared/api/generated/types/OutOfMagProject'
import type { Project as BackendProject } from '@/shared/api/generated/types/Project'
import type { ProjectCalendarItemSchema } from '@/shared/api/generated/types/ProjectCalendarItemSchema'
import type { ProjectDetailSchema } from '@/shared/api/generated/types/ProjectDetailSchema'
import type { ProjectStageEnumKey } from '@/shared/api/generated/types/Project'

import { mapBackendArticles } from '@/entities/project-articles'

import type {
  Project,
  ProjectDetail,
  ProjectEconomics,
  ProjectStage,
  StageFormData,
  StageSnapshot,
} from '../model/types'

/** Поля итогов, которые бэк может отдавать в списке, но их нет в сгенерированном Project. */
type BackendProjectListExtras = {
  sales_project_total?: number
  net_profit_total?: number
  bonus_calculated_total?: number
  bonus_approved_total?: number
}

function parseOptionalNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function mapEconomics(b: BackendProject & BackendProjectListExtras): ProjectEconomics {
  return {
    salesProjectTotal: parseOptionalNumber(b.sales_project_total),
    netProfitTotal: parseOptionalNumber(b.net_profit_total),
    bonusCalculatedTotal: parseOptionalNumber(b.bonus_calculated_total),
    bonusApprovedTotal: parseOptionalNumber(b.bonus_approved_total),
  }
}

function hasAnyEconomics(e: ProjectEconomics): boolean {
  return (
    e.salesProjectTotal !== null ||
    e.netProfitTotal !== null ||
    e.bonusCalculatedTotal !== null ||
    e.bonusApprovedTotal !== null
  )
}

const STAGE_MAP: Partial<Record<ProjectStageEnumKey, ProjectStage>> = {
  plum_request: 'plum_request',
  primary_contact_done: 'primary_contact_done',
  calculation_prepared: 'calculation_prepared',
  contract_signed: 'contract_signed',
  ready_to_event: 'ready_to_event',
  event_held: 'event_held',
  expenses_entered: 'expenses_entered',
  documents_confirmed: 'documents_confirmed',
  /** В канбане колонки нет — отображаем вместе с «Данные подтверждены». */
  feedback_received: 'data_confirmed',
  data_confirmed: 'data_confirmed',
  bonus_calculated: 'bonus_calculated',
  bonus_approved: 'bonus_approved',
  closed: 'closed',
  archived: 'archived',
  out_of_mag_scope: 'out_of_mag_scope',
}

function takeFirstManager(raw: string | undefined): string {
  if (!raw) return ''
  const first = raw.split(',')[0]?.trim()
  return first ?? ''
}

function formatLastUpdate(iso: string | undefined): string {
  if (!iso) return ''
  try {
    return formatDistanceToNow(parseISO(iso), { addSuffix: true, locale: ru })
  } catch {
    return ''
  }
}

type BackendProjectListable = BackendProject | ProjectDetailSchema

export function mapBackendProject(b: BackendProjectListable): Project | null {
  const stage = b.stage ? STAGE_MAP[b.stage] : undefined
  if (!stage) return null

  const raw = b as BackendProject & BackendProjectListExtras
  const economics = mapEconomics(raw)

  const lastActiveStage = b.last_active_stage ? STAGE_MAP[b.last_active_stage] : undefined

  return {
    id: String(b.id),
    title: b.event_name,
    date: b.event_date,
    stage,
    ...(lastActiveStage ? { lastActiveStage } : {}),
    city: b.city_label || b.city,
    loft: b.loft_name ?? '',
    hall: b.hall_name ?? '',
    // Бэк иногда отдаёт `mag_manager` как «Имя1, Имя2, Имя3» — берём первого
    // как «ведущего менеджера» проекта, остальных пока игнорируем.
    manager: takeFirstManager(b.mag_manager),
    type: b.event_type_label ?? '',
    company: b.client_company ?? '',
    phone: b.phone ?? '',
    email: b.email ?? '',
    plumCardUrl: b.plum_card_url,
    lastUpdate: formatLastUpdate(b.updated_at),
    createdAt: b.created_at,
    // documents_confirmed_at пока есть только в ProjectDetailSchema, не в списке.
    ...('documents_confirmed_at' in b && b.documents_confirmed_at
      ? { documentsConfirmedAt: b.documents_confirmed_at }
      : {}),
    ...(hasAnyEconomics(economics) ? { economics } : {}),
  }
}

export function mapBackendOutOfMagProject(b: OutOfMagProject): Project | null {
  const lastActiveStage = b.stage_from ? STAGE_MAP[b.stage_from as ProjectStageEnumKey] : undefined

  return {
    id: String(b.id),
    title: b.event_name,
    date: b.event_date,
    stage: 'out_of_mag_scope',
    ...(lastActiveStage ? { lastActiveStage } : {}),
    city: '',
    loft: b.loft_name ?? '',
    hall: b.hall_name ?? '',
    manager: takeFirstManager(b.mag_manager),
    type: '',
    company: '',
    phone: '',
    email: '',
    plumCardUrl: '',
    lastUpdate: formatLastUpdate(b.out_of_mag_transferred_at ?? undefined),
    createdAt: b.out_of_mag_transferred_at ?? '',
    outsideMag: {
      reason: b.out_of_mag_reason,
      transferredAt: b.out_of_mag_transferred_at,
      transferredBy: b.out_of_mag_transferred_by,
    },
  }
}

export function mapBackendOutOfMagProjects(list: readonly OutOfMagProject[]): Project[] {
  const result: Project[] = []
  for (const item of list) {
    const mapped = mapBackendOutOfMagProject(item)
    if (mapped) result.push(mapped)
  }
  return result
}

export function mapBackendProjects(list: readonly BackendProject[]): Project[] {
  const result: Project[] = []
  for (const item of list) {
    const mapped = mapBackendProject(item)
    if (mapped) result.push(mapped)
  }
  return result
}

/**
 * Маппер лёгких карточек из `/api/v1/projects/calendar/`. Из отсутствующих
 * относительно общего `Project` — `email` и `city`. Остальное доступно.
 */
export function mapBackendCalendarProject(b: ProjectCalendarItemSchema): Project | null {
  const stage = b.stage ? STAGE_MAP[b.stage] : undefined
  if (!stage) return null

  return {
    id: String(b.id),
    title: b.event_name,
    date: b.event_date,
    stage,
    city: '',
    loft: b.loft_name ?? '',
    hall: b.hall_name ?? '',
    manager: takeFirstManager(b.mag_manager),
    type: b.event_type_label ?? '',
    company: b.client_company ?? '',
    phone: b.phone ?? '',
    email: '',
    plumCardUrl: '',
    lastUpdate: '',
    createdAt: '',
  }
}

export function mapBackendCalendarProjects(list: readonly ProjectCalendarItemSchema[]): Project[] {
  const result: Project[] = []
  for (const item of list) {
    const mapped = mapBackendCalendarProject(item)
    if (mapped) result.push(mapped)
  }
  return result
}

function userBriefName(
  user: { full_name?: string | null } | null | undefined,
): string | undefined {
  return user?.full_name ?? undefined
}

interface SnapshotInput {
  enteredAt?: string | null
  enteredBy?: string
  values: Record<string, string | null | undefined>
}

/** Собирает снимок этапа, отбрасывая пустые значения. `undefined`, если этап пуст. */
function buildSnapshot({ enteredAt, enteredBy, values }: SnapshotInput): StageSnapshot | undefined {
  const cleaned: Record<string, string> = {}
  for (const [key, value] of Object.entries(values)) {
    if (value) cleaned[key] = value
  }
  const at = enteredAt ?? undefined
  if (Object.keys(cleaned).length === 0 && !at && !enteredBy) return undefined
  return { enteredAt: at, enteredBy, values: cleaned as Partial<StageFormData> }
}

/**
 * Снимки пройденных этапов из detail-схемы. Нужны, чтобы после перезагрузки страницы
 * `useStageFlow` показал значения пройденных этапов (иначе они рисуются как «—»).
 * Финансовые этапы (ready/expenses/bonus) хранят `articles` — здесь не гидрируются.
 */
function mapStageSnapshots(b: ProjectDetailSchema): Partial<Record<ProjectStage, StageSnapshot>> {
  const snapshots: Partial<Record<ProjectStage, StageSnapshot>> = {}
  const put = (stage: ProjectStage, snapshot: StageSnapshot | undefined) => {
    if (snapshot) snapshots[stage] = snapshot
  }

  put(
    'plum_request',
    buildSnapshot({
      enteredAt: b.created_at,
      values: {
        clientCompany: b.client_company || b.plum_client_company,
        phone: b.phone || b.plum_phone,
        contactPerson: b.contact_person || b.plum_contact_person,
        email: b.email || b.plum_email,
      },
    }),
  )

  put(
    'primary_contact_done',
    buildSnapshot({
      enteredAt: b.contacted_at,
      enteredBy: userBriefName(b.primary_contact_set_by),
      values: {
        contactComment: b.contact_comment,
        contactChannel: b.contact_channel,
        contactedAt: b.contacted_at,
      },
    }),
  )

  put(
    'calculation_prepared',
    buildSnapshot({
      enteredAt: b.calculation_prepared_at,
      enteredBy: userBriefName(b.calculation_prepared_set_by),
      values: { calcComment: b.calculation_comment },
    }),
  )

  put(
    'contract_signed',
    buildSnapshot({
      enteredAt: b.contract_signed_at,
      enteredBy: userBriefName(b.contract_signed_set_by),
      values: {
        contractType: b.contract_type,
        contractNumber: b.contract_number,
        contractDate: b.contract_date,
        legalEntity: b.legal_entity,
        contractComment: b.contract_comment,
      },
    }),
  )

  put(
    'event_held',
    buildSnapshot({
      enteredAt: b.event_held_at,
      enteredBy: userBriefName(b.event_held_set_by),
      values: {
        postEventComment: b.post_event_comment,
        eventReadiness:
          b.event_readiness === true
            ? 'ready'
            : b.event_readiness === false
              ? 'not_ready'
              : undefined,
      },
    }),
  )

  put(
    'documents_confirmed',
    buildSnapshot({
      enteredAt: b.documents_confirmed_at,
      enteredBy: userBriefName(b.documents_confirmed_set_by),
      values: {
        projectDocsStatus: b.project_docs_status,
        projectDocsConfirmedAt: b.project_docs_confirmed_at,
        projectDocsConfirmedBy: userBriefName(b.project_docs_confirmed_by),
        subleaseDocsStatus: b.sublease_docs_status,
        subleaseDocsConfirmedAt: b.sublease_docs_confirmed_at,
        subleaseDocsConfirmedBy: userBriefName(b.sublease_docs_confirmed_by),
        staffReceiptsStatus: b.staff_receipts_status,
        staffReceiptsConfirmedAt: b.staff_receipts_confirmed_at,
        staffReceiptsConfirmedBy: userBriefName(b.staff_receipts_confirmed_by),
      },
    }),
  )

  put(
    'data_confirmed',
    buildSnapshot({
      enteredAt: b.data_confirmation_at,
      enteredBy: userBriefName(b.data_confirmation_by),
      values: { dataConfirmedStatus: b.data_confirmed_status },
    }),
  )

  return snapshots
}

export function mapBackendProjectDetail(b: ProjectDetailSchema): ProjectDetail | null {
  const base = mapBackendProject(b)
  if (!base) return null

  const stageSnapshots = mapStageSnapshots(b)

  return {
    ...base,
    enteredSystemAt: b.created_at,
    plumId: b.plum_event_id,
    plumStatus: 'confirmed',
    plumComment: b.plum_comment,
    plumSyncedAt: b.plum_last_synced_at,
    clientCompany: b.client_company ?? '',
    clientStatus: 'confirmed',
    finance: { sales: null, expenses: null, bonuses: null, netProfit: null },
    history: [],
    ...(Object.keys(stageSnapshots).length > 0 ? { stageSnapshots } : {}),
    articles: mapBackendArticles(b.articles),
    taxRate: b.tax_rate,
  }
}

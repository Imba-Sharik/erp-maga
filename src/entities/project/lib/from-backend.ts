import type { OutOfMagProject } from '@/shared/api/generated/types/OutOfMagProject'
import type { Project as BackendProject } from '@/shared/api/generated/types/Project'
import type { ProjectCalendarItemSchema } from '@/shared/api/generated/types/ProjectCalendarItemSchema'
import type { ProjectDetail as BackendProjectDetail } from '@/shared/api/generated/types/ProjectDetail'
import type { ProjectDocumentFile } from '@/shared/api/generated/types/ProjectDocumentFile'
import type { ProjectDocumentStatus } from '@/shared/api/generated/types/ProjectDocumentStatus'
import type { ProjectStageEnumKey } from '@/shared/api/generated/types/Project'

import { mapBackendArticles } from '@/entities/project-articles'
import { mapBackendDocumentFile, type StageDocumentFile } from '@/entities/project-documents'
import type { StageDocumentType } from '@/entities/stage-document-files'

import { projectVenueFieldsFromHalls } from './map-project-halls'
import {
  parsePlumEventStatusCode,
  plumEventStatusLabel as labelByPlumStatusCode,
} from './plum-event-status-catalog'
import type {
  Project,
  ProjectDetail,
  ProjectEconomics,
  DocumentStatus,
  ProjectStage,
  StageFormData,
  StageSnapshot,
} from '../model/types'

/** Поля, которые бэк может отдавать в списке, но их нет в сгенерированном Project. */
type BackendProjectListExtras = {
  sales_project_total?: number
  net_profit_total?: number
  bonus_calculated_total?: number
  bonus_approved_total?: number
  is_from_plum?: boolean
}

function mapPlumEventStatusLabel(raw: string | undefined): string | null {
  const label = raw?.trim()
  return label ? label : null
}

function inferIsFromPlum(b: BackendProjectListable): boolean {
  const plumEventId = b.plum_event_id?.trim() ?? ''
  if (!plumEventId) return false
  if (plumEventId.startsWith('ui-') || plumEventId.startsWith('optimistic-')) return false
  return Boolean(b.plum_card_url?.trim())
}

function mapIsFromPlum(b: BackendProjectListable): boolean {
  const raw = b as BackendProject & BackendProjectListExtras
  if ('is_from_plum' in raw && raw.is_from_plum !== undefined) {
    return Boolean(raw.is_from_plum)
  }
  return inferIsFromPlum(b)
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

type BackendProjectListable = BackendProject | BackendProjectDetail

const DOCUMENT_STATUSES: ReadonlySet<DocumentStatus> = new Set([
  'present',
  're_requested',
  'not_required',
])

function mapDocStatus(raw: string | null | undefined): DocumentStatus | undefined {
  if (!raw) return undefined
  return DOCUMENT_STATUSES.has(raw as DocumentStatus) ? (raw as DocumentStatus) : undefined
}

type DocumentsByType = Partial<Record<StageDocumentType, ProjectDocumentStatus>>

function indexDocumentsByType(
  documents: readonly ProjectDocumentStatus[] | null | undefined,
): DocumentsByType {
  const result: DocumentsByType = {}
  if (!documents) return result
  for (const doc of documents) {
    result[doc.document_type] = doc
  }
  return result
}

export function mapBackendProject(b: BackendProjectListable): Project | null {
  const stage = b.stage ? STAGE_MAP[b.stage] : undefined
  if (!stage) return null

  const raw = b as BackendProject & BackendProjectListExtras
  const economics = mapEconomics(raw)

  const lastActiveStage = b.last_active_stage ? STAGE_MAP[b.last_active_stage] : undefined
  const venue = projectVenueFieldsFromHalls(b.halls)

  return {
    id: String(b.id),
    title: b.event_name,
    date: b.event_date,
    stage,
    ...(lastActiveStage ? { lastActiveStage } : {}),
    city: b.city_label || b.city,
    loft: venue.loft,
    hall: venue.hall,
    ...(venue.hallLoft ? { hallLoft: venue.hallLoft } : {}),
    manager: b.mag_manager?.full_name ?? '',
    type: b.event_type_label ?? '',
    company: b.client_company ?? '',
    phone: b.phone ?? '',
    email: b.email ?? '',
    plumCardUrl: b.plum_card_url,
    isFromPlum: mapIsFromPlum(b),
    plumEventStatus: parsePlumEventStatusCode(b.plum_event_status),
    plumEventStatusLabel:
      mapPlumEventStatusLabel(b.plum_event_status_label) ??
      labelByPlumStatusCode(parsePlumEventStatusCode(b.plum_event_status)),
    updatedAt: b.updated_at,
    createdAt: b.created_at,
    ...(b.archived_at ? { archivedAt: b.archived_at } : {}),
    // documents_confirmed_at пока есть только в ProjectDetailSchema, не в списке.
    ...('documents_confirmed_at' in b && b.documents_confirmed_at
      ? { documentsConfirmedAt: b.documents_confirmed_at }
      : {}),
    ...(hasAnyEconomics(economics) ? { economics } : {}),
  }
}

export function mapBackendOutOfMagProject(b: OutOfMagProject): Project | null {
  const base = mapBackendProject(b as BackendProjectListable)
  if (!base) return null

  const lastActiveStage = b.stage_from
    ? STAGE_MAP[b.stage_from as ProjectStageEnumKey]
    : base.lastActiveStage

  return {
    ...base,
    stage: 'out_of_mag_scope',
    ...(lastActiveStage ? { lastActiveStage } : {}),
    updatedAt: b.out_of_mag_transferred_at ?? b.updated_at,
    outsideMag: {
      reason: b.out_of_mag_reason,
      transferredAt: b.out_of_mag_transferred_at,
      transferredBy: userBriefName(b.out_of_mag_transferred_by) ?? null,
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
 * относительно общего `Project` — `email` и `city`. Залы — в `halls[]`.
 */
export function mapBackendCalendarProject(b: ProjectCalendarItemSchema): Project | null {
  const stage = b.stage ? STAGE_MAP[b.stage] : undefined
  if (!stage) return null

  const venue = projectVenueFieldsFromHalls(b.halls)

  return {
    id: String(b.id),
    title: b.event_name,
    date: b.event_date,
    stage,
    city: '',
    loft: venue.loft,
    hall: venue.hall,
    ...(venue.hallLoft ? { hallLoft: venue.hallLoft } : {}),
    manager: b.mag_manager?.full_name ?? '',
    type: b.event_type_label ?? '',
    company: b.client_company ?? '',
    phone: b.phone ?? '',
    email: '',
    plumCardUrl: '',
    isFromPlum: false,
    plumEventStatus: null,
    plumEventStatusLabel: null,
    updatedAt: '',
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
  user: string | { full_name?: string | null } | null | undefined,
): string | undefined {
  if (typeof user === 'string') return user || undefined
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
function mapStageSnapshots(b: BackendProjectDetail): Partial<Record<ProjectStage, StageSnapshot>> {
  const snapshots: Partial<Record<ProjectStage, StageSnapshot>> = {}
  const put = (stage: ProjectStage, snapshot: StageSnapshot | undefined) => {
    if (snapshot) snapshots[stage] = snapshot
  }
  const docs = indexDocumentsByType(b.documents)
  const projectClosingDoc = docs.project_closing
  const subrentClosingDoc = docs.subrent_closing
  const staffReceiptsDoc = docs.staff_receipts

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
        projectDocsStatus: mapDocStatus(projectClosingDoc?.status ?? b.project_docs_status),
        projectDocsConfirmedAt: projectClosingDoc?.confirmed_at ?? b.project_docs_confirmed_at,
        projectDocsConfirmedBy: userBriefName(
          projectClosingDoc?.confirmed_by ?? b.project_docs_confirmed_by,
        ),
        projectDocsFileName: projectClosingDoc?.file_name ?? b.project_docs_file_name,
        subleaseDocsStatus: mapDocStatus(subrentClosingDoc?.status ?? b.sublease_docs_status),
        subleaseDocsConfirmedAt: subrentClosingDoc?.confirmed_at ?? b.sublease_docs_confirmed_at,
        subleaseDocsConfirmedBy: userBriefName(
          subrentClosingDoc?.confirmed_by ?? b.sublease_docs_confirmed_by,
        ),
        subleaseDocsFileName: subrentClosingDoc?.file_name ?? b.sublease_docs_file_name,
        staffReceiptsStatus: mapDocStatus(staffReceiptsDoc?.status ?? b.staff_receipts_status),
        staffReceiptsConfirmedAt: staffReceiptsDoc?.confirmed_at ?? b.staff_receipts_confirmed_at,
        staffReceiptsConfirmedBy: userBriefName(
          staffReceiptsDoc?.confirmed_by ?? b.staff_receipts_confirmed_by,
        ),
        staffReceiptsFileName: staffReceiptsDoc?.file_name ?? b.staff_receipts_file_name,
      },
    }),
  )

  put(
    'data_confirmed',
    buildSnapshot({
      enteredAt: b.data_confirmed_at ?? b.data_confirmation_at,
      enteredBy: userBriefName(b.data_confirmed_set_by),
      values: {
        dataConfirmedStatus: b.data_confirmed_status,
        dataConfirmedAt: b.data_confirmation_at ?? undefined,
        dataConfirmedBy: userBriefName(b.data_confirmation_by),
      },
    }),
  )

  return snapshots
}

export function mapBackendProjectDetail(b: BackendProjectDetail): ProjectDetail | null {
  const base = mapBackendProject(b)
  if (!base) return null

  const stageSnapshots = mapStageSnapshots(b)

  const docs = indexDocumentsByType(b.documents)
  const documentFiles: Partial<Record<StageDocumentType, StageDocumentFile>> = {}
  const fileFallbackByType: Record<StageDocumentType, ProjectDocumentFile | null | undefined> = {
    project_closing: b.project_docs_file,
    subrent_closing: b.sublease_docs_file,
    staff_receipts: b.staff_receipts_file,
  }
  for (const documentType of Object.keys(fileFallbackByType) as StageDocumentType[]) {
    const doc = docs[documentType]
    const mapped = mapBackendDocumentFile(doc?.file ?? fileFallbackByType[documentType])
    if (!mapped) continue
    if (doc?.reuploaded_at) mapped.reuploadedAt = doc.reuploaded_at
    documentFiles[documentType] = mapped
  }

  return {
    ...base,
    enteredSystemAt: b.created_at,
    isFromPlum: base.isFromPlum,
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
    ...(Object.keys(documentFiles).length > 0 ? { documentFiles } : {}),
  }
}

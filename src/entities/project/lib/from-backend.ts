import { formatDistanceToNow, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'

import type { Project as BackendProject } from '@/shared/api/generated/types/Project'
import type { StageEnum } from '@/shared/api/generated/types/StageEnum'

import type { Project, ProjectDetail, ProjectStage } from '../model/types'

const STAGE_MAP: Partial<Record<StageEnum, ProjectStage>> = {
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

export function mapBackendProject(b: BackendProject): Project | null {
  const stage = b.stage ? STAGE_MAP[b.stage] : undefined
  if (!stage) return null

  return {
    id: String(b.id),
    title: b.event_name,
    date: b.event_date,
    stage,
    city: b.city_label || b.city,
    loft: b.venue,
    hall: b.hall_loft,
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
  }
}

export function mapBackendProjects(list: readonly BackendProject[]): Project[] {
  const result: Project[] = []
  for (const item of list) {
    const mapped = mapBackendProject(item)
    if (mapped) result.push(mapped)
  }
  return result
}

export function mapBackendProjectDetail(b: BackendProject): ProjectDetail | null {
  const base = mapBackendProject(b)
  if (!base) return null

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
  }
}

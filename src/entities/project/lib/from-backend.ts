import { formatDistanceToNow, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'

import type { Project as BackendProject } from '@/shared/api/generated/types/Project'
import type { StageEnum } from '@/shared/api/generated/types/StageEnum'

import type { Project, ProjectDetail, ProjectStage, ProjectStatus } from '../model/types'

const STAGE_MAP: Partial<Record<StageEnum, ProjectStage>> = {
  plum_request: 'plum_request',
  primary_contact_done: 'first_contact',
  calculation_prepared: 'calc_ready',
  contract_signed: 'signed',
  ready_to_event: 'ready',
  event_held: 'event_held',
  expenses_entered: 'expenses_entered',
  documents_confirmed: 'documents_confirmed',
  feedback_received: 'feedback_received',
  data_confirmed: 'data_confirmed',
  bonus_calculated: 'bonus_calculated',
  bonus_approved: 'bonus_approved',
}

function statusForStage(stage: ProjectStage): ProjectStatus {
  switch (stage) {
    case 'plum_request':
    case 'first_contact':
    case 'calc_ready':
      return 'confirmed'
    case 'signed':
    case 'ready':
    case 'event_held':
      return 'signed'
    case 'expenses_entered':
    case 'documents_confirmed':
    case 'feedback_received':
    case 'data_confirmed':
    case 'bonus_calculated':
    case 'bonus_approved':
      return 'expenses'
  }
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
    status: statusForStage(stage),
    stage,
    city: b.city_label || b.city,
    loft: b.venue,
    hall: b.hall_loft,
    manager: b.mag_manager ?? '',
    type: b.event_type ?? '',
    company: b.client_company ?? '',
    phone: b.phone ?? '',
    email: b.email ?? '',
    plumCardUrl: b.plum_card_url,
    lastUpdate: formatLastUpdate(b.updated_at),
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

import type { Project as ApiProject } from '@/shared/api/generated/types/Project'

import type { Project } from '../model/types'
import { projectHallItemsFromVenue } from './map-project-halls'
import { projectStageToApi } from './project-stage-api'

const EMPTY_API_ROW_FIELDS = {
  plum_card_url: '',
  plum_last_synced_at: '',
  plum_event_payload_hash: '',
  plum_event_status: '',
  plum_event_status_label: '',
  plum_comment: '',
  mag_comment: '',
  plum_client_company: '',
  plum_contact_person: '',
  plum_phone: '',
  plum_email: '',
  plum_lofthall_manager: '',
  plum_mag_manager: '',
  event_type: null,
  event_format: null,
  event_format_label: '',
  contact_person: '',
  sales_total: 0,
  net_profit_ex_tax: 0,
  final_bonus: 0,
  source_payload: null,
  sync_error: '',
} as const

/** Проекция UI-проекта для patch React Query кэшей списков и канбана. */
export function projectToApiListRow(project: Project): ApiProject {
  const stage = projectStageToApi(project.stage)
  const lastActiveStage = project.lastActiveStage
    ? projectStageToApi(project.lastActiveStage)
    : stage

  return {
    ...EMPTY_API_ROW_FIELDS,
    id: Number(project.id),
    plum_event_id: `ui-${project.id}`,
    stage,
    last_active_stage: lastActiveStage,
    event_name: project.title,
    event_date: project.date,
    halls: projectHallItemsFromVenue(project.loft, project.hall),
    city: [],
    city_labels: project.city ? [project.city] : [],
    event_type_label: project.type,
    mag_manager: project.manager ? { id: 0, full_name: project.manager, email: '' } : null,
    client_company: project.company,
    phone: project.phone,
    email: project.email,
    plum_card_url: project.plumCardUrl,
    plum_event_status: project.plumEventStatus !== null ? String(project.plumEventStatus) : '',
    plum_event_status_label: project.plumEventStatusLabel ?? '',
    updated_at: project.updatedAt,
    created_at: project.createdAt,
    is_from_plum: project.isFromPlum,
  } as ApiProject & { is_from_plum?: boolean }
}

import type { Project as ApiProject } from '@/shared/api/generated/types/Project'

import type { Project } from '../model/types'
import { projectStageToApi } from './project-stage-api'

const EMPTY_API_ROW_FIELDS = {
  plum_card_url: '',
  plum_last_synced_at: '',
  plum_event_payload_hash: '',
  plum_event_status: '',
  plum_event_status_label: '',
  plum_comment: '',
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
} as const

/** Проекция UI-проекта для patch React Query кэшей списков и канбана. */
export function projectToApiListRow(project: Project): ApiProject {
  const stage = projectStageToApi(project.stage)

  return {
    ...EMPTY_API_ROW_FIELDS,
    id: Number(project.id),
    plum_event_id: `ui-${project.id}`,
    stage,
    event_name: project.title,
    event_date: project.date,
    venue: project.loft,
    hall_loft: project.hall,
    city: project.city,
    city_label: project.city,
    event_type_label: project.type,
    mag_manager: project.manager,
    client_company: project.company,
    phone: project.phone,
    email: project.email,
    plum_card_url: project.plumCardUrl,
    updated_at: project.lastUpdate,
    created_at: project.createdAt,
    ...(project.lastActiveStage
      ? { last_active_stage: projectStageToApi(project.lastActiveStage) }
      : {}),
  } as ApiProject
}

import type { Project } from '@/shared/api/generated/types/Project'

let mockIdSeq = -1

export function buildMockApiProject(params: {
  event_name: string
  event_type: string
  loft: string
  hall: string
  event_date: string
  mag_manager: string
}): Project {
  const nowIso = new Date().toISOString()
  const id = mockIdSeq--
  const clientId = `${id}_${Date.now()}`

  return {
    id,
    plum_event_id: `mock-${clientId}`,
    plum_card_url: 'https://example.com/mock-plum-card',
    plum_last_synced_at: nowIso,
    plum_event_payload_hash: '',
    event_name: params.event_name.trim(),
    event_type: null,
    event_type_label: params.event_type,
    event_format: null,
    event_format_label: '',
    event_date: params.event_date,
    venue: params.loft,
    hall_loft: params.hall,
    city: 'Москва',
    city_label: 'Москва',
    plum_event_status: 'mock',
    plum_event_status_label: 'Мок',
    plum_comment: '',
    plum_client_company: '',
    plum_contact_person: '',
    plum_phone: '',
    plum_email: '',
    plum_lofthall_manager: '',
    plum_mag_manager: '',
    mag_manager: params.mag_manager,
    mag_manager_email: null,
    stage: 'plum_request',
    last_active_stage: 'plum_request',
    source_payload: null,
    sync_error: '',
    created_at: nowIso,
    updated_at: nowIso,
  }
}

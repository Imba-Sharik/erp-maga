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
    event_name: params.event_name.trim(),
    event_type: null,
    event_type_label: params.event_type,
    event_format: null,
    event_format_label: '',
    event_date: params.event_date,
    venue: params.loft,
    hall_loft: params.hall,
    city: 'Москва',
    mag_manager: params.mag_manager,
    plum_event_status: 'mock',
    stage: 'plum_request',
    created_at: nowIso,
    updated_at: nowIso,
    city_label: 'Москва',
    plum_event_status_label: 'Мок',
  }
}

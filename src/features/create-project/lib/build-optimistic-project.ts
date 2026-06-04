import type { Project } from '@/shared/api/generated/types/Project'
import type { ProjectHallItem } from '@/shared/api/generated/types/ProjectHallItem'

let optimisticIdSeq = -1

export function buildOptimisticProject(params: {
  event_name: string
  event_type: number
  event_type_label: string
  halls: ProjectHallItem[]
  event_date: string
  mag_manager: string
  mag_manager_id: number
}): Project {
  const nowIso = new Date().toISOString()
  const id = optimisticIdSeq--
  const clientId = `${id}_${Date.now()}`

  return {
    id,
    plum_event_id: `optimistic-${clientId}`,
    plum_card_url: '',
    plum_last_synced_at: nowIso,
    plum_event_payload_hash: '',
    event_name: params.event_name.trim(),
    event_type: params.event_type,
    event_type_label: params.event_type_label,
    event_format: null,
    event_format_label: '',
    event_date: params.event_date,
    halls: params.halls,
    city: 'Москва',
    city_label: 'Москва',
    plum_event_status: '',
    plum_event_status_label: '',
    plum_comment: '',
    plum_client_company: '',
    plum_contact_person: '',
    plum_phone: '',
    plum_email: '',
    plum_lofthall_manager: '',
    plum_mag_manager: '',
    mag_manager: { id: params.mag_manager_id, full_name: params.mag_manager, email: '' },
    sales_total: 0,
    net_profit_ex_tax: 0,
    final_bonus: 0,
    stage: 'plum_request',
    last_active_stage: 'plum_request',
    source_payload: null,
    sync_error: '',
    created_at: nowIso,
    updated_at: nowIso,
    is_from_plum: false,
  } as Project & { is_from_plum?: boolean }
}

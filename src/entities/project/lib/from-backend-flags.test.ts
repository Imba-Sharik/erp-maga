import { describe, expect, it } from 'vitest'

import type { Project as BackendProject } from '@/shared/api/generated/types/Project'

import { mapBackendProject } from './from-backend'

function makeBackendProject(overrides: Partial<BackendProject> = {}): BackendProject {
  return {
    id: 1,
    stage: 'plum_request',
    event_name: 'Проект',
    event_date: '2026-06-01',
    halls: [],
    city: [],
    city_labels: [],
    event_type: null,
    event_type_label: '',
    mag_manager: null,
    can_claim: false,
    can_edit: false,
    is_read_only: false,
    client_company: '',
    phone: '',
    email: '',
    plum_event_id: '',
    plum_card_url: '',
    is_from_plum: false,
    plum_event_status: '',
    plum_event_status_label: '',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  } as BackendProject
}

describe('mapBackendProject — флаги доступа', () => {
  it('маппит can_claim/can_edit/is_read_only в canClaim/canEdit/isReadOnly', () => {
    const project = mapBackendProject(
      makeBackendProject({ can_claim: true, can_edit: false, is_read_only: true }),
    )

    expect(project).toMatchObject({ canClaim: true, canEdit: false, isReadOnly: true })
  })

  it('false по умолчанию, если флаги не пришли', () => {
    const project = mapBackendProject(
      makeBackendProject({
        can_claim: undefined as never,
        can_edit: undefined as never,
        is_read_only: undefined as never,
      }),
    )

    expect(project).toMatchObject({ canClaim: false, canEdit: false, isReadOnly: false })
  })
})

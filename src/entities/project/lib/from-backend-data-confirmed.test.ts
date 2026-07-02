import { describe, expect, it } from 'vitest'

import type { ProjectDetail as BackendProjectDetail } from '@/shared/api/generated/types/ProjectDetail'

import { mapBackendProjectDetail } from './from-backend'

const DATA_CONFIRMATION_AT = '2026-05-01T10:00:00Z'
const DATA_CONFIRMED_AT = '2026-05-01T11:00:00Z'

function makeBackendDetail(overrides: Partial<BackendProjectDetail> = {}): BackendProjectDetail {
  return {
    id: 42,
    stage: 'bonus_calculated',
    event_name: 'Тестовое мероприятие',
    event_date: '2026-06-01',
    halls: [],
    city: [1],
    city_labels: ['Москва'],
    event_type: null,
    event_type_label: '',
    mag_manager: null,
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
    articles: [],
    documents: [],
    data_confirmed_status: 'confirmed',
    data_confirmation_at: DATA_CONFIRMATION_AT,
    data_confirmation_by: { id: 7, full_name: 'Директор Дмитрий Директоров' },
    data_confirmed_at: DATA_CONFIRMED_AT,
    data_confirmed_set_by: { id: 8, full_name: 'Менеджер Михаил Менеджеров' },
    ...overrides,
  } as BackendProjectDetail
}

describe('mapBackendProjectDetail — снимок data_confirmed', () => {
  it('кладёт per-row аудит в values, мету транзишена — в enteredAt/enteredBy', () => {
    const detail = mapBackendProjectDetail(makeBackendDetail())
    const snapshot = detail?.stageSnapshots?.data_confirmed

    expect(snapshot).toBeDefined()
    expect(snapshot?.values?.dataConfirmedStatus).toBe('confirmed')
    expect(snapshot?.values?.dataConfirmedBy).toBe('Директор Дмитрий Директоров')
    expect(snapshot?.values?.dataConfirmedAt).toBe(DATA_CONFIRMATION_AT)
    expect(snapshot?.enteredAt).toBe(DATA_CONFIRMED_AT)
    expect(snapshot?.enteredBy).toBe('Менеджер Михаил Менеджеров')
  })

  it('не подставляет data_confirmation_by в enteredBy', () => {
    const snapshot = mapBackendProjectDetail(makeBackendDetail())?.stageSnapshots?.data_confirmed

    expect(snapshot?.enteredBy).not.toBe('Директор Дмитрий Директоров')
  })

  it('fallback enteredAt на data_confirmation_at, если data_confirmed_at пуст', () => {
    const snapshot = mapBackendProjectDetail(makeBackendDetail({ data_confirmed_at: null }))
      ?.stageSnapshots?.data_confirmed

    expect(snapshot?.enteredAt).toBe(DATA_CONFIRMATION_AT)
  })
})

describe('mapBackendProjectDetail — data_rejected (ERP-221)', () => {
  it('маппит data_rejected=true в dataRejected', () => {
    const detail = mapBackendProjectDetail(makeBackendDetail({ data_rejected: true }))

    expect(detail?.dataRejected).toBe(true)
  })

  it('маппит data_rejected=false в dataRejected=false', () => {
    const detail = mapBackendProjectDetail(makeBackendDetail({ data_rejected: false }))

    expect(detail?.dataRejected).toBe(false)
  })

  it('без поля в payload (старый бэк) dataRejected=false — подсветки нет', () => {
    const detail = mapBackendProjectDetail(makeBackendDetail())

    expect(detail?.dataRejected).toBe(false)
  })
})

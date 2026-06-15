import { describe, expect, it } from 'vitest'

import type { ProjectCalendarItemSchema } from '@/shared/api/generated/types/ProjectCalendarItemSchema'

import { mapBackendCalendarProject } from './from-backend'

function makeCalendarItem(
  overrides: Partial<ProjectCalendarItemSchema> = {},
): ProjectCalendarItemSchema {
  return {
    id: 1,
    event_name: 'Свадьба Ивановых',
    event_date: '2026-05-10',
    event_type: 2,
    event_type_label: 'Свадьба',
    client_company: 'ООО Ромашка',
    phone: '+7 999 000-00-00',
    halls: [
      {
        hall_id: 10,
        hall_name: 'Зал A',
        loft_id: 2,
        loft_name: 'Loft Центр',
      },
    ],
    plum_event_status: '',
    plum_event_status_label: '',
    is_from_plum: false,
    plum_lofthall_manager: '',
    stage: 'calculation_prepared',
    stage_label: 'Расчёт подготовлен',
    mag_manager: { id: 5, full_name: 'Иванов Иван', email: 'ivan@example.com' },
    ...overrides,
  }
}

describe('mapBackendCalendarProject — статус Plum', () => {
  it('маппит isFromPlum и статус из ответа календаря', () => {
    const project = mapBackendCalendarProject(
      makeCalendarItem({
        is_from_plum: true,
        plum_event_status: '4',
        plum_event_status_label: 'Заявка',
      }),
    )

    expect(project).toMatchObject({
      isFromPlum: true,
      plumEventStatus: 4,
      plumEventStatusLabel: 'Заявка',
    })
  })

  it('подставляет label из справочника, если plum_event_status_label пуст', () => {
    const project = mapBackendCalendarProject(
      makeCalendarItem({
        is_from_plum: true,
        plum_event_status: '6',
        plum_event_status_label: '',
      }),
    )

    expect(project).toMatchObject({
      plumEventStatus: 6,
      plumEventStatusLabel: 'Подтверждено',
    })
  })

  it('возвращает null для статуса при пустом plum_event_status', () => {
    const project = mapBackendCalendarProject(makeCalendarItem())

    expect(project).toMatchObject({
      isFromPlum: false,
      plumEventStatus: null,
      plumEventStatusLabel: null,
    })
  })
})

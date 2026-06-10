import { describe, expect, it } from 'vitest'

import type { VenueHall } from '@/entities/venue'

import type { CreateProjectFormValues } from './create-project-form-values'
import { toProjectCreateRequest } from './to-project-create-request'

function hall(id: number, loftId: number, cityId: number | null): VenueHall {
  return {
    id,
    plum_id: id,
    name: `Hall ${id}`,
    loft: { id: loftId, plum_id: loftId, name: `Loft ${loftId}`, city: cityId },
    synced_at: '2024-01-01T00:00:00Z',
  } as VenueHall
}

// Loft 1 → город 1 (залы 10, 11) | Loft 2 → город 2 (зал 20)
const halls: VenueHall[] = [hall(10, 1, 1), hall(11, 1, 1), hall(20, 2, 2)]

function values(overrides: Partial<CreateProjectFormValues> = {}): CreateProjectFormValues {
  return {
    title: '  Свадьба  ',
    eventType: '5',
    eventDate: '2024-06-01',
    lofts: ['1'],
    halls: ['10', '11'],
    ...overrides,
  }
}

describe('toProjectCreateRequest', () => {
  it('собирает запрос и выводит city_ids из выбранных залов', () => {
    expect(toProjectCreateRequest(values(), halls)).toEqual({
      title: 'Свадьба',
      event_type: 5,
      event_date: '2024-06-01',
      hall_ids: [10, 11],
      city_ids: [1],
    })
  })

  it('дедуплицирует город при нескольких залах одного лофта, объединяет разные города', () => {
    const request = toProjectCreateRequest(values({ halls: ['10', '11', '20'] }), halls)
    expect(request.hall_ids).toEqual([10, 11, 20])
    expect(request.city_ids).toEqual([1, 2])
  })

  it('подставляет mag_manager_id только при валидном id', () => {
    expect(toProjectCreateRequest(values({ magManagerId: '42' }), halls).mag_manager_id).toBe(42)
    expect(
      toProjectCreateRequest(values({ magManagerId: '' }), halls).mag_manager_id,
    ).toBeUndefined()
    expect(
      toProjectCreateRequest(values({ magManagerId: 'abc' }), halls).mag_manager_id,
    ).toBeUndefined()
  })

  it('отбрасывает нечисловые id залов', () => {
    const request = toProjectCreateRequest(values({ halls: ['10', 'x', ''] }), halls)
    expect(request.hall_ids).toEqual([10])
    expect(request.city_ids).toEqual([1])
  })
})

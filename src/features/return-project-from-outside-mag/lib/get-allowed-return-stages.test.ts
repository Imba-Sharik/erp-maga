import { describe, expect, it } from 'vitest'

import { getAllowedReturnStages } from './get-allowed-return-stages'

describe('getAllowedReturnStages', () => {
  it('предпроектный этап в середине: предыдущие + он сам, без более поздних', () => {
    expect(getAllowedReturnStages('calculation_prepared')).toEqual([
      'plum_request',
      'primary_contact_done',
      'calculation_prepared',
    ])
  })

  it('первый этап: только он сам', () => {
    expect(getAllowedReturnStages('plum_request')).toEqual(['plum_request'])
  })

  it('последний предпроектный этап: все пять', () => {
    expect(getAllowedReturnStages('ready_to_event')).toEqual([
      'plum_request',
      'primary_contact_done',
      'calculation_prepared',
      'contract_signed',
      'ready_to_event',
    ])
  })

  it('закрывающий этап: все пять предпроектных доступны', () => {
    expect(getAllowedReturnStages('event_held')).toEqual([
      'plum_request',
      'primary_contact_done',
      'calculation_prepared',
      'contract_signed',
      'ready_to_event',
    ])
  })

  it('undefined: все пять (полагаемся на валидацию бэка)', () => {
    expect(getAllowedReturnStages(undefined)).toEqual([
      'plum_request',
      'primary_contact_done',
      'calculation_prepared',
      'contract_signed',
      'ready_to_event',
    ])
  })

  it('out_of_mag_scope (нет в ALL_STAGE_ORDER): fallback на все пять', () => {
    expect(getAllowedReturnStages('out_of_mag_scope')).toEqual([
      'plum_request',
      'primary_contact_done',
      'calculation_prepared',
      'contract_signed',
      'ready_to_event',
    ])
  })
})

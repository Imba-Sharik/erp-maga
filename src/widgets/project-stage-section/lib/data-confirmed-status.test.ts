import { describe, expect, it } from 'vitest'

import {
  isDataConfirmedStatusField,
  isDataRejectedStatus,
  parseDataConfirmedStatus,
} from './data-confirmed-status'

describe('isDataConfirmedStatusField', () => {
  it('true только для dataConfirmedStatus на этапе data_confirmed', () => {
    expect(isDataConfirmedStatusField('data_confirmed', 'dataConfirmedStatus')).toBe(true)
  })

  it('false для другого поля того же этапа', () => {
    expect(isDataConfirmedStatusField('data_confirmed', 'dataConfirmedAt')).toBe(false)
  })

  it('false для того же поля на другом этапе (правка прошлого этапа)', () => {
    expect(isDataConfirmedStatusField('bonus_calculated', 'dataConfirmedStatus')).toBe(false)
  })
})

describe('parseDataConfirmedStatus', () => {
  it('пропускает confirmed и rejected', () => {
    expect(parseDataConfirmedStatus('confirmed')).toBe('confirmed')
    expect(parseDataConfirmedStatus('rejected')).toBe('rejected')
  })

  it('отбрасывает пустое и чужие значения', () => {
    expect(parseDataConfirmedStatus('')).toBeUndefined()
    expect(parseDataConfirmedStatus('present')).toBeUndefined()
  })
})

describe('isDataRejectedStatus', () => {
  it('true при rejected на data_confirmed', () => {
    expect(isDataRejectedStatus('data_confirmed', 'rejected')).toBe(true)
  })

  it('false при confirmed и при пустом статусе', () => {
    expect(isDataRejectedStatus('data_confirmed', 'confirmed')).toBe(false)
    expect(isDataRejectedStatus('data_confirmed', '')).toBe(false)
    expect(isDataRejectedStatus('data_confirmed', undefined)).toBe(false)
  })

  it('false на другом этапе даже при rejected', () => {
    expect(isDataRejectedStatus('documents_confirmed', 'rejected')).toBe(false)
  })
})

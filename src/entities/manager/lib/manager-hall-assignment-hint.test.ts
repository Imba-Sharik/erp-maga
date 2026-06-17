import { describe, expect, it } from 'vitest'

import {
  hasAssignableManagerOptions,
  isManagersDirectoryOptionsLoading,
  shouldShowManagerHallAssignmentHint,
} from './manager-hall-assignment-hint'

describe('hasAssignableManagerOptions', () => {
  it('false для пустого списка', () => {
    expect(hasAssignableManagerOptions([])).toBe(false)
  })

  it('false, если только текущий менеджер без id', () => {
    expect(hasAssignableManagerOptions([{ id: 'name:Иванов' }])).toBe(false)
  })

  it('true при наличии реального id', () => {
    expect(hasAssignableManagerOptions([{ id: '5' }])).toBe(true)
  })
})

describe('isManagersDirectoryOptionsLoading', () => {
  it('false без фильтра', () => {
    expect(
      isManagersDirectoryOptionsLoading({ filtered: false, isFetched: false, isFetching: false }),
    ).toBe(false)
  })

  it('true пока не завершён первый запрос', () => {
    expect(
      isManagersDirectoryOptionsLoading({ filtered: true, isFetched: false, isFetching: true }),
    ).toBe(true)
  })

  it('true при повторном fetch', () => {
    expect(
      isManagersDirectoryOptionsLoading({ filtered: true, isFetched: true, isFetching: true }),
    ).toBe(true)
  })
})

describe('shouldShowManagerHallAssignmentHint', () => {
  it('false во время загрузки', () => {
    expect(
      shouldShowManagerHallAssignmentHint({
        filtered: true,
        isFetched: false,
        isFetching: true,
        isError: false,
        options: [],
      }),
    ).toBe(false)
  })

  it('false при наличии менеджеров', () => {
    expect(
      shouldShowManagerHallAssignmentHint({
        filtered: true,
        isFetched: true,
        isFetching: false,
        isError: false,
        options: [{ id: '5' }],
      }),
    ).toBe(false)
  })

  it('true после успешного пустого ответа', () => {
    expect(
      shouldShowManagerHallAssignmentHint({
        filtered: true,
        isFetched: true,
        isFetching: false,
        isError: false,
        options: [],
      }),
    ).toBe(true)
  })
})

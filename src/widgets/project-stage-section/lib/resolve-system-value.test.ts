import { describe, expect, it } from 'vitest'

import type { ProjectDetail } from '@/entities/project'
import type { StageRecord } from '@/features/advance-stage'

import { resolveSystemValue } from './resolve-system-value'

const project = { manager: 'Ведущий менеджер' } as ProjectDetail

function resolveDataConfirmedBy(record?: StageRecord) {
  return resolveSystemValue('dataConfirmedBy', undefined, {
    project,
    stage: 'data_confirmed',
    record,
  })
}

describe('resolveSystemValue — dataConfirmedBy', () => {
  it('берёт values.dataConfirmedBy в первую очередь', () => {
    expect(
      resolveDataConfirmedBy({
        values: { dataConfirmedBy: 'Петров Пётр Петрович' },
        completedBy: 'Сидоров',
        enteredBy: 'Иванов',
      }),
    ).toBe('Петров Пётр Петрович')
  })

  it('fallback на completedBy (локальный flow после submit)', () => {
    expect(
      resolveDataConfirmedBy({
        completedBy: 'Сидоров Сидор Сидорович',
        enteredBy: 'Иванов Иван Иванович',
      }),
    ).toBe('Сидоров Сидор Сидорович')
  })

  it('fallback на enteredBy (старый маппинг с бэка)', () => {
    expect(resolveDataConfirmedBy({ enteredBy: 'Иванов Иван Иванович' })).toBe(
      'Иванов Иван Иванович',
    )
  })

  it('возвращает undefined без записи', () => {
    expect(resolveDataConfirmedBy()).toBeUndefined()
  })
})

describe('resolveSystemValue — dataConfirmedAt', () => {
  it('берёт values.dataConfirmedAt с бэка', () => {
    expect(
      resolveSystemValue('dataConfirmedAt', undefined, {
        project,
        stage: 'data_confirmed',
        record: { values: { dataConfirmedAt: '2026-05-01T12:00:00Z' } },
      }),
    ).toBe('2026-05-01T12:00:00Z')
  })
})

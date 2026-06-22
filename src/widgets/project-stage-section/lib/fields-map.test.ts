import { describe, expect, it } from 'vitest'

import type { ProjectDetail, ProjectStage } from '@/entities/project'

import { STAGE_FIELDS } from './fields-map'
import { resolveSystemValue } from './resolve-system-value'

const stages = Object.keys(STAGE_FIELDS) as ProjectStage[]

describe('STAGE_FIELDS — никаких demo/mock-значений в конфиге', () => {
  it('ни у одного поля нет свойства mockValue', () => {
    const offenders = stages.flatMap((stage) =>
      STAGE_FIELDS[stage].filter((f) => 'mockValue' in f).map((f) => `${stage}.${String(f.name)}`),
    )
    expect(offenders).toEqual([])
  })
})

// Конец-в-конец спецификация фикса №1: без реальных данных секция этапа не показывает
// НИЧЕГО выдуманного — каждое системное поле резолвится в undefined (UI рисует «—»).
describe('resolveSystemValue — пустой контекст не даёт выдуманных значений', () => {
  const emptyProject = { manager: '', date: '', enteredSystemAt: '' } as ProjectDetail

  it.each(stages)('этап %s: все системные поля -> undefined', (stage) => {
    const systemFields = STAGE_FIELDS[stage].filter((f) => f.source === 'system')
    for (const field of systemFields) {
      expect(
        resolveSystemValue(field.name, { project: emptyProject, stage }),
        `${stage}.${String(field.name)} должно быть пустым без реальных данных`,
      ).toBeUndefined()
    }
  })
})

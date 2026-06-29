import { describe, expect, it } from 'vitest'

import type { UserRole } from '@/entities/user-role'

import type { ProjectStage } from '../model/types'
import { canAdvanceStage, canEditCurrentStage, STAGE_CAPABILITIES } from './stage-capabilities'

const FUNNEL_STAGES: ProjectStage[] = [
  'primary_contact_done',
  'calculation_prepared',
  'contract_signed',
  'ready_to_event',
  'event_held',
  'expenses_entered',
]

describe('STAGE_CAPABILITIES — матрица прав (current-edit + advance)', () => {
  it('Менеджер и Руководитель ведут текущие этапы воронки', () => {
    for (const stage of FUNNEL_STAGES) {
      expect(canEditCurrentStage(stage, 'manager')).toBe(true)
      expect(canEditCurrentStage(stage, 'director')).toBe(true)
    }
  })

  it('Руководитель НЕ редактирует текущий documents_confirmed (зона Бухгалтера)', () => {
    expect(canEditCurrentStage('documents_confirmed', 'director')).toBe(false)
    expect(canEditCurrentStage('documents_confirmed', 'accountant')).toBe(true)
  })

  it('advance на documents_confirmed — у Бухгалтера и Руководителя, не у Менеджера', () => {
    expect(canAdvanceStage('documents_confirmed', 'accountant')).toBe(true)
    expect(canAdvanceStage('documents_confirmed', 'director')).toBe(true)
    expect(canAdvanceStage('documents_confirmed', 'manager')).toBe(false)
  })

  it('admin не значится в правах редактирования (управляется отдельно)', () => {
    for (const stage of Object.keys(STAGE_CAPABILITIES) as ProjectStage[]) {
      expect(canEditCurrentStage(stage, 'admin')).toBe(false)
    }
  })

  it('терминальные/вне-контурные этапы не редактируются (current-edit пуст)', () => {
    for (const stage of ['out_of_mag_scope', 'archived'] as ProjectStage[]) {
      expect(STAGE_CAPABILITIES[stage].editCurrent).toHaveLength(0)
      for (const role of ['manager', 'accountant', 'director', 'admin'] as UserRole[]) {
        expect(canEditCurrentStage(stage, role)).toBe(false)
      }
    }
  })
})

import { describe, expect, it } from 'vitest'

import type { ProjectDetail, ProjectStage } from '../model/types'
import { resolveStageBlockEditable } from './resolve-stage-block-editable'

type Flags = Pick<
  ProjectDetail,
  | 'canEditClient'
  | 'canEditContract'
  | 'canEditSales'
  | 'canEditExpenses'
  | 'canEditPrimaryContact'
  | 'canEditCalculation'
  | 'canEditEventHeld'
  | 'canEditBonus'
>

describe('resolveStageBlockEditable', () => {
  it('маппит секцию этапа на соответствующий бэк-флаг can_edit_*', () => {
    const flags: Flags = {
      canEditClient: true,
      canEditContract: true,
      canEditSales: false,
      canEditExpenses: true,
      canEditPrimaryContact: true,
      canEditCalculation: false,
      canEditEventHeld: true,
      canEditBonus: false,
    }
    expect(resolveStageBlockEditable(flags, 'plum_request')).toBe(true)
    expect(resolveStageBlockEditable(flags, 'primary_contact_done')).toBe(true)
    expect(resolveStageBlockEditable(flags, 'calculation_prepared')).toBe(false)
    expect(resolveStageBlockEditable(flags, 'contract_signed')).toBe(true)
    expect(resolveStageBlockEditable(flags, 'ready_to_event')).toBe(false)
    expect(resolveStageBlockEditable(flags, 'expenses_entered')).toBe(true)
    expect(resolveStageBlockEditable(flags, 'event_held')).toBe(true)
    expect(resolveStageBlockEditable(flags, 'bonus_calculated')).toBe(false)
  })

  it('undefined для этапов без block-ручки (правки задним числом нет)', () => {
    const flags: Flags = {
      canEditClient: true,
      canEditContract: true,
      canEditSales: true,
      canEditExpenses: true,
      canEditPrimaryContact: true,
      canEditCalculation: true,
      canEditEventHeld: true,
      canEditBonus: true,
    }
    const noHandle: ProjectStage[] = [
      'documents_confirmed',
      'data_confirmed',
      'bonus_approved',
      'closed',
      'out_of_mag_scope',
      'archived',
    ]
    for (const stage of noHandle) {
      expect(resolveStageBlockEditable(flags, stage)).toBeUndefined()
    }
  })
})

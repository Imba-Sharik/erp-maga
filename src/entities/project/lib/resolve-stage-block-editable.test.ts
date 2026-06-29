import { describe, expect, it } from 'vitest'

import type { ProjectDetail, ProjectStage } from '../model/types'
import { resolveStageBlockEditable } from './resolve-stage-block-editable'

type Flags = Pick<
  ProjectDetail,
  'canEditClient' | 'canEditContract' | 'canEditSales' | 'canEditExpenses'
>

describe('resolveStageBlockEditable', () => {
  it('маппит секцию этапа на соответствующий бэк-флаг can_edit_*', () => {
    const flags: Flags = {
      canEditClient: true,
      canEditContract: true,
      canEditSales: false,
      canEditExpenses: true,
    }
    expect(resolveStageBlockEditable(flags, 'plum_request')).toBe(true)
    expect(resolveStageBlockEditable(flags, 'contract_signed')).toBe(true)
    expect(resolveStageBlockEditable(flags, 'ready_to_event')).toBe(false)
    expect(resolveStageBlockEditable(flags, 'expenses_entered')).toBe(true)
  })

  it('undefined для этапов без block-ручки (правки задним числом нет)', () => {
    const flags: Flags = {
      canEditClient: true,
      canEditContract: true,
      canEditSales: true,
      canEditExpenses: true,
    }
    const noHandle: ProjectStage[] = [
      'primary_contact_done',
      'calculation_prepared',
      'event_held',
      'documents_confirmed',
      'data_confirmed',
      'bonus_calculated',
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

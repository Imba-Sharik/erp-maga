import { describe, expect, it } from 'vitest'

import {
  resolveStageBlockEditable,
  resolveStageEditAccess,
  type ProjectDetail,
  type ProjectStage,
} from '@/entities/project'

import { isStagePatchable } from './stage-patch-registry'

type Flags = Pick<
  ProjectDetail,
  | 'canEditClient'
  | 'canEditContract'
  | 'canEditSales'
  | 'canEditExpenses'
  | 'canEditPrimaryContact'
  | 'canEditCalculation'
>

const ALL_EDITABLE: Flags = {
  canEditClient: true,
  canEditContract: true,
  canEditSales: true,
  canEditExpenses: true,
  canEditPrimaryContact: true,
  canEditCalculation: true,
}
// Так бэк отвечает на archived/out_of_mag, на прошедшую дату события и т.п.
const NONE_EDITABLE: Flags = {
  canEditClient: false,
  canEditContract: false,
  canEditSales: false,
  canEditExpenses: false,
  canEditPrimaryContact: false,
  canEditCalculation: false,
}

const PATCHABLE_STAGES: ProjectStage[] = [
  'plum_request',
  'primary_contact_done',
  'calculation_prepared',
  'contract_signed',
  'ready_to_event',
  'expenses_entered',
]

/**
 * Сквозное правило видимости кнопки «Редактировать» на пройденном этапе
 * (как в project-stage-section.tsx): бэк разрешил блок (can_edit_*) И у этапа есть
 * реальный PATCH-маршрут. Композиция flag → resolver × registry проверяется без рендера
 * (в репозитории нет render-инфраструктуры — только unit-тесты).
 */
function showsPassedEditButton(flags: Flags, stage: ProjectStage, readOnly = false): boolean {
  const access = resolveStageEditAccess({
    stage,
    role: 'director',
    isCurrent: false,
    readOnly,
    blockEditable: resolveStageBlockEditable(flags, stage),
  })
  return access.canEditPassed && isStagePatchable(stage)
}

describe('видимость кнопки «Редактировать» на пройденном этапе', () => {
  it('кнопка есть, когда бэк разрешил блок и у этапа есть PATCH-ручка', () => {
    for (const stage of PATCHABLE_STAGES) {
      expect(showsPassedEditButton(ALL_EDITABLE, stage)).toBe(true)
    }
  })

  it('кнопки нет, когда бэк запретил блок (archived/out_of_mag/прошедшая дата → can_edit_*=false)', () => {
    for (const stage of PATCHABLE_STAGES) {
      expect(showsPassedEditButton(NONE_EDITABLE, stage)).toBe(false)
    }
  })

  it('read-only НЕ скрывает кнопку (passed-edit развязан с read-only)', () => {
    expect(showsPassedEditButton(ALL_EDITABLE, 'contract_signed', true)).toBe(true)
  })

  it('нет кнопки на documents_confirmed (нет block-ручки, бухгалтерская зона)', () => {
    expect(showsPassedEditButton(ALL_EDITABLE, 'documents_confirmed')).toBe(false)
  })

  it('нет кнопки на этапах без PATCH-ручки, даже если флаги выставлены (нет block-маршрута)', () => {
    for (const stage of ['event_held', 'bonus_calculated'] as ProjectStage[]) {
      expect(resolveStageBlockEditable(ALL_EDITABLE, stage)).toBeUndefined()
      expect(isStagePatchable(stage)).toBe(false)
      expect(showsPassedEditButton(ALL_EDITABLE, stage)).toBe(false)
    }
  })
})

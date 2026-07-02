import { describe, expect, it } from 'vitest'

import type { StageFieldConfig } from './fields-map'
import { canEditField } from './stage-permissions'

const managerField: StageFieldConfig = {
  name: 'contractNumber',
  label: '',
  type: 'text',
  source: 'manager',
}
const systemField: StageFieldConfig = {
  name: 'createdAt',
  label: '',
  type: 'date',
  source: 'system',
}
const accountantOnlyField: StageFieldConfig = {
  name: 'projectDocsStatus',
  label: '',
  type: 'text',
  source: 'manager',
  editRoles: ['accountant'],
}

describe('canEditField — current', () => {
  it('менеджер правит manager-поле на этапе своей роли', () => {
    expect(canEditField('contract_signed', 'manager', managerField, 'current')).toBe(true)
  })

  it('роль вне editCurrent этапа не правит', () => {
    expect(canEditField('contract_signed', 'accountant', managerField, 'current')).toBe(false)
  })

  it('системные поля не правит никто', () => {
    expect(canEditField('contract_signed', 'manager', systemField, 'current')).toBe(false)
  })
})

describe('canEditField — passed (блок-гейт у бэка, здесь лишь пофайловые исключения)', () => {
  it('ролевая матрица этапа НЕ применяется (блок уже разрешил бэк-флаг)', () => {
    // accountant нет в editCurrent contract_signed, но passed-гейт это не смотрит.
    expect(canEditField('contract_signed', 'accountant', managerField, 'passed')).toBe(true)
  })

  it('системные поля не правит никто и в passed', () => {
    expect(canEditField('plum_request', 'director', systemField, 'passed')).toBe(false)
  })

  it('editRoles ограничивает и в passed (статус документов остаётся за Бухгалтером)', () => {
    expect(canEditField('documents_confirmed', 'director', accountantOnlyField, 'passed')).toBe(
      false,
    )
    expect(canEditField('documents_confirmed', 'accountant', accountantOnlyField, 'passed')).toBe(
      true,
    )
  })
})

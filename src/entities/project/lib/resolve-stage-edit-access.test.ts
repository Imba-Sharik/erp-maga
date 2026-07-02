import { describe, expect, it } from 'vitest'

import { resolveStageEditAccess } from './resolve-stage-edit-access'

describe('resolveStageEditAccess', () => {
  it('менеджер ведёт текущий этап, когда проект не read-only', () => {
    expect(
      resolveStageEditAccess({
        stage: 'primary_contact_done',
        role: 'manager',
        isCurrent: true,
        readOnly: false,
        blockEditable: undefined,
      }),
    ).toEqual({ canEditCurrent: true, canEditPassed: false, canAdvance: true })
  })

  it('read-only гасит current-edit и advance', () => {
    expect(
      resolveStageEditAccess({
        stage: 'primary_contact_done',
        role: 'manager',
        isCurrent: true,
        readOnly: true,
        blockEditable: undefined,
      }),
    ).toEqual({ canEditCurrent: false, canEditPassed: false, canAdvance: false })
  })

  it('read-only НЕ мешает править пройденный блок, если бэк разрешил (развязка)', () => {
    expect(
      resolveStageEditAccess({
        stage: 'contract_signed',
        role: 'director',
        isCurrent: false,
        readOnly: true,
        blockEditable: true,
      }),
    ).toEqual({ canEditCurrent: false, canEditPassed: true, canAdvance: false })
  })

  it('canEditPassed=false для текущего этапа (его правят как current)', () => {
    expect(
      resolveStageEditAccess({
        stage: 'contract_signed',
        role: 'director',
        isCurrent: true,
        readOnly: true,
        blockEditable: true,
      }).canEditPassed,
    ).toBe(false)
  })

  it('canEditPassed=false, когда бэк не разрешает блок (can_edit_* = false)', () => {
    expect(
      resolveStageEditAccess({
        stage: 'contract_signed',
        role: 'director',
        isCurrent: false,
        readOnly: false,
        blockEditable: false,
      }).canEditPassed,
    ).toBe(false)
  })

  it('canEditPassed=false, когда у этапа нет block-ручки (blockEditable=undefined)', () => {
    expect(
      resolveStageEditAccess({
        stage: 'documents_confirmed',
        role: 'director',
        isCurrent: false,
        readOnly: false,
        blockEditable: undefined,
      }).canEditPassed,
    ).toBe(false)
  })
})

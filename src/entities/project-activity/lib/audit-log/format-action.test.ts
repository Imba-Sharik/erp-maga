import { describe, expect, it } from 'vitest'

import type { ProjectAuditLog } from '@/shared/api/generated/types/ProjectAuditLog'

import { formatAuditLogAction } from './format-action'

function makeEntry(overrides: Partial<ProjectAuditLog>): ProjectAuditLog {
  return {
    id: 1,
    created_at: '2026-05-27T15:46:55.336763+03:00',
    action_type: 'other',
    action_label: 'Прочее',
    field_name: '',
    old_value: '',
    new_value: '',
    stage: null,
    source: 'user',
    metadata: null,
    user: null,
    ...overrides,
  }
}

const managerContext = {
  managerNameById: new Map([
    [2, 'Игорь Менеджеров'],
    [5, 'Анна Бухгалтерова'],
  ]),
}

describe('formatAuditLogAction', () => {
  it('форматирует смену стадии с человекочитаемыми названиями', () => {
    const action = formatAuditLogAction(
      makeEntry({
        action_type: 'stage_change',
        action_label: 'Смена стадии',
        field_name: 'stage',
        old_value: 'plum_request',
        new_value: 'primary_contact_done',
      }),
    )

    expect(action).toBe('перевёл статус из «Заявка из PLUM» в «Первич. контакт выполнен»')
  })

  it('форматирует статус закрывающего документа', () => {
    const action = formatAuditLogAction(
      makeEntry({
        action_type: 'field_change',
        action_label: 'Изменение поля',
        field_name: 'document.staff_receipts',
        old_value: 'yes',
        new_value: 'not_required',
      }),
    )

    expect(action).toBe('изменил статус «Расписки по персоналу»: «Есть» → «Не требуется»')
  })

  it('форматирует назначение менеджера по id', () => {
    const action = formatAuditLogAction(
      makeEntry({
        action_type: 'field_change',
        action_label: 'Изменение поля',
        field_name: 'mag_manager',
        old_value: '',
        new_value: '2',
      }),
      managerContext,
    )

    expect(action).toBe('назначил менеджера «Игорь Менеджеров»')
  })

  it('форматирует смену менеджера по id', () => {
    const action = formatAuditLogAction(
      makeEntry({
        action_type: 'field_change',
        action_label: 'Изменение поля',
        field_name: 'mag_manager',
        old_value: '2',
        new_value: '5',
      }),
      managerContext,
    )

    expect(action).toBe('изменил менеджера проекта: «Игорь Менеджеров» → «Анна Бухгалтерова»')
  })

  it('форматирует неизвестное поле через generic-лейбл', () => {
    const action = formatAuditLogAction(
      makeEntry({
        action_type: 'field_change',
        action_label: 'Изменение поля',
        field_name: 'contract_number',
        old_value: '001',
        new_value: '002',
      }),
    )

    expect(action).toBe('изменил «номер договора»: «001» → «002»')
  })

  it('переводит дотированное имя поля-комментария', () => {
    const action = formatAuditLogAction(
      makeEntry({
        action_type: 'field_change',
        action_label: 'Изменение поля',
        field_name: 'calculation.comment',
        old_value: 'test',
        new_value: 'test123',
      }),
    )

    expect(action).toBe('изменил «комментарий к расчёту»: «test» → «test123»')
  })

  it('различает комментарии разных секций по дотированному пути', () => {
    const action = formatAuditLogAction(
      makeEntry({
        action_type: 'field_change',
        action_label: 'Изменение поля',
        field_name: 'primary_contact.comment',
        old_value: '',
        new_value: 'test',
      }),
    )

    expect(action).toBe('установил «комментарий по контакту»: «test»')
  })

  it('переводит enum-значение канала контакта', () => {
    const action = formatAuditLogAction(
      makeEntry({
        action_type: 'field_change',
        action_label: 'Изменение поля',
        field_name: 'primary_contact.contact_channel',
        old_value: 'messenger',
        new_value: 'meeting',
      }),
    )

    expect(action).toBe('изменил «канал контакта»: «Мессенджер» → «Встреча»')
  })

  it('добавляет к правке поля контекст этапа', () => {
    const action = formatAuditLogAction(
      makeEntry({
        action_type: 'field_change',
        action_label: 'Изменение поля',
        field_name: 'tax_rate',
        old_value: '10',
        new_value: '20',
        stage: 'expenses_entered',
      }),
    )

    expect(action).toBe('изменил «налог»: «10» → «20» · этап «Расходы внесены»')
  })
})

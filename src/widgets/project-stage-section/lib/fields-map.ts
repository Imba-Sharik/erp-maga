import type { ProjectStage, StageFormData } from '@/entities/project'
import { DOCUMENT_STATUS_OPTIONS } from '@/entities/project-documents'
import type { StageDocumentType } from '@/entities/stage-document-files'
import type { UserRole } from '@/entities/user-role'

export type StageFieldType = 'text' | 'textarea' | 'date' | 'select' | 'phone' | 'document'
export type StageFieldSource = 'manager' | 'system'
export type StageFieldRole = 'manager' | 'accountant' | 'director' | 'admin'
export type { StageDocumentType }

export interface StageFieldConfig {
  name: keyof StageFormData
  label: string
  type: StageFieldType
  required?: boolean
  placeholder?: string
  options?: { value: string; label: string }[]
  /** Кто заполняет поле — менеджер вводит руками, система проставляет автоматически. */
  source?: StageFieldSource
  /** Если задано — поле показывается на текущем этапе только этим ролям. */
  roles?: readonly StageFieldRole[]
  /** Кто может редактировать; по умолчанию совпадает с `roles`. */
  editRoles?: readonly StageFieldRole[]
  /** Тип документа в API (для загрузки файлов). */
  documentType?: StageDocumentType
  /** Демонстрационное значение, показывается, если в entry.data ничего нет. */
  mockValue?: string
  /** Колспан на сетке passed-секции (по умолчанию 1 из 3). */
  span?: 1 | 2 | 3
  /** Два подряд `narrow: true` поля рендерятся внутри одной ячейки сетки. */
  narrow?: boolean
  /** Доп. класс на сам инпут (например, ограничение ширины date-пикера). */
  inputClassName?: string
}

/** Поле видно для роли; `roles` не задан — системное поле, видно всем. */
export function isFieldVisibleForRole(
  field: StageFieldConfig,
  role: UserRole,
  _context: 'current' | 'passed',
): boolean {
  if (!field.roles) return true
  return field.roles.includes(role)
}

export function filterStageFields(
  fields: StageFieldConfig[],
  role: UserRole,
  context: 'current' | 'passed',
): StageFieldConfig[] {
  return fields.filter((f) => isFieldVisibleForRole(f, role, context))
}

const docStatusOptions = [...DOCUMENT_STATUS_OPTIONS]

export const STAGE_FIELDS: Record<ProjectStage, StageFieldConfig[]> = {
  plum_request: [
    {
      name: 'clientCompany',
      label: 'Клиент',
      type: 'text',
      source: 'manager',
      required: true,
      mockValue: 'Иванов Иван Иванович',
    },
    {
      name: 'phone',
      label: 'Телефон',
      type: 'phone',
      source: 'manager',
      required: true,
      mockValue: '+7 (999) 999-99-99',
    },
    {
      name: 'createdAt',
      label: 'Дата создания проекта в системе',
      type: 'date',
      source: 'system',
      mockValue: '2026-05-06',
    },
    {
      name: 'contactPerson',
      label: 'Контактное лицо',
      type: 'text',
      source: 'manager',
      required: true,
      mockValue: 'Ленин Сталин Марксович',
    },
    {
      name: 'email',
      label: 'Email',
      type: 'text',
      source: 'manager',
      mockValue: 'client@gmail.com',
    },
  ],
  primary_contact_done: [
    {
      name: 'contactComment',
      label: 'Комментарий по контакту',
      type: 'textarea',
      required: true,
      source: 'manager',
      mockValue: 'Договорились о смете до 25 апреля, нужен экран и расширенный звук.',
    },
    {
      name: 'leadManager',
      label: 'Статус перевёл менеджер',
      type: 'text',
      source: 'system',
      mockValue: 'Иванов Иван Иванович',
    },
    {
      name: 'contactedAt',
      label: 'Дата первичного контакта',
      type: 'date',
      source: 'system',
      mockValue: '2026-05-07',
    },
    {
      name: 'contactChannel',
      label: 'Канал контакта',
      type: 'select',
      required: true,
      source: 'manager',
      options: [
        { value: 'messenger', label: 'Мессенджер' },
        { value: 'meeting', label: 'Встреча' },
        { value: 'phone', label: 'Звонок' },
      ],
      mockValue: 'messenger',
    },
  ],
  calculation_prepared: [
    {
      name: 'calcComment',
      label: 'Комментарий к расчёту',
      type: 'textarea',
      required: true,
      source: 'manager',
      mockValue: 'Основной блок: оборудование + персонал — 1.8 млн, бэклайн 220 тыс.',
    },
    {
      name: 'leadManager',
      label: 'Статус перевёл менеджер',
      type: 'text',
      source: 'system',
      mockValue: 'Иванов Иван Иванович',
    },
    {
      name: 'closingFunnelEnteredAt',
      label: 'Дата перехода в статус',
      type: 'date',
      source: 'system',
      mockValue: '2026-05-09',
    },
  ],
  contract_signed: [
    {
      name: 'contractType',
      label: 'Тип договора',
      type: 'select',
      source: 'manager',
      options: [
        { value: 'with_vat', label: 'С НДС' },
        { value: 'without_vat', label: 'Без НДС' },
      ],
      mockValue: 'with_vat',
    },
    {
      name: 'contractNumber',
      label: 'Номер договора',
      type: 'text',
      source: 'manager',
      mockValue: 'MAG-2026/142',
      narrow: true,
    },
    {
      name: 'contractDate',
      label: 'Дата договора',
      type: 'date',
      source: 'manager',
      placeholder: 'дд-мм-гггг',
      mockValue: '2026-05-11',
      narrow: true,
      inputClassName: 'max-w-[130px]',
    },
    {
      name: 'leadManager',
      label: 'Статус перевёл менеджер',
      type: 'text',
      source: 'system',
      mockValue: 'Иванов Иван Иванович',
    },
    {
      name: 'legalEntity',
      label: 'Юрлицо MAG',
      type: 'text',
      source: 'manager',
      mockValue: 'ООО «MAG Продакшен»',
    },
    {
      name: 'contractComment',
      label: 'Комментарий по договору',
      type: 'text',
      source: 'manager',
      placeholder: '—',
    },
    {
      name: 'closingFunnelEnteredAt',
      label: 'Дата перехода в статус',
      type: 'date',
      source: 'system',
      mockValue: '2026-05-09',
    },
  ],
  ready_to_event: [
    {
      name: 'salesMainTotal',
      label: 'Итого продажи (основной блок)',
      type: 'text',
      source: 'system',
      mockValue: '1 718 000 ₽',
    },
    {
      name: 'salesBacklineTotal',
      label: 'Итого продажи бэклайна',
      type: 'text',
      source: 'system',
      mockValue: '220 000 ₽',
    },
    {
      name: 'salesProjectTotal',
      label: 'Итого продажи проекта',
      type: 'text',
      source: 'system',
      mockValue: '1 938 000 ₽',
    },
    {
      name: 'taxRate',
      label: 'Единый % налога',
      type: 'text',
      source: 'manager',
      mockValue: '15%',
    },
    {
      name: 'taxAmount',
      label: 'Сумма налога',
      type: 'text',
      source: 'system',
      mockValue: '290 700 ₽',
    },
    {
      name: 'leadManager',
      label: 'Статус перевёл менеджер',
      type: 'text',
      source: 'system',
      mockValue: 'Иванов Иван Иванович',
    },
  ],
  event_held: [
    {
      name: 'postEventComment',
      label: 'Комментарий после мероприятия',
      type: 'textarea',
      source: 'manager',
      mockValue: 'Всё прошло успешно, клиент остался крайне доволен предоставленным оборудованием.',
      span: 1,
    },
    {
      name: 'eventDate',
      label: 'Дата мероприятия',
      type: 'date',
      source: 'system',
      mockValue: '2026-05-09',
    },
    {
      name: 'closingFunnelEnteredAt',
      label: 'Дата перехода в закр воронку',
      type: 'date',
      source: 'system',
      mockValue: '2026-05-09',
    },
    {
      name: 'eventReadiness',
      label: 'Статус готовности к проведению',
      type: 'text',
      source: 'system',
      mockValue: 'Был готов',
    },
  ],
  expenses_entered: [
    {
      name: 'expensesMainTotal',
      label: 'Итого расходы (основной блок)',
      type: 'text',
      source: 'system',
      mockValue: '1 020 000 ₽',
    },
    {
      name: 'expensesBacklineTotal',
      label: 'Итого расходы бэклайна',
      type: 'text',
      source: 'system',
      mockValue: '170 000 ₽',
    },
    {
      name: 'expensesProjectTotal',
      label: 'Итого расходы проекта',
      type: 'text',
      source: 'system',
      mockValue: '1 190 000 ₽',
    },
    {
      name: 'postEventComment',
      label: 'Комментарий к расходам',
      type: 'textarea',
      source: 'manager',
      mockValue: 'Всё прошло успешно, клиент остался крайне доволен предоставленным оборудованием.',
      span: 1,
    },
    {
      name: 'leadManager',
      label: 'Статус перевёл менеджер',
      type: 'text',
      source: 'system',
      mockValue: 'Иванов Иван Иванович',
    },
    {
      name: 'closingFunnelEnteredAt',
      label: 'Дата перехода в статус',
      type: 'date',
      source: 'system',
      mockValue: '2026-05-09',
    },
  ],
  documents_confirmed: [
    {
      name: 'projectDocsStatus',
      label: 'Закрывающие по проекту',
      type: 'select',
      required: false,
      placeholder: 'Выберите статус',
      source: 'manager',
      roles: ['accountant', 'director'],
      editRoles: ['accountant'],
      options: docStatusOptions,
    },
    {
      name: 'projectDocsFileName',
      label: 'Закрывающие по проекту',
      type: 'document',
      source: 'manager',
      roles: ['manager'],
      editRoles: ['manager', 'accountant'],
      documentType: 'project_closing',
    },
    {
      name: 'projectDocsConfirmedAt',
      label: 'Дата подтверждения документа',
      type: 'date',
      source: 'system',
    },
    {
      name: 'projectDocsConfirmedBy',
      label: 'Кто подтвердил',
      type: 'text',
      source: 'system',
    },
    {
      name: 'subleaseDocsStatus',
      label: 'Закрывающие по субаренде',
      type: 'select',
      required: false,
      placeholder: 'Выберите статус',
      source: 'manager',
      roles: ['accountant', 'director'],
      editRoles: ['accountant'],
      options: docStatusOptions,
    },
    {
      name: 'subleaseDocsFileName',
      label: 'Закрывающие по субаренде',
      type: 'document',
      source: 'manager',
      roles: ['manager'],
      editRoles: ['manager', 'accountant'],
      documentType: 'subrent_closing',
    },
    {
      name: 'subleaseDocsConfirmedAt',
      label: 'Дата подтверждения документа',
      type: 'date',
      source: 'system',
    },
    {
      name: 'subleaseDocsConfirmedBy',
      label: 'Кто подтвердил',
      type: 'text',
      source: 'system',
    },
    {
      name: 'staffReceiptsStatus',
      label: 'Расписки по персоналу',
      type: 'select',
      required: false,
      placeholder: 'Выберите статус',
      source: 'manager',
      roles: ['accountant', 'director'],
      editRoles: ['accountant'],
      options: docStatusOptions,
    },
    {
      name: 'staffReceiptsFileName',
      label: 'Расписки по персоналу',
      type: 'document',
      source: 'manager',
      roles: ['manager'],
      editRoles: ['manager', 'accountant'],
      documentType: 'staff_receipts',
    },
    {
      name: 'staffReceiptsConfirmedAt',
      label: 'Дата подтверждения документа',
      type: 'date',
      source: 'system',
    },
    {
      name: 'staffReceiptsConfirmedBy',
      label: 'Кто подтвердил',
      type: 'text',
      source: 'system',
    },
  ],
  data_confirmed: [
    {
      name: 'dataConfirmedStatus',
      label: 'Статус',
      type: 'select',
      required: true,
      source: 'manager',
      options: [
        { value: 'confirmed', label: 'Данные подтверждены' },
        { value: 'rejected', label: 'Не приняты' },
      ],
      placeholder: '—',
    },
    {
      name: 'dataConfirmedAt',
      label: 'Дата подтверждения данных',
      type: 'date',
      source: 'system',
    },
    {
      name: 'dataConfirmedBy',
      label: 'Кто подтвердил',
      type: 'text',
      source: 'system',
    },
  ],
  bonus_calculated: [
    {
      name: 'salesProjectTotal',
      label: 'Итого продажи проекта',
      type: 'text',
      source: 'system',
      mockValue: '1 938 000 ₽',
    },
    {
      name: 'expensesProjectTotal',
      label: 'Итого расходы проекта',
      type: 'text',
      source: 'system',
      mockValue: '1 190 000 ₽',
    },
    {
      name: 'netProfitTotal',
      label: 'Итоговая чистая прибыль',
      type: 'text',
      source: 'system',
      mockValue: '748 000 ₽',
    },
    {
      name: 'calculatedBonus',
      label: 'Итоговый бонус (рассчитанный)',
      type: 'text',
      source: 'system',
      mockValue: '443 330 ₽',
    },
    {
      name: 'leadManager',
      label: 'Получатель бонуса',
      type: 'text',
      source: 'system',
      mockValue: 'Иванов Иван Иванович',
    },
    {
      name: 'bonusCalculatedAt',
      label: 'Дата расчёта бонуса',
      type: 'date',
      source: 'system',
      mockValue: '2026-05-09',
    },
  ],
  bonus_approved: [
    {
      name: 'totalBonus',
      label: 'Итоговый бонус',
      type: 'text',
      source: 'system',
    },
    {
      name: 'bonusApprovedAt',
      label: 'Дата подтверждения бонуса',
      type: 'date',
      source: 'system',
      mockValue: '2026-05-09',
    },
    {
      name: 'bonusApprovedBy',
      label: 'Кто подтвердил',
      type: 'text',
      source: 'system',
      mockValue: 'Иванов Иван Иванович',
    },
  ],
  closed: [
    {
      name: 'closedAt',
      label: 'Дата закрытия',
      type: 'date',
      source: 'system',
    },
    {
      name: 'leadManager',
      label: 'Ведущий менеджер',
      type: 'text',
      source: 'system',
    },
  ],
  out_of_mag_scope: [],
  archived: [],
}

export interface PassedExtra {
  label: string
  source: 'manager' | 'enteredAt'
}

export const PASSED_EXTRAS: Record<ProjectStage, PassedExtra[]> = {
  plum_request: [],
  primary_contact_done: [],
  calculation_prepared: [],
  contract_signed: [],
  ready_to_event: [],
  event_held: [],
  expenses_entered: [],
  documents_confirmed: [],
  data_confirmed: [],
  bonus_calculated: [],
  bonus_approved: [],
  closed: [],
  out_of_mag_scope: [],
  archived: [],
}

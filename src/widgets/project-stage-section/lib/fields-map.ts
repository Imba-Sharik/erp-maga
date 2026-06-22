import type { ProjectStage, StageFormData } from '@/entities/project'
import { DOCUMENT_STATUS_OPTIONS } from '@/entities/project-documents'
import type { StageDocumentType } from '@/entities/stage-document-files'
import type { UserRole } from '@/entities/user-role'

export type StageFieldType =
  | 'text'
  | 'textarea'
  | 'date'
  | 'select'
  | 'phone'
  | 'document'
  | 'estimate'
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
  /** Подпись кнопки прикрепления (для `type: 'estimate'` / документов). */
  addButtonLabel?: string
  /** Колспан на сетке passed-секции (по умолчанию 1 из 3). */
  span?: 1 | 2 | 3
  /** Два подряд `narrow: true` поля рендерятся внутри одной ячейки сетки. */
  narrow?: boolean
  /** Доп. класс на сам инпут (например, ограничение ширины date-пикера). */
  inputClassName?: string
  /** Сохранить значение на бэк при blur (PATCH этапа, не transition). */
  patchOnBlur?: boolean
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
    },
    {
      name: 'phone',
      label: 'Телефон',
      type: 'phone',
      source: 'manager',
      required: true,
    },
    {
      name: 'createdAt',
      label: 'Дата создания проекта в системе',
      type: 'date',
      source: 'system',
    },
    {
      name: 'contactPerson',
      label: 'Контактное лицо',
      type: 'text',
      source: 'manager',
      required: true,
    },
    {
      name: 'email',
      label: 'Email',
      type: 'text',
      source: 'manager',
    },
    {
      name: 'magComment',
      label: 'Комментарий ',
      type: 'text',
      source: 'manager',
      patchOnBlur: true,
    },
  ],
  primary_contact_done: [
    {
      name: 'contactComment',
      label: 'Комментарий по контакту',
      type: 'textarea',
      required: true,
      source: 'manager',
    },
    {
      name: 'leadManager',
      label: 'Статус перевёл менеджер',
      type: 'text',
      source: 'system',
    },
    {
      name: 'contactedAt',
      label: 'Дата первичного контакта',
      type: 'date',
      source: 'system',
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
    },
  ],
  calculation_prepared: [
    {
      name: 'calcComment',
      label: 'Комментарий к расчёту',
      type: 'textarea',
      required: true,
      source: 'manager',
    },
    {
      name: 'leadManager',
      label: 'Статус перевёл менеджер',
      type: 'text',
      source: 'system',
    },
    {
      name: 'closingFunnelEnteredAt',
      label: 'Дата перехода в статус',
      type: 'date',
      source: 'system',
    },
    {
      name: 'estimateFileName',
      label: 'Смета',
      type: 'estimate',
      required: true,
      source: 'manager',
      addButtonLabel: 'Добавить смету',
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
    },
    {
      name: 'contractNumber',
      label: 'Номер договора',
      type: 'text',
      source: 'manager',
      narrow: true,
    },
    {
      name: 'contractDate',
      label: 'Дата договора',
      type: 'date',
      source: 'manager',
      placeholder: 'дд-мм-гггг',
      narrow: true,
      inputClassName: 'h-9! max-w-[130px]',
    },
    {
      name: 'leadManager',
      label: 'Статус перевёл менеджер',
      type: 'text',
      source: 'system',
    },
    {
      name: 'legalEntity',
      label: 'Юрлицо MAG',
      type: 'text',
      source: 'manager',
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
    },
  ],
  ready_to_event: [
    {
      name: 'salesMainTotal',
      label: 'Итого продажи (основной блок)',
      type: 'text',
      source: 'system',
    },
    {
      name: 'salesBacklineTotal',
      label: 'Итого продажи бэклайна',
      type: 'text',
      source: 'system',
    },
    {
      name: 'salesProjectTotal',
      label: 'Итого продажи проекта',
      type: 'text',
      source: 'system',
    },
    {
      name: 'taxRate',
      label: 'Единый % налога',
      type: 'text',
      source: 'manager',
    },
    {
      name: 'taxAmount',
      label: 'Сумма налога',
      type: 'text',
      source: 'system',
    },
    {
      name: 'leadManager',
      label: 'Статус перевёл менеджер',
      type: 'text',
      source: 'system',
    },
  ],
  event_held: [
    {
      name: 'postEventComment',
      label: 'Комментарий после мероприятия',
      type: 'textarea',
      source: 'manager',
      span: 1,
    },
    {
      name: 'eventDate',
      label: 'Дата мероприятия',
      type: 'date',
      source: 'system',
    },
    {
      name: 'closingFunnelEnteredAt',
      label: 'Дата перехода в закр воронку',
      type: 'date',
      source: 'system',
    },
    {
      name: 'eventReadiness',
      label: 'Статус готовности к проведению',
      type: 'text',
      source: 'system',
    },
  ],
  expenses_entered: [
    {
      name: 'expensesMainTotal',
      label: 'Итого расходы (основной блок)',
      type: 'text',
      source: 'system',
    },
    {
      name: 'expensesBacklineTotal',
      label: 'Итого расходы бэклайна',
      type: 'text',
      source: 'system',
    },
    {
      name: 'expensesProjectTotal',
      label: 'Итого расходы проекта',
      type: 'text',
      source: 'system',
    },
    {
      name: 'postEventComment',
      label: 'Комментарий к расходам',
      type: 'textarea',
      source: 'manager',
      span: 1,
    },
    {
      name: 'leadManager',
      label: 'Статус перевёл менеджер',
      type: 'text',
      source: 'system',
    },
    {
      name: 'closingFunnelEnteredAt',
      label: 'Дата перехода в статус',
      type: 'date',
      source: 'system',
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
    },
    {
      name: 'expensesProjectTotal',
      label: 'Итого расходы проекта',
      type: 'text',
      source: 'system',
    },
    {
      name: 'netProfitTotal',
      label: 'Итоговая чистая прибыль',
      type: 'text',
      source: 'system',
    },
    {
      name: 'calculatedBonus',
      label: 'Итоговый бонус (рассчитанный)',
      type: 'text',
      source: 'system',
    },
    {
      name: 'leadManager',
      label: 'Получатель бонуса',
      type: 'text',
      source: 'system',
    },
    {
      name: 'bonusCalculatedAt',
      label: 'Дата расчёта бонуса',
      type: 'date',
      source: 'system',
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
    },
    {
      name: 'bonusApprovedBy',
      label: 'Кто подтвердил',
      type: 'text',
      source: 'system',
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

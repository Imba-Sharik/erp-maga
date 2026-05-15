import type { ProjectStage, StageFormData } from '@/entities/project'

export type StageFieldType = 'text' | 'textarea' | 'date' | 'select'
export type StageFieldSource = 'manager' | 'system'

export interface StageFieldConfig {
  name: keyof StageFormData
  label: string
  type: StageFieldType
  required?: boolean
  placeholder?: string
  options?: { value: string; label: string }[]
  /** Кто заполняет поле — менеджер вводит руками, система проставляет автоматически. */
  source?: StageFieldSource
  /** Демонстрационное значение, показывается, если в entry.data ничего нет. */
  mockValue?: string
  /** Колспан на сетке passed-секции (по умолчанию 1 из 3). */
  span?: 1 | 2 | 3
}

const docStatusOptions = [
  { value: 'present', label: 'Есть' },
  { value: 'absent', label: 'Нет' },
  { value: 'not_required', label: 'Не требуется' },
]

const readinessOptions = [
  { value: 'ready', label: 'Был готов' },
  { value: 'not_ready', label: 'Не был готов к проведению' },
]

export const STAGE_FIELDS: Record<ProjectStage, StageFieldConfig[]> = {
  plum_request: [
    { name: 'client', label: 'Клиент', type: 'text', source: 'manager', mockValue: 'Иванов Иван Иванович' },
    { name: 'phone', label: 'Телефон', type: 'text', source: 'manager', mockValue: '+7 (999) 999-99-99' },
    { name: 'createdAt', label: 'Дата создания проекта в системе', type: 'date', source: 'system', mockValue: '2026-05-06' },
    { name: 'contactPerson', label: 'Контактное лицо', type: 'text', source: 'manager', mockValue: 'Ленин Сталин Марксович' },
    { name: 'email', label: 'Email', type: 'text', source: 'manager', mockValue: 'client@gmail.com' },
  ],
  first_contact: [
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
        { value: 'phone', label: 'Телефон' },
        { value: 'email', label: 'Email' },
        { value: 'meeting', label: 'Встреча' },
      ],
      mockValue: 'messenger',
    },
  ],
  calc_ready: [
    {
      name: 'calcComment',
      label: 'Комментарий к расчёту',
      type: 'textarea',
      required: true,
      source: 'manager',
      mockValue: 'Основной блок: оборудование + персонал — 1.8 млн, бэклайн 220 тыс.',
    },
  ],
  signed: [
    {
      name: 'contractType',
      label: 'Тип договора',
      type: 'select',
      required: true,
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
      required: true,
      source: 'manager',
      mockValue: 'MAG-2026/142',
    },
    {
      name: 'contractDate',
      label: 'Дата договора',
      type: 'date',
      required: true,
      source: 'manager',
      placeholder: 'дд-мм-гггг',
      mockValue: '2026-05-11',
    },
    {
      name: 'legalEntity',
      label: 'Юрлицо MAG',
      type: 'text',
      required: true,
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
  ],
  ready: [
    { name: 'salesMainTotal', label: 'Итого продажи (основной блок)', type: 'text', source: 'system', mockValue: '1 718 000 ₽' },
    { name: 'salesBacklineTotal', label: 'Итого продажи бэклайна', type: 'text', source: 'system', mockValue: '220 000 ₽' },
    { name: 'salesProjectTotal', label: 'Итого продажи проекта', type: 'text', source: 'system', mockValue: '1 938 000 ₽' },
    { name: 'taxRate', label: 'Единый % налога', type: 'text', source: 'manager', mockValue: '15%' },
    { name: 'taxAmount', label: 'Сумма налога', type: 'text', source: 'system', mockValue: '290 700 ₽' },
    { name: 'leadManager', label: 'Статус перевёл менеджер', type: 'text', source: 'system', mockValue: 'Иванов Иван Иванович' },
  ],
  event_held: [
    {
      name: 'postEventComment',
      label: 'Комментарий после мероприятия*',
      type: 'textarea',
      source: 'manager',
      mockValue:
        'Всё прошло успешно, клиент остался крайне доволен предоставленным оборудованием.',
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
      type: 'select',
      source: 'system',
      options: readinessOptions,
      mockValue: 'ready',
    },
  ],
  expenses_entered: [
    { name: 'expensesMainTotal', label: 'Итого расходы (основной блок)', type: 'text', source: 'system', mockValue: '1 020 000 ₽' },
    { name: 'expensesBacklineTotal', label: 'Итого расходы бэклайна', type: 'text', source: 'system', mockValue: '170 000 ₽' },
    { name: 'expensesProjectTotal', label: 'Итого расходы проекта', type: 'text', source: 'system', mockValue: '1 190 000 ₽' },
    {
      name: 'postEventComment',
      label: 'Комментарий к расходам',
      type: 'textarea',
      source: 'manager',
      mockValue:
        'Всё прошло успешно, клиент остался крайне доволен предоставленным оборудованием.',
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
      source: 'manager',
      options: docStatusOptions,
      mockValue: 'present',
    },
    {
      name: 'projectDocsConfirmedAt',
      label: 'Дата подтверждения документа',
      type: 'date',
      source: 'system',
      mockValue: '2026-05-09',
    },
    {
      name: 'projectDocsConfirmedBy',
      label: 'Кто подтвердил',
      type: 'text',
      source: 'system',
      mockValue: 'Иванова Анна Алексеевна',
    },
    {
      name: 'subleaseDocsStatus',
      label: 'Закрывающие по субаренде',
      type: 'select',
      source: 'manager',
      options: docStatusOptions,
      mockValue: 'present',
    },
    {
      name: 'subleaseDocsConfirmedAt',
      label: 'Дата подтверждения документа',
      type: 'date',
      source: 'system',
      mockValue: '2026-05-09',
    },
    {
      name: 'subleaseDocsConfirmedBy',
      label: 'Кто подтвердил',
      type: 'text',
      source: 'system',
      mockValue: 'Иванова Анна Алексеевна',
    },
    {
      name: 'staffReceiptsStatus',
      label: 'Расписки по персоналу',
      type: 'select',
      source: 'manager',
      options: docStatusOptions,
      mockValue: 'present',
    },
    {
      name: 'staffReceiptsConfirmedAt',
      label: 'Дата подтверждения документа',
      type: 'date',
      source: 'system',
      mockValue: '2026-05-09',
    },
    {
      name: 'staffReceiptsConfirmedBy',
      label: 'Кто подтвердил',
      type: 'text',
      source: 'system',
      mockValue: 'Иванова Анна Алексеевна',
    },
  ],
  data_confirmed: [
    {
      name: 'dataConfirmedStatus',
      label: 'Статус',
      type: 'text',
      source: 'system',
      mockValue: 'Данные подтверждены',
    },
    {
      name: 'dataConfirmedAt',
      label: 'Дата подтверждения данных',
      type: 'date',
      source: 'system',
      mockValue: '2026-05-09',
    },
    {
      name: 'dataConfirmedBy',
      label: 'Кто подтвердил',
      type: 'text',
      source: 'system',
      mockValue: 'Петров Пётр Петрович',
    },
  ],
  bonus_calculated: [
    { name: 'salesProjectTotal', label: 'Итого продажи проекта', type: 'text', source: 'system', mockValue: '1 938 000 ₽' },
    { name: 'expensesProjectTotal', label: 'Итого расходы проекта', type: 'text', source: 'system', mockValue: '1 190 000 ₽' },
    { name: 'netProfitTotal', label: 'Итоговая чистая прибыль', type: 'text', source: 'system', mockValue: '748 000 ₽' },
    { name: 'calculatedBonus', label: 'Итоговый бонус (рассчитанный)', type: 'text', source: 'system', mockValue: '443 330 ₽' },
    { name: 'leadManager', label: 'Получатель бонуса', type: 'text', source: 'system', mockValue: 'Иванов Иван Иванович' },
    { name: 'bonusCalculatedAt', label: 'Дата расчёта бонуса', type: 'date', source: 'system', mockValue: '2026-05-09' },
  ],
  bonus_approved: [
    {
      name: 'totalBonus',
      label: 'Итоговый бонус',
      type: 'text',
      source: 'system',
      mockValue: '443 330 ₽',
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
      mockValue: '2026-05-09',
    },
    {
      name: 'leadManager',
      label: 'Ведущий менеджер',
      type: 'text',
      source: 'system',
      mockValue: 'Петров Пётр Петрович',
    },
  ],
}

export interface PassedExtra {
  label: string
  source: 'manager' | 'enteredAt'
}

export const PASSED_EXTRAS: Record<ProjectStage, PassedExtra[]> = {
  plum_request: [],
  first_contact: [],
  calc_ready: [
    { label: 'Статус перевёл менеджер', source: 'manager' },
    { label: 'Дата перехода в статус', source: 'enteredAt' },
  ],
  signed: [],
  ready: [],
  event_held: [],
  expenses_entered: [],
  documents_confirmed: [],
  data_confirmed: [],
  bonus_calculated: [],
  bonus_approved: [],
  closed: [],
}

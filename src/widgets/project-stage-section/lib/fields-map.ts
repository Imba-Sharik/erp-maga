import type { PreprojectStage, StageFormData } from '@/entities/project'

export type StageFieldType = 'text' | 'textarea' | 'date' | 'select'

export interface StageFieldConfig {
  name: keyof StageFormData
  label: string
  type: StageFieldType
  required?: boolean
  placeholder?: string
  options?: { value: string; label: string }[]
}

export const STAGE_FIELDS: Record<PreprojectStage, StageFieldConfig[]> = {
  plum_request: [
    { name: 'client', label: 'Клиент', type: 'text' },
    { name: 'phone', label: 'Телефон', type: 'text' },
    { name: 'createdAt', label: 'Дата создания проекта в системе', type: 'date' },
    { name: 'contactPerson', label: 'Контактное лицо', type: 'text' },
    { name: 'email', label: 'Email', type: 'text' },
  ],
  first_contact: [
    { name: 'contactComment', label: 'Комментарий по контакту', type: 'textarea', required: true },
    { name: 'contactedAt', label: 'Дата первичного контакта', type: 'date' },
    {
      name: 'contactChannel',
      label: 'Канал контакта',
      type: 'select',
      required: true,
      options: [
        { value: 'messenger', label: 'Мессенджер' },
        { value: 'phone', label: 'Телефон' },
        { value: 'email', label: 'Email' },
        { value: 'meeting', label: 'Встреча' },
      ],
    },
  ],
  calc_ready: [
    { name: 'calcComment', label: 'Комментарий к расчёту', type: 'textarea', required: true },
  ],
  signed: [
    {
      name: 'contractType',
      label: 'Тип договора',
      type: 'select',
      required: true,
      options: [
        { value: 'with_vat', label: 'С НДС' },
        { value: 'without_vat', label: 'Без НДС' },
      ],
    },
    { name: 'contractNumber', label: 'Номер договора', type: 'text', required: true },
    {
      name: 'contractDate',
      label: 'Дата договора',
      type: 'date',
      required: true,
      placeholder: 'дд-мм-гггг',
    },
    { name: 'legalEntity', label: 'Юрлицо MAG', type: 'text', required: true },
    { name: 'contractComment', label: 'Комментарий по договору', type: 'text', placeholder: '—' },
  ],
  ready: [],
}

export interface PassedExtra {
  label: string
  source: 'manager' | 'enteredAt'
}

export const PASSED_EXTRAS: Record<PreprojectStage, PassedExtra[]> = {
  plum_request: [],
  first_contact: [{ label: 'Статус перевёл менеджер', source: 'manager' }],
  calc_ready: [
    { label: 'Статус перевёл менеджер', source: 'manager' },
    { label: 'Дата перехода в статус', source: 'enteredAt' },
  ],
  signed: [],
  ready: [],
}

import { z } from 'zod'

import { isValidRuPhone } from '@/shared/lib/phone/is-valid-ru-phone'

import type { ProjectStage } from '../model/types'

const required = (msg = 'Обязательное поле') => z.string().min(1, msg)

const ruPhone = (msg = 'Невалидный номер телефона') =>
  required().refine(isValidRuPhone, msg)

export const stageFormSchemas = {
  plum_request: z.object({
    clientCompany: required(),
    phone: ruPhone(),
    contactPerson: required(),
    email: required().email('Невалидный email'),
    createdAt: z.string().optional(),
  }),
  primary_contact_done: z.object({
    contactComment: required(),
    contactChannel: z.enum(['messenger', 'phone', 'meeting'], {
      error: () => 'Выберите канал контакта',
    }),
  }),
  calculation_prepared: z.object({
    calcComment: required(),
  }),
  contract_signed: z.object({
    contractType: z.enum(['with_vat', 'without_vat'], {
      error: () => 'Выберите тип договора',
    }),
    contractNumber: required(),
    contractDate: required(),
    legalEntity: required(),
    contractComment: z.string().optional(),
  }),
  ready_to_event: z.object({}),
  event_held: z.object({
    postEventComment: z.string().optional(),
  }),
  expenses_entered: z.object({}),
  documents_confirmed: z.object({
    projectDocsStatus: z.enum(['present', 'absent', 'not_required'], {
      error: () => 'Выберите статус по закрывающим проекта',
    }),
    subleaseDocsStatus: z.enum(['present', 'absent', 'not_required'], {
      error: () => 'Выберите статус по субаренде',
    }),
    staffReceiptsStatus: z.enum(['present', 'absent', 'not_required'], {
      error: () => 'Выберите статус по распискам персонала',
    }),
  }),
  data_confirmed: z.object({
    dataConfirmedStatus: z.enum(['confirmed', 'rejected'], {
      error: () => 'Выберите статус подтверждения данных',
    }),
  }),
  bonus_calculated: z.object({}),
  bonus_approved: z.object({}),
  closed: z.object({}),
} satisfies Record<ProjectStage, z.ZodTypeAny>

export type StageFormValues<S extends ProjectStage> = z.infer<(typeof stageFormSchemas)[S]>

export const contactChannelLabels: Record<'messenger' | 'phone' | 'meeting', string> = {
  messenger: 'Мессенджер',
  phone: 'Звонок',
  meeting: 'Встреча',
}

export const contractTypeLabels: Record<'with_vat' | 'without_vat', string> = {
  with_vat: 'С НДС',
  without_vat: 'Без НДС',
}

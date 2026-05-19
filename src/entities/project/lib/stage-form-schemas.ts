import { z } from 'zod'

import type { ProjectStage } from '../model/types'

const required = (msg = 'Обязательное поле') => z.string().min(1, msg)

export const stageFormSchemas = {
  plum_request: z.object({
    clientCompany: required(),
    phone: required(),
    contactPerson: required(),
    email: required().email('Невалидный email'),
    createdAt: z.string().optional(),
  }),
  first_contact: z.object({
    contactComment: required(),
    contactChannel: z.enum(['messenger', 'phone', 'meeting'], {
      error: () => 'Выберите канал контакта',
    }),
  }),
  calc_ready: z.object({
    calcComment: required(),
  }),
  signed: z.object({
    contractType: z.enum(['with_vat', 'without_vat'], {
      error: () => 'Выберите тип договора',
    }),
    contractNumber: required(),
    contractDate: required(),
    legalEntity: required(),
    contractComment: z.string().optional(),
  }),
  ready: z.object({}),
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

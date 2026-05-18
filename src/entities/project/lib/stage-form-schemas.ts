import { z } from 'zod'

import type { PreprojectStage } from '../model/types'

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
} satisfies Record<PreprojectStage, z.ZodTypeAny>

export type StageFormValues<S extends PreprojectStage> = z.infer<(typeof stageFormSchemas)[S]>

export const contactChannelLabels: Record<'messenger' | 'phone' | 'meeting', string> = {
  messenger: 'Мессенджер',
  phone: 'Звонок',
  meeting: 'Встреча',
}

export const contractTypeLabels: Record<'with_vat' | 'without_vat', string> = {
  with_vat: 'С НДС',
  without_vat: 'Без НДС',
}

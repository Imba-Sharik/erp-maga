import { z } from 'zod'

import type { PreprojectStage } from '../model/types'

const required = (msg = 'Обязательное поле') => z.string().min(1, msg)

export const stageFormSchemas = {
  plum_request: z.object({
    client: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    contactPerson: z.string().optional(),
    createdAt: z.string().optional(),
  }),
  first_contact: z.object({
    contactComment: required(),
    contactChannel: z.enum(['messenger', 'phone', 'email', 'meeting']),
    contactedAt: required(),
  }),
  calc_ready: z.object({
    calcComment: required(),
  }),
  signed: z.object({
    contractType: z.enum(['with_vat', 'without_vat']),
    contractNumber: required(),
    contractDate: required(),
    legalEntity: required(),
    contractComment: z.string().optional(),
  }),
  ready: z.object({}),
} satisfies Record<PreprojectStage, z.ZodTypeAny>

export type StageFormValues<S extends PreprojectStage> = z.infer<(typeof stageFormSchemas)[S]>

export const contactChannelLabels: Record<'messenger' | 'phone' | 'email' | 'meeting', string> = {
  messenger: 'Мессенджер',
  phone: 'Телефон',
  email: 'Email',
  meeting: 'Встреча',
}

export const contractTypeLabels: Record<'with_vat' | 'without_vat', string> = {
  with_vat: 'С НДС',
  without_vat: 'Без НДС',
}

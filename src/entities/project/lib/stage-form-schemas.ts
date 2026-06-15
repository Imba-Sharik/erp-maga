import { z } from 'zod'

import { isValidRuPhone } from '@/shared/lib/phone/is-valid-ru-phone'
import type { UserRole } from '@/entities/user-role'

import type { ProjectStage } from '../model/types'

const required = (msg = 'Обязательное поле') => z.string().min(1, msg)

const ruPhone = (msg = 'Невалидный номер телефона') => required().refine(isValidRuPhone, msg)

export const stageFormSchemas = {
  plum_request: z.object({
    clientCompany: required(),
    phone: ruPhone(),
    contactPerson: required(),
    email: z.union([z.literal(''), z.string().email('Невалидный email')]),
    magComment: z.string().optional(),
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
    estimateFileName: required('Прикрепите смету'),
  }),
  // Все поля опциональные — этап целиком необязателен, его можно пройти не заполняя.
  contract_signed: z.object({
    // Форма подставляет '' для пустого селекта — без literal('') z.enum падает.
    contractType: z.union([z.literal(''), z.enum(['with_vat', 'without_vat'])]).optional(),
    contractNumber: z.string().optional(),
    contractDate: z.string().optional(),
    legalEntity: z.string().optional(),
    contractComment: z.string().optional(),
  }),
  ready_to_event: z.object({}),
  event_held: z.object({
    postEventComment: z.string().optional(),
  }),
  expenses_entered: z.object({}),
  documents_confirmed: z.object({}),
  data_confirmed: z.object({
    dataConfirmedStatus: z.enum(['confirmed', 'rejected'], {
      error: () => 'Выберите статус подтверждения данных',
    }),
  }),
  bonus_calculated: z.object({}),
  bonus_approved: z.object({}),
  closed: z.object({}),
  out_of_mag_scope: z.object({}),
  archived: z.object({}),
} satisfies Record<ProjectStage, z.ZodTypeAny>

const docStatusField = z.union([z.literal(''), z.enum(['present', 're_requested', 'not_required'])])

const documentsConfirmedAccountantSchema = z
  .object({
    projectDocsFileName: z.string().optional(),
    subleaseDocsFileName: z.string().optional(),
    staffReceiptsFileName: z.string().optional(),
    projectDocsStatus: docStatusField.optional(),
    subleaseDocsStatus: docStatusField.optional(),
    staffReceiptsStatus: docStatusField.optional(),
  })
  .superRefine((data, ctx) => {
    const pending: Array<{ key: keyof typeof data; message: string }> = [
      {
        key: 'projectDocsStatus',
        message: 'Дождитесь повторной загрузки закрывающих по проекту',
      },
      {
        key: 'subleaseDocsStatus',
        message: 'Дождитесь повторной загрузки закрывающих по субаренде',
      },
      {
        key: 'staffReceiptsStatus',
        message: 'Дождитесь повторной загрузки расписок по персоналу',
      },
    ]
    for (const { key, message } of pending) {
      if (data[key] === 're_requested') {
        ctx.addIssue({ code: 'custom', message, path: [key] })
      }
    }
  })

const documentsConfirmedManagerSchema = z.object({
  projectDocsFileName: z.string().optional(),
  subleaseDocsFileName: z.string().optional(),
  staffReceiptsFileName: z.string().optional(),
})

/** Руководитель видит селекты статусов в read-only — поля опциональны для формы. */
const documentsConfirmedDirectorSchema = z.object({
  projectDocsStatus: docStatusField.optional(),
  subleaseDocsStatus: docStatusField.optional(),
  staffReceiptsStatus: docStatusField.optional(),
})

/** Схема валидации текущего этапа с учётом роли (documents_confirmed разделён). */
export function getStageFormSchema(stage: ProjectStage, role: UserRole): z.ZodTypeAny {
  if (stage === 'documents_confirmed') {
    if (role === 'accountant') return documentsConfirmedAccountantSchema
    if (role === 'manager') return documentsConfirmedManagerSchema
    if (role === 'director') return documentsConfirmedDirectorSchema
    return documentsConfirmedDirectorSchema
  }
  return stageFormSchemas[stage]
}

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

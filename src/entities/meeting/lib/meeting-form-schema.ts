import { z } from 'zod'

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/

const timeField = z
  .string()
  .min(1, 'Обязательное поле')
  .regex(TIME_REGEX, 'Укажите время в формате ЧЧ:ММ')

/** Если не выбран ни один зал — подсветить оба поля (лофт + зал). */
function refineHalls(data: { halls: string[] }, ctx: z.RefinementCtx) {
  if (data.halls.length === 0) {
    ctx.addIssue({
      code: 'custom',
      message: 'Выберите лофт',
      path: ['lofts'],
    })
    ctx.addIssue({
      code: 'custom',
      message: 'Выберите зал',
      path: ['halls'],
    })
  }
}

export const meetingFormSchema = z
  .object({
    title: z.string().trim().min(1, 'Обязательное поле'),
    comment: z.string().trim().min(1, 'Обязательное поле'),
    time: timeField,
    lofts: z.array(z.string()),
    halls: z.array(z.string()),
  })
  .superRefine(refineHalls)

export type MeetingFormValues = z.infer<typeof meetingFormSchema>

/**
 * Создание встречи: помимо времени начала (`time`) — обязательное время
 * окончания (`endTime`), окончание должно быть строго позже начала.
 *
 * Бэк пока хранит только `meeting_datetime` (начало), поэтому `endTime`
 * собирается формой, но в запрос не уходит — см. `toMeetingCreateRequest`
 * и `CreateMeetingDialog`. Когда на бэке появится поле окончания, маппинг
 * дополняется, а UI уже готов.
 */
export const meetingCreateFormSchema = z
  .object({
    title: z.string().trim().min(1, 'Обязательное поле'),
    comment: z.string().trim().min(1, 'Обязательное поле'),
    time: timeField,
    endTime: timeField,
    lofts: z.array(z.string()),
    halls: z.array(z.string()),
  })
  .superRefine((data, ctx) => {
    refineHalls(data, ctx)
    // Время в формате ЧЧ:ММ (zero-padded) сравнивается лексикографически.
    if (data.time && data.endTime && data.endTime <= data.time) {
      ctx.addIssue({
        code: 'custom',
        message: 'Время окончания должно быть позже начала',
        path: ['endTime'],
      })
    }
  })

export type MeetingCreateFormValues = z.infer<typeof meetingCreateFormSchema>

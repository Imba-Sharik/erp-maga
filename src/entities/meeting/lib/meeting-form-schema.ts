import { z } from 'zod'

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/

export const meetingFormSchema = z
  .object({
    title: z.string().trim().min(1, 'Обязательное поле'),
    comment: z.string().trim().min(1, 'Обязательное поле'),
    time: z.string().min(1, 'Обязательное поле').regex(TIME_REGEX, 'Укажите время в формате ЧЧ:ММ'),
    lofts: z.array(z.string()),
    halls: z.array(z.string()),
  })
  .superRefine((data, ctx) => {
    if (data.halls.length === 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'Выберите хотя бы один лофт',
        path: ['lofts'],
      })
    }
  })

export type MeetingFormValues = z.infer<typeof meetingFormSchema>
